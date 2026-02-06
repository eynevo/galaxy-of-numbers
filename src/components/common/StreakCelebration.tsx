import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import type { StreakMilestoneReached } from '../../stores/progressStore';

interface StreakCelebrationProps {
  milestone: StreakMilestoneReached | null;
  onDismiss: () => void;
}

export function StreakCelebration({ milestone, onDismiss }: StreakCelebrationProps) {
  if (!milestone) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Celebration content */}
        <motion.div
          className="relative bg-gradient-to-b from-orange-500/20 to-yellow-500/20 rounded-3xl p-8 max-w-sm w-full border border-yellow-500/30 text-center"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Fire animation */}
          <motion.div
            className="text-8xl mb-4"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: 2,
            }}
          >
            🔥
          </motion.div>

          <motion.h2
            className="text-3xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {milestone.message}
          </motion.h2>

          <motion.p
            className="text-lg text-[var(--color-text-secondary)] mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {milestone.days} days of practice in a row!
          </motion.p>

          {/* Bonus stars */}
          <motion.div
            className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-yellow-500/20 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <span className="text-4xl">⭐</span>
            <div className="text-left">
              <div className="text-2xl font-bold text-[var(--color-star)]">
                +{milestone.bonus} Bonus Stars!
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                Streak reward
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button fullWidth onClick={onDismiss}>
              Awesome!
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
