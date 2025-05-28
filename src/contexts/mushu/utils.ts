
import { MushuState } from './types';

export const getDefaultMushuState = (): MushuState => ({
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
});

export const mapEmotionToMood = (emotion: string): MushuState['mood'] => {
  switch(emotion) {
    case 'happy':
    case 'excited':
      return 'happy';
    case 'sad':
    case 'tired':
      return 'sad';
    case 'angry':
      return 'confused';
    case 'anxious':
      return 'sleepy';
    default:
      return 'normal';
  }
};

export const saveMushuStateToStorage = (userId: string, state: MushuState) => {
  localStorage.setItem(`mushu_state_${userId}`, JSON.stringify(state));
};

export const loadMushuStateFromStorage = (userId: string): MushuState | null => {
  try {
    const storedState = localStorage.getItem(`mushu_state_${userId}`);
    return storedState ? JSON.parse(storedState) : null;
  } catch (e) {
    console.error("Error parsing stored mushu state:", e);
    return null;
  }
};
