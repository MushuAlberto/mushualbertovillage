
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useEmotion, EmotionRecord } from './EmotionContext';

export interface MushuAccessory {
  id: string;
  name: string;
  type: 'hat' | 'outfit' | 'glasses' | 'shoes' | 'pet' | 'background';
  imageUrl: string;
  unlocked: boolean;
  equipped: boolean;
}

export interface MushuState {
  mood: 'happy' | 'sad' | 'excited' | 'sleepy' | 'confused' | 'normal';
  accessories: MushuAccessory[];
  chatHistory: { id: string, sender: 'user' | 'mushu', text: string, timestamp: string }[];
  relationship: number; // 0-100 friendship level
  userPreferences: {
    topics: string[];
    interests: string[];
    learningGoals: string[];
  };
  learningData: {
    mentionedTopics: Record<string, number>;
    favoriteActivities: Record<string, number>;
    emotionalPatterns: Record<string, number>;
    conversationCount: number;
    lastInteractionDate: string | null;
  };
}

interface MushuContextType {
  mushuState: MushuState;
  updateMood: (emotion: EmotionRecord['emotion']) => void;
  addChatMessage: (sender: 'user' | 'mushu', text: string) => void;
  getChatHistory: () => MushuState['chatHistory'];
  clearChatHistory: () => void;
  unlockAccessory: (id: string) => void;
  equipAccessory: (id: string, equipped: boolean) => void;
  getEquippedAccessories: () => MushuAccessory[];
  updateUserPreferences: (preferences: Partial<MushuState['userPreferences']>) => void;
  analyzeUserMessage: (text: string) => void;
  getPersonalizedResponse: (text: string) => string;
}

const MushuContext = createContext<MushuContextType | undefined>(undefined);

export const MushuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const { currentEmotion } = useEmotion();
  
  const defaultMushuState: MushuState = {
    mood: 'normal',
    accessories: [
      { id: 'a1', name: 'Party Hat', type: 'hat', imageUrl: '/accessories/party-hat.png', unlocked: true, equipped: false },
      { id: 'a2', name: 'Sunglasses', type: 'glasses', imageUrl: '/accessories/sunglasses.png', unlocked: true, equipped: false },
      { id: 'a3', name: 'Sneakers', type: 'shoes', imageUrl: '/accessories/sneakers.png', unlocked: false, equipped: false },
      { id: 'a4', name: 'Hoodie', type: 'outfit', imageUrl: '/accessories/hoodie.png', unlocked: false, equipped: false },
      { id: 'a5', name: 'Beach Background', type: 'background', imageUrl: '/accessories/beach.png', unlocked: false, equipped: false }
    ],
    chatHistory: [],
    relationship: 50,
    userPreferences: {
      topics: [],
      interests: [],
      learningGoals: []
    },
    learningData: {
      mentionedTopics: {},
      favoriteActivities: {},
      emotionalPatterns: {},
      conversationCount: 0,
      lastInteractionDate: null
    }
  };
  
  const [mushuState, setMushuState] = useState<MushuState>(defaultMushuState);
  
  useEffect(() => {
    if (user) {
      const storedMushuState = localStorage.getItem(`mushu_state_${user.id}`);
      if (storedMushuState) {
        try {
          setMushuState(JSON.parse(storedMushuState));
        } catch (e) {
          console.error("Error parsing stored mushu state:", e);
          setMushuState(defaultMushuState);
        }
      } else {
        setMushuState(defaultMushuState);
      }
    }
  }, [user]);
  
  useEffect(() => {
    if (currentEmotion) {
      updateMood(currentEmotion.emotion);
    }
  }, [currentEmotion]);
  
  const saveMushuState = (updatedState: MushuState) => {
    if (user) {
      localStorage.setItem(`mushu_state_${user.id}`, JSON.stringify(updatedState));
    }
  };
  
  const updateMood = (emotion: EmotionRecord['emotion']) => {
    // Map user emotion to Mushu mood
    let mood: MushuState['mood'] = 'normal';
    
    switch(emotion) {
      case 'happy':
      case 'excited':
        mood = 'happy';
        break;
      case 'sad':
      case 'tired':
        mood = 'sad';
        break;
      case 'angry':
        mood = 'confused';
        break;
      case 'anxious':
        mood = 'sleepy';
        break;
      default:
        mood = 'normal';
    }
    
    // También actualiza los patrones emocionales en learningData
    const updatedEmotionalPatterns = { ...mushuState.learningData.emotionalPatterns };
    updatedEmotionalPatterns[emotion] = (updatedEmotionalPatterns[emotion] || 0) + 1;
    
    const updatedLearningData = {
      ...mushuState.learningData,
      emotionalPatterns: updatedEmotionalPatterns
    };
    
    const updatedState = { 
      ...mushuState, 
      mood,
      learningData: updatedLearningData
    };
    
    setMushuState(updatedState);
    saveMushuState(updatedState);
  };
  
  const addChatMessage = (sender: 'user' | 'mushu', text: string) => {
    const newMessage = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [...mushuState.chatHistory, newMessage];
    
    // Incrementar la relación con Mushu cuando el usuario escribe mensajes
    let relationshipBonus = 0;
    if (sender === 'user') {
      relationshipBonus = 1; // Pequeño incremento por cada mensaje
      
      // Bonos extras por mensajes positivos o agradecimientos
      if (text.toLowerCase().includes('gracias') || 
          text.toLowerCase().includes('genial') || 
          text.toLowerCase().includes('te quiero')) {
        relationshipBonus += 2;
      }
      
      // Analizar el mensaje del usuario para aprender
      analyzeUserMessage(text);
    }
    
    const updatedRelationship = Math.min(100, mushuState.relationship + relationshipBonus);
    
    // Actualizar el contador de conversaciones
    const updatedLearningData = {
      ...mushuState.learningData,
      conversationCount: sender === 'user' ? mushuState.learningData.conversationCount + 1 : mushuState.learningData.conversationCount,
      lastInteractionDate: new Date().toISOString()
    };
    
    const updatedState = { 
      ...mushuState, 
      chatHistory: updatedHistory,
      relationship: updatedRelationship,
      learningData: updatedLearningData
    };
    
    setMushuState(updatedState);
    saveMushuState(updatedState);
  };
  
  const clearChatHistory = () => {
    const updatedState = { ...mushuState, chatHistory: [] };
    setMushuState(updatedState);
    saveMushuState(updatedState);
  };
  
  const getChatHistory = () => mushuState.chatHistory;
  
  const unlockAccessory = (id: string) => {
    const updatedAccessories = mushuState.accessories.map(acc => {
      if (acc.id === id) {
        return { ...acc, unlocked: true };
      }
      return acc;
    });
    
    const updatedState = { ...mushuState, accessories: updatedAccessories };
    setMushuState(updatedState);
    saveMushuState(updatedState);
  };
  
  const equipAccessory = (id: string, equipped: boolean) => {
    const accessory = mushuState.accessories.find(a => a.id === id);
    if (!accessory || !accessory.unlocked) return;
    
    // If equipping, unequip others of same type
    const updatedAccessories = mushuState.accessories.map(acc => {
      if (acc.id === id) {
        return { ...acc, equipped };
      } else if (equipped && acc.type === accessory.type) {
        return { ...acc, equipped: false };
      }
      return acc;
    });
    
    const updatedState = { ...mushuState, accessories: updatedAccessories };
    setMushuState(updatedState);
    saveMushuState(updatedState);
  };
  
  const updateUserPreferences = (preferences: Partial<MushuState['userPreferences']>) => {
    const updatedPreferences = {
      ...mushuState.userPreferences,
      ...preferences
    };
    
    const updatedState = { ...mushuState, userPreferences: updatedPreferences };
    setMushuState(updatedState);
    saveMushuState(updatedState);
  };
  
  const getEquippedAccessories = () => mushuState.accessories.filter(acc => acc.unlocked && acc.equipped);
  
  // Nueva función para analizar mensajes del usuario
  const analyzeUserMessage = (text: string) => {
    if (!text) return;
    
    const lowerText = text.toLowerCase();
    const updatedLearningData = { ...mushuState.learningData };
    
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
    
    const updatedState = {
      ...mushuState,
      learningData: updatedLearningData
    };
    
    setMushuState(updatedState);
    saveMushuState(updatedState);
  };
  
  // Nueva función para generar respuestas personalizadas basadas en datos aprendidos
  const getPersonalizedResponse = (userMessage: string): string => {
    const userName = user?.name || 'Usuario';
    const lowerMessage = userMessage.toLowerCase();
    const { mentionedTopics, favoriteActivities, conversationCount } = mushuState.learningData;
    
    // Encontrar el tema más mencionado
    let favoriteTopics: string[] = [];
    let maxCount = 0;
    Object.entries(mentionedTopics).forEach(([topic, count]) => {
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
    Object.entries(favoriteActivities).forEach(([activity, count]) => {
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
  
  const value = {
    mushuState,
    updateMood,
    addChatMessage,
    getChatHistory,
    clearChatHistory,
    unlockAccessory,
    equipAccessory,
    getEquippedAccessories,
    updateUserPreferences,
    analyzeUserMessage,
    getPersonalizedResponse
  };
  
  return <MushuContext.Provider value={value}>{children}</MushuContext.Provider>;
};

export const useMushu = () => {
  const context = useContext(MushuContext);
  if (context === undefined) {
    throw new Error('useMushu must be used within a MushuProvider');
  }
  return context;
};
