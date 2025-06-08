

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { DashboardPage } from './pages/DashboardPage';
import { ProductivityPage } from './pages/ProductivityPage';
import { AIChatPage } from './pages/AIChatPage';
import { WellbeingPage } from './pages/WellbeingPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ExpenseTrackingPage } from './pages/ExpenseTrackingPage';
import { DigitalJournalPage } from './pages/DigitalJournalPage';
import { AuthPage } from './pages/AuthPage';
import { StorePage } from './pages/StorePage'; 
import { QuickNotesPage } from './pages/QuickNotesPage'; // Import QuickNotesPage
import { FocusSessionModal } from './pages/components/FocusSessionModal';
import { QuickNoteModal } from './components/shared/QuickNoteModal'; // Import QuickNoteModal
import { HomeIcon, ClipboardListIcon, ChatIcon, WellbeingIcon, TrophyIcon, WalletIcon, BookOpenIcon, LogoutIcon, SparklesIcon, ShoppingBagIcon, LightbulbIcon, PlusIcon } from './components/icons'; // Added LightbulbIcon
import { Task, Habit, Transaction, CurrencyCode, JournalEntry, QuickNote } from './types'; // Added QuickNote
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_CURRENCY_CODE, MUSHU_STORE_ITEMS, MUCHU_TASK_COMPLETION_CELEBRATION_PROMPT, DEFAULT_USER_NAME } from './constants';
import { useTheme } from './hooks/useTheme';
import { ThemeToggle } from './components/ThemeToggle';
import { authService } from './services/authService';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { Button } from './components/shared/Button';
import { generateSimpleText } from './services/geminiService';


const App: React.FC = () => {
  const location = useLocation();
  useTheme(); 

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true); 

  useEffect(() => {
    const { data: authListener } = authService.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user ?? null);
      setLoadingAuth(false);
      if (event === 'SIGNED_OUT') {
        // Data clearing is handled by useLocalStorage re-initialization with null userId
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); 

  const userId = currentUser?.id ?? null;

  const [tasks, setTasks] = useLocalStorage<Task[]>('mushu_alberto_tasks', [], userId);
  const [habits, setHabits] = useLocalStorage<Habit[]>('mushu_alberto_habits', [], userId);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('mushu_alberto_transactions', [], userId);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useLocalStorage<CurrencyCode>('mushu_alberto_selected_currency', DEFAULT_CURRENCY_CODE, userId);
  const [breathingExercisesCompletedCount, setBreathingExercisesCompletedCount] = useLocalStorage<number>('mushu_alberto_breathing_exercises_completed_count', 0, userId);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('mushu_alberto_journal_entries', [], userId);
  const [sparkles, setSparkles] = useLocalStorage<number>('mushu_alberto_sparkles', 0, userId);
  const [quickNotes, setQuickNotes] = useLocalStorage<QuickNote[]>('mushu_alberto_quick_notes', [], userId); // QuickNotes state
  
  // Store related state
  const [ownedItems, setOwnedItems] = useLocalStorage<string[]>('mushu_alberto_owned_store_items', ['mushu_default'], userId); // Default is always owned
  const [equippedItem, setEquippedItem] = useLocalStorage<string | null>('mushu_alberto_equipped_store_item', 'mushu_default', userId);

  // Focus Session State
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false);


  const handleLogout = async () => {
    await authService.signOutUser();
    setActiveFocusTask(null); // Clear focus session on logout
    setShowQuickNoteModal(false); // Close quick note modal on logout
  };

  const navItems = [
    { path: '/', label: 'Inicio', icon: <HomeIcon className="w-5 h-5" /> },
    { path: '/productivity', label: 'Productividad', icon: <ClipboardListIcon className="w-5 h-5" /> },
    { path: '/quick-notes', label: 'Apuntes', icon: <LightbulbIcon className="w-5 h-5" /> }, // Added QuickNotes
    { path: '/journal', label: 'Diario', icon: <BookOpenIcon className="w-5 h-5" /> },
    { path: '/expenses', label: 'Finanzas', icon: <WalletIcon className="w-5 h-5" /> },
    { path: '/chat', label: 'Mushu Alberto AI', icon: <ChatIcon className="w-5 h-5" /> },
    { path: '/wellbeing', label: 'Bienestar', icon: <WellbeingIcon className="w-5 h-5" /> },
    { path: '/store', label: 'Tienda', icon: <ShoppingBagIcon className="w-5 h-5" /> }, 
    { path: '/achievements', label: 'Logros', icon: <TrophyIcon className="w-5 h-5" /> },
  ];
  
  const getGreeting = () => {
    if (currentUser?.email) {
      const emailNamePart = currentUser.email.split('@')[0];
      return `Hola, ${emailNamePart.charAt(0).toUpperCase() + emailNamePart.slice(1)}!`;
    }
    return "Mushu Alberto";
  }
  const userName = currentUser?.email?.split('@')[0] || DEFAULT_USER_NAME;


  const getMushuImageAsset = (imageKey: string | null) => {
    const item = MUSHU_STORE_ITEMS.find(i => i.id === imageKey);
    if (item && item.imageAssetKey !== 'default') {
        return `assets/mushu_alberto_${item.imageAssetKey}.png`;
    }
    return 'assets/mushu_alberto.png'; // Default image
  };
  
  const getMushuDialogImageAsset = (imageKey: string | null) => {
    const item = MUSHU_STORE_ITEMS.find(i => i.id === imageKey);
     if (item && item.imageAssetKey !== 'default') {
        return `assets/mushu_alberto_${item.imageAssetKey}_dialog.png`; 
    }
    return 'assets/mushu_alberto_dialog.png';
  }
  
  const getMushuSpeakingGif = (imageKey: string | null) => {
    const item = MUSHU_STORE_ITEMS.find(i => i.id === imageKey);
    if (item && item.imageAssetKey !== 'default') {
        return `assets/mushu_alberto_${item.imageAssetKey}_speaking.gif`;
    }
    return 'assets/mushu_alberto_speaking.gif';
  }

  const getMushuListeningGif = (imageKey: string | null) => {
    const item = MUSHU_STORE_ITEMS.find(i => i.id === imageKey);
    if (item && item.imageAssetKey !== 'default') {
        return `assets/mushu_alberto_${item.imageAssetKey}_listening.gif`;
    }
    return 'assets/mushu_alberto_listening.gif';
  }
  
  const getMushuIdleImage = (imageKey: string | null) => {
    const item = MUSHU_STORE_ITEMS.find(i => i.id === imageKey);
    if (item && item.imageAssetKey !== 'default') {
        return `assets/mushu_alberto_${item.imageAssetKey}_idle.png`;
    }
    return 'assets/mushu_alberto_idle.png';
  }

  const handleCompleteTaskFromFocus = async (taskToComplete: Task) => {
    setSparkles(prev => prev + 10);
    let celebrationMsg = "¡Bien hecho!";
    try {
      const { text } = await generateSimpleText(MUCHU_TASK_COMPLETION_CELEBRATION_PROMPT(taskToComplete.name));
      celebrationMsg = text + " (+10 ✨)";
    } catch (error) {
      console.error("Failed to get task completion celebration:", error);
      celebrationMsg = `¡"${taskToComplete.name}" completado! Sigue así. (+10 ✨)`;
    }
    setTasks(prevTasks => prevTasks.map(t =>
      t.id === taskToComplete.id ? { ...t, completed: true, createdAt: Date.now(), completionMessage: celebrationMsg, storyHook: undefined } : t
    ));
    setActiveFocusTask(null); // Close modal
  };

  const handleAddQuickNote = (text: string) => {
    const newNote: QuickNote = {
      id: crypto.randomUUID(),
      text,
      timestamp: Date.now(),
    };
    setQuickNotes(prev => [newNote, ...prev].sort((a,b) => b.timestamp - a.timestamp));
  };


  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 dark:bg-neutral-900 transition-colors duration-300">
      {!isAuthPage && (
      <header className="bg-teal-700 dark:bg-neutral-800 text-white shadow-md sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src={getMushuImageAsset(equippedItem)} alt="Mushu Alberto Logo" className="h-10 w-auto" />
            <h1 className="text-xl md:text-2xl font-bold text-white dark:text-teal-50">{getGreeting()}</h1>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:flex items-center text-sm text-yellow-300 dark:text-yellow-400 font-semibold p-2 bg-black/20 dark:bg-white/10 rounded-lg">
                <SparklesIcon className="w-5 h-5 mr-1.5 text-yellow-300 dark:text-yellow-400" />
                {sparkles}
            </div>
            <nav className="hidden md:flex space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 py-2 lg:px-3 rounded-md text-xs lg:text-sm font-medium flex items-center space-x-1 lg:space-x-2 transition-colors duration-150
                    ${location.pathname === item.path 
                      ? 'bg-teal-800 dark:bg-teal-600 text-white' 
                      : 'text-teal-100 dark:text-neutral-300 hover:bg-teal-600 dark:hover:bg-neutral-700 hover:text-white dark:hover:text-neutral-100'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <ThemeToggle />
             <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="sm"
                className="!text-xs !px-2 !py-1 text-teal-100 dark:text-neutral-300 hover:bg-teal-600 dark:hover:bg-neutral-700 hover:text-white dark:hover:text-neutral-100"
                title="Cerrar Sesión"
              >
                <LogoutIcon className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
          </div>
        </div>
      </header>
      )}

      <main className={`flex-grow container mx-auto px-4 ${isAuthPage ? 'py-0' : 'py-8'}`}>
        <Routes>
          <Route path="/" element={<DashboardPage tasks={tasks} habits={habits} transactions={transactions} selectedCurrencyCode={selectedCurrencyCode} currentUser={currentUser} sparkles={sparkles} equippedMushuDialogImage={getMushuDialogImageAsset(equippedItem)} />} />
          <Route 
            path="/productivity" 
            element={
              <ProductivityPage 
                tasks={tasks} 
                setTasks={setTasks} 
                habits={habits} 
                setHabits={setHabits} 
                setSparkles={setSparkles}
                activeFocusTask={activeFocusTask}
                setActiveFocusTask={setActiveFocusTask} 
              />} 
          />
           <Route path="/quick-notes" element={<QuickNotesPage quickNotes={quickNotes} setQuickNotes={setQuickNotes} />} />
          <Route 
            path="/journal" 
            element={<DigitalJournalPage journalEntries={journalEntries} setJournalEntries={setJournalEntries} setSparkles={setSparkles} />}
          />
          <Route 
            path="/expenses" 
            element={<ExpenseTrackingPage 
                        transactions={transactions} 
                        setTransactions={setTransactions} 
                        selectedCurrencyCode={selectedCurrencyCode}
                        setSelectedCurrencyCode={setSelectedCurrencyCode}
                        />} 
          />
          <Route path="/chat" element={
            <AIChatPage 
                userId={userId} 
                mushuImageKey={equippedItem}
                mushuSpeakingGif={getMushuSpeakingGif(equippedItem)}
                mushuListeningGif={getMushuListeningGif(equippedItem)}
                mushuIdleImage={getMushuIdleImage(equippedItem)}
                quickNotes={quickNotes} // Pass quickNotes
                userName={userName}
            />} 
          />
          <Route path="/wellbeing" element={
            <WellbeingPage 
              breathingExercisesCompletedCount={breathingExercisesCompletedCount} 
              setBreathingExercisesCompletedCount={setBreathingExercisesCompletedCount}
              currentUser={currentUser}
              setSparkles={setSparkles}
              equippedMushuDialogImage={getMushuDialogImageAsset(equippedItem)}
            />} 
          />
           <Route path="/store" element={
            <StorePage 
              sparkles={sparkles} 
              setSparkles={setSparkles} 
              ownedItems={ownedItems} 
              setOwnedItems={setOwnedItems}
              equippedItem={equippedItem}
              setEquippedItem={setEquippedItem}
            />} 
          />
          <Route path="/achievements" element={
            <AchievementsPage 
              tasks={tasks} 
              habits={habits} 
              breathingExercisesCompletedCount={breathingExercisesCompletedCount}
              sparkles={sparkles}
            />} 
          />
           <Route path="/auth" element={<Navigate to="/" />} /> 
        </Routes>
      </main>

      {activeFocusTask && (
        <FocusSessionModal
          task={activeFocusTask}
          onCloseSession={() => setActiveFocusTask(null)}
          onCompleteTask={handleCompleteTaskFromFocus}
          mushuDialogImage={getMushuDialogImageAsset(equippedItem)}
          userName={userName}
        />
      )}

      {showQuickNoteModal && (
        <QuickNoteModal
          onClose={() => setShowQuickNoteModal(false)}
          onSave={handleAddQuickNote}
        />
      )}

      {!isAuthPage && !activeFocusTask && !showQuickNoteModal && (
         <Button
            onClick={() => setShowQuickNoteModal(true)}
            variant="primary"
            className="fixed bottom-20 md:bottom-6 right-6 z-40 !p-4 rounded-full shadow-xl animate-bounce hover:animate-none"
            title="Añadir Apunte Rápido"
        >
            <LightbulbIcon className="w-6 h-6" />
        </Button>
      )}


      {!isAuthPage && (
      <footer className="bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-center p-4 md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-300 dark:border-neutral-700 transition-colors duration-300">
        <div className="flex items-center justify-between px-2">
            <nav className="flex justify-around w-full">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center p-1 rounded-md text-xs w-1/6 
                      ${location.pathname === item.path 
                        ? 'text-teal-600 dark:text-teal-400 font-semibold'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-teal-500 dark:hover:text-teal-300'
                      }`}
                  >
                    {React.cloneElement(item.icon, { className: "w-4 h-4 mb-0.5"})}
                    <span>{item.label}</span>
                  </Link>
                ))}
            </nav>
            <div className="flex items-center text-xs text-yellow-500 dark:text-yellow-400 font-semibold ml-2">
                <SparklesIcon className="w-4 h-4 mr-1 text-yellow-400 dark:text-yellow-400" />
                {sparkles}
            </div>
        </div>
      </footer>
      )}
      {!isAuthPage && <div className="h-16 md:hidden"></div>}
    </div>
  );
};

export default App;