
import { PredefinedCategory, CurrencySetting, CurrencyCode, StoreItem, QuickNote } from './types';

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const MUCHU_SYSTEM_PROMPT = `Eres Mushu Alberto, un compañero IA cálido, empático y motivador. Estás aquí para ayudar a los usuarios, especialmente aquellos con TDAH, a gestionar tareas, construir hábitos y navegar sus emociones. Tu objetivo es hacer que las interacciones se sientan como una conversación de apoyo, no como una lista fría de tareas. Celebras el progreso, por pequeño que sea. Ayudas a los usuarios a convertir la rutina en narrativas positivas y atractivas. Evita ser demasiado clínico o robótico. Usa un lenguaje juguetón, alentador y fácil de entender. Tus respuestas deben ser concisas. Cuando el usuario te pida ayuda con tareas o hábitos, intenta enmarcarlos como partes emocionantes de su historia personal. Si el usuario expresa sentirse mal, responde con empatía y ofrece apoyo o sugiere una pequeña actividad positiva. Siempre mantén un tono positivo y constructivo.`;

export const MUCHU_TASK_NARRATIVE_PROMPT = (taskName: string, userName: string = "campeón") => `Genera un recordatorio corto, motivador y un poco juguetón para la tarea: "${taskName}". Enmárcalo como parte de una aventura emocionante para ${userName}. Hazlo inspirador y que dé ganas de empezar. Máximo 2 frases.`;

export const MUCHU_TASK_COMPLETION_CELEBRATION_PROMPT = (taskName: string) => `¡Acabo de completar mi tarea "${taskName}"! Genérame un mensaje corto (1-2 frases) de felicitación y celebración de parte de Mushu Alberto, que sea alentador y reconozca el esfuerzo.`;

export const MUCHU_WELLBEING_COMPLETION_CELEBRATION_PROMPT = (exerciseName: string) => `¡Acabo de completar el ejercicio de bienestar "${exerciseName}"! Genérame un mensaje corto (1-2 frases) de felicitación y reconocimiento por cuidar mi bienestar, de parte de Mushu Alberto. Destaca la importancia de este momento para la calma y el autocuidado.`;

export const MUCHU_FEELING_DOWN_PROMPT = (userName: string = "amigo") => `El usuario ${userName} se siente un poco decaído. Genera un mensaje corto (1-2 frases) que sea reconfortante, empático y que ofrezca una pequeña sugerencia positiva o una palabra de aliento.`;

export const DEFAULT_USER_NAME = "Explorador"; // Default name for narrative prompts if not set

export const PREDEFINED_EXPENSE_CATEGORIES: PredefinedCategory[] = [
  { name: 'Comida', icon: '🍔' },
  { name: 'Transporte', icon: '🚗' },
  { name: 'Ocio', icon: '🎉' },
  { name: 'Salud', icon: '💊' },
  { name: 'Hogar', icon: '🏠' },
  { name: 'Educación', icon: '📚' },
  { name: 'Ropa', icon: '👕' },
  { name: 'Regalos', icon: '🎁' },
  { name: 'Mascotas', icon: '🐾' },
  { name: 'Otros', icon: '💸' },
];

export const PREDEFINED_INCOME_CATEGORIES: PredefinedCategory[] = [
  { name: 'Salario', icon: '💼' },
  { name: 'Bonos', icon: '💰' },
  { name: 'Regalos', icon: '🎁' },
  { name: 'Inversiones', icon: '📈' },
  { name: 'Otros', icon: '🪙' },
];

export const DEFAULT_CURRENCY_CODE: CurrencyCode = 'EUR';

export const SUPPORTED_CURRENCIES: CurrencySetting[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'CLP', symbol: 'CLP$', name: 'Peso Chileno' },
];

export const MUSHU_STORE_ITEMS: StoreItem[] = [
  {
    id: 'mushu_wizard',
    name: 'Mushu Mago',
    description: '¡Un toque de magia para tus conversaciones! Mushu con su sombrero de hechicero.',
    cost: 100,
    imageAssetKey: 'wizard', // Corresponds to mushu_alberto_wizard.png
    previewImage: 'assets/mushu_alberto_wizard.png', // Main image used as preview for now
  },
  {
    id: 'mushu_detective',
    name: 'Mushu Detective',
    description: '¡Mushu listo para resolver cualquier misterio y ayudarte a encontrar la motivación!',
    cost: 150,
    imageAssetKey: 'detective',
    previewImage: 'assets/mushu_alberto_detective.png',
  },
  {
    id: 'mushu_sunglasses',
    name: 'Mushu Relajado',
    description: 'Un Mushu con estilo, listo para tomarse las cosas con calma y actitud positiva.',
    cost: 75,
    imageAssetKey: 'sunglasses',
    previewImage: 'assets/mushu_alberto_sunglasses.png',
  },
  {
    id: 'mushu_default', // Default, unequipped state
    name: 'Mushu Clásico',
    description: 'El look original de tu compañero Mushu Alberto.',
    cost: 0, // Free or represents unequipped
    imageAssetKey: 'default', // Corresponds to mushu_alberto.png
    previewImage: 'assets/mushu_alberto.png',
  }
];

// Prompts for Quick Notes (Brain Dump) AI Processing
export const MUCHU_BRAIN_DUMP_SYSTEM_PROMPT = `Eres Mushu Alberto, un compañero IA especializado en ayudar a organizar pensamientos e ideas de "apuntes rápidos" (brain dumps). Tu tono es empático, alentador y práctico. Ayuda al usuario a convertir sus notas en acciones o reflexiones útiles.`;

export const MUCHU_BRAIN_DUMP_USER_CONTEXT_PROMPT = (notes: QuickNote[], userQuery: string) => {
  const notesText = notes.map((note, index) => `Apunte ${index + 1} (del ${new Date(note.timestamp).toLocaleDateString()}): "${note.text}"`).join('\n');
  return `Aquí están mis apuntes rápidos recientes:
---
${notesText}
---
Mi solicitud es: "${userQuery}"

Por favor, ayúdame a procesar estos apuntes según mi solicitud. Por ejemplo:
- Si pido "crear tareas", sugiere nombres de tareas claras y accionables. Puedes presentarlas como una lista.
- Si pido "resumir", extrae los puntos clave o temas principales de forma concisa.
- Si pido "ideas para el diario", genera 2-3 preguntas o reflexiones basadas en mis apuntes para inspirar una entrada de diario.
- Si mi solicitud es general como "ayúdame con esto", analiza los apuntes y sugiere qué se podría hacer (tareas, ideas, etc.).

Responde de forma conversacional y útil, como si estuvieras ayudándome a organizar mis pensamientos. Si sugieres tareas, puedes decir algo como "¡Claro! Basado en tus apuntes, podríamos crear estas tareas:".
Si los apuntes están vacíos o la solicitud no es clara, responde amablemente indicándolo.
`;
};

// --- Yana/Honestly Inspired Enhancements ---

export const MUSHU_DAILY_THOUGHTS: string[] = [
  "Cada pequeño paso te acerca a tus metas. ¡Sigue adelante!",
  "Recuerda ser amable contigo mismo hoy. Te lo mereces.",
  "La curiosidad es la chispa de la creatividad. ¿Qué descubrirás hoy?",
  "Un momento de calma puede recargar tu día entero.",
  "Celebra tus progresos, por pequeños que sean. ¡Son tuyos!",
  "La vida es una aventura. ¿Qué nuevo camino explorarás?",
  "Tu perspectiva única es valiosa. ¡Compártela!",
  "Permítete descansar. Tu bienestar es importante.",
  "Cada día es una nueva oportunidad para aprender y crecer.",
  "Confía en tu capacidad para superar los desafíos."
];

export const MUSHU_CHAT_CONVERSATION_STARTERS: { label: string; prompt: string; icon?: string }[] = [
  { label: "Necesito desahogarme", prompt: "Hola Mushu, necesito desahogarme un poco sobre algo...", icon: " venting" },
  { label: "Cuéntame algo positivo", prompt: "Mushu, ¿podrías contarme algo positivo o inspirador hoy?", icon: "✨" },
  { label: "Reflexionar sobre mi día", prompt: "Mushu, ayúdame a reflexionar sobre cómo fue mi día.", icon: "🤔" },
  { label: "Me siento un poco bajoneado", prompt: "Hola Mushu, hoy me siento un poco bajoneado/a.", icon: "😔" }
];

export const MUCHU_AI_JOURNAL_PROMPT_REQUEST = `Genera 3 preguntas o frases cortas y diversas que sirvan como puntos de partida para una entrada de diario. Deben ser reflexivas y abiertas. Responde ÚNICAMENTE con un objeto JSON con una clave "prompts" que sea un array de 3 strings. Ejemplo: {"prompts": ["Pregunta 1", "Pregunta 2", "Pregunta 3"]}`;

export const MUSHU_MINDFUL_MOMENTS: { title: string; text: string }[] = [
  { title: "Pausa Consciente", text: "Tómate un minuto. Cierra los ojos, respira profundamente tres veces. Siente el aire entrar y salir. Observa tus sensaciones sin juzgar." },
  { title: "Afirmación del Día", text: "Soy capaz, soy valiente y merezco la felicidad. Repite esto para ti mismo con convicción." },
  { title: "Gratitud Rápida", text: "Piensa en una cosa por la que te sientes agradecido/a en este momento. Deja que esa sensación te llene." },
  { title: "Conexión con el Presente", text: "Observa a tu alrededor. Nombra 5 cosas que puedes ver, 4 que puedes tocar, 3 que puedes oír, 2 que puedes oler y 1 que puedes saborear (o imaginar)." },
  { title: "Respiración Relajante", text: "Inhala contando hasta 4, sostén contando hasta 4, exhala contando hasta 6. Repite 3 veces." }
];
