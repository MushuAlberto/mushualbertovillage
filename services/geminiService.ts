
import { GoogleGenAI, GenerateContentResponse, Part, Content, GroundingChunk } from "@google/genai"; 
import { GEMINI_MODEL_TEXT, MUCHU_SYSTEM_PROMPT, PREDEFINED_EXPENSE_CATEGORIES, PREDEFINED_INCOME_CATEGORIES, MUCHU_BRAIN_DUMP_SYSTEM_PROMPT, MUCHU_BRAIN_DUMP_USER_CONTEXT_PROMPT, MUCHU_AI_JOURNAL_PROMPT_REQUEST } from '../constants';
import { AIMessage, Transaction, Mood, JournalSentiment, QuickNote } from "../types";

const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;
let geminiInitializationError = "";

if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
  geminiInitializationError = "API_KEY for Gemini is missing or is a placeholder. Please set a valid API_KEY in your environment (e.g., in index.html). AI features will not work.";
  console.error(geminiInitializationError);
} else {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (e) {
    geminiInitializationError = `Failed to initialize Gemini AI SDK: ${e instanceof Error ? e.message : String(e)}`;
    console.error(geminiInitializationError);
    ai = null;
  }
}

export interface BrainDumpContext {
  notes: QuickNote[];
  userOriginalQuery: string;
}

export const streamChatWithMuchu = async (
  historyForThisTurn: AIMessage[], 
  newMessageText: string, 
  onChunk: (chunkText: string, isFinal: boolean, groundingChunks?: GroundingChunk[]) => void,
  onError: (error: string) => void,
  useGoogleSearch: boolean = false,
  brainDumpContext?: BrainDumpContext // Added for QuickNotes processing
): Promise<void> => {
  if (!ai) {
    onError(geminiInitializationError || "Gemini AI SDK no está inicializado. Revisa la configuración de la API Key.");
    return;
  }
  
  let systemInstructionToUse = MUCHU_SYSTEM_PROMPT;
  let contentsForThisTurn: Content[];

  if (brainDumpContext && brainDumpContext.notes.length > 0) {
    systemInstructionToUse = MUCHU_BRAIN_DUMP_SYSTEM_PROMPT;
    // For brain dump, history might be less relevant, or we can prepend it.
    // Let's make the primary content the brain dump processing request.
    const brainDumpPromptText = MUCHU_BRAIN_DUMP_USER_CONTEXT_PROMPT(brainDumpContext.notes, brainDumpContext.userOriginalQuery);
    contentsForThisTurn = [{ role: 'user', parts: [{ text: brainDumpPromptText }] }];
    // If you want to include chat history as well:
    // const geminiHistory: Content[] = historyForThisTurn.map(msg => ({...})); 
    // contentsForThisTurn = [...geminiHistory, { role: 'user', parts: [{ text: brainDumpPromptText }] }];
  } else {
    const geminiHistory: Content[] = historyForThisTurn.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }] as Part[] 
    }));
    const currentMessageContent: Content = { role: 'user', parts: [{ text: newMessageText }] as Part[] };
    contentsForThisTurn = [...geminiHistory, currentMessageContent];
  }


  try {
    const stream = await ai.models.generateContentStream({
      model: GEMINI_MODEL_TEXT,
      contents: contentsForThisTurn,
      config: {
        systemInstruction: systemInstructionToUse,
        ...(useGoogleSearch && !brainDumpContext && { tools: [{ googleSearch: {} }] }), // Disable search if processing brain dump for now
      }
    });

    let fullText = "";
    let finalGroundingChunks: GroundingChunk[] | undefined = undefined;

    for await (const chunk of stream) {
      const chunkText = chunk.text;
      fullText += chunkText;
      if (chunk.candidates && chunk.candidates[0].groundingMetadata?.groundingChunks) {
         finalGroundingChunks = chunk.candidates[0].groundingMetadata.groundingChunks;
      }
      onChunk(chunkText, false, finalGroundingChunks); 
    }
    onChunk("", true, finalGroundingChunks); 
  } catch (error) {
    console.error("Error streaming chat with Mushu Alberto:", error);
    onError(`Error al conectar con Mushu Alberto AI: ${error instanceof Error ? error.message : String(error)}`);
  }
};


export const generateSimpleText = async (prompt: string, useGoogleSearch: boolean = false): Promise<{text: string, groundingChunks?: GroundingChunk[]}> => {
  if (!ai) {
    throw new Error(geminiInitializationError || "Gemini AI SDK not initialized due to missing API Key.");
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        systemInstruction: MUCHU_SYSTEM_PROMPT,
         ...(useGoogleSearch && { tools: [{ googleSearch: {} }] }),
      },
    });
    return {
        text: response.text,
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Error generating simple text from Gemini:", error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const extractTransactionFromText = async (
  userText: string,
  currentDateIso: string // YYYY-MM-DD
): Promise<Partial<Omit<Transaction, 'id' | 'createdAt'>>> => {
  if (!ai) {
    throw new Error(geminiInitializationError || "Gemini AI SDK no está inicializado debido a la falta de API Key.");
  }

  const expenseCategoryNames = PREDEFINED_EXPENSE_CATEGORIES.map(c => c.name).join(', ');
  const incomeCategoryNames = PREDEFINED_INCOME_CATEGORIES.map(c => c.name).join(', ');

  const prompt = `
Eres un asistente financiero experto. Analiza el siguiente texto proporcionado por el usuario para extraer los detalles de una transacción financiera.
La fecha actual es ${currentDateIso}. Interpreta fechas relativas como "hoy", "ayer", "mañana", "el [día] de [mes]" basándote en esta fecha actual.

Extrae la siguiente información:
- type: DEBE SER 'income' o 'expense'. Determina esto según el contexto (ej. "gasté", "pagué" implican 'expense'; "recibí", "ingreso" implican 'income').
- category: Clasifica la transacción.
    - Si es un gasto ('expense'), usa una de estas categorías de gastos: [${expenseCategoryNames}]. Por defecto si no está claro: 'Otros'.
    - Si es un ingreso ('income'), usa una de estas categorías de ingresos: [${incomeCategoryNames}]. Por defecto si no está claro: 'Otros'.
    - Si no encaja claramente en ninguna, usa la categoría 'Otros'.
- amount: El monto numérico de la transacción. Debe ser un número positivo.
- date: La fecha de la transacción en formato YYYY-MM-DD. Asegúrate de que esta fecha sea válida.
- description: Una breve descripción de la transacción basada en el texto del usuario. Si no se da una descripción explícita, intenta generar una a partir del contexto (ej: "Compra de supermercado" si la categoría es Comida y el tipo es gasto).

Considera lo siguiente:
- El usuario puede usar diferentes monedas o no especificarla. Asume que el monto es el número que mencionan.
- Si falta alguna información crítica (como el monto o una categoría clara), haz tu mejor esfuerzo o usa valores por defecto razonables (ej. 'Otros' para categoría, y la fecha actual para la fecha si no se especifica).
- Si el tipo no está claro, asume 'expense' si hay un gasto implicito, o 'income' si hay un ingreso implicito. Si es muy ambiguo, puedes omitir 'type'.

Texto del usuario: "${userText}"

Responde ÚNICAMENTE con un objeto JSON válido que contenga los campos: type, category, amount, date, description.
Omite cualquier campo si no se puede determinar de forma fiable, pero intenta siempre proveer 'category' (defecto 'Otros'), 'amount', y 'date' (defecto fecha actual).
Si el monto no es numérico o no se encuentra, omite el campo 'amount'.
Ejemplo de JSON esperado:
{
  "type": "expense",
  "category": "Comida",
  "amount": 25.50,
  "date": "2024-03-15",
  "description": "Almuerzo con amigos"
}
O si es un ingreso:
{
  "type": "income",
  "category": "Salario",
  "amount": 1500,
  "date": "2024-03-01",
  "description": "Salario mensual"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedData = parseJsonFromAiResponse<Partial<Omit<Transaction, 'id' | 'createdAt'>>>(response.text);
    
    if (!parsedData) {
        throw new Error("La respuesta de la IA no fue un JSON válido o estaba vacía.");
    }


    // Basic validation and defaults
    if (!parsedData.type && (parsedData.category || parsedData.amount)) { 
        const textLower = userText.toLowerCase();
        if (textLower.includes("gasté") || textLower.includes("pagué") || textLower.includes("compré")) {
            parsedData.type = 'expense';
        } else if (textLower.includes("recibí") || textLower.includes("ingreso") || textLower.includes("gané")) {
            parsedData.type = 'income';
        } else {
            const expenseKeywords = PREDEFINED_EXPENSE_CATEGORIES.map(c => c.name.toLowerCase());
            if (parsedData.category && expenseKeywords.includes(parsedData.category.toLowerCase())) {
                 parsedData.type = 'expense';
            }
        }
    }
    if (!parsedData.date) parsedData.date = currentDateIso;
    if (!parsedData.category) parsedData.category = parsedData.type === 'income' ? 'Otros' : 'Otros';

    return parsedData;

  } catch (error) {
    console.error("Error extracting transaction from text with Gemini:", error);
    let errorMessage = "No pude entender los detalles de la transacción. ";
    if (error instanceof Error) {
        errorMessage += error.message.includes("JSON") ? "La respuesta de la IA no fue un JSON válido." : error.message;
    } else {
        errorMessage += String(error);
    }
    errorMessage += " Por favor, intenta de nuevo o ingresa los datos manualmente."
    throw new Error(errorMessage);
  }
};


export const getDailyMotivation = async (
  mood: Mood
): Promise<{ phrase: string; advice: string; suggestedAction?: 'chat' | 'wellbeing' }> => {
  if (!ai) {
    throw new Error(geminiInitializationError || "Gemini AI SDK no está inicializado.");
  }

  const prompt = `
El usuario se siente: "${mood}".
Tu tarea es generar un mensaje de apoyo corto y útil.
Responde ÚNICAMENTE con un objeto JSON válido con los siguientes campos:
- "phrase": Una frase del día inspiradora, motivadora o reconfortante, de 1 oración, relacionada sutilmente con el ánimo del usuario.
- "advice": Un consejo breve y empático de 1-2 oraciones.
- "suggestedAction": (Opcional) Una sugerencia de acción simple. Puede ser "chat" (para sugerir hablar con Mushu Alberto AI) o "wellbeing" (para sugerir una actividad de bienestar como respirar o ir a la página de Bienestar). Omite este campo si no hay una sugerencia clara o si el ánimo es muy positivo.

Ejemplos de ánimo y posibles respuestas:
- Si mood="Feliz": phrase podría ser sobre saborear el momento, advice sobre compartir la alegría.
- Si mood="Triste": phrase podría ser sobre la impermanencia de los sentimientos, advice sobre permitirse sentir y buscar apoyo. suggestedAction="chat".
- Si mood="Ansioso": phrase podría ser sobre encontrar calma, advice sobre enfocarse en el presente. suggestedAction="wellbeing".
- Si mood="Productivo": phrase podría ser sobre el poder del progreso, advice sobre celebrar los logros.
- Si mood="Cansado": phrase sobre la importancia del descanso, advice sobre recargar energías. suggestedAction="wellbeing".

Asegúrate de que el JSON sea válido y solo contenga esos campos.
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    const parsed = parseJsonFromAiResponse<{ phrase: string; advice: string; suggestedAction?: 'chat' | 'wellbeing' }>(response.text);
    if (!parsed || !parsed.phrase || !parsed.advice) {
        throw new Error("Respuesta inválida de la IA para la motivación diaria.");
    }
    return parsed;
  } catch (error) {
    console.error("Error getting daily motivation from Gemini:", error);
    throw new Error(`No se pudo obtener la motivación: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateChatReflection = async (
  chatMessages: AIMessage[]
): Promise<{ summary: string; encouragement: string }> => {
  if (!ai) {
    throw new Error(geminiInitializationError || "Gemini AI SDK no está inicializado.");
  }
  if (chatMessages.length === 0) {
    return { summary: "No hay chats recientes para reflexionar.", encouragement: "¡Habla conmigo cuando quieras!" };
  }

  const conversationText = chatMessages
    .map(msg => `${msg.sender === 'user' ? 'Usuario' : 'Mushu Alberto'}: ${msg.text}`)
    .join('\n');

  const prompt = `
Analiza la siguiente conversación reciente entre un usuario y Mushu Alberto (una IA de apoyo emocional). El objetivo es proveer una reflexión útil y empática para el usuario.

Conversación:
${conversationText}

Basado en esta conversación:
1.  Genera un "summary": Un resumen muy breve (1-2 frases concisas) de los principales temas o sentimientos expresados por el usuario en la conversación.
2.  Genera un "encouragement": Palabras de ánimo, apoyo o una reflexión positiva (1-2 frases) basadas en la conversación. Debe ser empático y constructivo.

Responde ÚNICAMENTE con un objeto JSON válido con los campos "summary" y "encouragement".
Ejemplo de JSON:
{
  "summary": "Parece que hoy estuviste pensando mucho en tus proyectos futuros y buscando maneras de organizarte.",
  "encouragement": "Es genial que estés planificando. Recuerda que cada pequeño paso cuenta. ¡Sigue adelante con esa energía!"
}
O si el usuario expresó tristeza:
{
  "summary": "Hoy compartiste que te sentías un poco decaído y hablamos sobre algunas formas de afrontarlo.",
  "encouragement": "Recuerda que está bien no estar bien siempre. Valoro que compartas tus sentimientos. Mañana será un nuevo día."
}
Asegúrate de que la respuesta sea solo el JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    
    const parsed = parseJsonFromAiResponse<{ summary: string; encouragement: string }>(response.text);
    if (!parsed || !parsed.summary || !parsed.encouragement) {
        throw new Error("Respuesta inválida de la IA para la reflexión del chat.");
    }
    return parsed;

  } catch (error) {
    console.error("Error generating chat reflection from Gemini:", error);
    throw new Error(`No se pudo generar la reflexión del chat: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const analyzeJournalEntrySentiment = async (
  entryContent: string
): Promise<{ sentiment: JournalSentiment; emoji: string }> => {
  if (!ai) {
    throw new Error(geminiInitializationError || "Gemini AI SDK no está inicializado.");
  }
  const prompt = `Analiza el sentimiento del siguiente texto de un diario personal. Responde ÚNICAMENTE con un objeto JSON con dos claves: "sentiment" (valores posibles: "positivo", "negativo", "neutral", "mixto") y "emoji" (un emoji Unicode que represente ese sentimiento). Texto del diario:\n\n"${entryContent}"`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    const parsed = parseJsonFromAiResponse<{ sentiment: JournalSentiment; emoji: string }>(response.text);
    if (!parsed || !parsed.sentiment || !parsed.emoji) {
      console.warn("Invalid or incomplete JSON for sentiment analysis:", response.text);
      throw new Error("Respuesta inválida de la IA para el análisis de sentimiento del diario.");
    }
    return parsed;
  } catch (error) {
    console.error("Error analyzing journal entry sentiment:", error);
    // Provide a default fallback if AI fails
    return { sentiment: 'neutral', emoji: '😐' };
  }
};

export const summarizeJournalEntry = async (entryContent: string): Promise<string> => {
  if (!ai) {
    throw new Error(geminiInitializationError || "Gemini AI SDK no está inicializado.");
  }
  const prompt = `Resume el siguiente texto de un diario personal en una o dos frases concisas y directas. Enfócate en los hechos o sentimientos clave. Texto del diario:\n\n"${entryContent}"`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
    });
    return response.text.trim() || "No se pudo generar un resumen.";
  } catch (error) {
    console.error("Error summarizing journal entry:", error);
    return "No se pudo generar un resumen en este momento.";
  }
};

// --- Updated for multiple prompts ---
export const getJournalReflectionPrompts = async (): Promise<string[]> => {
  const fallbackPrompts = [
    "¿Qué fue lo más destacado de tu día y por qué?",
    "Describe un desafío que enfrentaste hoy y cómo lo manejaste.",
    "¿Qué aprendiste hoy sobre ti mismo o sobre los demás?",
    "¿Por qué cosa pequeña te sientes agradecido hoy?",
    "Si pudieras darle un consejo a tu yo de mañana, ¿cuál sería?",
  ];

  if (!ai) {
    console.warn(geminiInitializationError || "Gemini AI SDK no está inicializado. Usando prompts de diario locales.");
    // Return 3 random fallback prompts
    return fallbackPrompts.sort(() => 0.5 - Math.random()).slice(0, 3);
  }
  
  try {
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: MUCHU_AI_JOURNAL_PROMPT_REQUEST, // Using the new constant for structured JSON
        config: {
            responseMimeType: "application/json",
        },
    });
    
    const parsed = parseJsonFromAiResponse<{ prompts: string[] }>(response.text);

    if (parsed && Array.isArray(parsed.prompts) && parsed.prompts.length > 0) {
        return parsed.prompts.slice(0, 3); // Ensure we only take up to 3 prompts
    } else {
      console.warn("AI did not return valid prompts array, using local fallback:", response.text);
      return fallbackPrompts.sort(() => 0.5 - Math.random()).slice(0, 3);
    }
  } catch (error) {
    console.error("Error getting journal reflection prompts from AI, using local fallback:", error);
    return fallbackPrompts.sort(() => 0.5 - Math.random()).slice(0, 3);
  }
};


// Helper to parse JSON, removing potential markdown fences
export const parseJsonFromAiResponse = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    const parsedData = JSON.parse(jsonStr);
    // Check if T is expected to be an array, and if parsedData is an array
    // This is a basic check. More sophisticated type guards might be needed for complex T.
    // For now, if T could be an array of objects, this will pass it through.
    // If T is a single object, and parsedData is an array of such objects,
    // you might want to return parsedData[0] or handle it differently.
    // For this use case, we assume the AI will return what's expected by T.
    return parsedData as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    return null;
  }
};
