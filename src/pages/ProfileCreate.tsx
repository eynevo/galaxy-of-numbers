import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader, PageContent } from '../components/common/PageContainer';
import { Button } from '../components/common/Button';
import { AvatarSelector, getAvatarsForTheme } from '../components/common/Avatar';
import { useProfileStore } from '../stores/profileStore';
import type { Theme, InputMethod } from '../types';

type Step = 'name' | 'theme' | 'avatar' | 'input';

export function ProfileCreate() {
  const navigate = useNavigate();
  const addProfile = useProfileStore(state => state.addProfile);

  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<Theme>('sparkle');
  const [avatarId, setAvatarId] = useState('');
  const [inputMethod, setInputMethod] = useState<InputMethod>('multiple-choice');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 'name' && name.trim()) {
      setStep('theme');
    } else if (step === 'theme') {
      // Set default avatar for selected theme
      const avatars = getAvatarsForTheme(theme);
      setAvatarId(avatars[0].id);
      setStep('avatar');
    } else if (step === 'avatar') {
      setStep('input');
    }
  };

  const handleBack = () => {
    if (step === 'theme') setStep('name');
    else if (step === 'avatar') setStep('theme');
    else if (step === 'input') setStep('avatar');
    else navigate(-1);
  };

  const handleCreate = async () => {
    if (!name.trim() || !avatarId) return;

    setIsCreating(true);
    setError(null);
    try {
      console.log('Creating profile...', { name: name.trim(), theme, avatarId, inputMethod });
      const profile = await addProfile(name.trim(), theme, avatarId, inputMethod);
      console.log('Profile created:', profile);
      navigate('/profiles', { replace: true });
    } catch (err) {
      console.error('Failed to create profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to create profile: ' + errorMessage);
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'name':
        return (
          <motion.div
            key="name"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">What's your name?</h2>
              <p className="text-[var(--color-text-secondary)]">Enter the explorer's name</p>
            </div>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name"
              className="w-full max-w-xs px-6 py-4 text-xl text-center text-white bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/50"
              autoFocus
              maxLength={20}
            />

            <Button
              onClick={handleNext}
              disabled={!name.trim()}
              size="lg"
            >
              Next →
            </Button>
          </motion.div>
        );

      case 'theme':
        return (
          <motion.div
            key="theme"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Choose your style!</h2>
              <p className="text-[var(--color-text-secondary)]">Pick a theme for {name}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
              <motion.button
                className={`p-6 rounded-2xl text-left transition-all ${
                  theme === 'sparkle'
                    ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30 ring-2 ring-pink-400'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setTheme('sparkle')}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-3xl mb-2 block">✨👸🦄</span>
                <span className="text-lg font-bold text-white">Sparkle Space Princess</span>
                <span className="text-sm text-[var(--color-text-secondary)] block mt-1">
                  Magical, sparkly, pink & purple
                </span>
              </motion.button>

              <motion.button
                className={`p-6 rounded-2xl text-left transition-all ${
                  theme === 'lego'
                    ? 'bg-gradient-to-br from-red-500/30 to-blue-500/30 ring-2 ring-red-400'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setTheme('lego')}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-3xl mb-2 block">🧱🤖🚀</span>
                <span className="text-lg font-bold text-white">Lego Space Builder</span>
                <span className="text-sm text-[var(--color-text-secondary)] block mt-1">
                  Blocky, bold colors, building fun
                </span>
              </motion.button>
            </div>

            <Button onClick={handleNext} size="lg">
              Next →
            </Button>
          </motion.div>
        );

      case 'avatar':
        return (
          <motion.div
            key="avatar"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Pick your avatar!</h2>
              <p className="text-[var(--color-text-secondary)]">Choose how you look in space</p>
            </div>

            <div data-theme={theme}>
              <AvatarSelector
                theme={theme}
                selectedId={avatarId}
                onSelect={setAvatarId}
              />
            </div>

            <Button onClick={handleNext} disabled={!avatarId} size="lg">
              Next →
            </Button>
          </motion.div>
        );

      case 'input':
        return (
          <motion.div
            key="input"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">How to answer?</h2>
              <p className="text-[var(--color-text-secondary)]">Pick the answer method for {name}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
              <motion.button
                className={`p-6 rounded-2xl text-left transition-all ${
                  inputMethod === 'multiple-choice'
                    ? 'bg-[var(--color-surface-elevated)] ring-2 ring-[var(--color-primary)]'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setInputMethod('multiple-choice')}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl mb-2 block">🔘</span>
                <span className="text-lg font-bold text-white">Multiple Choice</span>
                <span className="text-sm text-[var(--color-text-secondary)] block mt-1">
                  Pick from 4 answer buttons - easier for beginners
                </span>
              </motion.button>

              <motion.button
                className={`p-6 rounded-2xl text-left transition-all ${
                  inputMethod === 'number-pad'
                    ? 'bg-[var(--color-surface-elevated)] ring-2 ring-[var(--color-primary)]'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setInputMethod('number-pad')}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl mb-2 block">🔢</span>
                <span className="text-lg font-bold text-white">Number Pad</span>
                <span className="text-sm text-[var(--color-text-secondary)] block mt-1">
                  Type the answer - builds stronger recall
                </span>
              </motion.button>
            </div>

            {error && (
              <div className="w-full max-w-sm p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}

            <Button onClick={handleCreate} disabled={isCreating} size="lg">
              {isCreating ? 'Creating...' : '🚀 Start Adventure!'}
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <PageContainer>
      <PageHeader title="New Explorer" onBack={handleBack} />
      <PageContent center>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-2 mt-8">
          {(['name', 'theme', 'avatar', 'input'] as Step[]).map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                step === s ? 'bg-[var(--color-primary)]' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
}
