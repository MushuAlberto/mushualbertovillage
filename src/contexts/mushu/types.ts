
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

export interface MushuContextType {
  mushuState: MushuState;
  updateMood: (emotion: string) => void;
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
