
import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MindfulnessActivity } from './types';

interface ActivityDetailsProps {
  activity: MindfulnessActivity;
  onFinish: () => void;
}

const ActivityDetails: React.FC<ActivityDetailsProps> = ({ activity, onFinish }) => {
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create audio element for completion sound
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bell-meditation-sound-2000.mp3');
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive && timer > 0) {
      interval = window.setInterval(() => {
        setTimer(prevTimer => {
          const newTime = prevTimer - 1;
          // Calculate progress percentage
          const progressValue = 100 - (newTime / totalTime * 100);
          setProgress(progressValue);
          return newTime;
        });
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      // Play completion sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Could not play sound:", e));
      }
      // Show completion toast
      toast({
        title: "¡Meditación completada!",
        description: `Has completado ${activity.name} con éxito.`,
        duration: 5000,
      });
      onFinish();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer, totalTime, activity.name, onFinish, toast]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    // Extract numeric part from duration (e.g., "5 minutos" -> 5)
    const durationMatch = activity.duration.match(/\d+/);
    const durationInMinutes = durationMatch ? parseInt(durationMatch[0]) : 5;
    const durationInSeconds = durationInMinutes * 60;
    setTotalTime(durationInSeconds);
    setTimer(durationInSeconds);
    setProgress(0);
  };

  return (
    <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur">
      <CardHeader>
        <h2 className="text-xl font-bold text-center">{activity.name}</h2>
        {isActive && (
          <div className="space-y-4">
            <div className="text-center text-4xl font-mono my-2">
              {formatTime(timer)}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity.instructions.map((instruction, index) => (
            <div key={index} className="flex items-start">
              <span className="bg-mushu-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 shrink-0">
                {index + 1}
              </span>
              <p>{instruction}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {isActive ? (
          <Button 
            className="w-full bg-red-500 hover:bg-red-600" 
            onClick={() => setIsActive(false)}
          >
            Terminar
          </Button>
        ) : (
          <Button 
            className="w-full bg-mushu-primary hover:bg-mushu-dark"
            onClick={handleStart}
          >
            <Bell className="mr-2 h-4 w-4" /> Comenzar {activity.name}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ActivityDetails;
