import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useMission } from '../contexts/MissionContext';
import { useEmotion } from '../contexts/EmotionContext';
import MenuButton from '../components/MenuButton';
import MushuAvatar from '../components/MushuAvatar';
import XPBar from '../components/XPBar';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MessageSquare, 
  Award, 
  CheckSquare,
  BarChart2, 
  Settings, 
  Smile, 
  Gamepad,
  Dumbbell,
  BookOpen 
} from 'lucide-react';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useUser();
  const { getActiveMissions } = useMission();
  const { currentEmotion } = useEmotion();
  const [greeting, setGreeting] = useState<string>("¡Hola!");
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);
  
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "¡Hola!";
    
    if (hour < 12) {
      newGreeting = "¡Buenos días!";
    } else if (hour < 18) {
      newGreeting = "¡Buenas tardes!";
    } else {
      newGreeting = "¡Buenas noches!";
    }
    
    setGreeting(newGreeting);
  }, []);
  
  // Get number of active missions for notification badge
  const activeMissions = getActiveMissions();
  const pendingMissionsCount = activeMissions.length;
  
  // Check if emotion check is needed today
  const needsEmotionCheck = !currentEmotion;
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header with user info */}
        <div className="rpg-border mb-6 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold">{greeting}</h2>
              <p>{user.name}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
            >
              Salir
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className="text-xs">Nivel</div>
              <div className="font-bold text-xl">{user.level}</div>
            </div>
            <div className="flex-1">
              <XPBar />
            </div>
          </div>
        </div>
        
        {/* Mushu Avatar */}
        <div className="flex justify-center mb-6">
          <MushuAvatar size="xl" animate={true} />
        </div>
        
        <div className="mb-4 text-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-mushu-dark hover:bg-mushu-primary"
            size="lg"
          >
            Ir al Pueblo
          </Button>
        </div>
        
        {/* Main Menu Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <MenuButton 
            icon={<Smile size={24} />} 
            label="Check-in" 
            to="/emotion-check" 
            notification={needsEmotionCheck ? 1 : 0}
          />
          <MenuButton 
            icon={<CheckSquare size={24} />} 
            label="Misiones" 
            to="/missions" 
            notification={pendingMissionsCount}
          />
          <MenuButton 
            icon={<MessageSquare size={24} />} 
            label="Cafetería" 
            to="/chat" 
          />
          <MenuButton 
            icon={<Award size={24} />} 
            label="Logros" 
            to="/achievements" 
          />
          <MenuButton 
            icon={<BarChart2 size={24} />} 
            label="Progreso" 
            to="/dashboard" 
          />
          <MenuButton 
            icon={<Settings size={24} />} 
            label="Mushu" 
            to="/customization" 
          />
          <MenuButton 
            icon={<Gamepad size={24} />} 
            label="Arcade" 
            to="/mini-game" 
          />
          <MenuButton 
            icon={<Dumbbell size={24} />} 
            label="Gimnasio" 
            to="/gym" 
          />
          <MenuButton 
            icon={<BookOpen size={24} />} 
            label="Jardín" 
            to="/mindfulness" 
          />
          <MenuButton 
            icon={<Calendar size={24} />} 
            label="Calendario" 
            to="/calendar" 
          />
        </div>
        
        {/* Settings button */}
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/settings')}
            variant="outline"
            size="sm"
          >
            <Settings size={16} className="mr-2" />
            Configuración
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
