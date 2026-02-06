// Theme types
export type Theme = 'sparkle' | 'lego';
export type InputMethod = 'multiple-choice' | 'number-pad';

// Math operation types
export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Profile types
export interface Profile {
  id: string;
  name: string;
  theme: Theme;
  avatarId: string;
  inputMethod: InputMethod;
  enabledOperations: OperationType[];
  difficultyLevel: DifficultyLevel;
  createdAt: Date;
  lastActiveAt: Date;
}

// Progress types
export type TableStatus = 'locked' | 'learning' | 'practiced' | 'mastered';

export interface TableProgress {
  profileId: string;
  tableNumber: number;
  status: TableStatus;
  teachingCompleted: boolean;
  guidedPracticeCompleted: boolean;
  masteryScore: number; // 0-100
  lastPracticedAt: Date | null;
}

export interface FactStat {
  profileId: string;
  fact: string; // e.g., "7x8"
  correctCount: number;
  incorrectCount: number;
  lastAttempt: Date | null;
  nextReviewDate: Date;
  easeFactor: number; // For spaced repetition (default 2.5)
  interval: number; // Days until next review
}

export interface QuizAttempt {
  id: string;
  profileId: string;
  tableNumber: number;
  date: Date;
  totalProblems: number;
  correctAnswers: number;
  timeSpentSeconds: number;
  problems: QuizProblem[];
}

export interface QuizProblem {
  multiplicand: number;
  multiplier: number;
  correctAnswer: number;
  userAnswer: number | null;
  isCorrect: boolean;
  timeToAnswerMs: number;
}

// Generic math problem for all operation types
export interface MathProblem {
  operand1: number;
  operand2: number;
  operation: OperationType;
  correctAnswer: number;
  userAnswer: number | null;
  isCorrect: boolean;
  timeToAnswerMs: number;
}

// Session tracking
export interface Session {
  id: string;
  profileId: string;
  startTime: Date;
  endTime: Date | null;
  tablesWorked: number[];
  problemsAttempted: number;
  problemsCorrect: number;
}

// Streak tracking
export interface Streak {
  profileId: string;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null; // YYYY-MM-DD format, null if never practiced
}

// Character/Collectible types
export interface Character {
  id: string;
  name: string;
  description: string;
  theme: Theme;
  unlockCondition: UnlockCondition;
  imageUrl: string;
}

export type UnlockCondition =
  | { type: 'table_mastery'; tableNumber: number }
  | { type: 'star_threshold'; stars: number }
  | { type: 'streak'; days: number }
  | { type: 'total_problems'; count: number };

export interface UnlockedCharacter {
  profileId: string;
  characterId: string;
  unlockedAt: Date;
}

// Stars/Rewards
export interface StarBalance {
  profileId: string;
  totalStars: number;
  lifetimeStars: number;
}

// Settings
export interface AppSettings {
  parentPin: string;
  breakReminderMinutes: number;
  soundEnabled: boolean;
  readAloudEnabled: boolean;
}

// Teaching content types
export interface TableTeaching {
  tableNumber: number;
  title: string;
  conceptIntro: TeachingStep[];
  patterns: PatternTeaching[];
  guidedPractice: GuidedProblem[];
}

export interface TeachingStep {
  type: 'text' | 'visual' | 'interactive';
  content: string;
  visualType?: 'groups' | 'array' | 'numberline';
  example?: { multiplicand: number; multiplier: number };
}

export interface PatternTeaching {
  title: string;
  description: string;
  examples: string[];
  tip?: string;
}

export interface GuidedProblem {
  multiplicand: number;
  multiplier: number;
  hint: string;
  explanation: string;
}

// Navigation
export type AppRoute =
  | 'splash'
  | 'profiles'
  | 'create-profile'
  | 'main-menu'
  | 'adventure'
  | 'practice'
  | 'collection'
  | 'learning'
  | 'quiz'
  | 'results'
  | 'parent-dashboard'
  | 'parent-child-detail'
  | 'settings';

// Quiz state
export interface QuizState {
  tableNumber: number;
  currentProblemIndex: number;
  problems: QuizProblem[];
  startTime: Date;
  isComplete: boolean;
}

// Assessment for new users
export interface AssessmentResult {
  profileId: string;
  knownTables: number[];
  suggestedStartTable: number;
  completedAt: Date;
}
