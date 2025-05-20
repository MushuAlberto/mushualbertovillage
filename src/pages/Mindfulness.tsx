
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MushuAvatar from '../components/MushuAvatar';
import ActivityList from './mindfulness/ActivityList';
import ActivityDetails from './mindfulness/ActivityDetails';
import IntroCard from './mindfulness/IntroCard';
import { mindfulnessActivities } from './mindfulness/activityData';
import { MindfulnessActivity } from './mindfulness/types';

const Mindfulness: React.FC = () => {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<MindfulnessActivity | null>(null);
  const [isActiveSession, setIsActiveSession] = useState(false);
  
  const handleSelectActivity = (activity: MindfulnessActivity) => {
    setSelectedActivity(activity);
    setIsActiveSession(false);
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
        
        <IntroCard />
        
        {isActiveSession && selectedActivity ? (
          <ActivityDetails 
            activity={selectedActivity} 
            onFinish={() => setIsActiveSession(false)} 
          />
        ) : (
          <>
            <ActivityList 
              activities={mindfulnessActivities}
              selectedActivityId={selectedActivity?.id || null}
              onSelectActivity={handleSelectActivity}
            />
            
            {selectedActivity && (
              <Button 
                className="w-full bg-mushu-primary hover:bg-mushu-dark mt-4"
                onClick={() => setIsActiveSession(true)}
              >
                Comenzar {selectedActivity.name}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Mindfulness;
