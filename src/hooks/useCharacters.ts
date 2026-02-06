import { useEffect, useState, useCallback } from 'react';
import { useProfileStore } from '../stores/profileStore';
import { useProgressStore } from '../stores/progressStore';
import { getUnlockedCharacters, unlockCharacter as unlockCharacterDb } from '../db/database';
import {
  getCharactersForTheme,
  checkCharacterUnlock,
} from '../data/characters';
import type { UnlockedCharacter, Character } from '../types';

interface UseCharactersResult {
  allCharacters: Character[];
  unlockedCharacters: Character[];
  lockedCharacters: Character[];
  unlockedIds: Set<string>;
  newlyUnlocked: Character[];
  checkAndUnlockCharacters: () => Promise<Character[]>;
  clearNewlyUnlocked: () => void;
  isLoading: boolean;
}

export function useCharacters(): UseCharactersResult {
  const currentProfile = useProfileStore(state => state.currentProfile);
  const { tableProgress, starBalance, streak } = useProgressStore();

  const [unlockedRecords, setUnlockedRecords] = useState<UnlockedCharacter[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const theme = currentProfile?.theme || 'sparkle';
  const allCharacters = getCharactersForTheme(theme);

  // Load unlocked characters from database
  useEffect(() => {
    if (!currentProfile) return;

    const loadUnlocked = async () => {
      setIsLoading(true);
      const records = await getUnlockedCharacters(currentProfile.id);
      setUnlockedRecords(records);
      setIsLoading(false);
    };

    loadUnlocked();
  }, [currentProfile]);

  // Create set of unlocked IDs for fast lookup
  const unlockedIds = new Set(unlockedRecords.map(r => r.characterId));

  // Split characters into unlocked and locked
  const unlockedCharacters = allCharacters.filter(c => unlockedIds.has(c.id));
  const lockedCharacters = allCharacters.filter(c => !unlockedIds.has(c.id));

  // Check and unlock characters based on current progress
  const checkAndUnlockCharacters = useCallback(async (): Promise<Character[]> => {
    if (!currentProfile) return [];

    const masteredTables = tableProgress
      .filter(p => p.status === 'mastered')
      .map(p => p.tableNumber);

    const totalStars = starBalance?.lifetimeStars || 0;
    const currentStreak = streak?.currentStreak || 0;

    const newUnlocks: Character[] = [];

    for (const character of allCharacters) {
      // Skip if already unlocked
      if (unlockedIds.has(character.id)) continue;

      // Check if should be unlocked
      if (checkCharacterUnlock(character, masteredTables, totalStars, currentStreak)) {
        await unlockCharacterDb(currentProfile.id, character.id);
        newUnlocks.push(character);
      }
    }

    if (newUnlocks.length > 0) {
      // Reload unlocked records
      const records = await getUnlockedCharacters(currentProfile.id);
      setUnlockedRecords(records);
      setNewlyUnlocked(newUnlocks);
    }

    return newUnlocks;
  }, [currentProfile, tableProgress, starBalance, streak, allCharacters, unlockedIds]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  return {
    allCharacters,
    unlockedCharacters,
    lockedCharacters,
    unlockedIds,
    newlyUnlocked,
    checkAndUnlockCharacters,
    clearNewlyUnlocked,
    isLoading,
  };
}
