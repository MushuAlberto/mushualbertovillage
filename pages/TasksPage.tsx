
import React, { useState, useEffect } from 'react';
import { PageShell } from '../components/shared/PageShell';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { TasksIcon, PlusIcon, TrashIcon, EditIcon, CheckCircleIcon, XCircleIcon, SparklesIcon } from '../components/icons';
import { Task, SubTask } from '../types';
import { generateSimpleText } from '../services/geminiService';
import { MUCHU_TASK_NARRATIVE_PROMPT } from '../constants';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

interface TaskFormData {
  name: string;
  description?: string;
  dueDate?: string;
}

// Define TasksPageProps interface
interface TasksPageProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskForm: React.FC<{
  onSubmit: (data: TaskFormData) => void;
  initialData?: TaskFormData;
  onCancel?: () => void;
}> = ({ onSubmit, initialData, onCancel }) => {
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
    if (onCancel) onCancel(); // Close form after submit if it's an edit
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
          style={{ colorScheme: 'dark' }}
        />
      </div>
      <div className="flex items-center justify-end space-x-3">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" leftIcon={<PlusIcon className="w-4 h-4"/>}>{initialData ? 'Guardar Cambios' : 'Añadir Tarea'}</Button>
      </div>
    </form>
  );
};


const TaskItem: React.FC<{ 
  task: Task; 
  onToggleComplete: (id: string) => void; 
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onGetNarrative: (taskName: string, taskId: string) => Promise<void>; // Added taskId
  isLoadingNarrative: boolean;
}> = ({ task, onToggleComplete, onDelete, onEdit, onGetNarrative, isLoadingNarrative }) => {
  const [showNarrative, setShowNarrative] = useState(false);
  const [narrative, setNarrative] = useState('');
  
  const handleGetNarrative = async () => {
    setShowNarrative(true); 
    setNarrative(''); 
    await onGetNarrative(task.name, task.id); // Pass taskId
  };

  useEffect(() => {
    if (task.storyHook) {
      setNarrative(task.storyHook);
    }
  }, [task.storyHook]);

  return (
    <Card className={`mb-4 transition-all duration-300 ${task.completed ? 'bg-green-50 dark:bg-green-900/40 opacity-70' : 'bg-white dark:bg-neutral-800'}`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className={`text-lg font-semibold ${task.completed ? 'line-through text-neutral-500 dark:text-neutral-400' : 'text-neutral-800 dark:text-neutral-100'}`}>{task.name}</h4>
          {task.description && <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{task.description}</p>}
          {task.dueDate && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Fecha Límite: {new Date(task.dueDate+"T00:00:00").toLocaleDateString('es-ES')}</p>}
          {task.completed && task.createdAt && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Completada el: {new Date(task.createdAt).toLocaleDateString('es-ES')}</p>}
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onToggleComplete(task.id)} title={task.completed ? "Marcar como pendiente" : "Marcar como completada"}>
            {task.completed ? <XCircleIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400"/> : <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400"/>}
          </Button>
          {!task.completed && <Button variant="ghost" size="sm" onClick={() => onEdit(task)} title="Editar tarea"><EditIcon className="w-5 h-5 text-teal-500 dark:text-teal-400"/></Button>}
          <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)} title="Eliminar tarea"><TrashIcon className="w-5 h-5 text-red-500 dark:text-red-400"/></Button>
        </div>
      </div>
      {!task.completed && (
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleGetNarrative}
            disabled={isLoadingNarrative && task.storyHook === undefined} 
            leftIcon={isLoadingNarrative && task.storyHook === undefined ? <LoadingSpinner size="sm" color="text-neutral-700" darkColor="dark:text-neutral-800"/> : <SparklesIcon className="w-4 h-4"/>}
          >
            {isLoadingNarrative && task.storyHook === undefined ? 'Motivando...' : '¡Dame motivación!'}
          </Button>
          {narrative && (showNarrative || task.storyHook) && (
             <p className="mt-2 text-sm text-teal-700 dark:text-teal-300 italic p-2 bg-teal-50 dark:bg-teal-900/40 rounded-md">{narrative}</p>
          )}
        </div>
      )}
    </Card>
  );
};


export const TasksPage: React.FC<TasksPageProps> = ({ tasks, setTasks }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loadingNarrativeTaskId, setLoadingNarrativeTaskId] = useState<string | null>(null);

  const addTask = (taskData: TaskFormData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: taskData.name,
      description: taskData.description,
      dueDate: taskData.dueDate,
      completed: false,
      createdAt: Date.now(),
      status: 'todo', 
      subTasks: [], 
      // storyHook and completionMessage will be undefined initially
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setShowForm(false);
  };

  const updateTask = (updatedTaskData: TaskFormData) => {
    if (!editingTask) return;
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === editingTask.id ? { ...editingTask, ...updatedTaskData, createdAt: Date.now() } : task
    ));
    setEditingTask(null);
    setShowForm(false);
  };


  const toggleCompleteTask = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed, status: !task.completed ? 'done' : 'todo', createdAt: task.completed ? task.createdAt : Date.now() } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };
  
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  }

  const handleGetNarrative = async (taskName: string, taskId: string) => {
    setLoadingNarrativeTaskId(taskId);
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


  const pendingTasks = tasks.filter(task => !task.completed).sort((a,b) => (a.dueDate && b.dueDate ? new Date(a.dueDate+"T00:00:00").getTime() - new Date(b.dueDate+"T00:00:00").getTime() : (a.dueDate ? -1 : (b.dueDate ? 1 : b.createdAt - a.createdAt ))));
  const completedTasks = tasks.filter(task => task.completed).sort((a,b) => b.createdAt - a.createdAt);


  return (
    <PageShell 
      title="Mis Misiones y Tareas" 
      icon={<TasksIcon className="w-8 h-8" />}
      actionButton={
        !showForm && (
          <Button onClick={() => { setEditingTask(null); setShowForm(true); }} leftIcon={<PlusIcon className="w-5 h-5" />}>
            Nueva Tarea
          </Button>
        )
      }
    >
      {showForm && (
        <TaskForm 
          onSubmit={editingTask ? updateTask : addTask} 
          initialData={editingTask ? {name: editingTask.name, description: editingTask.description, dueDate: editingTask.dueDate} : undefined}
          onCancel={() => { setShowForm(false); setEditingTask(null);}}
        />
      )}

      <section>
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Pendientes ({pendingTasks.length})</h3>
        {pendingTasks.length > 0 ? (
          pendingTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggleComplete={toggleCompleteTask} 
              onDelete={deleteTask}
              onEdit={handleEdit}
              onGetNarrative={handleGetNarrative}
              isLoadingNarrative={loadingNarrativeTaskId === task.id}
            />
          ))
        ) : (
          !showForm && <p className="text-neutral-500 dark:text-neutral-400 italic">¡Ninguna tarea pendiente! ¿Listo para tu próxima aventura?</p>
        )}
      </section>

      {completedTasks.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Completadas ({completedTasks.length})</h3>
          {completedTasks.map(task => (
             <TaskItem 
              key={task.id} 
              task={task} 
              onToggleComplete={toggleCompleteTask} 
              onDelete={deleteTask}
              onEdit={handleEdit} // Or disable edit for completed
              onGetNarrative={handleGetNarrative}
              isLoadingNarrative={loadingNarrativeTaskId === task.id}
            />
          ))}
        </section>
      )}
    </PageShell>
  );
};
