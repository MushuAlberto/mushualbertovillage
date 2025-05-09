
import React from 'react';
import { useUser } from '../contexts/UserContext';

interface XPBarProps {
  showLevel?: boolean;
  className?: string;
}

const XPBar: React.FC<XPBarProps> = ({ showLevel = true, className = '' }) => {
  const { user } = useUser();
  
  if (!user) return null;
  
  const { level, xp, xpToNextLevel } = user;
  const progress = (xp / xpToNextLevel) * 100;
  
  return (
    <div className={`${className}`}>
      {showLevel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="font-bold">Nivel {level}</span>
          <span>{xp}/{xpToNextLevel} XP</span>
        </div>
      )}
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="xp-bar" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default XPBar;
