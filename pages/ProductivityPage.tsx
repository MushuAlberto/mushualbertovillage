
import React, { useState, useEffect } from 'react';
import { PageShell } from '../components/shared/PageShell';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { 
    ClipboardListIcon, PlusIcon, TrashIcon, EditIcon, CheckCircleIcon, XCircleIcon, SparklesIcon, 
    TasksIcon, HabitsIcon, FocusIcon, Cog6ToothIcon, ListBulletIcon, ViewColumnsIcon, ViewListIcon 
} from '../components/icons';
import { Task, Habit, SubTask, TaskStatus } from '../types';
import { generateSimpleText } from '../services/geminiService';
import { MUCHU_TASK_NARRATIVE_PROMPT, MUCHU_TASK_COMPLETION_CELEBRATION_PROMPT } from '../constants';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

// --- Task Related Interfaces and Components ---
interface TaskFormData {
  name: string;
  description?: string;
  dueDate?: string;
}

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  initialData?: TaskFormData;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, description, dueDate });
    setName('');
    setDescription('');
    setDueDate('');
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
      <div>
        <label htmlFor="taskName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nombre de la Tarea <span className="text-red-500">*</span></label>
        <input
          type="text"
          id="taskName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
          required
        />
      </div>
      <div>
        <label htmlFor="taskDescription" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Descripción (opcional)</label>
        <textarea
          id="taskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
        />
      </div>
      <div>
        <label htmlFor="taskDueDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Fecha Límite (opcional)</label>
        <input
          type="date"
          id="taskDueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
          style={{ colorScheme: 'dark' }} // Helps with date picker in dark mode
        />
      </div>
      <div className="flex items-center justify-end space-x-3">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" leftIcon={<PlusIcon className="w-4 h-4"/>}>{initialData ? 'Guardar Cambios' : 'Añadir Tarea'}</Button>
      </div>
    </form>
  );
};

interface TaskItemProps {
  task: Task; 
  onToggleComplete: (id: string, taskName: string, currentCompletionStatus: boolean) => void; 
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onGetNarrative: (taskName: string, taskId: string) => Promise<void>;
  isLoadingNarrative: boolean;
  isLoadingCompletionMessage: boolean;
  onStartFocusSession: (task: Task) => void;
  isFocusSessionActive: boolean;
  onAddSubTask: (parentId: string, subTaskName: string) => void;
  onToggleSubTaskComplete: (parentId: string, subTaskId: string) => void;
  onDeleteSubTask: (parentId: string, subTaskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggleComplete, 
  onDelete, 
  onEdit, 
  onGetNarrative, 
  isLoadingNarrative, 
  isLoadingCompletionMessage,
  onStartFocusSession,
  isFocusSessionActive,
  onAddSubTask,
  onToggleSubTaskComplete,
  onDeleteSubTask
}) => {
  const [showNarrative, setShowNarrative] = useState(false);
  const [narrative, setNarrative] = useState(task.storyHook || '');
  const [newSubTaskName, setNewSubTaskName] = useState('');
  
  const handleGetNarrative = async () => {
    setShowNarrative(true);
    setNarrative(''); 
    await onGetNarrative(task.name, task.id);
  };

  useEffect(() => {
    if (task.storyHook) {
      setNarrative(task.storyHook);
    }
  }, [task.storyHook]);

  const handleSubTaskFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubTaskName.trim()) {
      onAddSubTask(task.id, newSubTaskName.trim());
      setNewSubTaskName('');
    }
  };

  const completedSubTasksCount = task.subTasks?.filter(st => st.completed).length || 0;
  const totalSubTasksCount = task.subTasks?.length || 0;

  return (
    <Card className={`mb-4 transition-all duration-300 ${task.completed ? 'bg-green-50 dark:bg-green-900/30 opacity-90' : 'bg-white dark:bg-neutral-800'}`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className={`text-lg font-semibold ${task.completed ? 'line-through text-neutral-500 dark:text-neutral-400' : 'text-neutral-800 dark:text-neutral-100'}`}>{task.name}</h4>
          {task.description && <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{task.description}</p>}
          {task.dueDate && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Fecha Límite: {new Date(task.dueDate+"T00:00:00").toLocaleDateString('es-ES')}</p>}
          {task.completed && task.createdAt && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Completada el: {new Date(task.createdAt).toLocaleDateString('es-ES')}</p>}
           {totalSubTasksCount > 0 && !task.completed && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Sub-tareas: {completedSubTasksCount} / {totalSubTasksCount} completadas
            </p>
          )}
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onToggleComplete(task.id, task.name, task.completed)} 
            title={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
            disabled={isLoadingCompletionMessage}
          >
            {isLoadingCompletionMessage && !task.completed ? <LoadingSpinner size="sm" /> : (task.completed ? <XCircleIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400"/> : <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400"/>)}
          </Button>
          {!task.completed && <Button variant="ghost" size="sm" onClick={() => onEdit(task)} title="Editar tarea"><EditIcon className="w-5 h-5 text-teal-500 dark:text-teal-400"/></Button>}
          <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)} title="Eliminar tarea"><TrashIcon className="w-5 h-5 text-red-500 dark:text-red-400"/></Button>
        </div>
      </div>

      {/* Sub-Tasks Section */}
      {!task.completed && (
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <h5 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Pasos Pequeños (Sub-tareas):</h5>
          {task.subTasks && task.subTasks.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {task.subTasks.map(subTask => (
                <li key={subTask.id} className={`flex items-center justify-between p-1.5 rounded-md text-sm ${subTask.completed ? 'bg-green-50 dark:bg-green-800/30' : 'bg-neutral-100 dark:bg-neutral-700/50'}`}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={subTask.completed}
                      onChange={() => onToggleSubTaskComplete(task.id, subTask.id)}
                      className="h-4 w-4 text-teal-600 border-neutral-300 dark:border-neutral-500 rounded focus:ring-teal-500 mr-2"
                      aria-labelledby={`subtask-name-${subTask.id}`}
                    />
                    <span id={`subtask-name-${subTask.id}`} className={subTask.completed ? 'line-through text-neutral-500 dark:text-neutral-400' : 'text-neutral-700 dark:text-neutral-200'}>
                      {subTask.name}
                    </span>
                    {subTask.completed && <SparklesIcon className="w-3 h-3 text-yellow-500 ml-1" />}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onDeleteSubTask(task.id, subTask.id)} className="!p-0.5" title={`Eliminar sub-tarea ${subTask.name}`}>
                    <TrashIcon className="w-3.5 h-3.5 text-red-400 hover:text-red-600"/>
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleSubTaskFormSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={newSubTaskName}
              onChange={(e) => setNewSubTaskName(e.target.value)}
              placeholder="Añadir un paso pequeño..."
              className="flex-grow px-2 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
            />
            <Button type="submit" size="sm" variant="ghost" disabled={!newSubTaskName.trim()} leftIcon={<PlusIcon className="w-4 h-4"/>}>
              Añadir
            </Button>
          </form>
        </div>
      )}


      {!task.completed && (
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleGetNarrative}
              disabled={isLoadingNarrative && narrative === ''}
              leftIcon={(isLoadingNarrative && narrative === '') ? <LoadingSpinner size="sm" color="text-neutral-700" darkColor="dark:text-neutral-800"/> : <SparklesIcon className="w-4 h-4"/>}
            >
              {(isLoadingNarrative && narrative === '') ? 'Motivando...' : '¡Dame motivación!'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStartFocusSession(task)}
              disabled={isFocusSessionActive}
              leftIcon={<FocusIcon className="w-4 h-4" />}
              title={isFocusSessionActive ? "Hay otra sesión de foco activa" : "Iniciar sesión de foco para esta tarea"}
            >
              Iniciar Foco
            </Button>
          </div>
          {narrative && (showNarrative || task.storyHook) && (
             <p className="mt-2 text-sm text-teal-700 dark:text-teal-300 italic p-2 bg-teal-50 dark:bg-teal-900/40 rounded-md">{narrative}</p>
          )}
        </div>
      )}
      {task.completed && task.completionMessage && (
        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
            <p className="text-sm text-green-700 dark:text-green-300 italic p-2 bg-green-100 dark:bg-green-800/40 rounded-md flex items-center">
                <SparklesIcon className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400 flex-shrink-0" /> {task.completionMessage}
            </p>
        </div>
      )}
    </Card>
  );
};

// --- Kanban Task Card ---
interface KanbanTaskCardProps {
    task: Task;
    onChangeStatus: (taskId: string, newStatus: TaskStatus) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onStartFocusSession: (task: Task) => void;
    isFocusSessionActive: boolean;
}

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({ task, onChangeStatus, onEdit, onDelete, onStartFocusSession, isFocusSessionActive }) => {
    const completedSubTasksCount = task.subTasks?.filter(st => st.completed).length || 0;
    const totalSubTasksCount = task.subTasks?.length || 0;

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChangeStatus(task.id, e.target.value as TaskStatus);
    };

    return (
        <div className="bg-white dark:bg-neutral-700 p-3 rounded-lg shadow-md mb-3 transition-shadow hover:shadow-lg">
            <h5 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1 text-sm leading-tight">{task.name}</h5>
            {task.dueDate && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Vence: {new Date(task.dueDate + "T00:00:00").toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </p>
            )}
            {totalSubTasksCount > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                    Sub-tareas: {completedSubTasksCount}/{totalSubTasksCount}
                </p>
            )}
            <div className="mb-2.5">
                <label htmlFor={`status-select-${task.id}`} className="sr-only">Cambiar estado</label>
                <select
                    id={`status-select-${task.id}`}
                    value={task.status}
                    onChange={handleStatusChange}
                    className="w-full text-xs p-1.5 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-neutral-50 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200"
                >
                    <option value="todo">Por Hacer</option>
                    <option value="inprogress">En Proceso</option>
                    <option value="done">Hecho</option>
                </select>
            </div>
            <div className="flex items-center justify-start space-x-1.5 text-xs">
                <Button onClick={() => onEdit(task)} variant="ghost" size="sm" className="!p-1" title="Editar">
                    <EditIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                </Button>
                 <Button 
                    onClick={() => onStartFocusSession(task)} 
                    variant="ghost" size="sm" className="!p-1" 
                    title="Iniciar Foco"
                    disabled={isFocusSessionActive}
                >
                    <FocusIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </Button>
                <Button onClick={() => onDelete(task.id)} variant="ghost" size="sm" className="!p-1" title="Eliminar">
                    <TrashIcon className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                </Button>
            </div>
        </div>
    );
};


// --- Habit Related Interfaces and Components ---
interface HabitFormProps {
  onSubmit: (habit: Omit<Habit, 'id' | 'streak' | 'lastCompleted' | 'createdAt'>) => void;
  initialData?: Omit<Habit, 'id' | 'streak' | 'lastCompleted' | 'createdAt'>;
  onCancel?: () => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ onSubmit, initialData, onCancel }) => {
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

interface HabitItemProps {
  habit: Habit;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  isLoadingCelebration: boolean;
  celebrationMessage: string | null;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, onToggleComplete, onDelete, onEdit, isLoadingCelebration, celebrationMessage }) => {
  const today = new Date().setHours(0,0,0,0);
  const lastCompletedDate = habit.lastCompleted ? new Date(habit.lastCompleted).setHours(0,0,0,0) : null;
  const isCompletedToday = lastCompletedDate === today;

  return (
    <Card className={`mb-4 transition-all duration-300 ${isCompletedToday ? 'bg-green-50 dark:bg-green-900/30' : 'bg-white dark:bg-neutral-800'}`}>
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
            {isLoadingCelebration && !isCompletedToday ? <LoadingSpinner size="sm"/> : (isCompletedToday ? <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400"/> : <CheckCircleIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500 hover:text-green-500 dark:hover:text-green-400"/>) }
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

// --- Productivity Page ---
interface ProductivityPageProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  setSparkles: React.Dispatch<React.SetStateAction<number>>;
  activeFocusTask: Task | null; // For disabling focus buttons
  setActiveFocusTask: (task: Task | null) => void; // To start a focus session
}

export const ProductivityPage: React.FC<ProductivityPageProps> = ({ 
  tasks, 
  setTasks, 
  habits, 
  setHabits, 
  setSparkles,
  activeFocusTask,
  setActiveFocusTask
}) => {
  const [tasksViewMode, setTasksViewMode] = useState<'list' | 'board'>('list');
  // Task States
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loadingNarrativeTaskId, setLoadingNarrativeTaskId] = useState<string | null>(null);
  const [loadingCompletionMessageTaskId, setLoadingCompletionMessageTaskId] = useState<string | null>(null);


  // Habit States
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [celebratingHabitId, setCelebratingHabitId] = useState<string | null>(null);
  const [celebrationMessages, setCelebrationMessages] = useState<Record<string, string>>({});

  // Task Functions
  const addTask = (taskData: TaskFormData) => {
    const newTask: Task = { 
        id: crypto.randomUUID(),
        name: taskData.name,
        description: taskData.description,
        dueDate: taskData.dueDate,
        completed: false, 
        createdAt: Date.now(), 
        subTasks: [], 
        status: 'todo' 
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setShowTaskForm(false);
  };

  const updateTask = (updatedTaskData: TaskFormData) => {
    if (!editingTask) return;
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === editingTask.id ? { ...editingTask, ...updatedTaskData, createdAt: Date.now() } : task
    ));
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const toggleCompleteTask = async (id: string, taskName: string, currentCompletionStatus: boolean) => {
    if (!currentCompletionStatus) { // Task is being marked as complete
      setLoadingCompletionMessageTaskId(id);
      setSparkles(prev => prev + 10); // Award 10 Sparkles for main task
      let celebrationMsg = "¡Bien hecho!";
      try {
        const { text } = await generateSimpleText(MUCHU_TASK_COMPLETION_CELEBRATION_PROMPT(taskName));
        celebrationMsg = text + " (+10 ✨)";
      } catch (error) {
        console.error("Failed to get task completion celebration:", error);
        celebrationMsg = `¡"${taskName}" completado! Sigue así. (+10 ✨)`;
      }
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === id) {
          const updatedSubTasks = task.subTasks?.map(st => ({ ...st, completed: true })) || [];
          return { ...task, completed: true, status: 'done', createdAt: Date.now(), completionMessage: celebrationMsg, storyHook: undefined, subTasks: updatedSubTasks };
        }
        return task;
      }));
      setLoadingCompletionMessageTaskId(null);
    } else { // Task is being marked as incomplete
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === id ? { ...task, completed: false, status: 'todo', completionMessage: undefined } : task
      ));
    }
  };

  const handleChangeTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const taskToChange = tasks.find(t => t.id === taskId);
    if (!taskToChange) return;

    if (newStatus === 'done') {
        if (!taskToChange.completed) { // Only trigger full completion if not already done
            toggleCompleteTask(taskId, taskToChange.name, false);
        }
    } else { // 'todo' or 'inprogress'
        setTasks(prevTasks => prevTasks.map(t => {
            if (t.id === taskId) {
                return { ...t, status: newStatus, completed: false, completionMessage: undefined };
            }
            return t;
        }));
    }
  };

  const deleteTask = (id: string) => setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowHabitForm(false); 
    setShowTaskForm(true);
  };

  const handleGetNarrative = async (taskName: string, taskId: string) => {
    setLoadingNarrativeTaskId(taskId);
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? {...t, storyHook: undefined} : t)); 
    try {
      const {text: narrative} = await generateSimpleText(MUCHU_TASK_NARRATIVE_PROMPT(taskName));
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? {...t, storyHook: narrative} : t));
    } catch (error) {
      console.error("Failed to get narrative:", error);
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? {...t, storyHook: "¡Ups! No pude generar una frase motivadora ahora mismo. ¡Pero tú puedes con esto!"} : t));
    } finally {
      setLoadingNarrativeTaskId(null);
    }
  };

  // SubTask Functions
  const handleAddSubTask = (parentId: string, subTaskName: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === parentId) {
        const newSubTask: SubTask = {
          id: crypto.randomUUID(),
          name: subTaskName,
          completed: false,
          parentId: parentId,
          createdAt: Date.now()
        };
        const updatedSubTasks = [...(task.subTasks || []), newSubTask];
        return { ...task, subTasks: updatedSubTasks };
      }
      return task;
    }));
  };

  const handleToggleSubTaskComplete = (parentId: string, subTaskId: string) => {
    let subTaskJustCompleted = false;
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === parentId) {
        const updatedSubTasks = task.subTasks?.map(st => {
          if (st.id === subTaskId) {
            if(!st.completed) subTaskJustCompleted = true; 
            return { ...st, completed: !st.completed };
          }
          return st;
        }) || [];
        // Check if all subtasks are now complete
        const allSubTasksComplete = updatedSubTasks.length > 0 && updatedSubTasks.every(st => st.completed);
        if (allSubTasksComplete && !task.completed) {
          // Automatically complete the parent task if all subtasks are done
          // Note: This won't trigger the AI celebration for the parent task automatically here.
          // That logic is in toggleCompleteTask for the parent. Consider if this is desired.
          // For now, it just marks parent as complete visually.
           // toggleCompleteTask(parentId, task.name, false); // This would trigger AI and sparkles
           // If we want a silent completion of parent:
           return { ...task, subTasks: updatedSubTasks, completed: true, status: 'done', completionMessage: task.completionMessage || "¡Todos los pasos completados!" };
        }
        return { ...task, subTasks: updatedSubTasks };
      }
      return task;
    }));
    if(subTaskJustCompleted){
      setSparkles(prev => prev + 2); 
    }
  };

  const handleDeleteSubTask = (parentId: string, subTaskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === parentId) {
        const updatedSubTasks = task.subTasks?.filter(st => st.id !== subTaskId) || [];
        return { ...task, subTasks: updatedSubTasks };
      }
      return task;
    }));
  };

  const pendingTasks = tasks.filter(task => !task.completed).sort((a,b) => (a.dueDate && b.dueDate ? new Date(a.dueDate+"T00:00:00").getTime() - new Date(b.dueDate+"T00:00:00").getTime() : (a.dueDate ? -1 : (b.dueDate ? 1 : b.createdAt - a.createdAt ))));
  const completedTasksForList = tasks.filter(task => task.completed).sort((a,b) => b.createdAt - a.createdAt);

  const tasksTodo = tasks.filter(task => !task.completed && task.status === 'todo').sort((a,b) => (a.dueDate && b.dueDate ? new Date(a.dueDate+"T00:00:00").getTime() - new Date(b.dueDate+"T00:00:00").getTime() : (a.dueDate ? -1 : (b.dueDate ? 1 : b.createdAt - a.createdAt ))));
  const tasksInProgress = tasks.filter(task => !task.completed && task.status === 'inprogress').sort((a,b) => (a.dueDate && b.dueDate ? new Date(a.dueDate+"T00:00:00").getTime() - new Date(b.dueDate+"T00:00:00").getTime() : (a.dueDate ? -1 : (b.dueDate ? 1 : b.createdAt - a.createdAt ))));
  const tasksDone = tasks.filter(task => task.completed && task.status === 'done').sort((a,b) => b.createdAt - a.createdAt);


  // Habit Functions
  const addHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'lastCompleted'| 'createdAt'>) => {
    const newHabit: Habit = { ...habitData, id: crypto.randomUUID(), streak: 0, lastCompleted: null, createdAt: Date.now() };
    setHabits(prevHabits => [newHabit, ...prevHabits].sort((a,b) => (a.lastCompleted || Number.MAX_SAFE_INTEGER) - (b.lastCompleted || Number.MAX_SAFE_INTEGER) || b.createdAt - a.createdAt));
    setShowHabitForm(false);
  };

  const updateHabit = (updatedHabitData: Omit<Habit, 'id' | 'streak' | 'lastCompleted'| 'createdAt'>) => {
    if (!editingHabit) return;
    setHabits(prevHabits => prevHabits.map(h => 
      h.id === editingHabit.id ? { ...editingHabit, ...updatedHabitData } : h
    ).sort((a,b) => (a.lastCompleted || Number.MAX_SAFE_INTEGER) - (b.lastCompleted || Number.MAX_SAFE_INTEGER) || b.createdAt - a.createdAt));
    setEditingHabit(null);
    setShowHabitForm(false);
  };
  
  const toggleCompleteHabit = async (id: string) => {
    let newStreak = 0;
    let habitName = "";
    let awardedSparkles = 5; // Base for completion
    setCelebrationMessages(prev => ({...prev, [id]: ''})); 
    setCelebratingHabitId(id);

    setHabits(prevHabits => prevHabits.map(habit => {
      if (habit.id === id) {
        habitName = habit.name;
        const today = new Date().setHours(0,0,0,0);
        const lastCompletedDate = habit.lastCompleted ? new Date(habit.lastCompleted).setHours(0,0,0,0) : null;
        if (lastCompletedDate === today) { 
            setCelebratingHabitId(null); 
            return habit; 
        }
        newStreak = habit.streak + 1;
        if (newStreak > 0 && newStreak % 7 === 0) {
            awardedSparkles += 10; // Bonus for 7-day streak milestone
        }
        return { ...habit, streak: newStreak, lastCompleted: Date.now() };
      }
      return habit;
    }).sort((a,b) => (a.lastCompleted || Number.MAX_SAFE_INTEGER) - (b.lastCompleted || Number.MAX_SAFE_INTEGER) || b.createdAt - a.createdAt));
    
    setSparkles(prev => prev + awardedSparkles);

    if (habitName) { 
        try {
          const prompt = `¡Acabo de completar mi hábito "${habitName}" y llevo una racha de ${newStreak} ${newStreak > 1 ? 'días' : 'día'}! Genérame un mensaje corto (1-2 frases) de celebración y motivación de parte de Muchu. (Gané ${awardedSparkles} ✨)`;
          const {text: celebration} = await generateSimpleText(prompt);
          setCelebrationMessages(prev => ({...prev, [id]: celebration}));
        } catch (error) {
          console.error("Failed to get celebration message:", error);
          setCelebrationMessages(prev => ({...prev, [id]: `¡Felicidades por completar "${habitName}"! Sigue así. (+${awardedSparkles} ✨)`}));
        }
    }
    setCelebratingHabitId(null);
  };

  const deleteHabit = (id: string) => setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowTaskForm(false); 
    setShowHabitForm(true);
  };
  
  const actionButtons = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="flex items-center space-x-1 p-0.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg">
            <Button
                onClick={() => setTasksViewMode('list')}
                variant={tasksViewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                className={`!px-2 !py-1 !text-xs ${tasksViewMode === 'list' ? 'bg-teal-600 dark:bg-teal-500 text-white' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'}`}
                leftIcon={<ViewListIcon className="w-4 h-4"/>}
            >
                Lista
            </Button>
            <Button
                onClick={() => setTasksViewMode('board')}
                variant={tasksViewMode === 'board' ? 'primary' : 'ghost'}
                size="sm"
                className={`!px-2 !py-1 !text-xs ${tasksViewMode === 'board' ? 'bg-teal-600 dark:bg-teal-500 text-white' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'}`}
                leftIcon={<ViewColumnsIcon className="w-4 h-4"/>}
            >
                Tablero
            </Button>
        </div>
        {!showTaskForm && !showHabitForm && (
            <>
            <Button onClick={() => { setEditingTask(null); setShowHabitForm(false); setShowTaskForm(true); }} leftIcon={<PlusIcon className="w-5 h-5" />}>
                Nueva Tarea
            </Button>
            <Button onClick={() => { setEditingHabit(null); setShowTaskForm(false); setShowHabitForm(true); }} leftIcon={<PlusIcon className="w-5 h-5" />} variant="secondary">
                Nuevo Hábito
            </Button>
            </>
        )}
    </div>
  );
  
  const sortedHabits = [...habits].sort((a,b) => (a.lastCompleted || Number.MAX_SAFE_INTEGER) - (b.lastCompleted || Number.MAX_SAFE_INTEGER) || b.createdAt - a.createdAt);


  return (
    <PageShell 
      title="Mis Tareas y Hábitos" 
      icon={<ClipboardListIcon className="w-8 h-8" />}
      actionButton={actionButtons}
    >
      {/* Tasks Section */}
      <section className="mb-12">
        <div className="flex items-center mb-6">
            <TasksIcon className="w-7 h-7 text-teal-600 dark:text-teal-400 mr-3"/>
            <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200">Mis Misiones y Tareas</h2>
        </div>
        {showTaskForm && (
          <TaskForm 
            onSubmit={editingTask ? updateTask : addTask} 
            initialData={editingTask ? {name: editingTask.name, description: editingTask.description, dueDate: editingTask.dueDate} : undefined}
            onCancel={() => { setShowTaskForm(false); setEditingTask(null);}}
          />
        )}

        {tasksViewMode === 'list' && (
            <>
            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Pendientes ({pendingTasks.length})</h3>
            {pendingTasks.length > 0 ? (
            pendingTasks.map(task => (
                <TaskItem 
                key={task.id} task={task} 
                onToggleComplete={toggleCompleteTask} onDelete={deleteTask} onEdit={handleEditTask}
                onGetNarrative={handleGetNarrative}
                isLoadingNarrative={loadingNarrativeTaskId === task.id}
                isLoadingCompletionMessage={loadingCompletionMessageTaskId === task.id}
                onStartFocusSession={setActiveFocusTask}
                isFocusSessionActive={activeFocusTask !== null}
                onAddSubTask={handleAddSubTask}
                onToggleSubTaskComplete={handleToggleSubTaskComplete}
                onDeleteSubTask={handleDeleteSubTask}
                />
            ))
            ) : (
            !showTaskForm && <p className="text-neutral-500 dark:text-neutral-400 italic">¡Ninguna tarea pendiente! ¿Listo para tu próxima aventura?</p>
            )}
            {completedTasksForList.length > 0 && (
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Completadas ({completedTasksForList.length})</h3>
                {completedTasksForList.map(task => (
                <TaskItem 
                    key={task.id} task={task} 
                    onToggleComplete={toggleCompleteTask} onDelete={deleteTask} onEdit={handleEditTask}
                    onGetNarrative={handleGetNarrative} 
                    isLoadingNarrative={loadingNarrativeTaskId === task.id}
                    isLoadingCompletionMessage={loadingCompletionMessageTaskId === task.id}
                    onStartFocusSession={setActiveFocusTask}
                    isFocusSessionActive={activeFocusTask !== null}
                    onAddSubTask={handleAddSubTask}
                    onToggleSubTaskComplete={handleToggleSubTaskComplete}
                    onDeleteSubTask={handleDeleteSubTask}
                />
                ))}
            </div>
            )}
            </>
        )}

        {tasksViewMode === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* To Do Column */}
                <div className="bg-neutral-100 dark:bg-neutral-800/70 p-3 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-3 flex items-center">
                        <ListBulletIcon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/> Por Hacer ({tasksTodo.length})
                    </h3>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                        {tasksTodo.map(task => (
                            <KanbanTaskCard key={task.id} task={task} onChangeStatus={handleChangeTaskStatus} onEdit={handleEditTask} onDelete={deleteTask} onStartFocusSession={setActiveFocusTask} isFocusSessionActive={activeFocusTask !== null} />
                        ))}
                        {tasksTodo.length === 0 && <p className="text-xs text-neutral-500 dark:text-neutral-400 italic p-2">Nada por aquí.</p>}
                    </div>
                </div>
                {/* In Progress Column */}
                <div className="bg-neutral-100 dark:bg-neutral-800/70 p-3 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-3 flex items-center">
                        <Cog6ToothIcon className="w-5 h-5 mr-2 text-yellow-500 dark:text-yellow-400"/> En Proceso ({tasksInProgress.length})
                    </h3>
                     <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                        {tasksInProgress.map(task => (
                           <KanbanTaskCard key={task.id} task={task} onChangeStatus={handleChangeTaskStatus} onEdit={handleEditTask} onDelete={deleteTask} onStartFocusSession={setActiveFocusTask} isFocusSessionActive={activeFocusTask !== null} />
                        ))}
                        {tasksInProgress.length === 0 && <p className="text-xs text-neutral-500 dark:text-neutral-400 italic p-2">Nada por aquí.</p>}
                    </div>
                </div>
                {/* Done Column */}
                <div className="bg-neutral-100 dark:bg-neutral-800/70 p-3 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-3 flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500 dark:text-green-400"/> Hecho ({tasksDone.length})
                    </h3>
                     <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                        {tasksDone.map(task => (
                           <KanbanTaskCard key={task.id} task={task} onChangeStatus={handleChangeTaskStatus} onEdit={handleEditTask} onDelete={deleteTask} onStartFocusSession={setActiveFocusTask} isFocusSessionActive={activeFocusTask !== null}/>
                        ))}
                        {tasksDone.length === 0 && <p className="text-xs text-neutral-500 dark:text-neutral-400 italic p-2">Nada por aquí.</p>}
                    </div>
                </div>
            </div>
        )}

      </section>

      {/* Habits Section */}
      <section className="mt-12">
        <div className="flex items-center mb-6">
            <HabitsIcon className="w-7 h-7 text-yellow-500 dark:text-yellow-400 mr-3"/>
            <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200">Mis Rituales y Hábitos</h2>
        </div>
        {showHabitForm && (
         <HabitForm 
            onSubmit={editingHabit ? updateHabit : addHabit} 
            initialData={editingHabit ? {name: editingHabit.name, description: editingHabit.description, frequency: editingHabit.frequency} : undefined}
            onCancel={() => {setShowHabitForm(false); setEditingHabit(null);}}
          />
        )}
        {sortedHabits.length > 0 ? (
          sortedHabits.map(habit => (
            <HabitItem 
              key={habit.id} habit={habit} 
              onToggleComplete={toggleCompleteHabit} onDelete={deleteHabit} onEdit={handleEditHabit}
              isLoadingCelebration={celebratingHabitId === habit.id && celebrationMessages[habit.id] === ''}
              celebrationMessage={celebrationMessages[habit.id] || null}
            />
          ))
        ) : (
          !showHabitForm && (
            <Card className="text-center border-l-4 border-yellow-400 dark:border-yellow-500">
              <SparklesIcon className="w-10 h-10 mx-auto text-yellow-400 dark:text-yellow-300 mb-3" />
              <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-2">¡Comienza a construir tus hábitos!</h3>
              <p className="text-neutral-500 dark:text-neutral-400">Añade tu primer hábito para iniciar esta emocionante jornada.</p>
            </Card>
          )
        )}
      </section>
    </PageShell>
  );
};
