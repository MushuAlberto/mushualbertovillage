
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'daily' | 'weekly' | 'one-time';
  xpReward: number;
  completed: boolean;
  dueDate?: string;
  createdDate: string;
  completedDate?: string;
}

interface MissionContextType {
  missions: Mission[];
  addMission: (mission: Omit<Mission, 'id' | 'completed' | 'createdDate' | 'completedDate'>) => void;
  completeMission: (id: string) => void;
  deleteMission: (id: string) => void;
  editMission: (id: string, updates: Partial<Mission>) => void;
  getActiveMissions: () => Mission[];
  getCompletedMissions: () => Mission[];
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateXP } = useUser();
  const [missions, setMissions] = useState<Mission[]>([]);
  
  useEffect(() => {
    if (user) {
      const storedMissions = localStorage.getItem(`mushu_missions_${user.id}`);
      if (storedMissions) {
        try {
          setMissions(JSON.parse(storedMissions));
        } catch (e) {
          console.error("Error parsing stored missions:", e);
        }
      } else {
        // Default starter missions
        const starterMissions: Mission[] = [
          {
            id: '1',
            title: 'Complete your first emotion check',
            description: 'Record how you\'re feeling today',
            difficulty: 'easy',
            type: 'one-time',
            xpReward: 50,
            completed: false,
            createdDate: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Chat with Mushu',
            description: 'Have your first conversation with Mushu',
            difficulty: 'easy',
            type: 'one-time',
            xpReward: 50,
            completed: false,
            createdDate: new Date().toISOString()
          }
        ];
        
        setMissions(starterMissions);
        localStorage.setItem(`mushu_missions_${user.id}`, JSON.stringify(starterMissions));
      }
    } else {
      setMissions([]);
    }
  }, [user]);
  
  const saveMissions = (updatedMissions: Mission[]) => {
    if (user) {
      localStorage.setItem(`mushu_missions_${user.id}`, JSON.stringify(updatedMissions));
    }
  };
  
  const addMission = (missionData: Omit<Mission, 'id' | 'completed' | 'createdDate' | 'completedDate'>) => {
    if (!user) return;
    
    const newMission: Mission = {
      ...missionData,
      id: Date.now().toString(),
      completed: false,
      createdDate: new Date().toISOString()
    };
    
    const updatedMissions = [...missions, newMission];
    setMissions(updatedMissions);
    saveMissions(updatedMissions);
  };
  
  const completeMission = (id: string) => {
    if (!user) return;
    
    const mission = missions.find(m => m.id === id);
    if (!mission || mission.completed) return;
    
    const updatedMissions = missions.map(m => {
      if (m.id === id) {
        return {
          ...m,
          completed: true,
          completedDate: new Date().toISOString()
        };
      }
      return m;
    });
    
    setMissions(updatedMissions);
    saveMissions(updatedMissions);
    
    // Award XP
    updateXP(mission.xpReward);
  };
  
  const deleteMission = (id: string) => {
    if (!user) return;
    
    const updatedMissions = missions.filter(m => m.id !== id);
    setMissions(updatedMissions);
    saveMissions(updatedMissions);
  };
  
  const editMission = (id: string, updates: Partial<Mission>) => {
    if (!user) return;
    
    const updatedMissions = missions.map(m => {
      if (m.id === id) {
        return { ...m, ...updates };
      }
      return m;
    });
    
    setMissions(updatedMissions);
    saveMissions(updatedMissions);
  };
  
  const getActiveMissions = () => missions.filter(m => !m.completed);
  
  const getCompletedMissions = () => missions.filter(m => m.completed);
  
  const value = {
    missions,
    addMission,
    completeMission,
    deleteMission,
    editMission,
    getActiveMissions,
    getCompletedMissions
  };
  
  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (context === undefined) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
