import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

export interface EmotionRecord {
  id: string;
  emotion: 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral' | 'excited' | 'tired';
  intensity: number;
  note: string;
  date: string;
  timestamp: string; // Added timestamp property
}

interface EmotionContextType {
  currentEmotion: EmotionRecord | null;
  emotionHistory: EmotionRecord[];
  recordEmotion: (emotion: EmotionRecord['emotion'], intensity: number, note: string) => void;
  getEmotionsForDateRange: (startDate: Date, endDate: Date) => EmotionRecord[];
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export const EmotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [currentEmotion, setCurrentEmotion] = useState<EmotionRecord | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([]);
  
  useEffect(() => {
    if (user) {
      const storedEmotions = localStorage.getItem(`mushu_emotions_${user.id}`);
      if (storedEmotions) {
        try {
          const parsedEmotions = JSON.parse(storedEmotions);
          setEmotionHistory(parsedEmotions);
          
          // Set current emotion if recorded today
          const today = new Date().toISOString().split('T')[0];
          const todayEmotion = parsedEmotions.find((e: EmotionRecord) => e.date.startsWith(today));
          if (todayEmotion) {
            setCurrentEmotion(todayEmotion);
          } else {
            setCurrentEmotion(null);
          }
        } catch (e) {
          console.error("Error parsing stored emotions:", e);
        }
      }
    } else {
      setEmotionHistory([]);
      setCurrentEmotion(null);
    }
  }, [user]);
  
  const recordEmotion = (emotion: EmotionRecord['emotion'], intensity: number, note: string) => {
    if (!user) return;
    
    const newRecord: EmotionRecord = {
      id: Date.now().toString(),
      emotion,
      intensity,
      note,
      date: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    
    setCurrentEmotion(newRecord);
    
    // Add to history and save
    const updatedHistory = [newRecord, ...emotionHistory];
    setEmotionHistory(updatedHistory);
    localStorage.setItem(`mushu_emotions_${user.id}`, JSON.stringify(updatedHistory));
  };
  
  const getEmotionsForDateRange = (startDate: Date, endDate: Date): EmotionRecord[] => {
    return emotionHistory.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };
  
  const value = {
    currentEmotion,
    emotionHistory,
    recordEmotion,
    getEmotionsForDateRange
  };
  
  return <EmotionContext.Provider value={value}>{children}</EmotionContext.Provider>;
};

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (context === undefined) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};
