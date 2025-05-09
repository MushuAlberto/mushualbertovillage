
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RPGDialog from '../components/RPGDialog';
import MushuAvatar from '../components/MushuAvatar';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0);
  
  const onboardingSteps = [
    {
      text: "¡Bienvenido a MushuMind! Soy Mushu, tu compañero en esta aventura hacia el bienestar mental.",
      speaker: "Mushu"
    },
    {
      text: "Con MushuMind podrás rastrear tus emociones, completar misiones diarias, ganar recompensas y más.",
      speaker: "Mushu"
    },
    {
      text: "¡Todo con un estilo de videojuego RPG que hace que cuidar tu salud mental sea divertido!",
      speaker: "Mushu"
    },
    {
      text: "¿Estás listo para comenzar tu aventura?",
      speaker: "Mushu",
      isLast: true
    }
  ];
  
  const nextStep = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/login');
    }
  };
  
  const skipOnboarding = () => {
    navigate('/login');
  };
  
  const currentStep = onboardingSteps[step];
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-mushu-light to-white flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-4xl font-bold text-mushu-dark mb-8 animate-fade-in">
          MushuMind
        </h1>
        
        <div className="mb-8 animate-bounce-slight">
          <MushuAvatar size="xl" animate={true} />
        </div>
        
        <div className="w-full">
          <RPGDialog
            text={currentStep.text}
            speaker={currentStep.speaker}
            onContinue={nextStep}
            className="animate-fade-in"
          >
            {currentStep.isLast && (
              <div className="flex justify-between mt-4">
                <Button 
                  onClick={skipOnboarding} 
                  variant="outline"
                >
                  Saltar
                </Button>
                <Button 
                  onClick={nextStep} 
                  className="rpg-button"
                >
                  ¡Vamos!
                </Button>
              </div>
            )}
          </RPGDialog>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
