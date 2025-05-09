
import React, { useState, useEffect } from 'react';
import { useMushu } from '../contexts/MushuContext';

interface MushuAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

const MushuAvatar: React.FC<MushuAvatarProps> = ({ 
  size = 'md', 
  animate = true 
}) => {
  const { mushuState, getEquippedAccessories } = useMushu();
  const { mood } = mushuState;
  const [animation, setAnimation] = useState('');
  
  const equippedAccessories = getEquippedAccessories();
  
  // Set size class
  const sizeClass = {
    'sm': 'w-16 h-16',
    'md': 'w-24 h-24',
    'lg': 'w-32 h-32',
    'xl': 'w-48 h-48'
  }[size];
  
  // Animation based on mood
  useEffect(() => {
    if (!animate) return;
    
    switch(mood) {
      case 'happy':
        setAnimation('animate-bounce-slight');
        break;
      case 'excited':
        setAnimation('animate-bounce-slight');
        break;
      case 'sad':
        setAnimation('');
        break;
      case 'sleepy':
        setAnimation('animate-pulse-gentle');
        break;
      case 'confused':
        setAnimation('animate-pulse-gentle');
        break;
      default:
        setAnimation('animate-float');
    }
  }, [mood, animate]);
  
  // Render the base Mushu character with mood
  const renderMushuBase = () => {
    return (
      <div className={`relative ${sizeClass} ${animation}`}>
        {/* Base character - this would be replaced with actual character images */}
        <div className="relative">
          {/* For now, using colored circles to represent different moods */}
          <div className={`
            rounded-full bg-mushu-primary border-4 border-mushu-dark
            flex items-center justify-center
            ${sizeClass}
            ${mood === 'happy' ? 'bg-mushu-accent' : ''}
            ${mood === 'sad' ? 'bg-mushu-secondary' : ''}
            ${mood === 'excited' ? 'bg-yellow-400' : ''}
            ${mood === 'sleepy' ? 'bg-blue-300' : ''}
            ${mood === 'confused' ? 'bg-orange-300' : ''}
          `}>
            <span className="text-lg font-bold text-mushu-dark">
              {mood === 'happy' && '😊'}
              {mood === 'sad' && '😢'}
              {mood === 'excited' && '🤩'}
              {mood === 'sleepy' && '😴'}
              {mood === 'confused' && '😕'}
              {mood === 'normal' && '😀'}
            </span>
          </div>
          
          {/* Render equipped accessories */}
          {equippedAccessories.map(acc => (
            <div 
              key={acc.id} 
              className="absolute" 
              style={{
                // Position accessories based on type
                top: acc.type === 'hat' ? '-20%' : 
                     acc.type === 'glasses' ? '30%' : 
                     acc.type === 'outfit' ? '50%' : 
                     acc.type === 'shoes' ? '80%' : '0',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10
              }}
            >
              {/* We would use actual images here */}
              <div className="bg-gray-400 rounded-md p-1 text-xs">
                {acc.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return renderMushuBase();
};

export default MushuAvatar;
