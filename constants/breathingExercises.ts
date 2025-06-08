
import { BreathingExercise } from '../types'; // Assuming BreathingExercise types will be moved/defined in types.ts

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: 'box-breathing',
    name: 'Respiración Cuadrada',
    description: 'Equilibra tu sistema nervioso y calma la mente con este ritmo constante.',
    themeColor: 'teal', // Tailwind color prefix, e.g., bg-teal-500
    phases: [
      { name: 'Inhala', duration: 4, instruction: 'Inhala profundamente por la nariz.', animationState: 'expand' },
      { name: 'Sostén', duration: 4, instruction: 'Sostén la respiración con los pulmones llenos.', animationState: 'hold-in' },
      { name: 'Exhala', duration: 4, instruction: 'Exhala lentamente por la boca.', animationState: 'contract' },
      { name: 'Sostén', duration: 4, instruction: 'Sostén la respiración con los pulmones vacíos.', animationState: 'hold-out' },
    ],
    totalCycleDuration: 16,
  },
  {
    id: '4-7-8-breathing',
    name: 'Respiración 4-7-8',
    description: 'Una técnica de relajación efectiva para reducir la ansiedad y ayudar a dormir.',
    themeColor: 'blue',
    phases: [
      { name: 'Inhala', duration: 4, instruction: 'Inhala suavemente por la nariz.', animationState: 'expand' },
      { name: 'Sostén', duration: 7, instruction: 'Mantén el aire en tus pulmones.', animationState: 'hold-in' },
      { name: 'Exhala', duration: 8, instruction: 'Exhala completamente por la boca, haciendo un sonido suave.', animationState: 'contract' },
    ],
    totalCycleDuration: 19,
  },
  {
    id: 'deep-calm-breathing',
    name: 'Calma Profunda',
    description: 'Fomenta la relajación profunda y reduce el estrés con exhalaciones largas.',
    themeColor: 'indigo',
    phases: [
      { name: 'Inhala', duration: 4, instruction: 'Inhala lenta y profundamente.', animationState: 'expand' },
      { name: 'Sostén Breve', duration: 2, instruction: 'Una pausa suave.', animationState: 'hold-in' },
      { name: 'Exhala Lento', duration: 6, instruction: 'Exhala de forma controlada y prolongada.', animationState: 'contract' },
      { name: 'Pausa Natural', duration: 2, instruction: 'Descansa antes de la siguiente inhalación.', animationState: 'hold-out'}
    ],
    totalCycleDuration: 14,
  },
];
