
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MushuAvatar from '../components/MushuAvatar';
import { useUser } from '../contexts/UserContext';

const Index = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
  const [characterPosition, setCharacterPosition] = useState({ x: 50, y: 50 });
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  // Locations in the RPG town
  const locations = [
    { id: 'arcade', name: 'Arcade', x: 25, y: 25, route: '/mini-game', description: 'Juega mini-juegos divertidos con Mushu' },
    { id: 'gym', name: 'Gimnasio', x: 75, y: 25, route: '/gym', description: 'Entrena y haz ejercicio con Mushu' },
    { id: 'garden', name: 'Jardín Mindfulness', x: 25, y: 75, route: '/mindfulness', description: 'Medita y realiza ejercicios de respiración' },
    { id: 'cafe', name: 'Cafetería', x: 75, y: 75, route: '/chat', description: 'Conversa con Mushu mientras tomas un café' }
  ];

  // Handle movement with arrow keys
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setCharacterPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        
        const step = 5;
        switch(e.key) {
          case 'ArrowUp': 
            newY = Math.max(10, prev.y - step); 
            break;
          case 'ArrowDown': 
            newY = Math.min(90, prev.y + step); 
            break;
          case 'ArrowLeft': 
            newX = Math.max(10, prev.x - step); 
            break;
          case 'ArrowRight': 
            newX = Math.min(90, prev.x + step); 
            break;
        }
        
        return { x: newX, y: newY };
      });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check if near a location
  React.useEffect(() => {
    const nearLocation = locations.find(loc => {
      const distance = Math.sqrt(
        Math.pow(loc.x - characterPosition.x, 2) + 
        Math.pow(loc.y - characterPosition.y, 2)
      );
      return distance < 15; // If within 15 units, consider "near"
    });
    
    setActiveLocation(nearLocation?.id || null);
  }, [characterPosition]);

  // Helper to handle location click or enter
  const enterLocation = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      navigate(location.route);
    }
  };

  // If not logged in, show the welcome screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4 flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <MushuAvatar size="xl" animate={true} mood="happy" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-mushu-dark">Mushu</h1>
          <p className="text-lg mb-8">Tu compañero emocional que te ayuda a crecer</p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/onboarding')} 
              className="w-full bg-mushu-primary hover:bg-mushu-dark text-white"
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-300 p-4 relative overflow-hidden">
      {/* RPG Map Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598539961065-598164b4acc4?q=80&w=1630&auto=format&fit=crop')] opacity-30 bg-cover bg-center z-0"></div>
      
      {/* Town Title */}
      <h1 className="text-3xl font-bold text-center mb-6 relative z-10 text-mushu-dark">
        Pueblo Mushu
      </h1>
      
      {/* Town Map */}
      <div className="relative w-full max-w-3xl mx-auto aspect-square bg-green-200 rounded-xl border-4 border-mushu-dark shadow-lg z-10">
        {/* Locations */}
        {locations.map(location => (
          <div 
            key={location.id}
            className={`absolute w-16 h-16 rounded-full flex items-center justify-center transition-all
              ${activeLocation === location.id ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
            style={{ 
              left: `${location.x}%`, 
              top: `${location.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div 
              className="w-full h-full bg-mushu-primary rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
              onClick={() => enterLocation(location.id)}
            >
              <span className="text-white font-bold text-xs">{location.name}</span>
            </div>
          </div>
        ))}
        
        {/* Character (Mushu) */}
        <div 
          className="absolute w-12 h-12 z-20 transition-all duration-300"
          style={{ 
            left: `${characterPosition.x}%`, 
            top: `${characterPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-full h-full">
            <MushuAvatar size="md" animate={true} mood="happy" />
          </div>
        </div>
      </div>
      
      {/* Location Info Card */}
      {activeLocation && (
        <Card className="max-w-md mx-auto mt-6 bg-white/80 backdrop-blur shadow-lg z-10 relative">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold">
              {locations.find(l => l.id === activeLocation)?.name}
            </h2>
            <p className="mb-4">
              {locations.find(l => l.id === activeLocation)?.description}
            </p>
            <Button 
              onClick={() => enterLocation(activeLocation)}
              className="w-full bg-mushu-primary hover:bg-mushu-dark"
            >
              Entrar
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Instructions */}
      <div className="max-w-md mx-auto mt-6 text-center text-sm bg-white/70 p-2 rounded z-10 relative">
        <p>Usa las teclas de flecha para mover a Mushu por el pueblo</p>
        <p>Acércate a un lugar y haz clic en "Entrar" para visitarlo</p>
      </div>
      
      {/* Menu Button */}
      <div className="fixed bottom-4 right-4 z-20">
        <Button 
          onClick={() => navigate('/menu')}
          className="bg-mushu-dark hover:bg-mushu-primary"
        >
          Ir al Menú
        </Button>
      </div>
    </div>
  );
};

export default Index;
