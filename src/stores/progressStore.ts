import { create } from 'zustand';
import type { TableProgress, FactStat, Streak, StarBalance, QuizAttempt } from '../types';
import {
  getTableProgress,
  updateTableProgress,
  getFactStats,
  updateFactStat,
  getStreak,
  updateStreak,
  getStarBalance,
  addStars as addStarsToDb,
  saveQuizAttempt,
  getQuizAttempts,
} from '../db/database';

interface ProgressState {
  tableProgress: TableProgress[];
  factStats: FactStat[];
  streak: Streak | null;
  starBalance: StarBalance | null;
  recentQuizzes: QuizAttempt[];
  isLoading: boolean;

  // Actions
  loadProgress: (profileId: string) => Promise<void>;
  completeTeaching: (profileId: string, tableNumber: number) => Promise<void>;
  completeGuidedPractice: (profileId: string, tableNumber: number) => Promise<void>;
  updateMastery: (profileId: string, tableNumber: number, score: number) => Promise<void>;
  unlockNextTable: (profileId: string) => Promise<void>;
  recordFactAttempt: (profileId: string, fact: string, isCorrect: boolean) => Promise<void>;
  addStars: (profileId: string, amount: number) => Promise<void>;
  updateDailyStreak: (profileId: string) => Promise<void>;
  saveQuiz: (attempt: QuizAttempt) => Promise<void>;
}

// Table unlock order
const UNLOCK_ORDER = [1, 10, 2, 5, 3, 4, 9, 6, 7, 8];

export const useProgressStore = create<ProgressState>((set, get) => ({
  tableProgress: [],
  factStats: [],
  streak: null,
  starBalance: null,
  recentQuizzes: [],
  isLoading: false,

  loadProgress: async (profileId: string) => {
    set({ isLoading: true });
    try {
      const [tableProgress, factStats, streak, starBalance, recentQuizzes] = await Promise.all([
        getTableProgress(profileId),
        getFactStats(profileId),
        getStreak(profileId),
        getStarBalance(profileId),
        getQuizAttempts(profileId),
      ]);

      set({
        tableProgress,
        factStats,
        streak: streak || null,
        starBalance: starBalance || null,
        recentQuizzes: recentQuizzes.slice(-10), // Keep last 10
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load progress:', error);
      set({ isLoading: false });
    }
  },

  completeTeaching: async (profileId: string, tableNumber: number) => {
    const { tableProgress } = get();
    const progress = tableProgress.find(
      p => p.profileId === profileId && p.tableNumber === tableNumber
    );

    if (progress) {
      const updated = { ...progress, teachingCompleted: true };
      await updateTableProgress(updated);

      set({
        tableProgress: tableProgress.map(p =>
          p.profileId === profileId && p.tableNumber === tableNumber ? updated : p
        ),
      });
    }
  },

  completeGuidedPractice: async (profileId: string, tableNumber: number) => {
    const { tableProgress } = get();
    const progress = tableProgress.find(
      p => p.profileId === profileId && p.tableNumber === tableNumber
    );

    if (progress) {
      const updated = {
        ...progress,
        guidedPracticeCompleted: true,
        status: 'practiced' as const,
        lastPracticedAt: new Date(),
      };
      await updateTableProgress(updated);

      set({
        tableProgress: tableProgress.map(p =>
          p.profileId === profileId && p.tableNumber === tableNumber ? updated : p
        ),
      });
    }
  },

  updateMastery: async (profileId: string, tableNumber: number, score: number) => {
    const { tableProgress } = get();
    const progress = tableProgress.find(
      p => p.profileId === profileId && p.tableNumber === tableNumber
    );

    if (progress) {
      const newStatus = score >= 90 ? 'mastered' : progress.status;
      const updated = {
        ...progress,
        masteryScore: Math.max(progress.masteryScore, score),
        status: newStatus,
        lastPracticedAt: new Date(),
      };
      await updateTableProgress(updated);

      set({
        tableProgress: tableProgress.map(p =>
          p.profileId === profileId && p.tableNumber === tableNumber ? updated : p
        ),
      });

      // If mastered, unlock next table
      if (newStatus === 'mastered') {
        await get().unlockNextTable(profileId);
      }
    }
  },

  unlockNextTable: async (profileId: string) => {
    const { tableProgress } = get();

    // Find the next locked table in unlock order
    for (const tableNum of UNLOCK_ORDER) {
      const progress = tableProgress.find(
        p => p.profileId === profileId && p.tableNumber === tableNum
      );

      if (progress && progress.status === 'locked') {
        const updated = { ...progress, status: 'learning' as const };
        await updateTableProgress(updated);

        set({
          tableProgress: tableProgress.map(p =>
            p.profileId === profileId && p.tableNumber === tableNum ? updated : p
          ),
        });
        break;
      }
    }
  },

  recordFactAttempt: async (profileId: string, fact: string, isCorrect: boolean) => {
    const { factStats } = get();
    let stat = factStats.find(s => s.profileId === profileId && s.fact === fact);

    if (!stat) {
      stat = {
        profileId,
        fact,
        correctCount: 0,
        incorrectCount: 0,
        lastAttempt: null,
        nextReviewDate: new Date(),
        easeFactor: 2.5,
        interval: 1,
      };
    }

    // Update counts
    if (isCorrect) {
      stat.correctCount++;
    } else {
      stat.incorrectCount++;
    }
    stat.lastAttempt = new Date();

    // Simple spaced repetition update
    if (isCorrect) {
      stat.interval = Math.ceil(stat.interval * stat.easeFactor);
      stat.easeFactor = Math.min(2.8, stat.easeFactor + 0.1);
    } else {
      stat.interval = 1;
      stat.easeFactor = Math.max(1.3, stat.easeFactor - 0.2);
    }

    stat.nextReviewDate = new Date(Date.now() + stat.interval * 24 * 60 * 60 * 1000);

    await updateFactStat(stat);

    set({
      factStats: factStats.some(s => s.profileId === profileId && s.fact === fact)
        ? factStats.map(s => (s.profileId === profileId && s.fact === fact ? stat! : s))
        : [...factStats, stat],
    });
  },

  addStars: async (profileId: string, amount: number) => {
    await addStarsToDb(profileId, amount);

    const { starBalance } = get();
    if (starBalance) {
      set({
        starBalance: {
          ...starBalance,
          totalStars: starBalance.totalStars + amount,
          lifetimeStars: starBalance.lifetimeStars + amount,
        },
      });
    }
  },

  updateDailyStreak: async (_profileId: string) => {
    const { streak } = get();
    const today = new Date().toISOString().split('T')[0];

    if (!streak) return;

    if (streak.lastPracticeDate === today) {
      // Already practiced today
      return;
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let newStreak: Streak;
    if (streak.lastPracticeDate === yesterday) {
      // Continue streak
      newStreak = {
        ...streak,
        currentStreak: streak.currentStreak + 1,
        longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
        lastPracticeDate: today,
      };
    } else {
      // Streak broken, start new
      newStreak = {
        ...streak,
        currentStreak: 1,
        lastPracticeDate: today,
      };
    }

    await updateStreak(newStreak);
    set({ streak: newStreak });
  },

  saveQuiz: async (attempt: QuizAttempt) => {
    await saveQuizAttempt(attempt);

    const { recentQuizzes } = get();
    set({
      recentQuizzes: [...recentQuizzes, attempt].slice(-10),
    });
  },
}));
