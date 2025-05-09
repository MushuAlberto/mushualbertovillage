
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MushuAvatar from '../components/MushuAvatar';
import { useUser } from '../contexts/UserContext';

const Onboarding = () => {
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // If already logged in, redirect to main menu
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/menu');
    }
  }, [isLoggedIn, navigate]);
  
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/login');
    }
  };
  
  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm">
            {step}/3
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSkip}
          >
            Saltar
          </Button>
        </div>
        
        <div className="flex justify-center mb-6">
          <MushuAvatar size="xl" animate={true} />
        </div>
        
        <div className="rpg-border">
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold mb-4">¡Hola! Soy Mushu</h1>
              <p className="mb-4">
                Tu compañero emocional que te ayudará a entender y gestionar tus emociones
                mientras te diviertes.
              </p>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold mb-4">Crece junto a mí</h1>
              <p className="mb-4">
                Completa misiones, registra tus emociones y gana experiencia.
                ¡Juntos superaremos los desafíos emocionales!
              </p>
            </div>
          )}
          
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold mb-4">¡Estamos listos!</h1>
              <p className="mb-4">
                Crea una cuenta para comenzar tu viaje con Mushu.
                ¡Tu bienestar emocional es nuestra misión!
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleNext} 
            className="w-full rpg-button mt-4"
          >
            {step < 3 ? 'Continuar' : 'Comenzar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
