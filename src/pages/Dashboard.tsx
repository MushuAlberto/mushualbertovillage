
import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useEmotion } from '../contexts/EmotionContext';
import XPBar from '../components/XPBar';
import MushuAvatar from '../components/MushuAvatar';
import { BarChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { emotionHistory } = useEmotion();

  if (!user) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  // Prepare emotion data for the chart
  const emotionData = emotionHistory.slice(-14).map(entry => ({
    date: new Date(entry.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
    emotion: entry.emotion,
    intensity: entry.intensity
  }));

  // Mock XP progress data (in a real app this would come from actual user data)
  const xpProgressData = [
    { day: 'Lun', xp: 120 },
    { day: 'Mar', xp: 150 },
    { day: 'Mie', xp: 180 },
    { day: 'Jue', xp: 130 },
    { day: 'Vie', xp: 200 },
    { day: 'Sab', xp: 90 },
    { day: 'Dom', xp: 110 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-mushu-dark mb-6 text-center">
          Tu Progreso
        </h1>

        <div className="mb-6">
          <div className="rpg-border">
            <div className="flex items-center space-x-4 mb-4">
              <MushuAvatar size="md" />
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <div className="text-sm">Nivel {user.level}</div>
                <XPBar className="mt-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emotion Chart */}
          <div className="rpg-border">
            <h3 className="text-lg font-semibold mb-3">Registro Emocional</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={emotionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="intensity" 
                  stroke="#8884d8" 
                  name="Intensidad" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* XP Progress Chart */}
          <div className="rpg-border">
            <h3 className="text-lg font-semibold mb-3">XP Ganado</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={xpProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="xp" 
                  fill="#82ca9d" 
                  name="XP" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Statistics Summary */}
          <div className="rpg-border md:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Resumen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-md shadow">
                <div className="text-sm text-gray-500">Misiones Completadas</div>
                <div className="text-2xl font-bold">{user.completedMissions || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow">
                <div className="text-sm text-gray-500">Logros</div>
                <div className="text-2xl font-bold">{user.achievements?.length || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow">
                <div className="text-sm text-gray-500">Días Consecutivos</div>
                <div className="text-2xl font-bold">{user.streak || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow">
                <div className="text-sm text-gray-500">XP Total</div>
                <div className="text-2xl font-bold">{user.totalXp || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
