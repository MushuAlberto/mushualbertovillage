
import React, { useState } from 'react';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useMission } from '../contexts/MissionContext';
import { useEmotion } from '../contexts/EmotionContext';
import { formatDate } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { EmotionRecord } from '../contexts/EmotionContext';

const Calendar: React.FC = () => {
  const { missions } = useMission();
  const { emotionHistory } = useEmotion();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Get events for the selected date
  const getEventsForDate = (date: Date | undefined) => {
    if (!date) return { missions: [], emotions: [] };
    
    const formattedDate = formatDate(date, 'yyyy-MM-dd');
    
    const dateMissions = missions.filter(mission => {
      // For this example, we're using the current date for all missions
      // In a real app, missions would have their own dates
      const missionDate = formatDate(new Date(), 'yyyy-MM-dd');
      return missionDate === formattedDate;
    });
    
    const dateEmotions = emotionHistory.filter(emotion => {
      const emotionDate = formatDate(new Date(emotion.date), 'yyyy-MM-dd');
      return emotionDate === formattedDate;
    });
    
    return { missions: dateMissions, emotions: dateEmotions };
  };
  
  const selectedDateEvents = getEventsForDate(selectedDate);
  
  // Function to render emoji based on emotion
  const getEmotionEmoji = (emotion: EmotionRecord['emotion']) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'anxious': return '😰';
      case 'neutral': return '😐';
      case 'excited': return '🤩';
      case 'tired': return '😴';
      default: return '😐';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-mushu-dark mb-6 text-center">
          Calendario
        </h1>
        
        <div className="rpg-border mb-6">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md"
            locale={es}
          />
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-3">
            {selectedDate ? formatDate(selectedDate, 'EEEE, d MMMM yyyy', { locale: es }) : 'Selecciona una fecha'}
          </h2>
          
          {selectedDateEvents.emotions.length > 0 && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Registro Emocional</h3>
                {selectedDateEvents.emotions.map((emotion, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <div className="text-2xl mr-2">{getEmotionEmoji(emotion.emotion)}</div>
                    <div>
                      <div className="font-medium">{emotion.emotion}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(new Date(emotion.date), 'HH:mm')}
                      </div>
                      {emotion.note && (
                        <div className="text-sm mt-1">{emotion.note}</div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          {selectedDateEvents.missions.length > 0 && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Misiones</h3>
                {selectedDateEvents.missions.map(mission => (
                  <div key={mission.id} className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${mission.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <div className={`font-medium ${mission.completed ? 'line-through opacity-70' : ''}`}>
                        {mission.title}
                      </div>
                      <div className="text-xs text-gray-500">{mission.type}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          {selectedDateEvents.emotions.length === 0 && selectedDateEvents.missions.length === 0 && (
            <div className="text-center p-6 rpg-border">
              <p className="text-gray-500">No hay eventos para este día</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
