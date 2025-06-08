

import React from 'react';
import { PageShell } from '../components/shared/PageShell';
import { Card } from '../components/shared/Card';
import { TrophyIcon, CheckCircleIcon, HabitsIcon, SparklesIcon, WellbeingIcon } from '../components/icons';
import { Task, Habit } from '../types';

interface AchievementsPageProps {
  tasks: Task[];
  habits: Habit[];
  breathingExercisesCompletedCount: number;
  sparkles: number; // Added sparkles
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ tasks, habits, breathingExercisesCompletedCount, sparkles }) => {
  const completedTasks = tasks.filter(task => task.completed).sort((a,b) => b.createdAt - a.createdAt);
  const significantHabitStreaks = habits.filter(habit => habit.streak >= 7); 

  const totalTasksCompleted = completedTasks.length;
  const longestHabitStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);

  return (
    <PageShell title="Mis Logros y Trofeos" icon={<TrophyIcon className="w-8 h-8" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-yellow-300 dark:bg-yellow-500 text-yellow-800 dark:text-yellow-100 text-center py-6">
          <CheckCircleIcon className="w-12 h-12 mx-auto mb-3 text-white dark:text-yellow-800" />
          <h3 className="text-3xl font-bold">{totalTasksCompleted}</h3>
          <p className="font-medium">Misiones Completadas</p>
        </Card>
        <Card className="bg-teal-500 dark:bg-teal-600 text-white text-center py-6">
          <HabitsIcon className="w-12 h-12 mx-auto mb-3" />
          <h3 className="text-3xl font-bold">{longestHabitStreak}</h3>
          <p className="font-medium">Racha de Hábito Más Larga</p>
        </Card>
        <Card className="bg-purple-500 dark:bg-purple-600 text-white text-center py-6">
          <WellbeingIcon className="w-12 h-12 mx-auto mb-3" />
          <h3 className="text-3xl font-bold">{breathingExercisesCompletedCount}</h3>
          <p className="font-medium">Sesiones de Bienestar</p>
        </Card>
        <Card className="bg-pink-500 dark:bg-pink-600 text-white text-center py-6">
          <SparklesIcon className="w-12 h-12 mx-auto mb-3" />
          <h3 className="text-3xl font-bold">{sparkles}</h3>
          <p className="font-medium">Mushu Sparkles ✨</p>
        </Card>
      </div>

      {(totalTasksCompleted === 0 && significantHabitStreaks.length === 0 && breathingExercisesCompletedCount === 0 && sparkles === 0) && (
         <Card className="text-center">
          <SparklesIcon className="w-12 h-12 mx-auto text-yellow-400 dark:text-yellow-300 mb-4" />
          <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">¡Tu aventura de logros apenas comienza!</h3>
          <p className="text-neutral-500 dark:text-neutral-400">Completa tareas, mantén tus hábitos y realiza sesiones de bienestar para llenar esta página de trofeos y ganar Sparkles. ¡Tú puedes!</p>
        </Card>
      )}

      {completedTasks.length > 0 && (
        <Card title="Misiones Completadas Recientemente" icon={<CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400" />}>
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {completedTasks.slice(0, 10).map(task => ( 
              task.createdAt && ( 
                <li key={task.id} className="p-3 bg-green-50 dark:bg-green-800/60 rounded-md shadow-sm">
                  <p className="font-semibold text-green-700 dark:text-green-300">{task.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Completada el: {new Date(task.createdAt).toLocaleDateString('es-ES')}</p>
                </li>
              )
            ))}
          </ul>
          {completedTasks.length > 10 && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">Y {completedTasks.length -10} más...</p>}
        </Card>
      )}

      {significantHabitStreaks.length > 0 && (
        <Card title="Rachas de Hábitos Destacadas" icon={<HabitsIcon className="w-6 h-6 text-teal-500 dark:text-teal-400" />} className="mt-6">
          <ul className="space-y-3">
            {significantHabitStreaks.map(habit => (
              <li key={habit.id} className="p-3 bg-teal-50 dark:bg-teal-800/60 rounded-md shadow-sm">
                <p className="font-semibold text-teal-700 dark:text-teal-300">{habit.name}</p>
                <p className="text-yellow-600 dark:text-yellow-400 font-bold">¡Racha de {habit.streak} días! 🔥</p>
                {habit.lastCompleted && <p className="text-xs text-teal-600 dark:text-teal-400">Última vez activo: {new Date(habit.lastCompleted).toLocaleDateString('es-ES')}</p>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </PageShell>
  );
};
