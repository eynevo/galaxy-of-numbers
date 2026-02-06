import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from './Button';

interface BreakReminderProps {
  checkInterval?: number; // Check every N milliseconds (default 60000 = 1 min)
}

export function BreakReminder({ checkInterval = 60000 }: BreakReminderProps) {
  const { shouldShowBreakReminder, getSessionDuration, startSession, settings } = useSettingsStore();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if break reminder should show
  useEffect(() => {
    const checkBreak = () => {
      if (!dismissed && shouldShowBreakReminder()) {
        setIsVisible(true);
      }
    };

    // Check immediately
    checkBreak();

    // Then check periodically
    const interval = setInterval(checkBreak, checkInterval);
    return () => clearInterval(interval);
  }, [shouldShowBreakReminder, checkInterval, dismissed]);

  const handleContinue = useCallback(() => {
    setIsVisible(false);
    setDismissed(true);
  }, []);

  const handleTakeBreak = useCallback(() => {
    setIsVisible(false);
    setDismissed(true);
    // Reset session start time for next reminder
    startSession();
  }, [startSession]);

  // Don't render anything if not visible
  if (!isVisible) return null;

  const duration = getSessionDuration();
  const breakMinutes = settings?.breakReminderMinutes || 20;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal content */}
        <motion.div
          className="relative bg-[var(--color-background)] rounded-3xl p-8 max-w-sm w-full border border-white/10 text-center"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Illustration */}
          <motion.div
            className="text-7xl mb-4"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop'
            }}
          >
            🌟
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Time for a Break!
          </h2>

          <p className="text-[var(--color-text-secondary)] mb-6">
            You've been playing for {duration} minutes!
            Your brain works best with little breaks.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center gap-3 text-lg text-white/80">
              <span>🧘</span>
              <span>Stretch your arms</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-lg text-white/80">
              <span>👀</span>
              <span>Rest your eyes</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-lg text-white/80">
              <span>💧</span>
              <span>Get some water</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button fullWidth onClick={handleTakeBreak}>
              Take a Break
            </Button>
            <Button fullWidth variant="ghost" onClick={handleContinue}>
              Continue Playing
            </Button>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] mt-4">
            Reminder set for every {breakMinutes} minutes
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
