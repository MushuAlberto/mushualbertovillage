
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useEmotion, EmotionRecord } from '../contexts/EmotionContext';
import { useMission } from '../contexts/MissionContext';
import EmotionSelector from '../components/EmotionSelector';
import RPGDialog from '../components/RPGDialog';
import MushuAvatar from '../components/MushuAvatar';

const EmotionCheck: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recordEmotion, currentEmotion } = useEmotion();
  const { missions, completeMission } = useMission();
  
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionRecord['emotion'] | null>(
    currentEmotion ? currentEmotion.emotion : null
  );
  const [intensity, setIntensity] = useState<number>(
    currentEmotion ? currentEmotion.intensity : 5
  );
  const [note, setNote] = useState<string>(
    currentEmotion ? currentEmotion.note : ''
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(!!currentEmotion);
  
  const handleEmotionSelect = (emotion: EmotionRecord['emotion']) => {
    setSelectedEmotion(emotion);
  };
  
  const handleIntensityChange = (value: number[]) => {
    setIntensity(value[0]);
  };
  
  const handleSubmit = () => {
    if (!selectedEmotion) {
      toast({
        title: "Selecciona una emoción",
        description: "Por favor selecciona cómo te sientes hoy",
        variant: "destructive"
      });
      return;
    }
    
    recordEmotion(selectedEmotion, intensity, note);
    
    // Check if there's a mission to complete emotional check-in
    const emotionCheckMission = missions.find(
      m => !m.completed && m.title.toLowerCase().includes('emotion check')
    );
    if (emotionCheckMission) {
      completeMission(emotionCheckMission.id);
    }
    
    setIsSubmitted(true);
    
    toast({
      title: "¡Registro guardado!",
      description: "Tu registro emocional ha sido guardado con éxito"
    });
  };
  
  const getEmotionResponse = () => {
    if (!selectedEmotion) return "";
    
    switch(selectedEmotion) {
      case 'happy':
        return "¡Me alegra mucho que te sientas feliz hoy! Vamos a mantener esa energía positiva.";
      case 'sad':
        return "Entiendo que hoy no sea un gran día para ti. Recuerda que está bien sentirse triste a veces, y estoy aquí para acompañarte.";
      case 'angry':
        return "Veo que estás experimentando enojo. Respiremos profundo juntos y encontremos maneras de canalizar esa energía.";
      case 'anxious':
        return "La ansiedad puede ser abrumadora. Podríamos intentar algunas técnicas de respiración o actividades que te ayuden a relajarte.";
      case 'neutral':
        return "Un día neutral puede ser una buena oportunidad para explorar nuevas actividades o simplemente descansar.";
      case 'excited':
        return "¡Tu entusiasmo es contagioso! ¿Qué te tiene tan emocionado hoy?";
      case 'tired':
        return "El cansancio es una señal importante de nuestro cuerpo. Asegúrate de descansar lo suficiente hoy.";
      default:
        return "Gracias por compartir cómo te sientes hoy.";
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-mushu-dark mb-6 text-center">
          ¿Cómo te sientes hoy?
        </h1>
        
        {!isSubmitted ? (
          <div className="rpg-dialog">
            <div className="flex flex-col items-center mb-6">
              <MushuAvatar size="lg" />
              <p className="text-center mt-3">
                Selecciona tu estado de ánimo actual
              </p>
            </div>
            
            <div className="mb-6">
              <EmotionSelector 
                selectedEmotion={selectedEmotion}
                onSelect={handleEmotionSelect}
              />
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Intensidad</h3>
              <Slider
                defaultValue={[intensity]}
                min={1}
                max={10}
                step={1}
                onValueChange={handleIntensityChange}
              />
              <div className="flex justify-between text-sm mt-1">
                <span>Leve</span>
                <span>Moderado</span>
                <span>Intenso</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Notas (opcional)</h3>
              <Textarea 
                placeholder="¿Quieres agregar alguna nota sobre cómo te sientes?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rpg-input"
              />
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => navigate('/menu')} 
                variant="outline"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="rpg-button"
              >
                Guardar
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-center mb-6">
              <MushuAvatar size="lg" />
            </div>
            
            <RPGDialog
              text={getEmotionResponse()}
              speaker="Mushu"
              onContinue={() => navigate('/menu')}
              showContinue={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionCheck;
