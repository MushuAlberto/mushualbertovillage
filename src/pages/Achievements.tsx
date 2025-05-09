
import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Medal, Star, Zap, Award, Trophy, Heart, BookOpen } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const Achievements: React.FC = () => {
  const { user } = useUser();

  // Mock achievements data (in a real app this would come from a database)
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Primeros Pasos',
      description: 'Completa tu primer check-in emocional',
      icon: <Heart size={24} />,
      unlocked: true,
    },
    {
      id: '2',
      title: 'Racha de 7 días',
      description: 'Completa check-ins emocionales por 7 días seguidos',
      icon: <Zap size={24} />,
      unlocked: true,
    },
    {
      id: '3',
      title: 'Misión Cumplida',
      description: 'Completa tu primera misión',
      icon: <Star size={24} />,
      unlocked: true,
    },
    {
      id: '4',
      title: 'Dominio Emocional',
      description: 'Registra 5 emociones diferentes',
      icon: <Medal size={24} />,
      unlocked: false,
      progress: 3,
      maxProgress: 5,
    },
    {
      id: '5',
      title: 'Maestro de Misiones',
      description: 'Completa 20 misiones',
      icon: <Trophy size={24} />,
      unlocked: false,
      progress: 8,
      maxProgress: 20,
    },
    {
      id: '6',
      title: 'Nivel 10',
      description: 'Alcanza el nivel 10',
      icon: <Award size={24} />,
      unlocked: false,
    },
    {
      id: '7',
      title: 'Erudito',
      description: 'Chatea con MushuBot 30 veces',
      icon: <BookOpen size={24} />,
      unlocked: false,
      progress: 12,
      maxProgress: 30,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-mushu-dark mb-6 text-center">
          Logros
        </h1>

        <div className="mb-6 rpg-border">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{user?.name || 'Usuario'}</h2>
              <p className="text-sm">Nivel {user?.level || 1}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                <span className="text-mushu-secondary">{achievements.filter(a => a.unlocked).length}</span>/{achievements.length} Logros
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`rpg-border ${!achievement.unlocked ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center">
                <div className={`
                  p-3 rounded-full mr-3 flex items-center justify-center
                  ${achievement.unlocked ? 'bg-mushu-accent' : 'bg-gray-200'}
                `}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold">
                    {achievement.title}
                    {achievement.unlocked && <span className="text-mushu-secondary ml-2">✓</span>}
                  </h3>
                  <p className="text-sm">{achievement.description}</p>
                  
                  {achievement.progress !== undefined && (
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-mushu-primary rounded-full" 
                          style={{ width: `${(achievement.progress / achievement.maxProgress!) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-right mt-1">
                        {achievement.progress}/{achievement.maxProgress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
