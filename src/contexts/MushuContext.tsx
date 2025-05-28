
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useEmotion, EmotionRecord } from './EmotionContext';
import { 
  MushuState, 
  MushuContextType, 
  MushuAccessory 
} from './mushu/types';
import { 
  getDefaultMushuState, 
  mapEmotionToMood, 
  saveMushuStateToStorage, 
  loadMushuStateFromStorage 
} from './mushu/utils';
import { 
  analyzeUserMessage as analyzeMessage, 
  generatePersonalizedResponse 
} from './mushu/learningService';

const MushuContext = createContext<MushuContextType | undefined>(undefined);

export const MushuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const { currentEmotion } = useEmotion();
  
  const [mushuState, setMushuState] = useState<MushuState>(getDefaultMushuState());
  
  useEffect(() => {
    if (user) {
      const storedState = loadMushuStateFromStorage(user.id);
      if (storedState) {
        setMushuState(storedState);
      } else {
        setMushuState(getDefaultMushuState());
      }
    }
  }, [user]);
  
  useEffect(() => {
    if (currentEmotion) {
      updateMood(currentEmotion.emotion);
    }
  }, [currentEmotion]);
  
  const saveState = (updatedState: MushuState) => {
    if (user) {
      saveMushuStateToStorage(user.id, updatedState);
    }
  };
  
  const updateMood = (emotion: EmotionRecord['emotion']) => {
    const mood = mapEmotionToMood(emotion);
    
    const currentLearningData = mushuState.learningData || {
      mentionedTopics: {},
      favoriteActivities: {},
      emotionalPatterns: {},
      conversationCount: 0,
      lastInteractionDate: null
    };
    
    const updatedEmotionalPatterns = { 
      ...currentLearningData.emotionalPatterns
    };
    updatedEmotionalPatterns[emotion] = (updatedEmotionalPatterns[emotion] || 0) + 1;
    
    const updatedLearningData = {
      ...currentLearningData,
      emotionalPatterns: updatedEmotionalPatterns
    };
    
    const updatedState = { 
      ...mushuState, 
      mood,
      learningData: updatedLearningData
    };
    
    setMushuState(updatedState);
    saveState(updatedState);
  };
  
  const addChatMessage = (sender: 'user' | 'mushu', text: string) => {
    const newMessage = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [...mushuState.chatHistory, newMessage];
    
    let relationshipBonus = 0;
    if (sender === 'user') {
      relationshipBonus = 1;
      
      if (text.toLowerCase().includes('gracias') || 
          text.toLowerCase().includes('genial') || 
          text.toLowerCase().includes('te quiero')) {
        relationshipBonus += 2;
      }
      
      analyzeUserMessage(text);
    }
    
    const updatedRelationship = Math.min(100, mushuState.relationship + relationshipBonus);
    
    const currentLearningData = mushuState.learningData || {
      mentionedTopics: {},
      favoriteActivities: {},
      emotionalPatterns: {},
      conversationCount: 0,
      lastInteractionDate: null
    };
    
    const updatedLearningData = {
      ...currentLearningData,
      conversationCount: sender === 'user' ? currentLearningData.conversationCount + 1 : currentLearningData.conversationCount,
      lastInteractionDate: new Date().toISOString()
    };
    
    const updatedState = { 
      ...mushuState, 
      chatHistory: updatedHistory,
      relationship: updatedRelationship,
      learningData: updatedLearningData
    };
    
    setMushuState(updatedState);
    saveState(updatedState);
  };
  
  const clearChatHistory = () => {
    const updatedState = { ...mushuState, chatHistory: [] };
    setMushuState(updatedState);
    saveState(updatedState);
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
    saveState(updatedState);
  };
  
  const equipAccessory = (id: string, equipped: boolean) => {
    const accessory = mushuState.accessories.find(a => a.id === id);
    if (!accessory || !accessory.unlocked) return;
    
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
    saveState(updatedState);
  };
  
  const updateUserPreferences = (preferences: Partial<MushuState['userPreferences']>) => {
    const updatedPreferences = {
      ...mushuState.userPreferences,
      ...preferences
    };
    
    const updatedState = { ...mushuState, userPreferences: updatedPreferences };
    setMushuState(updatedState);
    saveState(updatedState);
  };
  
  const getEquippedAccessories = () => mushuState.accessories.filter(acc => acc.unlocked && acc.equipped);
  
  const analyzeUserMessage = (text: string) => {
    if (!text) return;
    
    const currentLearningData = mushuState.learningData || {
      mentionedTopics: {},
      favoriteActivities: {},
      emotionalPatterns: {},
      conversationCount: 0,
      lastInteractionDate: null
    };
    
    const updatedLearningData = analyzeMessage(text, currentLearningData);
    
    const updatedState = {
      ...mushuState,
      learningData: updatedLearningData
    };
    
    setMushuState(updatedState);
    saveState(updatedState);
  };
  
  const getPersonalizedResponse = (userMessage: string): string => {
    const userName = user?.name || 'Usuario';
    
    const currentLearningData = mushuState.learningData || {
      mentionedTopics: {},
      favoriteActivities: {},
      emotionalPatterns: {},
      conversationCount: 0,
      lastInteractionDate: null
    };
    
    return generatePersonalizedResponse(userMessage, userName, currentLearningData);
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

// Re-export types for backward compatibility
export type { MushuAccessory, MushuState };
