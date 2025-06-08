
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@supabase/supabase-js'; // Added User type
import { PageShell } from '../components/shared/PageShell';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { WellbeingIcon, SparklesIcon, TrashIcon, PlayIcon, PauseIcon, StopIcon, LightbulbIcon } from '../components/icons';
import { Mood, MoodEntry, BreathingExercise } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateSimpleText } from '../services/geminiService';
import { MUCHU_FEELING_DOWN_PROMPT, DEFAULT_USER_NAME, MUCHU_WELLBEING_COMPLETION_CELEBRATION_PROMPT, MUSHU_MINDFUL_MOMENTS } from '../constants';
import { BREATHING_EXERCISES } from '../constants/breathingExercises';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { formatTime } from '../utils/time'; 
import { useTheme } from '../hooks/useTheme';

const moodOptions: { mood: Mood, emoji: string, color: string, darkColor?: string, textColor?: string, darkTextColor?: string }[] = [
  { mood: Mood.Happy, emoji: '😄', color: 'bg-yellow-400 hover:bg-yellow-500', darkColor: 'dark:bg-yellow-500 dark:hover:bg-yellow-600', textColor: 'text-neutral-800', darkTextColor: 'dark:text-neutral-900' },
  { mood: Mood.Productive, emoji: '🚀', color: 'bg-green-400 hover:bg-green-500', darkColor: 'dark:bg-green-500 dark:hover:bg-green-600', textColor: 'text-neutral-800', darkTextColor: 'dark:text-neutral-900' },
  { mood: Mood.Okay, emoji: '🙂', color: 'bg-teal-400 hover:bg-teal-500', darkColor: 'dark:bg-teal-500 dark:hover:bg-teal-600', textColor: 'text-neutral-800', darkTextColor: 'dark:text-neutral-900' },
  { mood: Mood.Tired, emoji: '😴', color: 'bg-neutral-400 hover:bg-neutral-500', darkColor: 'dark:bg-neutral-500 dark:hover:bg-neutral-600', textColor: 'text-white', darkTextColor: 'dark:text-white' },
  { mood: Mood.Anxious, emoji: '😟', color: 'bg-purple-400 hover:bg-purple-500', darkColor: 'dark:bg-purple-500 dark:hover:bg-purple-600', textColor: 'text-white', darkTextColor: 'dark:text-white' },
  { mood: Mood.Sad, emoji: '😢', color: 'bg-blue-500 hover:bg-blue-600', darkColor: 'dark:bg-blue-600 dark:hover:bg-blue-700', textColor: 'text-white', darkTextColor: 'dark:text-white' },
];

const getThemeColorClasses = (themeColor: string, type: 'bg' | 'text' | 'border' | 'ring', mode: 'light' | 'dark' = 'light') => {
  const intensityMap = {
    light: { bg: 500, text: 700, border: 500, ring: 500 },
    dark: { bg: 400, text: 300, border: 400, ring: 400 } 
  };
  const hoverIntensityMap = {
    light: { bg: 600, text: 800, border: 600, ring: 600 },
    dark: { bg: 500, text: 200, border: 500, ring: 500 }
  };

  const currentIntensity = intensityMap[mode][type];
  const currentHoverIntensity = hoverIntensityMap[mode][type];
  
  let classes = '';
  if (mode === 'light') {
    if (type === 'bg') classes = `bg-${themeColor}-${currentIntensity} hover:bg-${themeColor}-${currentHoverIntensity}`;
    else if (type === 'text') classes = `text-${themeColor}-${currentIntensity}`;
    else if (type === 'border') classes = `border-${themeColor}-${currentIntensity}`;
    else if (type === 'ring') classes = `focus:ring-${themeColor}-${currentIntensity}`;
  } else { // dark mode
    if (type === 'bg') classes = `dark:bg-${themeColor}-${currentIntensity} dark:hover:bg-${themeColor}-${currentHoverIntensity}`;
    else if (type === 'text') classes = `dark:text-${themeColor}-${currentIntensity}`;
    else if (type === 'border') classes = `dark:border-${themeColor}-${currentIntensity}`;
    else if (type === 'ring') classes = `dark:focus:ring-${themeColor}-${currentIntensity}`;
  }
  
  return classes;
};


type WellbeingViewState = 'list' | 'durationSelection' | 'exercisePlayer' | 'exerciseCompleted';

interface WellbeingPageProps {
    breathingExercisesCompletedCount: number;
    setBreathingExercisesCompletedCount: React.Dispatch<React.SetStateAction<number>>;
    currentUser: User | null; 
    setSparkles: React.Dispatch<React.SetStateAction<number>>;
    equippedMushuDialogImage: string; 
}

const MindfulMomentCard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [dailyMomentIndex, setDailyMomentIndex] = useLocalStorage<number>(`mushu_mindful_moment_index_${new Date().toISOString().split('T')[0]}`, -1, userId);
  const [currentMoment, setCurrentMoment] = useState<{title: string, text: string} | null>(null);

  useEffect(() => {
    if (MUSHU_MINDFUL_MOMENTS.length > 0) {
      let newIndex = dailyMomentIndex;
      if (newIndex === -1) { // If no index for today, pick one
        newIndex = Math.floor(Math.random() * MUSHU_MINDFUL_MOMENTS.length);
        setDailyMomentIndex(newIndex);
      }
      setCurrentMoment(MUSHU_MINDFUL_MOMENTS[newIndex % MUSHU_MINDFUL_MOMENTS.length]);
    }
  }, [userId, dailyMomentIndex, setDailyMomentIndex]);

  if (!currentMoment) return null;

  return (
    <Card title="Momento Consciente del Día" icon={<LightbulbIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />} className="bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-500">
      <h4 className="text-md font-semibold text-yellow-700 dark:text-yellow-300 mb-1">{currentMoment.title}</h4>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{currentMoment.text}</p>
    </Card>
  );
};


export const WellbeingPage: React.FC<WellbeingPageProps> = ({ setBreathingExercisesCompletedCount, currentUser, setSparkles, equippedMushuDialogImage }) => {
  const { effectiveTheme } = useTheme(); 
  const userId = currentUser?.id ?? null; 

  const [moodLog, setMoodLog] = useLocalStorage<MoodEntry[]>('muchu_mood_log', [], userId);
  const [muchuAdvice, setMuchuAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [notes, setNotes] = useState('');

  const [viewState, setViewState] = useState<WellbeingViewState>('list');
  const [exerciseForDurationSelection, setExerciseForDurationSelection] = useState<BreathingExercise | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isExercisePlaying, setIsExercisePlaying] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [animationClass, setAnimationClass] = useState('scale-100 opacity-70');
  const phaseIntervalRef = useRef<number | null>(null);
  
  const [totalExerciseDuration, setTotalExerciseDuration] = useState<number | null>(null);
  const [totalExerciseTimeRemaining, setTotalExerciseTimeRemaining] = useState<number | null>(null);
  const totalTimeIntervalRef = useRef<number | null>(null);

  const [exerciseCompletionMessage, setExerciseCompletionMessage] = useState<string | null>(null);
  const [isLoadingCompletionMessage, setIsLoadingCompletionMessage] = useState(false);


  const addMoodEntry = (mood: Mood) => {
    const newEntry: MoodEntry = {
      id: crypto.randomUUID(),
      mood,
      notes: notes.trim() || undefined,
      timestamp: Date.now(),
    };
    setMoodLog(prevLog => [newEntry, ...prevLog].slice(0, 20));
    setNotes('');

    if (mood === Mood.Sad || mood === Mood.Anxious) {
      getMuchuAdvice();
    } else {
      setMuchuAdvice(null);
    }
  };

  const deleteMoodEntry = (id: string) => {
    setMoodLog(prevLog => prevLog.filter(entry => entry.id !== id));
  };
  
  const userNameForPrompt = currentUser?.email?.split('@')[0] || DEFAULT_USER_NAME;

  const getMuchuAdvice = async () => {
    setIsLoadingAdvice(true);
    setMuchuAdvice(null);
    try {
      const {text: advice} = await generateSimpleText(MUCHU_FEELING_DOWN_PROMPT(userNameForPrompt));
      setMuchuAdvice(advice);
    } catch (error) {
      console.error("Failed to get Muchu's advice:", error);
      setMuchuAdvice("Recuerda que está bien no estar bien. Tómate un momento para ti. ❤️");
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const cleanupTimers = () => {
    if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
    if (totalTimeIntervalRef.current) clearInterval(totalTimeIntervalRef.current);
    phaseIntervalRef.current = null;
    totalTimeIntervalRef.current = null;
  };
  
  const completeExerciseAndShowMessage = useCallback(async () => {
    if (!selectedExercise) return;
    setBreathingExercisesCompletedCount(prev => prev + 1);
    setSparkles(prev => prev + 15); // Award 15 Sparkles
    setIsLoadingCompletionMessage(true);
    setExerciseCompletionMessage(null);
    try {
        const { text } = await generateSimpleText(MUCHU_WELLBEING_COMPLETION_CELEBRATION_PROMPT(selectedExercise.name));
        setExerciseCompletionMessage(`${text} (+15 ✨)`);
    } catch (error) {
        console.error("Error fetching wellbeing completion message:", error);
        setExerciseCompletionMessage(`¡Felicidades por completar ${selectedExercise.name}! Has dado un gran paso para tu bienestar. (+15 ✨)`);
    } finally {
        setIsLoadingCompletionMessage(false);
    }
    setViewState('exerciseCompleted');
  }, [selectedExercise, setBreathingExercisesCompletedCount, setSparkles]);


  const handleStopExercise = useCallback((completedNaturally = false) => {
    setIsExercisePlaying(false);
    cleanupTimers();
    setAnimationClass('scale-100 opacity-70');
    
    if (completedNaturally && selectedExercise) {
        completeExerciseAndShowMessage();
    } else {
        setSelectedExercise(null);
        setExerciseForDurationSelection(null);
        setTotalExerciseDuration(null);
        setTotalExerciseTimeRemaining(null);
        setViewState('list');
        setExerciseCompletionMessage(null);
    }
  }, [selectedExercise, completeExerciseAndShowMessage]);


  const playNextPhase = useCallback(() => {
    if (!selectedExercise) return;

    setCurrentPhaseIndex(prevIndex => {
      const nextIndex = (prevIndex + 1) % selectedExercise.phases.length;
      const nextPhase = selectedExercise.phases[nextIndex];
      setPhaseTimeLeft(nextPhase.duration);
      
      switch(nextPhase.animationState) {
        case 'expand': setAnimationClass('scale-125 opacity-100'); break;
        case 'hold-in': setAnimationClass('scale-125 opacity-90'); break;
        case 'contract': setAnimationClass('scale-75 opacity-60'); break;
        case 'hold-out': setAnimationClass('scale-75 opacity-50'); break;
        default: setAnimationClass('scale-100 opacity-70');
      }
      return nextIndex;
    });
  }, [selectedExercise]);

  useEffect(() => {
    if (isExercisePlaying && selectedExercise && totalExerciseTimeRemaining !== null && totalExerciseTimeRemaining > 0) {
      phaseIntervalRef.current = window.setInterval(() => {
        setPhaseTimeLeft(prevTime => {
          if (prevTime <= 1) {
            playNextPhase();
            // Ensure currentPhaseIndex is updated before accessing phases for duration
            const nextPhaseIndex = (currentPhaseIndex + 1) % selectedExercise.phases.length;
            return selectedExercise.phases[nextPhaseIndex].duration;
          }
          return prevTime - 1;
        });
      }, 1000);

      totalTimeIntervalRef.current = window.setInterval(() => {
        setTotalExerciseTimeRemaining(prevTotalTime => {
          if (prevTotalTime !== null && prevTotalTime <= 1) {
            handleStopExercise(true); 
            return 0;
          }
          return prevTotalTime !== null ? prevTotalTime - 1 : null;
        });
      }, 1000);

    } else if (!isExercisePlaying || (totalExerciseTimeRemaining !== null && totalExerciseTimeRemaining <= 0) ) {
      cleanupTimers();
    }
    return cleanupTimers;
  }, [isExercisePlaying, selectedExercise, playNextPhase, currentPhaseIndex, totalExerciseTimeRemaining, handleStopExercise]);

  const handleSelectExerciseForDuration = (exercise: BreathingExercise) => {
    setExerciseForDurationSelection(exercise);
    setViewState('durationSelection');
    setExerciseCompletionMessage(null);
  };
  
  const handleDurationSelectedAndStart = (durationMinutes: number) => {
    if (!exerciseForDurationSelection) return;

    const durationSeconds = durationMinutes * 60;
    setTotalExerciseDuration(durationSeconds);
    setTotalExerciseTimeRemaining(durationSeconds);
    setSelectedExercise(exerciseForDurationSelection);
    
    setCurrentPhaseIndex(0);
    const firstPhase = exerciseForDurationSelection.phases[0];
    setPhaseTimeLeft(firstPhase.duration);
    switch(firstPhase.animationState) {
        case 'expand': setAnimationClass('scale-125 opacity-100'); break;
        case 'hold-in': setAnimationClass('scale-125 opacity-90'); break;
        case 'contract': setAnimationClass('scale-75 opacity-60'); break;
        case 'hold-out': setAnimationClass('scale-75 opacity-50'); break;
        default: setAnimationClass('scale-100 opacity-70');
    }
    setIsExercisePlaying(true);
    setViewState('exercisePlayer');
    setExerciseCompletionMessage(null);
  };


  const handlePlayPauseExercise = () => {
    setIsExercisePlaying(!isExercisePlaying);
  };
  
  const currentPhase = selectedExercise?.phases[currentPhaseIndex];
  const durationOptions = [1, 3, 5]; 

  const returnToList = () => {
    setSelectedExercise(null);
    setExerciseForDurationSelection(null);
    setTotalExerciseDuration(null);
    setTotalExerciseTimeRemaining(null);
    setExerciseCompletionMessage(null);
    setViewState('list');
  };


  return (
    <PageShell title="Espacio de Bienestar" icon={<WellbeingIcon className="w-8 h-8" />}>
      {viewState === 'list' && (
        <>
          <div className="mb-6">
            <MindfulMomentCard userId={userId} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="¿Cómo te sientes ahora?" icon={<SparklesIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />}>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">Selecciona tu estado de ánimo actual. Tu registro es privado.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {moodOptions.map(({ mood, emoji, color, darkColor, textColor, darkTextColor }) => (
                  <Button
                    key={mood}
                    onClick={() => addMoodEntry(mood)}
                    className={`text-lg py-4 ${color} ${darkColor || ''} ${textColor} ${darkTextColor || ''}`}
                  >
                    <span className="text-2xl mr-2">{emoji}</span> {mood}
                  </Button>
                ))}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade algunas notas sobre cómo te sientes (opcional)..."
                rows={2}
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
              />
              {(isLoadingAdvice || muchuAdvice) && (
                <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/50 rounded-lg">
                  {isLoadingAdvice && <LoadingSpinner />}
                  {muchuAdvice && !isLoadingAdvice && <p className="text-teal-700 dark:text-teal-300 italic">{muchuAdvice}</p>}
                </div>
              )}
            </Card>

            <Card title="Ejercicios de Respiración Guiada" icon={<WellbeingIcon className="w-6 h-6" />}>
              <div className="space-y-4">
                {BREATHING_EXERCISES.map(exercise => (
                  <Card key={exercise.id} className={`border-l-4 ${getThemeColorClasses(exercise.themeColor, 'border', 'light')} ${getThemeColorClasses(exercise.themeColor, 'border', 'dark')}`}>
                    <h4 className={`text-lg font-semibold ${getThemeColorClasses(exercise.themeColor, 'text', 'light')} ${getThemeColorClasses(exercise.themeColor, 'text', 'dark')}`}>{exercise.name}</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">{exercise.description}</p>
                    <Button 
                      onClick={() => handleSelectExerciseForDuration(exercise)} 
                      className={`${getThemeColorClasses(exercise.themeColor, 'bg', 'light')} ${getThemeColorClasses(exercise.themeColor, 'bg', 'dark')} text-white`}
                    >
                      Comenzar Ejercicio
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          {moodLog.length > 0 && (
            <Card title="Historial de Ánimo Reciente" className="mt-6">
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {moodLog.map(entry => {
                  const moodInfo = moodOptions.find(m => m.mood === entry.mood);
                  return (
                    <li key={entry.id} className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-md shadow-sm flex justify-between items-start">
                      <div>
                        <span className={`text-xl mr-2`}>{moodInfo?.emoji || '❓'}</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-200">{entry.mood}</span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2"> - {new Date(entry.timestamp).toLocaleString()}</span>
                        {entry.notes && <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 italic">"{entry.notes}"</p>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteMoodEntry(entry.id)} title="Eliminar registro">
                        <TrashIcon className="w-4 h-4 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"/>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}

      {viewState === 'durationSelection' && exerciseForDurationSelection && (
         <Card 
            title={`Selecciona la Duración para ${exerciseForDurationSelection.name}`}
            icon={<WellbeingIcon className={`w-6 h-6 ${getThemeColorClasses(exerciseForDurationSelection.themeColor, 'text', effectiveTheme)}`} />} 
            className="text-center"
        >
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">¿Cuánto tiempo te gustaría dedicar a este ejercicio?</p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {durationOptions.map(minutes => (
                    <Button
                        key={minutes}
                        onClick={() => handleDurationSelectedAndStart(minutes)}
                        size="lg"
                        className={`w-full sm:w-auto text-white ${getThemeColorClasses(exerciseForDurationSelection.themeColor, 'bg', 'light')} ${getThemeColorClasses(exerciseForDurationSelection.themeColor, 'bg', 'dark')}`}
                    >
                        {minutes} Minuto{minutes > 1 ? 's' : ''}
                    </Button>
                ))}
            </div>
            <Button variant="ghost" onClick={() => handleStopExercise(false)} className="mt-8">
                Volver a la lista
            </Button>
        </Card>
      )}


      {viewState === 'exercisePlayer' && selectedExercise && currentPhase && (
        <Card 
            title={selectedExercise.name} 
            icon={<WellbeingIcon className={`w-6 h-6 ${getThemeColorClasses(selectedExercise.themeColor, 'text', effectiveTheme)}`} />} 
            className="text-center relative"
        >
          <div className={`absolute top-4 right-4 p-1 rounded-full ${getThemeColorClasses(selectedExercise.themeColor, 'bg', effectiveTheme)} opacity-20 dark:opacity-30 w-16 h-16 z-0`}></div>
          
          {totalExerciseTimeRemaining !== null && (
            <div className="absolute top-4 left-4 text-sm text-neutral-500 dark:text-neutral-400 p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg shadow">
              Total: {formatTime(totalExerciseTimeRemaining)}
            </div>
          )}

          <div className="my-8 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px]">
             {/* Visual breathing guide (the circle) */}
            <div 
              className={`w-48 h-48 sm:w-60 sm:h-60 rounded-full border-8 
              ${getThemeColorClasses(selectedExercise.themeColor, 'border', effectiveTheme)} 
              bg-opacity-20 ${getThemeColorClasses(selectedExercise.themeColor, 'bg', effectiveTheme)}
              flex items-center justify-center text-center
              ${animationClass} 
              transition-all duration-[1500ms] ease-in-out 
              `}
              style={{ transitionDuration: `${currentPhase.duration * 0.8}s` }} 
            >
              <div className="text-center">
                <p className={`text-2xl font-semibold ${getThemeColorClasses(selectedExercise.themeColor, 'text', effectiveTheme)}`}>
                  {currentPhase.name}
                </p>
                <p className={`text-4xl font-bold mt-1 ${getThemeColorClasses(selectedExercise.themeColor, 'text', effectiveTheme)}`}>
                  {phaseTimeLeft}s
                </p>
              </div>
            </div>
            <p className="mt-6 text-lg text-neutral-700 dark:text-neutral-200 min-h-[2.5em]">{currentPhase.instruction}</p>
          </div>

          <div className="flex items-center justify-center space-x-4 mt-6">
            <Button 
                onClick={handlePlayPauseExercise} 
                variant="ghost" 
                className={`!p-3 ${getThemeColorClasses(selectedExercise.themeColor, 'text', effectiveTheme)} hover:bg-opacity-20 ${getThemeColorClasses(selectedExercise.themeColor, 'bg', effectiveTheme)}`}
            >
              {isExercisePlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
            </Button>
            <Button 
                onClick={() => handleStopExercise(false)} 
                variant="ghost" 
                className={`!p-3 ${getThemeColorClasses(selectedExercise.themeColor, 'text', effectiveTheme)} hover:bg-opacity-20 ${getThemeColorClasses(selectedExercise.themeColor, 'bg', effectiveTheme)}`}
            >
              <StopIcon className="w-8 h-8" />
            </Button>
          </div>
        </Card>
      )}

       {viewState === 'exerciseCompleted' && selectedExercise && (
         <Card 
            title="¡Ejercicio Completado!" 
            icon={<SparklesIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />} 
            className="text-center"
        >
            {isLoadingCompletionMessage && <div className="p-8"><LoadingSpinner /></div>}
            {!isLoadingCompletionMessage && exerciseCompletionMessage && (
                 <img src={equippedMushuDialogImage} alt="Mushu Celebrando" className="w-28 h-auto mx-auto mb-4"/>
            )}
            <p className="text-xl font-semibold text-teal-700 dark:text-teal-300 mb-3">
                {selectedExercise.name}
            </p>
            {exerciseCompletionMessage && (
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">{exerciseCompletionMessage}</p>
            )}
             {!exerciseCompletionMessage && !isLoadingCompletionMessage && (
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">Has completado tu ejercicio de bienestar. ¡Buen trabajo! (+15 ✨)</p>
            )}
            <Button onClick={returnToList} variant="primary">Volver a la lista de Bienestar</Button>
        </Card>
       )}
    </PageShell>
  );
};
