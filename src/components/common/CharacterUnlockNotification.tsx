import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { useCharacters } from '../../hooks/useCharacters';
import { getCharacterEmoji } from '../../data/characters';
import { useAudio } from '../../hooks/useAudio';
import type { Character } from '../../types';

export function CharacterUnlockNotification() {
  const { newlyUnlocked, clearNewlyUnlocked } = useCharacters();
  const { play } = useAudio();
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);

  useEffect(() => {
    if (newlyUnlocked.length > 0 && !currentCharacter) {
      setCurrentCharacter(newlyUnlocked[0]);
      play('unlock');
    }
  }, [newlyUnlocked, currentCharacter, play]);

  const handleDismiss = () => {
    setCurrentCharacter(null);
    clearNewlyUnlocked();
  };

  if (!currentCharacter) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[95] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleDismiss}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Confetti-like particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#ec4899', '#a855f7', '#fbbf24', '#34d399'][i % 4],
              }}
              initial={{ y: -20, opacity: 1 }}
              animate={{
                y: window.innerHeight + 20,
                x: (Math.random() - 0.5) * 200,
                rotate: Math.random() * 720,
                opacity: 0,
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Card */}
        <motion.div
          className="relative bg-gradient-to-b from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 rounded-3xl p-8 max-w-sm w-full border border-[var(--color-primary)]/30 text-center"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            className="text-sm font-bold text-[var(--color-primary)] mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            NEW CHARACTER UNLOCKED!
          </motion.div>

          <motion.div
            className="text-8xl mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 10,
              delay: 0.3,
            }}
          >
            {getCharacterEmoji(currentCharacter)}
          </motion.div>

          <motion.h2
            className="text-2xl font-bold text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {currentCharacter.name}
          </motion.h2>

          <motion.p
            className="text-[var(--color-text-secondary)] mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {currentCharacter.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button onClick={handleDismiss}>
              Awesome!
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
