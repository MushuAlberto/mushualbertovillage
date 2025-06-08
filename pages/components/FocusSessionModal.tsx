
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task, FocusTimerMode } from '../../types';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { TimerIcon, PlayIcon, PauseIcon, StopIcon, CheckCircleIcon, XCircleIcon } from '../../components/icons';
import { formatTime } from '../../utils/time';

const WORK_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

interface FocusSessionModalProps {
  task: Task;
  onCloseSession: () => void;
  onCompleteTask: (task: Task) => void;
  mushuDialogImage: string;
  userName: string;
}

export const FocusSessionModal: React.FC<FocusSessionModalProps> = ({
  task,
  onCloseSession,
  onCompleteTask,
  mushuDialogImage,
  userName,
}) => {
  const [timerMode, setTimerMode] = useState<FocusTimerMode>('work');
  const [timeRemaining, setTimeRemaining] = useState(WORK_DURATION);
  const [isActive, setIsActive] = useState(true);
  const [mushuMessage, setMushuMessage] = useState('');

  const timerRef = useRef<number | null>(null);

  const updateMushuMessage = useCallback(() => {
    if (timerMode === 'work') {
      setMushuMessage(`¡Es hora de concentrarse en "${task.name}", ${userName}! ¡Tú puedes!`);
    } else {
      setMushuMessage(`¡Buen trabajo! Tómate un respiro de ${BREAK_DURATION / 60} minutos. Te lo mereces.`);
    }
  }, [timerMode, task.name, userName]);

  useEffect(() => {
    updateMushuMessage();
  }, [updateMushuMessage]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            // Timer finished
            if (timerMode === 'work') {
              setTimerMode('break');
              setTimeRemaining(BREAK_DURATION);
              setMushuMessage(`¡El descanso terminó, ${userName}! ¿Listo para continuar con "${task.name}"?`);
              // Optionally play a sound
            } else { // Break finished
              setTimerMode('work');
              setTimeRemaining(WORK_DURATION);
              updateMushuMessage(); // Sets work message
               // Optionally play a sound
            }
            return timerMode === 'work' ? BREAK_DURATION : WORK_DURATION; // Start next phase
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timerMode, task.name, userName, updateMushuMessage]);

  const handlePauseResume = () => {
    setIsActive(!isActive);
  };

  const handleCancelSession = () => {
    setMushuMessage(`Entendido. "${task.name}" te esperará cuando estés listo.`);
    // Delay closing to show message
    setTimeout(() => {
      onCloseSession();
    }, 1500);
  };

  const handleCompleteAndClose = () => {
    setIsActive(false); // Stop timer
    setMushuMessage(`¡"${task.name}" completado! ¡Increíble, ${userName}! Has ganado +10 Sparkles ✨.`);
    // Delay completion to show message
    setTimeout(() => {
      onCompleteTask(task);
      // onCloseSession is called by onCompleteTask in App.tsx after task updates
    }, 2000);
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
      <Card 
        className="w-full max-w-lg shadow-2xl bg-white dark:bg-neutral-800 flex flex-col items-center text-center"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      >
        <img src={mushuDialogImage} alt="Mushu Alberto" className="w-24 h-auto mt-2 mb-3"/>
        
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Concentrándose en:</p>
        <h2 className="text-2xl font-bold text-teal-700 dark:text-teal-300 mb-3 px-4">{task.name}</h2>
        
        <p className="text-base text-neutral-700 dark:text-neutral-200 mb-6 min-h-[3em] px-4">{mushuMessage}</p>

        <div className={`my-6 p-6 rounded-full border-4 ${timerMode === 'work' ? 'border-teal-500 dark:border-teal-400' : 'border-yellow-500 dark:border-yellow-400'} flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 mx-auto`}>
          <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {timerMode === 'work' ? 'Tiempo de Trabajo' : 'Descanso'}
          </p>
          <div className="text-6xl sm:text-7xl font-mono font-bold text-neutral-800 dark:text-neutral-100">
            {formatTime(timeRemaining)}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 w-full px-4 sm:px-0">
          <Button
            onClick={handlePauseResume}
            variant="ghost"
            size="md"
            className="w-full sm:w-auto"
            leftIcon={isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          >
            {isActive ? 'Pausar' : 'Reanudar'}
          </Button>
          <Button
            onClick={handleCompleteAndClose}
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            leftIcon={<CheckCircleIcon className="w-5 h-5" />}
          >
            Completar Tarea
          </Button>
          <Button
            onClick={handleCancelSession}
            variant="danger"
            size="md"
            className="w-full sm:w-auto"
            leftIcon={<XCircleIcon className="w-5 h-5" />}
          >
            Cancelar Foco
          </Button>
        </div>
      </Card>
      {/* 
        The <style jsx global> block was removed from here. 
        The fadeIn animation might not work if not defined globally.
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      */}
    </div>
  );
};
