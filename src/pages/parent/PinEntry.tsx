import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageContainer, PageHeader, PageContent } from '../../components/common/PageContainer';
import { useSettingsStore } from '../../stores/settingsStore';

export function PinEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || 'dashboard';

  const { verifyPin, isPinVerified } = useSettingsStore();
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // If already verified, go to redirect
    if (isPinVerified) {
      navigateToRedirect();
    }
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, [isPinVerified]);

  const navigateToRedirect = () => {
    switch (redirect) {
      case 'create-profile':
        navigate('/create-profile', { replace: true });
        break;
      case 'dashboard':
      default:
        navigate('/parent/dashboard', { replace: true });
        break;
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Move to next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check PIN when complete
    if (value && index === 3) {
      const fullPin = newPin.join('');
      if (verifyPin(fullPin)) {
        navigateToRedirect();
      } else {
        setError(true);
        setPin(['', '', '', '']);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <PageContainer showStars={false}>
      <PageHeader title="Parent Access" onBack={() => navigate(-1)} />
      <PageContent center className="gap-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white mb-2">Enter PIN</h2>
          <p className="text-[var(--color-text-secondary)]">
            Enter your 4-digit parent PIN
          </p>
        </motion.div>

        {/* PIN Input */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[0, 1, 2, 3].map(index => (
            <motion.input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={pin[index]}
              onChange={e => handleDigitChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className={`
                w-16 h-20 text-3xl text-center font-bold
                bg-white/10 border-2 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                ${error ? 'border-red-500 animate-shake' : 'border-white/20'}
                text-white
              `}
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </motion.div>

        {error && (
          <motion.p
            className="text-red-400 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Incorrect PIN. Please try again.
          </motion.p>
        )}

        <motion.p
          className="text-[var(--color-text-secondary)] text-sm text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Default PIN: 1234
        </motion.p>
      </PageContent>
    </PageContainer>
  );
}
