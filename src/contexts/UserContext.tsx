
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  avatar: string;
  created: Date;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateXP: (amount: number) => void;
  resetProgress: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('mushu_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          created: new Date(parsedUser.created)
        });
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('mushu_user');
      }
    }
  }, []);
  
  const calculateXpToNextLevel = (level: number): number => {
    // Simple formula: each level requires 100 + (level * 50) XP
    return 100 + (level * 50);
  };
  
  const updateXP = (amount: number) => {
    if (!user) return;
    
    let newXP = user.xp + amount;
    let newLevel = user.level;
    let xpToNextLevel = user.xpToNextLevel;
    
    // Check for level up
    while (newXP >= xpToNextLevel) {
      newXP -= xpToNextLevel;
      newLevel++;
      xpToNextLevel = calculateXpToNextLevel(newLevel);
    }
    
    const updatedUser = {
      ...user,
      xp: newXP,
      level: newLevel,
      xpToNextLevel
    };
    
    setUser(updatedUser);
    localStorage.setItem('mushu_user', JSON.stringify(updatedUser));
  };
  
  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in a real app, this would call an API
    if (email && password) {
      // Check if user exists in local storage
      const storedUser = localStorage.getItem('mushu_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.email === email) {
            setUser({
              ...parsedUser,
              created: new Date(parsedUser.created)
            });
            return true;
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
      
      // If no user found or different email, create a new user
      const newUser: User = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        level: 1,
        xp: 0,
        xpToNextLevel: calculateXpToNextLevel(1),
        avatar: 'default',
        created: new Date()
      };
      
      setUser(newUser);
      localStorage.setItem('mushu_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };
  
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Mock registration - in a real app, this would call an API
    if (name && email && password) {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        level: 1,
        xp: 0,
        xpToNextLevel: calculateXpToNextLevel(1),
        avatar: 'default',
        created: new Date()
      };
      
      setUser(newUser);
      localStorage.setItem('mushu_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setUser(null);
    // Don't remove user data, just log out
  };
  
  const resetProgress = () => {
    if (!user) return;
    
    const resetUser: User = {
      ...user,
      level: 1,
      xp: 0,
      xpToNextLevel: calculateXpToNextLevel(1)
    };
    
    setUser(resetUser);
    localStorage.setItem('mushu_user', JSON.stringify(resetUser));
    
    // Also clear other app data
    localStorage.removeItem('mushu_emotions');
    localStorage.removeItem('mushu_missions');
    localStorage.removeItem('mushu_achievements');
    localStorage.removeItem('mushu_customization');
  };
  
  const value = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
    register,
    updateXP,
    resetProgress
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
