
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import MushuAvatar from '../components/MushuAvatar';

const MiniGame: React.FC = () => {
  const { user, addUserXp } = useUser();
  const { toast } = useToast();
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [gameHistory, setGameHistory] = useState<number[]>([]);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(30);
    moveTarget();
  };

  const endGame = () => {
    setGameActive(false);
    setGameHistory(prev => [...prev, score]);
    
    // Award XP based on score
    const xpEarned = Math.floor(score * 2);
    if (xpEarned > 0) {
      addUserXp(xpEarned);
      toast({
        title: "¡Juego terminado!",
        description: `Ganaste ${xpEarned} puntos de experiencia`,
      });
    }
  };

  const moveTarget = () => {
    const newX = Math.floor(Math.random() * 80) + 10; // Keep within 10-90% of container
    const newY = Math.floor(Math.random() * 80) + 10;
    setTargetPosition({ x: newX, y: newY });
  };

  const handleTargetClick = () => {
    if (!gameActive) return;
    
    setScore(score + 1);
    moveTarget();
  };

  // Game timer
  useEffect(() => {
    if (!gameActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-mushu-dark mb-6 text-center">
          Mini-Juego
        </h1>
        
        <div className="rpg-border mb-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">¡Atrapa a Mushu!</h2>
            <p className="text-sm mb-3">
              Haz clic en Mushu tantas veces como puedas antes de que se acabe el tiempo.
              Ganarás XP basado en tu puntuación.
            </p>
            
            {!gameActive ? (
              <Button onClick={startGame} className="rpg-button">
                Iniciar Juego
              </Button>
            ) : (
              <div className="flex justify-between items-center">
                <div className="font-bold">Tiempo: {timeLeft}s</div>
                <div className="font-bold">Puntuación: {score}</div>
              </div>
            )}
          </div>
        </div>
        
        {gameActive && (
          <div 
            className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg"
            style={{ height: '50vh' }}
          >
            <div 
              className="absolute transition-all duration-200 cursor-pointer"
              style={{ 
                left: `${targetPosition.x}%`, 
                top: `${targetPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={handleTargetClick}
            >
              <MushuAvatar size="md" animate={true} />
            </div>
          </div>
        )}
        
        {!gameActive && gameHistory.length > 0 && (
          <div className="rpg-border mt-6">
            <h3 className="font-bold mb-2">Historial de Juego</h3>
            <div className="space-y-2">
              {gameHistory.map((gameScore, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>Partida {gameHistory.length - index}</div>
                  <div className="font-bold">{gameScore} puntos</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniGame;
