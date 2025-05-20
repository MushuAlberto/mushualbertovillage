
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import MushuAvatar from '../components/MushuAvatar';
import { Meditation } from 'lucide-react';

interface MindfulnessActivity {
  id: string;
  name: string;
  description: string;
  duration: string;
  type: 'meditación' | 'respiración' | 'relajación';
  instructions: string[];
}

const Mindfulness: React.FC = () => {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<MindfulnessActivity | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  
  // Sample mindfulness activities
  const activities: MindfulnessActivity[] = [
    {
      id: 'med1',
      name: 'Meditación de atención plena',
      description: 'Una meditación simple para centrar tu mente en el momento presente.',
      duration: '5 minutos',
      type: 'meditación',
      instructions: [
        'Siéntate en una posición cómoda con la espalda recta',
        'Cierra los ojos y respira profundamente',
        'Concéntrate en tu respiración, notando cómo entra y sale el aire',
        'Cuando tu mente divague, vuelve a centrar la atención en la respiración',
        'Continúa este proceso durante 5 minutos'
      ]
    },
    {
      id: 'breath1',
      name: 'Respiración 4-7-8',
      description: 'Técnica de respiración para calmar la ansiedad y facilitar el sueño.',
      duration: '2 minutos',
      type: 'respiración',
      instructions: [
        'Siéntate en una posición cómoda con la espalda recta',
        'Inhala por la nariz durante 4 segundos',
        'Mantén la respiración durante 7 segundos',
        'Exhala lentamente por la boca durante 8 segundos',
        'Repite este ciclo 4 veces'
      ]
    },
    {
      id: 'relax1',
      name: 'Relajación muscular progresiva',
      description: 'Técnica para relajar grupos musculares y reducir la tensión física.',
      duration: '10 minutos',
      type: 'relajación',
      instructions: [
        'Acuéstate en una posición cómoda',
        'Comienza por los pies: tensa los músculos durante 5 segundos y luego relaja',
        'Sube hacia las pantorrillas, repite el proceso',
        'Continúa subiendo por todo el cuerpo hasta llegar a la cara',
        'Termina con una respiración profunda'
      ]
    },
    {
      id: 'med2',
      name: 'Meditación de gratitud',
      description: 'Práctica para cultivar sentimientos de agradecimiento y positividad.',
      duration: '5 minutos',
      type: 'meditación',
      instructions: [
        'Siéntate cómodamente y cierra los ojos',
        'Respira profundamente varias veces',
        'Piensa en 5 cosas por las que estés agradecido hoy',
        'Con cada respiración, siente la gratitud en tu cuerpo',
        'Termina con una sonrisa y una respiración profunda'
      ]
    },
    {
      id: 'breath2',
      name: 'Respiración cuadrada',
      description: 'Técnica de respiración equilibrada para calmar la mente y reducir el estrés.',
      duration: '3 minutos',
      type: 'respiración',
      instructions: [
        'Inhala lentamente contando hasta 4',
        'Mantén el aire contando hasta 4',
        'Exhala lentamente contando hasta 4',
        'Mantén los pulmones vacíos contando hasta 4',
        'Repite este ciclo durante 3 minutos'
      ]
    }
  ];
  
  const handleSelectActivity = (activity: MindfulnessActivity) => {
    setSelectedActivity(activity);
    setIsActive(false);
    setTimer(0);
  };
  
  const handleStartActivity = () => {
    setIsActive(true);
    const durationInSeconds = parseInt(selectedActivity!.duration) * 60;
    setTimer(durationInSeconds);
  };
  
  // Timer effect for the meditation
  React.useEffect(() => {
    let interval: number | undefined;
    
    if (isActive && timer > 0) {
      interval = window.setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            ← Volver al Pueblo
          </Button>
          <h1 className="text-2xl font-bold">Jardín Mindfulness</h1>
          <Button variant="outline" onClick={() => navigate('/menu')}>
            Menú
          </Button>
        </div>
        
        <div className="mb-6 flex justify-center">
          <MushuAvatar size="lg" mood="happy" />
        </div>
        
        <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center">
              <Meditation className="mr-2" />
              <h2 className="text-xl font-bold">Jardín de Serenidad</h2>
            </div>
            <p className="text-sm text-gray-600">
              Bienvenido a este espacio de paz y tranquilidad. Aquí puedes practicar
              meditación y técnicas de respiración para encontrar calma interior.
            </p>
          </CardHeader>
        </Card>
        
        {isActive ? (
          <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <h2 className="text-xl font-bold text-center">{selectedActivity?.name}</h2>
              <div className="text-center text-4xl font-mono my-4">
                {formatTime(timer)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedActivity?.instructions.map((instruction, index) => (
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
              <Button 
                className="w-full bg-red-500 hover:bg-red-600" 
                onClick={() => setIsActive(false)}
              >
                Terminar
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activities.map(activity => (
              <Card 
                key={activity.id}
                className={`cursor-pointer transition-all hover:shadow-md bg-white/80 backdrop-blur
                  ${selectedActivity?.id === activity.id ? 'border-purple-500 bg-purple-50' : ''}`}
                onClick={() => handleSelectActivity(activity)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold">{activity.name}</h3>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                      {activity.duration}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                  <div className="text-xs text-gray-500 mt-1">Tipo: {activity.type}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {selectedActivity && !isActive && (
          <Button 
            className="w-full bg-mushu-primary hover:bg-mushu-dark mt-4"
            onClick={handleStartActivity}
          >
            Comenzar {selectedActivity.name}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Mindfulness;
