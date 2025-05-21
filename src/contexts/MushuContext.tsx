
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
    
    const updatedState = { ...mushuState, mood };
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
    }
    
    const updatedRelationship = Math.min(100, mushuState.relationship + relationshipBonus);
    
    const updatedState = { 
      ...mushuState, 
      chatHistory: updatedHistory,
      relationship: updatedRelationship
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
  
  const value = {
    mushuState,
    updateMood,
    addChatMessage,
    getChatHistory,
    clearChatHistory,
    unlockAccessory,
    equipAccessory,
    getEquippedAccessories,
    updateUserPreferences
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
