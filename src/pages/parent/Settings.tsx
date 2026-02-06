import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader, PageContent } from '../../components/common/PageContainer';
import { Button } from '../../components/common/Button';
import { useSettingsStore } from '../../stores/settingsStore';

export function ParentSettings() {
  const navigate = useNavigate();
  const { settings, isPinVerified, loadSettings, updatePin, toggleSound, toggleReadAloud } = useSettingsStore();

  const [showPinChange, setShowPinChange] = useState(false);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [pinStep, setPinStep] = useState<'new' | 'confirm'>('new');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isPinVerified) {
      navigate('/parent/pin?redirect=settings', { replace: true });
      return;
    }
    loadSettings();
  }, [isPinVerified, navigate, loadSettings]);

  const handlePinDigit = (index: number, value: string, isConfirm: boolean) => {
    if (!/^\d*$/.test(value)) return;

    const pins = isConfirm ? [...confirmPin] : [...newPin];
    pins[index] = value.slice(-1);

    if (isConfirm) {
      setConfirmPin(pins);
    } else {
      setNewPin(pins);
    }

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`${isConfirm ? 'confirm' : 'new'}-pin-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-advance to confirm step
    if (!isConfirm && index === 3 && value) {
      setTimeout(() => setPinStep('confirm'), 200);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm: boolean) => {
    if (e.key === 'Backspace') {
      const pins = isConfirm ? [...confirmPin] : [...newPin];
      if (!pins[index] && index > 0) {
        const prevInput = document.getElementById(`${isConfirm ? 'confirm' : 'new'}-pin-${index - 1}`);
        prevInput?.focus();
      }
    }
  };

  const handleSavePin = async () => {
    setError('');

    const newPinStr = newPin.join('');
    const confirmPinStr = confirmPin.join('');

    if (newPinStr.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (newPinStr !== confirmPinStr) {
      setError('PINs do not match');
      setConfirmPin(['', '', '', '']);
      setPinStep('confirm');
      return;
    }

    try {
      await updatePin(newPinStr);
      setSuccess('PIN updated successfully!');
      setShowPinChange(false);
      setNewPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
      setPinStep('new');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update PIN');
    }
  };

  const handleCancelPinChange = () => {
    setShowPinChange(false);
    setNewPin(['', '', '', '']);
    setConfirmPin(['', '', '', '']);
    setPinStep('new');
    setError('');
  };

  if (!settings) {
    return (
      <PageContainer showStars={false}>
        <PageHeader title="Settings" onBack={() => navigate('/parent/dashboard')} />
        <PageContent center>
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer showStars={false}>
      <PageHeader title="Settings" onBack={() => navigate('/parent/dashboard')} />
      <PageContent className="gap-6">
        {success && (
          <motion.div
            className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {success}
          </motion.div>
        )}

        {/* PIN Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Security</h2>

          {!showPinChange ? (
            <motion.div
              className="p-4 rounded-2xl bg-white/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Parent PIN</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Current: ****
                  </p>
                </div>
                <Button size="sm" onClick={() => setShowPinChange(true)}>
                  Change
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="p-4 rounded-2xl bg-white/5 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <h3 className="text-white font-medium text-center">
                {pinStep === 'new' ? 'Enter New PIN' : 'Confirm New PIN'}
              </h3>

              <div className="flex justify-center gap-3">
                {(pinStep === 'new' ? newPin : confirmPin).map((digit, index) => (
                  <input
                    key={index}
                    id={`${pinStep === 'new' ? 'new' : 'confirm'}-pin-${index}`}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinDigit(index, e.target.value, pinStep === 'confirm')}
                    onKeyDown={(e) => handleKeyDown(index, e, pinStep === 'confirm')}
                    className="w-14 h-14 text-2xl text-center font-bold bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)]"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleCancelPinChange} className="flex-1">
                  Cancel
                </Button>
                {pinStep === 'confirm' && (
                  <Button onClick={handleSavePin} className="flex-1">
                    Save PIN
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sound Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Audio</h2>

          <motion.div
            className="p-4 rounded-2xl bg-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Sound Effects</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Play sounds for correct/incorrect answers
                </p>
              </div>
              <button
                onClick={toggleSound}
                className={`w-14 h-8 rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-[var(--color-primary)]' : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: settings.soundEnabled ? 28 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </motion.div>

          <motion.div
            className="p-4 rounded-2xl bg-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Read Aloud</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Read instructions aloud for younger children
                </p>
              </div>
              <button
                onClick={toggleReadAloud}
                className={`w-14 h-8 rounded-full transition-colors ${
                  settings.readAloudEnabled ? 'bg-[var(--color-primary)]' : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: settings.readAloudEnabled ? 28 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Break Reminder Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Break Reminder</h2>

          <motion.div
            className="p-4 rounded-2xl bg-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white font-medium mb-2">Reminder after</p>
            <p className="text-2xl font-bold text-[var(--color-primary)]">
              {settings.breakReminderMinutes} minutes
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              A gentle reminder will appear to take a break
            </p>
          </motion.div>
        </div>
      </PageContent>
    </PageContainer>
  );
}
