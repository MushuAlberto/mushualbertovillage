
import React from 'react';
import { EmotionRecord } from '../contexts/EmotionContext';

interface EmotionSelectorProps {
  selectedEmotion: EmotionRecord['emotion'] | null;
  onSelect: (emotion: EmotionRecord['emotion']) => void;
}

const EmotionSelector: React.FC<EmotionSelectorProps> = ({ selectedEmotion, onSelect }) => {
  const emotions: { value: EmotionRecord['emotion']; label: string; emoji: string }[] = [
    { value: 'happy', label: 'Feliz', emoji: '😊' },
    { value: 'sad', label: 'Triste', emoji: '😢' },
    { value: 'angry', label: 'Enojado', emoji: '😠' },
    { value: 'anxious', label: 'Ansioso', emoji: '😰' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'excited', label: 'Emocionado', emoji: '🤩' },
    { value: 'tired', label: 'Cansado', emoji: '😴' },
  ];
  
  return (
    <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
      {emotions.map((emotion) => (
        <button
          key={emotion.value}
          onClick={() => onSelect(emotion.value)}
          className={`
            p-3 rounded-lg flex flex-col items-center justify-center 
            transition-transform transform hover:scale-105
            ${selectedEmotion === emotion.value 
              ? 'bg-mushu-accent border-2 border-mushu-dark' 
              : 'bg-white border border-gray-200'}
          `}
        >
          <span className="text-3xl mb-1">{emotion.emoji}</span>
          <span className="text-sm font-medium">{emotion.label}</span>
        </button>
      ))}
    </div>
  );
};

export default EmotionSelector;
