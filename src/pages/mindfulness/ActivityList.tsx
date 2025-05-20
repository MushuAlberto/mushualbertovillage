
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MindfulnessActivity } from './types';
import { BookOpen, Wind, Sun } from 'lucide-react';

interface ActivityListProps {
  activities: MindfulnessActivity[];
  selectedActivityId: string | null;
  onSelectActivity: (activity: MindfulnessActivity) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  activities, 
  selectedActivityId, 
  onSelectActivity,
  activeFilter,
  onFilterChange
}) => {
  // Apply the filter to our activities list
  const filteredActivities = activeFilter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === activeFilter);

  // Get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'meditación':
        return <BookOpen className="h-5 w-5 text-purple-600" />;
      case 'respiración':
        return <Wind className="h-5 w-5 text-blue-500" />;
      case 'relajación':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6 bg-white/90 rounded-lg p-4 shadow-sm">
        <h3 className="mb-3 font-medium text-gray-700">Filtrar por tipo</h3>
        <RadioGroup
          value={activeFilter}
          onValueChange={onFilterChange}
          className="flex flex-wrap gap-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">Todos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="meditación" id="meditation" />
            <Label htmlFor="meditation" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-purple-600" /> Meditación
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="respiración" id="breathing" />
            <Label htmlFor="breathing" className="flex items-center gap-1">
              <Wind className="h-4 w-4 text-blue-500" /> Respiración
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="relajación" id="relaxation" />
            <Label htmlFor="relaxation" className="flex items-center gap-1">
              <Sun className="h-4 w-4 text-yellow-500" /> Relajación
            </Label>
          </div>
        </RadioGroup>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center p-4 bg-white/80 rounded-lg">
          <p className="text-gray-600">No hay actividades que coincidan con el filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredActivities.map(activity => (
            <Card 
              key={activity.id}
              className={`cursor-pointer transition-all hover:shadow-md bg-white/80 backdrop-blur
                ${selectedActivityId === activity.id ? 'border-purple-500 bg-purple-50' : ''}`}
              onClick={() => onSelectActivity(activity)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                    <h3 className="font-bold">{activity.name}</h3>
                  </div>
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
    </div>
  );
};

export default ActivityList;
