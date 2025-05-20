
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MindfulnessActivity } from './types';

interface ActivityListProps {
  activities: MindfulnessActivity[];
  selectedActivityId: string | null;
  onSelectActivity: (activity: MindfulnessActivity) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  activities, 
  selectedActivityId, 
  onSelectActivity 
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {activities.map(activity => (
        <Card 
          key={activity.id}
          className={`cursor-pointer transition-all hover:shadow-md bg-white/80 backdrop-blur
            ${selectedActivityId === activity.id ? 'border-purple-500 bg-purple-50' : ''}`}
          onClick={() => onSelectActivity(activity)}
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
  );
};

export default ActivityList;
