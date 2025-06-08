
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { PageShell } from '../components/shared/PageShell';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { HomeIcon, TasksIcon, HabitsIcon, ChatIcon, SparklesIcon, WellbeingIcon, WalletIcon, ClipboardListIcon } from '../components/icons';
import { Task, Habit, Transaction, CurrencyCode, Mood, AIMessage } from '../types';
import { formatCurrency } from '../utils/currency';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getDailyMotivation, generateChatReflection } from '../services/geminiService';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { MUSHU_DAILY_THOUGHTS, DEFAULT_USER_NAME } from '../constants'; // Added MUSHU_DAILY_THOUGHTS and DEFAULT_USER_NAME

interface DashboardPageProps {
  tasks: Task[];
  habits: Habit[];
  transactions: Transaction[];
  selectedCurrencyCode: CurrencyCode;
  currentUser: User | null; 
  sparkles: number; 
  equippedMushuDialogImage: string; // Path to equipped Mushu dialog image
}

const moodOptions: { mood: Mood, emoji: string, color: string, darkColor?: string, textColor?: string, darkTextColor?: string }[] = [
  { mood: Mood.Happy, emoji: '😄', color: 'bg-yellow-400 hover:bg-yellow-500', darkColor: 'dark:bg-yellow-500 dark:hover:bg-yellow-600', textColor: 'text-neutral-800', darkTextColor: 'dark:text-neutral-900' },
  { mood: Mood.Productive, emoji: '🚀', color: 'bg-green-400 hover:bg-green-500', darkColor: 'dark:bg-green-500 dark:hover:bg-green-600', textColor: 'text-neutral-800', darkTextColor: 'dark:text-neutral-900' },
  { mood: Mood.Okay, emoji: '🙂', color: 'bg-teal-400 hover:bg-teal-500', darkColor: 'dark:bg-teal-500 dark:hover:bg-teal-600', textColor: 'text-neutral-800', darkTextColor: 'dark:text-neutral-900' },
  { mood: Mood.Tired, emoji: '😴', color: 'bg-neutral-400 hover:bg-neutral-500', darkColor: 'dark:bg-neutral-500 dark:hover:bg-neutral-600', textColor: 'text-white', darkTextColor: 'dark:text-white' },
  { mood: Mood.Anxious, emoji: '😟', color: 'bg-purple-400 hover:bg-purple-500', darkColor: 'dark:bg-purple-500 dark:hover:bg-purple-600', textColor: 'text-white', darkTextColor: 'dark:text-white' },
  { mood: Mood.Sad, emoji: '😢', color: 'bg-blue-500 hover:bg-blue-600', darkColor: 'dark:bg-blue-600 dark:hover:bg-blue-700', textColor: 'text-white', darkTextColor: 'dark:text-white' },
];


interface DailyMotivation {
  phrase: string;
  advice: string;
  suggestedAction?: 'chat' | 'wellbeing';
  date: string; // YYYY-MM-DD
}

interface ChatReflection {
  summary: string;
  encouragement: string;
  reflectedUntilTimestamp: number;
  generatedAt: number;
}

const MushusThoughtCard: React.FC<{ userId: string | null, equippedMushuDialogImage: string }> = ({ userId, equippedMushuDialogImage }) => {
  const [dailyThought, setDailyThought] = useLocalStorage<string | null>('mushu_alberto_daily_thought_text', null, userId);
  const [lastThoughtDate, setLastThoughtDate] = useLocalStorage<string | null>('mushu_alberto_last_thought_date', null, userId);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastThoughtDate !== todayStr || !dailyThought) {
      const randomIndex = Math.floor(Math.random() * MUSHU_DAILY_THOUGHTS.length);
      setDailyThought(MUSHU_DAILY_THOUGHTS[randomIndex]);
      setLastThoughtDate(todayStr);
    }
  }, [userId, dailyThought, setDailyThought, lastThoughtDate, setLastThoughtDate]);

  if (!dailyThought) return null;

  return (
    <Card className="mb-6 bg-purple-50 dark:bg-purple-900/40 border-l-4 border-purple-500 dark:border-purple-600">
        <div className="flex items-start">
            <img src={equippedMushuDialogImage} alt="Mushu Alberto Pensando" className="w-12 h-auto mr-4 flex-shrink-0"/>
            <div>
                <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Un pensamiento de Mushu para ti:</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">"{dailyThought}"</p>
            </div>
        </div>
    </Card>
  );
};


export const DashboardPage: React.FC<DashboardPageProps> = ({ tasks, habits, transactions, selectedCurrencyCode, currentUser, sparkles, equippedMushuDialogImage }) => {
  const navigate = useNavigate();
  const userId = currentUser?.id ?? null; 

  const [showMoodModal, setShowMoodModal] = useLocalStorage<boolean>(`mushu_alberto_show_mood_modal_${new Date().toISOString().split('T')[0]}`, true, userId); 
  const [selectedMood, setSelectedMood] = useLocalStorage<Mood | null>(`mushu_alberto_selected_mood_${new Date().toISOString().split('T')[0]}`, null, userId); 
  
  const [dailyMotivation, setDailyMotivation] = useLocalStorage<DailyMotivation | null>('mushu_alberto_daily_motivation', null, userId);
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);
  
  const [chatReflection, setChatReflection] = useLocalStorage<ChatReflection | null>('mushu_alberto_chat_reflection', null, userId);
  const [isLoadingReflection, setIsLoadingReflection] = useState(false);
  const [chatHistory] = useLocalStorage<AIMessage[]>('mushu_alberto_chat_history', [], userId); 

  const defaultMotivation: DailyMotivation = {
    phrase: "Que tengas un día productivo y lleno de calma.",
    advice: "Recuerda tomar pequeños descansos y celebrar tus progresos. ¡Mushu está aquí para ti!",
    date: new Date().toISOString().split('T')[0]
  };

  const fetchDailyMotivation = useCallback(async (mood: Mood) => {
    setIsLoadingMotivation(true);
    try {
      const motivation = await getDailyMotivation(mood);
      setDailyMotivation({ ...motivation, date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error("Error fetching daily motivation:", error);
      setDailyMotivation({
        phrase: "Cada día es una nueva oportunidad.",
        advice: "Recuerda ser amable contigo mismo.",
        suggestedAction: undefined, 
        date: new Date().toISOString().split('T')[0]
      });
    } finally {
      setIsLoadingMotivation(false);
    }
  }, [setDailyMotivation]);

 useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    // Clear old motivation or set default if mood was selected but motivation is old/missing
    if (dailyMotivation && dailyMotivation.date !== todayStr) {
        setDailyMotivation(null); // Clear outdated motivation
    }

    if (selectedMood && (!dailyMotivation || dailyMotivation.date !== todayStr)) {
        fetchDailyMotivation(selectedMood);
    } else if (!selectedMood && (!dailyMotivation || dailyMotivation.date !== todayStr)) {
        // If no mood is selected for today and no motivation is loaded for today (e.g. user dismissed modal without selecting)
        // set a default positive message for the day.
        setDailyMotivation(defaultMotivation);
    }
  }, [selectedMood, dailyMotivation, fetchDailyMotivation, setDailyMotivation, defaultMotivation]);


  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    // fetchDailyMotivation will be called by the useEffect above
  };

  const handleDismissModal = () => {
    setShowMoodModal(false);
     if (!selectedMood) { // If modal dismissed without selection, set default motivation for the day
      setDailyMotivation(defaultMotivation);
    }
  };
  
  const handleSuggestedActionOnModal = () => {
    if (dailyMotivation?.suggestedAction === 'chat') {
      navigate('/chat');
    } else if (dailyMotivation?.suggestedAction === 'wellbeing') {
      navigate('/wellbeing');
    }
    setShowMoodModal(false); 
  };

  const fetchChatReflection = useCallback(async () => {
    if (!userId) return; 

    const lastReflectedTimestamp = chatReflection?.reflectedUntilTimestamp || 0;
    const relevantMessages = chatHistory.filter(msg => msg.timestamp > lastReflectedTimestamp);

    if (relevantMessages.length < 3 && chatReflection?.generatedAt && (Date.now() - chatReflection.generatedAt < 24 * 60 * 60 * 1000)) {
      return;
    }
    if (relevantMessages.length === 0 && chatHistory.length > 0 && chatReflection?.generatedAt && (Date.now() - chatReflection.generatedAt < 24 * 60 * 60 * 1000)){
        return;
    }
    
    const messagesToReflect = (!chatReflection || (Date.now() - (chatReflection.generatedAt || 0) > 24 * 60 * 60 * 1000)) && chatHistory.length > 0
      ? chatHistory 
      : relevantMessages;

    if (messagesToReflect.length === 0 && chatHistory.length === 0) {
        setChatReflection({
            summary: "Aún no has charlado con Mushu Alberto.",
            encouragement: "¡Cuando quieras, estoy aquí para conversar!",
            reflectedUntilTimestamp: Date.now(),
            generatedAt: Date.now()
        });
        return;
    }
     if (messagesToReflect.length === 0 && chatHistory.length > 0) {
        return;
    }

    setIsLoadingReflection(true);
    try {
      const reflection = await generateChatReflection(messagesToReflect);
      setChatReflection({
        ...reflection,
        reflectedUntilTimestamp: messagesToReflect[messagesToReflect.length - 1]?.timestamp || Date.now(),
        generatedAt: Date.now()
      });
    } catch (error) {
      console.error("Error fetching chat reflection:", error);
    } finally {
      setIsLoadingReflection(false);
    }
  }, [chatHistory, chatReflection, setChatReflection, userId]);

  useEffect(() => {
    if (!userId) return; 
    const shouldFetchReflection = !chatReflection || (Date.now() - (chatReflection.generatedAt || 0) > 6 * 60 * 60 * 1000); 
    if(shouldFetchReflection){
        fetchChatReflection();
    }
  }, [fetchChatReflection, chatReflection, userId]);


  const pendingTasks = tasks.filter(task => !task.completed).slice(0, 3);
  const activeHabits = habits
    .filter(habit => {
        const today = new Date().setHours(0,0,0,0);
        const lastCompletedDate = habit.lastCompleted ? new Date(habit.lastCompleted).setHours(0,0,0,0) : null;
        return lastCompletedDate !== today;
    })
    .sort((a, b) => (a.lastCompleted || 0) - (b.lastCompleted || 0))
    .slice(0, 3);
  
  const recentTransactions = transactions
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt)
    .slice(0,3);

  const greetingName = currentUser?.email?.split('@')[0] || DEFAULT_USER_NAME;
  const pageTitle = `¡Hola de nuevo, ${greetingName.charAt(0).toUpperCase() + greetingName.slice(1)}!`;

  return (
    <PageShell title={pageTitle} icon={<HomeIcon className="w-8 h-8" />}>
      {showMoodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 dark:bg-opacity-80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md" title="¿Cómo te sientes hoy?">
            {selectedMood && isLoadingMotivation && (
               <div className="text-center p-8"><LoadingSpinner /> <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Un momento, Mushu Alberto te prepara algo especial...</p></div>
            )}
            {selectedMood && !isLoadingMotivation && dailyMotivation && dailyMotivation.date === new Date().toISOString().split('T')[0] && (
              <div className="text-center p-4 space-y-3">
                 <img src={equippedMushuDialogImage} alt="Mushu Alberto Pensando" className="w-24 h-auto mx-auto mb-3"/>
                <p className="text-lg font-semibold text-teal-700 dark:text-teal-300">"{dailyMotivation.phrase}"</p>
                <p className="text-neutral-600 dark:text-neutral-300">{dailyMotivation.advice}</p>
                {dailyMotivation.suggestedAction && (
                  <Button 
                    onClick={handleSuggestedActionOnModal} 
                    variant="secondary" 
                    className="mt-3"
                    leftIcon={dailyMotivation.suggestedAction === 'chat' ? <ChatIcon className="w-4 h-4"/> : <WellbeingIcon className="w-4 h-4"/>}
                  >
                    {dailyMotivation.suggestedAction === 'chat' ? 'Hablar con Mushu Alberto AI' : 'Ir a Bienestar'}
                  </Button>
                )}
              </div>
            )}
            {!selectedMood && ( 
              <>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4 text-sm">Tus respuestas ayudan a Mushu Alberto a conocerte mejor.</p>
                <div className="grid grid-cols-2 gap-3">
                  {moodOptions.map(({ mood, emoji, color, darkColor, textColor, darkTextColor }) => (
                    <Button
                      key={mood}
                      onClick={() => handleMoodSelect(mood)}
                      className={`w-full py-4 ${color} ${darkColor || ''} ${textColor} ${darkTextColor || ''}`}
                    >
                      <span className="text-xl mr-2">{emoji}</span> {mood}
                    </Button>
                  ))}
                </div>
              </>
            )}
             <div className="mt-5 text-right">
                <Button variant="ghost" size="sm" onClick={handleDismissModal}>
                  {selectedMood ? 'Cerrar' : 'Quizás más tarde'}
                </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Mood-based Motivation Card (if modal is dismissed or mood selected) */}
      {!showMoodModal && dailyMotivation && dailyMotivation.date === new Date().toISOString().split('T')[0] && (
        <Card className="mb-6 bg-teal-50 dark:bg-teal-900/50 border-l-4 border-teal-500 dark:border-teal-600">
            <div className="flex items-start">
                <img src={equippedMushuDialogImage} alt="Mushu Alberto" className="w-12 h-auto mr-4 flex-shrink-0"/>
                <div>
                    <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300">{dailyMotivation.phrase}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{dailyMotivation.advice}</p>
                    {dailyMotivation.suggestedAction && (
                        <Button 
                            onClick={() => {
                                if (dailyMotivation.suggestedAction === 'chat') navigate('/chat');
                                else if (dailyMotivation.suggestedAction === 'wellbeing') navigate('/wellbeing');
                            }} 
                            size="sm" 
                            variant="ghost"
                            className="mt-2 text-teal-600 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-800/70"
                            leftIcon={dailyMotivation.suggestedAction === 'chat' ? <ChatIcon className="w-4 h-4"/> : <WellbeingIcon className="w-4 h-4"/>}
                        >
                           {dailyMotivation.suggestedAction === 'chat' ? 'Hablar con Mushu Alberto AI' : 'Probar un ejercicio de bienestar'}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
      )}

      {/* Mushu's Thought of the Day Card */}
      {!showMoodModal && <MushusThoughtCard userId={userId} equippedMushuDialogImage={equippedMushuDialogImage} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Tareas Pendientes" icon={<TasksIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}>
          {pendingTasks.length > 0 ? (
            <ul className="space-y-2">
              {pendingTasks.map(task => (
                <li key={task.id} className="text-sm text-neutral-700 dark:text-neutral-300 p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <Link to="/productivity" className="block">{task.name}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">¡Todo al día por aquí!</p>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate('/productivity')} className="mt-3 w-full">Ver todas las tareas</Button>
        </Card>

        <Card title="Hábitos Activos" icon={<HabitsIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />}>
          {activeHabits.length > 0 ? (
            <ul className="space-y-2">
              {activeHabits.map(habit => (
                <li key={habit.id} className="text-sm text-neutral-700 dark:text-neutral-300 p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                   <Link to="/productivity" className="block">{habit.name} <span className="text-xs">({habit.streak} 🔥)</span></Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">¡Todos los hábitos completados hoy!</p>
          )}
           <Button variant="ghost" size="sm" onClick={() => navigate('/productivity')} className="mt-3 w-full">Ver todos los hábitos</Button>
        </Card>
        
        <Card title="Reflexión del Chat" icon={<ChatIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />}>
            {isLoadingReflection && <div className="py-4"><LoadingSpinner size="sm"/></div>}
            {!isLoadingReflection && chatReflection && (
                <>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium mb-1">{chatReflection.summary}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">"{chatReflection.encouragement}"</p>
                </>
            )}
            {!isLoadingReflection && !chatReflection && (
                 <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">Aún no hay reflexiones. ¡Habla con Mushu Alberto!</p>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/chat')} className="mt-3 w-full">Ir al Chat</Button>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
         <Card title="Resumen Rápido" icon={<ClipboardListIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-teal-50 dark:bg-teal-900/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{tasks.filter(t => !t.completed).length}</p>
                    <p className="text-xs text-teal-700 dark:text-teal-500">Tareas Pendientes</p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{habits.reduce((max, h) => Math.max(max, h.streak), 0)} 🔥</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-500">Mejor Racha Hábitos</p>
                </div>
                 <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(
                        transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum, 0),
                        selectedCurrencyCode
                    )}</p>
                    <p className="text-xs text-green-700 dark:text-green-500">Ingresos (Total)</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 mr-1 text-yellow-400 dark:text-yellow-300"/>{sparkles}
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-500">Mushu Sparkles</p>
                </div>
            </div>
         </Card>
      </div>

      {recentTransactions.length > 0 && (
        <Card title="Transacciones Recientes" icon={<WalletIcon className="w-5 h-5 text-green-500 dark:text-green-400" />} className="mt-6">
          <ul className="space-y-2">
            {recentTransactions.map(t => (
              <li key={t.id} className={`text-sm p-2 rounded flex justify-between items-center ${t.type === 'income' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                <div>
                  <span className={`font-medium ${t.type === 'income' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{t.category}</span>
                  {t.description && <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">({t.description})</span>}
                </div>
                <span className={`font-semibold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, selectedCurrencyCode)}
                </span>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" onClick={() => navigate('/expenses')} className="mt-3 w-full">Ver todas las finanzas</Button>
        </Card>
      )}
    </PageShell>
  );
};
