import { create } from 'zustand';
import type { Profile, Theme, InputMethod } from '../types';
import {
  getAllProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  initializeProfileProgress,
  getProfile,
} from '../db/database';

interface ProfileState {
  profiles: Profile[];
  currentProfile: Profile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProfiles: () => Promise<void>;
  setCurrentProfile: (profileId: string) => Promise<void>;
  clearCurrentProfile: () => void;
  addProfile: (name: string, theme: Theme, avatarId: string, inputMethod: InputMethod) => Promise<Profile>;
  removeProfile: (profileId: string) => Promise<void>;
  updateProfileSettings: (profileId: string, updates: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  currentProfile: null,
  isLoading: false,
  error: null,

  loadProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const profiles = await getAllProfiles();
      set({ profiles, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load profiles', isLoading: false });
      console.error('Failed to load profiles:', error);
    }
  },

  setCurrentProfile: async (profileId: string) => {
    const profile = await getProfile(profileId);
    if (profile) {
      // Update last active time
      await updateProfile(profileId, { lastActiveAt: new Date() });
      set({ currentProfile: { ...profile, lastActiveAt: new Date() } });
    }
  },

  clearCurrentProfile: () => {
    set({ currentProfile: null });
  },

  addProfile: async (name: string, theme: Theme, avatarId: string, inputMethod: InputMethod) => {
    const id = crypto.randomUUID();
    const now = new Date();

    const profile: Profile = {
      id,
      name,
      theme,
      avatarId,
      inputMethod,
      createdAt: now,
      lastActiveAt: now,
    };

    await createProfile(profile);
    await initializeProfileProgress(id);

    // Reload profiles
    await get().loadProfiles();

    return profile;
  },

  removeProfile: async (profileId: string) => {
    await deleteProfile(profileId);

    // Clear current profile if it was deleted
    const { currentProfile } = get();
    if (currentProfile?.id === profileId) {
      set({ currentProfile: null });
    }

    // Reload profiles
    await get().loadProfiles();
  },

  updateProfileSettings: async (profileId: string, updates: Partial<Profile>) => {
    await updateProfile(profileId, updates);

    // Update current profile if it's the one being updated
    const { currentProfile } = get();
    if (currentProfile?.id === profileId) {
      set({ currentProfile: { ...currentProfile, ...updates } });
    }

    // Reload profiles
    await get().loadProfiles();
  },
}));
