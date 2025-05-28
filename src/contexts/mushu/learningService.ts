
import { MushuState } from './types';

export const analyzeUserMessage = (text: string, currentLearningData: MushuState['learningData']): MushuState['learningData'] => {
  if (!text) return currentLearningData;
  
  const lowerText = text.toLowerCase();
  
  const updatedLearningData = { ...currentLearningData };
  
  // Detectar temas mencionados
  const topicKeywords: Record<string, string[]> = {
    'salud': ['salud', 'ejercicio', 'dieta', 'alimentación', 'nutrición', 'gimnasio'],
    'mindfulness': ['mindfulness', 'meditación', 'meditar', 'respiración', 'relajación', 'calma', 'tranquilidad'],
    'productividad': ['productividad', 'trabajo', 'estudiar', 'rutina', 'hábitos', 'organización'],
    'emociones': ['emociones', 'sentimientos', 'ánimo', 'feliz', 'triste', 'enojado', 'frustrado'],
    'relaciones': ['amigos', 'familia', 'pareja', 'social', 'relación', 'personas']
  };
  
  // Detectar actividades favoritas
  const activityKeywords: Record<string, string[]> = {
    'meditación': ['meditar', 'meditación', 'mindfulness', 'atención plena'],
    'ejercicio': ['correr', 'gimnasio', 'entrenamiento', 'deporte', 'ejercicio'],
    'lectura': ['leer', 'libro', 'lectura', 'estudio'],
    'socialización': ['amigos', 'salir', 'fiesta', 'reunión', 'socializar'],
    'creatividad': ['arte', 'dibujar', 'pintar', 'música', 'tocar', 'crear']
  };
  
  // Initialize if not present
  updatedLearningData.mentionedTopics = updatedLearningData.mentionedTopics || {};
  updatedLearningData.favoriteActivities = updatedLearningData.favoriteActivities || {};
  
  // Actualizar temas mencionados
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(word => lowerText.includes(word))) {
      updatedLearningData.mentionedTopics[topic] = 
        (updatedLearningData.mentionedTopics[topic] || 0) + 1;
    }
  });
  
  // Actualizar actividades favoritas
  Object.entries(activityKeywords).forEach(([activity, keywords]) => {
    if (keywords.some(word => lowerText.includes(word))) {
      updatedLearningData.favoriteActivities[activity] = 
        (updatedLearningData.favoriteActivities[activity] || 0) + 1;
    }
  });
  
  return updatedLearningData;
};

export const generatePersonalizedResponse = (
  userMessage: string, 
  userName: string, 
  learningData: MushuState['learningData']
): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  const { mentionedTopics, favoriteActivities, conversationCount } = learningData;
  
  // Encontrar el tema más mencionado
  let favoriteTopics: string[] = [];
  let maxCount = 0;
  Object.entries(mentionedTopics || {}).forEach(([topic, count]) => {
    if (count > maxCount) {
      favoriteTopics = [topic];
      maxCount = count;
    } else if (count === maxCount) {
      favoriteTopics.push(topic);
    }
  });
  
  // Encontrar la actividad favorita
  let favoriteActivity = '';
  maxCount = 0;
  Object.entries(favoriteActivities || {}).forEach(([activity, count]) => {
    if (count > maxCount) {
      favoriteActivity = activity;
      maxCount = count;
    }
  });
  
  // Respuestas personalizadas basadas en datos aprendidos
  if (lowerMessage.includes('hola') || lowerMessage.includes('hey') || lowerMessage.includes('saludos')) {
    if (conversationCount > 10) {
      return `¡Hola de nuevo, ${userName}! Siempre es un placer hablar contigo. Ya hemos tenido ${conversationCount} conversaciones. ¿Cómo estás hoy?`;
    } else {
      return `¡Hola, ${userName}! ¿Cómo puedo ayudarte hoy?`;
    }
  }
  else if (lowerMessage.includes('cómo estás') || lowerMessage.includes('como estas')) {
    return "¡Estoy muy bien, gracias por preguntar! Estoy aquí para ayudarte en lo que necesites. ¿Y tú cómo te sientes hoy?";
  }
  else if (lowerMessage.includes('qué sabes de mí') || lowerMessage.includes('que sabes sobre mi')) {
    let response = `He aprendido algunas cosas sobre ti, ${userName}. `;
    
    if (favoriteTopics.length > 0) {
      response += `Parece que te interesa hablar sobre ${favoriteTopics.join(', ')}. `;
    }
    
    if (favoriteActivity) {
      response += `También he notado que disfrutas de actividades como ${favoriteActivity}. `;
    }
    
    response += `Hemos tenido ${conversationCount} conversaciones hasta ahora. ¿Hay algo más que te gustaría compartir conmigo?`;
    
    return response;
  }
  else if (lowerMessage.includes('recomienda') || lowerMessage.includes('sugerencia') || lowerMessage.includes('consejo')) {
    if (favoriteTopics.includes('salud')) {
      return `Basado en nuestras conversaciones anteriores, ${userName}, creo que podrías estar interesado en una rutina de ejercicios rápidos para hacer en casa. ¿Te gustaría que te sugiera algunos?`;
    } else if (favoriteTopics.includes('mindfulness')) {
      return `He notado que te interesa el mindfulness, ${userName}. ¿Has probado la meditación guiada de 5 minutos en el Jardín Mindfulness? Podría ser perfecta para ti.`;
    } else {
      return `${userName}, considerando tus intereses, ¿has considerado explorar nuevas actividades en nuestra aplicación? Tenemos opciones de mindfulness y ejercicio que podrían ayudarte.`;
    }
  }
  
  // Respuesta genérica si no hay coincidencia específica
  return `Gracias por compartir eso conmigo, ${userName}. Estoy aprendiendo más sobre ti con cada conversación. ¿Hay algo específico en lo que pueda ayudarte hoy?`;
};
