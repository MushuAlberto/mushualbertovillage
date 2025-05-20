
import { MindfulnessActivity } from './types';

export const mindfulnessActivities: MindfulnessActivity[] = [
  {
    id: 'med1',
    name: 'Meditación de atención plena',
    description: 'Una meditación simple para centrar tu mente en el momento presente.',
    duration: '5 minutos',
    type: 'meditación',
    instructions: [
      'Siéntate en una posición cómoda con la espalda recta',
      'Cierra los ojos y respira profundamente',
      'Concéntrate en tu respiración, notando cómo entra y sale el aire',
      'Cuando tu mente divague, vuelve a centrar la atención en la respiración',
      'Continúa este proceso durante 5 minutos'
    ]
  },
  {
    id: 'breath1',
    name: 'Respiración 4-7-8',
    description: 'Técnica de respiración para calmar la ansiedad y facilitar el sueño.',
    duration: '2 minutos',
    type: 'respiración',
    instructions: [
      'Siéntate en una posición cómoda con la espalda recta',
      'Inhala por la nariz durante 4 segundos',
      'Mantén la respiración durante 7 segundos',
      'Exhala lentamente por la boca durante 8 segundos',
      'Repite este ciclo 4 veces'
    ]
  },
  {
    id: 'relax1',
    name: 'Relajación muscular progresiva',
    description: 'Técnica para relajar grupos musculares y reducir la tensión física.',
    duration: '10 minutos',
    type: 'relajación',
    instructions: [
      'Acuéstate en una posición cómoda',
      'Comienza por los pies: tensa los músculos durante 5 segundos y luego relaja',
      'Sube hacia las pantorrillas, repite el proceso',
      'Continúa subiendo por todo el cuerpo hasta llegar a la cara',
      'Termina con una respiración profunda'
    ]
  },
  {
    id: 'med2',
    name: 'Meditación de gratitud',
    description: 'Práctica para cultivar sentimientos de agradecimiento y positividad.',
    duration: '5 minutos',
    type: 'meditación',
    instructions: [
      'Siéntate cómodamente y cierra los ojos',
      'Respira profundamente varias veces',
      'Piensa en 5 cosas por las que estés agradecido hoy',
      'Con cada respiración, siente la gratitud en tu cuerpo',
      'Termina con una sonrisa y una respiración profunda'
    ]
  },
  {
    id: 'breath2',
    name: 'Respiración cuadrada',
    description: 'Técnica de respiración equilibrada para calmar la mente y reducir el estrés.',
    duration: '3 minutos',
    type: 'respiración',
    instructions: [
      'Inhala lentamente contando hasta 4',
      'Mantén el aire contando hasta 4',
      'Exhala lentamente contando hasta 4',
      'Mantén los pulmones vacíos contando hasta 4',
      'Repite este ciclo durante 3 minutos'
    ]
  }
];
