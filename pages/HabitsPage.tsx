
import React, { useState } from 'react';
import { PageShell } from '../components/shared/PageShell';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { HabitsIcon, PlusIcon, TrashIcon, EditIcon, CheckCircleIcon, SparklesIcon } from '../components/icons';
import { Habit } from '../types';
import { generateSimpleText } from '../services/geminiService';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

interface HabitsPageProps {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

const HabitForm: React.FC<{
  onSubmit: (habit: Omit<Habit, 'id' | 'streak' | 'lastCompleted' | 'createdAt'>) => void;
  initialData?: Omit<Habit, 'id' | 'streak' | 'lastCompleted' | 'createdAt'>;
  onCancel?: () => void;
}> = ({ onSubmit, initialData, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(initialData?.frequency || 'daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, description, frequency });
    setName('');
    setDescription('');
    setFrequency('daily');
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
      <div>
        <label htmlFor="habitName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nombre del Hábito <span className="text-red-500">*</span></label>
        <input
          type="text"
          id="habitName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
          required
        />
      </div>
      <div>
        <label htmlFor="habitDescription" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Descripción (opcional)</label>
        <textarea
          id="habitDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
        />
      </div>
      <div>
        <label htmlFor="habitFrequency" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Frecuencia</label>
        <select
          id="habitFrequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
          className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100"
        >
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
        </select>
      </div>
      <div className="flex items-center justify-end space-x-3">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" leftIcon={<PlusIcon className="w-4 h-4"/>}>{initialData ? 'Guardar Hábito' : 'Añadir Hábito'}</Button>
      </div>
    </form>
  );
};

const HabitItem: React.FC<{
  habit: Habit;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  isLoadingCelebration: boolean;
  celebrationMessage: string | null;
}> = ({ habit, onToggleComplete, onDelete, onEdit, isLoadingCelebration, celebrationMessage }) => {
  const today = new Date().setHours(0,0,0,0);
  const lastCompletedDate = habit.lastCompleted ? new Date(habit.lastCompleted).setHours(0,0,0,0) : null;
  const isCompletedToday = lastCompletedDate === today;

  return (
    <Card className={`mb-4 transition-all duration-300 ${isCompletedToday ? 'bg-green-50 dark:bg-green-900/40' : 'bg-white dark:bg-neutral-800'}`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{habit.name}</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{habit.frequency === 'daily' ? 'Diario' : habit.frequency === 'weekly' ? 'Semanal' : 'Mensual'}</p>
          {habit.description && <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{habit.description}</p>}
          <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mt-1">Racha actual: {habit.streak} 🔥</p>
          {habit.lastCompleted && <p className="text-xs text-neutral-500 dark:text-neutral-400">Última vez completado: {new Date(habit.lastCompleted).toLocaleDateString('es-ES')}</p>}
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onToggleComplete(habit.id)}
            disabled={isCompletedToday || isLoadingCelebration}
            title={isCompletedToday ? "Hábito completado hoy" : "Marcar como completado hoy"}
          >
            {isLoadingCelebration && !isCompletedToday ? <LoadingSpinner size="sm"/> : (isCompletedToday ? <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400"/> : <CheckCircleIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500 hover:text-green-500 dark:hover:text-green-400"/>)}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(habit)} title="Editar hábito"><EditIcon className="w-5 h-5 text-teal-500 dark:text-teal-400"/></Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(habit.id)} title="Eliminar hábito"><TrashIcon className="w-5 h-5 text-red-500 dark:text-red-400"/></Button>
        </div>
      </div>
      {isLoadingCelebration && celebrationMessage === null && <div className="mt-2"><LoadingSpinner size="sm" /></div>}
      {celebrationMessage && (
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-teal-700 dark:text-teal-300 italic p-2 bg-teal-50 dark:bg-teal-900/40 rounded-md flex items-center">
            <SparklesIcon className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400 flex-shrink-0" /> {celebrationMessage}
          </p>
        </div>
      )}
    </Card>
  );
};


export const HabitsPage: React.FC<HabitsPageProps> = ({ habits, setHabits }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [celebratingHabitId, setCelebratingHabitId] = useState<string | null>(null);
  const [celebrationMessages, setCelebrationMessages] = useState<Record<string, string>>({});

  const addHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'lastCompleted'| 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: crypto.randomUUID(),
      streak: 0,
      lastCompleted: null,
      createdAt: Date.now(),
    };
    setHabits(prevHabits => [newHabit, ...prevHabits].sort((a,b) => (a.lastCompleted || Number.MAX_SAFE_INTEGER) - (b.lastCompleted || Number.MAX_SAFE_INTEGER) || b.createdAt - a.createdAt));
    setShowForm(false);
  };

  const updateHabit = (updatedHabitData: Omit<Habit, 'id' | 'streak' | 'lastCompleted'| 'createdAt'>) => {
    if (!editingHabit) return;
    setHabits(prevHabits => prevHabits.map(h => 
      h.id === editingHabit.id ? { ...editingHabit, ...updatedHabitData } : h
    ).sort((a,b) => (a.lastCompleted || Number.MAX_SAFE_INTEGER) - (b.lastCompleted || Number.MAX_SAFE_INTEGER) || b.createdAt - a.createdAt));
    setEditingHabit(null);
    setShowForm(false);
  };
  
  const toggleCompleteHabit = async (id: string) => {
    let newStreak = 0;
    let habitName = "";
    setCelebrationMessages(prev => ({...prev, [id]: ''}));
    setCelebratingHabitId(id);


    setHabits(prevHabits =>
      prevHabits.map(habit => {
        if (habit.id === id) {
          habitName = habit.name;
          const today = new Date().setHours(0,0,0,0);
          const lastCompletedDate = habit.lastCompleted ? new Date(habit.lastCompleted).setHours(0,0,0,0) : null;
          
          if (lastCompletedDate === today) {
            setCelebratingHabitId(null);
            return habit; 
          }

          newStreak = habit.streak + 1; 
          return { ...habit, streak: newStreak, lastCompleted: Date.now() };
        }
        return habit;
      }).sort((a,b) => (a.lastCompleted || Number.MAX_SAFE_INTEGER) - (b.lastCompleted || Number.MAX_SAFE_INTEGER) || b.createdAt - a.createdAt)
    );
    
    if (habitName) {
        try {
          const prompt = `¡Acabo de completar mi hábito "${habitName}" y llevo una racha de ${newStreak} ${newStreak > 1 ? 'días' : 'día'}! Genérame un mensaje corto (1-2 frases) de celebración y motivación de parte de Muchu.`;
          const {text: celebration} = await generateSimpleText(prompt);
          setCelebrationMessages(prev => ({...prev, [id]: celebration}));
        } catch (error) {
          console.error("Failed to get celebration message:", error);
          setCelebrationMessages(prev => ({...prev, [id]: `¡Felicidades por completar "${habitName}"! Sigue así.`}));
        }
    }
    setCelebratingHabitId(null);
  };

  const deleteHabit = (id: string) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };
  
  const sortedHabits = [...habits].sort((a,b) => (a.lastCompleted || Number.MAX_SAFE_INTEGER) - (b.lastCompleted || Number.MAX_SAFE_INTEGER) || b.createdAt - a.createdAt);


  return (
    <PageShell 
      title="Mis Rituales y Hábitos" 
      icon={<HabitsIcon className="w-8 h-8" />}
      actionButton={
        !showForm && (
          <Button onClick={() => {setEditingHabit(null); setShowForm(true);}} leftIcon={<PlusIcon className="w-5 h-5" />}>
            Nuevo Hábito
          </Button>
        )
      }
    >
      {showForm && (
         <HabitForm 
          onSubmit={editingHabit ? updateHabit : addHabit} 
          initialData={editingHabit ? {name: editingHabit.name, description: editingHabit.description, frequency: editingHabit.frequency} : undefined}
          onCancel={() => {setShowForm(false); setEditingHabit(null);}}
        />
      )}

      {sortedHabits.length > 0 ? (
        sortedHabits.map(habit => (
          <HabitItem 
            key={habit.id} 
            habit={habit} 
            onToggleComplete={toggleCompleteHabit} 
            onDelete={deleteHabit}
            onEdit={handleEdit}
            isLoadingCelebration={celebratingHabitId === habit.id && celebrationMessages[habit.id] === ''}
            celebrationMessage={celebrationMessages[habit.id] || null}
          />
        ))
      ) : (
        !showForm && (
        <Card className="text-center border-l-4 border-yellow-400 dark:border-yellow-500">
          <SparklesIcon className="w-12 h-12 mx-auto text-yellow-400 dark:text-yellow-300 mb-4" />
          <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">¡Empieza tu viaje de hábitos!</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">Los pequeños hábitos consistentes llevan a grandes transformaciones. Añade tu primer hábito para comenzar.</p>
          <Button onClick={() => {setEditingHabit(null); setShowForm(true);}} leftIcon={<PlusIcon className="w-5 h-5" />}>
            Crear mi Primer Hábito
          </Button>
        </Card>
        )
      )}
    </PageShell>
  );
};
