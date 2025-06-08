export interface SubTask {
  id: string;
  name: string;
  completed: boolean;
  parentId: string; // ID of the parent Task
  createdAt: number;
}

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: number;
  storyHook?: string; // For narrative element
  completionMessage?: string; // For celebration message upon completion
  subTasks?: SubTask[]; // Array of sub-tasks
  status: TaskStatus; // For Kanban board
}

export interface Habit {
  id:string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly'; // Example frequencies
  description?: string;
  streak: number;
  lastCompleted: number | null; // Timestamp
  createdAt: number;
}

export interface AIMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export enum Mood {
  Happy = 'Feliz',
  Okay = 'Bien',
  Sad = 'Triste',
  Anxious = 'Ansioso',
  Productive = 'Productivo',
  Tired = 'Cansado'
}

export interface MoodEntry {
  id: string;
  mood: Mood;
  notes?: string;
  timestamp: number;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievalQuery?: string;
  text?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // ISO string for date YYYY-MM-DD
  description?: string;
  createdAt: number; // Timestamp for creation/sorting
}

export interface PredefinedCategory {
  name: string;
  icon?: string; // Emoji or simple identifier
}

// Currency Types
export type CurrencyCode = 'EUR' | 'USD' | 'CLP';

export interface CurrencySetting {
  code: CurrencyCode;
  symbol: string; // For simple display, though Intl.NumberFormat is preferred
  name: string;
}

// Breathing Exercise Types
export interface BreathingPhase {
  name: string;
  duration: number;
  instruction: string;
  animationState: 'expand' | 'hold-in' | 'contract' | 'hold-out';
}

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  phases: BreathingPhase[];
  themeColor: string;
  totalCycleDuration?: number;
}

// Digital Journal Types
export type JournalSentiment = 'positivo' | 'negativo' | 'neutral' | 'mixto';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
  sentiment?: JournalSentiment;
  sentimentEmoji?: string;
  summary?: string;
}

// Quick Notes / Brain Dump
export interface QuickNote {
  id: string;
  text: string;
  timestamp: number;
}


// Speech API Interfaces
export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

export interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

export interface SpeechRecognition extends EventTarget {
  grammars: any; // Using 'any' for SpeechGrammarList for simplicity
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI?: string;

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

  abort(): void;
  start(): void;
  stop(): void;
}

// Mushu Store Types
export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  imageAssetKey: string; // e.g., 'wizard', 'detective'. Maps to assets/mushu_alberto_wizard.png
  previewImage: string; // Full path to preview image, e.g., 'assets/mushu_alberto_wizard_preview.png'
}

// Focus Session Types
export type FocusTimerMode = 'work' | 'break';


declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
    readonly speechSynthesis: SpeechSynthesis;
  }
}