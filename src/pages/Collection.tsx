import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader, PageContent } from '../components/common/PageContainer';
import { useProfileStore } from '../stores/profileStore';
import { useProgressStore } from '../stores/progressStore';
import { useCharacters } from '../hooks/useCharacters';
import { getCharacterEmoji, getUnlockDescription } from '../data/characters';
import type { Character } from '../types';

export function Collection() {
  const navigate = useNavigate();
  const currentProfile = useProfileStore(state => state.currentProfile);
  const loadProgress = useProgressStore(state => state.loadProgress);
  const {
    allCharacters,
    unlockedCharacters,
    lockedCharacters,
    unlockedIds,
    checkAndUnlockCharacters,
    isLoading,
  } = useCharacters();

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/profiles', { replace: true });
      return;
    }
    loadProgress(currentProfile.id);
  }, [currentProfile, navigate, loadProgress]);

  // Check for new unlocks when progress loads
  useEffect(() => {
    if (!isLoading) {
      checkAndUnlockCharacters();
    }
  }, [isLoading, checkAndUnlockCharacters]);

  if (!currentProfile) return null;

  const unlockedCount = unlockedCharacters.length;
  const totalCount = allCharacters.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <PageContainer>
      <PageHeader
        title="Collection"
        onBack={() => navigate('/menu')}
      />

      <PageContent className="gap-4">
        {/* Progress summary */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-3xl font-bold text-white">
            {unlockedCount} / {totalCount}
          </div>
          <div className="text-sm text-[var(--color-text-secondary)]">
            Characters Unlocked ({progressPercent}%)
          </div>
          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden max-w-xs mx-auto">
            <motion.div
              className="h-full bg-[var(--color-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Character grid */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Unlocked characters */}
          {unlockedCharacters.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-3">
                Your Characters
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {unlockedCharacters.map((character, index) => (
                  <motion.button
                    key={character.id}
                    className="flex flex-col items-center p-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]"
                    onClick={() => setSelectedCharacter(character)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-3xl mb-1">
                      {getCharacterEmoji(character)}
                    </span>
                    <span className="text-xs text-white truncate w-full text-center">
                      {character.name.split(' ')[0]}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Locked characters */}
          {lockedCharacters.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white/70 mb-3">
                Locked
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {lockedCharacters.map((character, index) => (
                  <motion.button
                    key={character.id}
                    className="flex flex-col items-center p-2 rounded-xl bg-white/5"
                    onClick={() => setSelectedCharacter(character)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: index * 0.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-3xl mb-1 grayscale opacity-50">
                      {getCharacterEmoji(character)}
                    </span>
                    <span className="text-xs text-white/50 truncate w-full text-center">
                      ???
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {allCharacters.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[var(--color-text-secondary)]">
              No characters available yet!
            </p>
          </div>
        )}
      </PageContent>

      {/* Character detail modal */}
      <AnimatePresence>
        {selectedCharacter && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCharacter(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70" />

            {/* Modal content */}
            <motion.div
              className="relative bg-[var(--color-background)] rounded-2xl p-6 max-w-sm w-full border border-white/10"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  className={`text-7xl mb-4 ${
                    !unlockedIds.has(selectedCharacter.id) ? 'grayscale opacity-50' : ''
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {getCharacterEmoji(selectedCharacter)}
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-1">
                  {unlockedIds.has(selectedCharacter.id)
                    ? selectedCharacter.name
                    : '???'}
                </h3>

                <p className="text-[var(--color-text-secondary)] mb-4">
                  {unlockedIds.has(selectedCharacter.id)
                    ? selectedCharacter.description
                    : 'This character is still locked'}
                </p>

                {!unlockedIds.has(selectedCharacter.id) && (
                  <div className="px-4 py-2 rounded-lg bg-white/5 text-sm">
                    <span className="text-[var(--color-primary)]">
                      How to unlock:
                    </span>
                    <br />
                    <span className="text-white">
                      {getUnlockDescription(selectedCharacter)}
                    </span>
                  </div>
                )}
              </div>

              <button
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20"
                onClick={() => setSelectedCharacter(null)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
