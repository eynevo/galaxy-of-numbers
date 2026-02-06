import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if prompt was dismissed recently
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show for 7 days after dismissal
      }
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after a short delay (don't interrupt initial experience)
      setTimeout(() => setShowPrompt(true), 30000); // 30 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS, show custom prompt after some usage
    if (iOS && !standalone) {
      setTimeout(() => setShowPrompt(true), 60000); // 1 minute for iOS
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone) return null;

  // Don't show if no prompt available and not iOS
  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 left-4 right-4 z-[80]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
      >
        <div className="bg-[var(--color-background)] border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📱</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                Install Galaxy of Numbers
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                {isIOS
                  ? 'Tap the share button and select "Add to Home Screen" to install.'
                  : 'Install for quick access and offline play!'}
              </p>

              <div className="flex gap-2">
                {!isIOS && deferredPrompt && (
                  <Button size="sm" onClick={handleInstall}>
                    Install
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  {isIOS ? 'Got it' : 'Later'}
                </Button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-white/50 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* iOS specific instructions */}
          {isIOS && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <span>1. Tap</span>
              <span className="text-2xl">⎙</span>
              <span>2. Scroll down</span>
              <span>3. "Add to Home Screen"</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
