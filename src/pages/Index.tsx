
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MushuAvatar from '../components/MushuAvatar';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4 flex flex-col items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <MushuAvatar size="xl" animate={true} />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-mushu-dark">Mushu</h1>
        <p className="text-lg mb-8">Tu compañero emocional que te ayuda a crecer</p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/onboarding')} 
            className="w-full rpg-button"
          >
            Comenzar
          </Button>
          
          <Button 
            onClick={() => navigate('/login')} 
            variant="outline" 
            className="w-full"
          >
            Iniciar sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
