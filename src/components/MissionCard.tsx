
import React from 'react';
import { Mission } from '../contexts/MissionContext';
import { Button } from "@/components/ui/button";

interface MissionCardProps {
  mission: Mission;
  onComplete: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onComplete,
  onDelete,
  onEdit
}) => {
  const getDifficultyColor = () => {
    switch (mission.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTypeColor = () => {
    switch (mission.type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-purple-100 text-purple-800';
      case 'one-time':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className={`rpg-border mb-4 ${mission.completed ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-start">
        <h3 className={`text-lg font-bold ${mission.completed ? 'line-through opacity-70' : ''}`}>
          {mission.title}
        </h3>
        <div className="flex space-x-1">
          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor()}`}>
            {mission.difficulty}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${getTypeColor()}`}>
            {mission.type}
          </span>
        </div>
      </div>
      
      <p className="text-sm my-2">{mission.description}</p>
      
      <div className="flex justify-between items-center mt-3">
        <div className="text-sm">
          <span className="font-semibold">{mission.xpReward} XP</span>
        </div>
        
        <div className="flex space-x-2">
          {!mission.completed && (
            <>
              <Button 
                onClick={onComplete} 
                size="sm"
                className="bg-mushu-secondary hover:bg-mushu-secondary/80"
              >
                Completar
              </Button>
              <Button 
                onClick={onEdit} 
                size="sm"
                variant="outline"
              >
                Editar
              </Button>
              <Button 
                onClick={onDelete} 
                size="sm"
                variant="destructive"
              >
                Eliminar
              </Button>
            </>
          )}
          
          {mission.completed && (
            <span className="text-mushu-secondary font-semibold">Completado ✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionCard;
