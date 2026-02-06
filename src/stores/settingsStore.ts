import { create } from 'zustand';
import type { AppSettings } from '../types';
import { getSettings, updateSettings, initializeSettings } from '../db/database';

interface SettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  isPinVerified: boolean;
  sessionStartTime: Date | null;

  // Actions
  loadSettings: () => Promise<void>;
  verifyPin: (pin: string) => boolean;
  clearPinVerification: () => void;
  updatePin: (newPin: string) => Promise<void>;
  updateBreakReminder: (minutes: number) => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleReadAloud: () => Promise<void>;
  startSession: () => void;
  getSessionDuration: () => number;
  shouldShowBreakReminder: () => boolean;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  isPinVerified: false,
  sessionStartTime: null,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      await initializeSettings();
      const settings = await getSettings();
      set({ settings: settings || null, isLoading: false });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoading: false });
    }
  },

  verifyPin: (pin: string) => {
    const { settings } = get();
    if (settings && settings.parentPin === pin) {
      set({ isPinVerified: true });
      return true;
    }
    return false;
  },

  clearPinVerification: () => {
    set({ isPinVerified: false });
  },

  updatePin: async (newPin: string) => {
    const { settings } = get();
    if (settings) {
      const updated = { ...settings, parentPin: newPin };
      await updateSettings(updated);
      set({ settings: updated });
    }
  },

  updateBreakReminder: async (minutes: number) => {
    const { settings } = get();
    if (settings) {
      const updated = { ...settings, breakReminderMinutes: minutes };
      await updateSettings(updated);
      set({ settings: updated });
    }
  },

  toggleSound: async () => {
    const { settings } = get();
    if (settings) {
      const updated = { ...settings, soundEnabled: !settings.soundEnabled };
      await updateSettings(updated);
      set({ settings: updated });
    }
  },

  toggleReadAloud: async () => {
    const { settings } = get();
    if (settings) {
      const updated = { ...settings, readAloudEnabled: !settings.readAloudEnabled };
      await updateSettings(updated);
      set({ settings: updated });
    }
  },

  startSession: () => {
    set({ sessionStartTime: new Date() });
  },

  getSessionDuration: () => {
    const { sessionStartTime } = get();
    if (!sessionStartTime) return 0;
    return Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60);
  },

  shouldShowBreakReminder: () => {
    const { settings, sessionStartTime } = get();
    if (!settings || !sessionStartTime) return false;

    const duration = get().getSessionDuration();
    return duration >= settings.breakReminderMinutes;
  },
}));
