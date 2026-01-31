import { motion } from 'framer-motion';
import { useTheme } from '../../themes/themeContext';

interface StarDisplayProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

export function StarDisplay({ count, size = 'md', showAnimation = false }: StarDisplayProps) {
  const { isLego } = useTheme();

  const sizeStyles = {
    sm: 'text-sm gap-1',
    md: 'text-lg gap-2',
    lg: 'text-2xl gap-3',
  };

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      className={`flex items-center ${sizeStyles[size]}`}
      initial={showAnimation ? { scale: 0.5, opacity: 0 } : undefined}
      animate={showAnimation ? { scale: 1, opacity: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className={`${starSizes[size]} text-[var(--color-star)]`}
        fill="currentColor"
        animate={showAnimation ? { rotate: [0, 20, -20, 0] } : undefined}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </motion.svg>
      <span
        className={`font-bold ${isLego ? 'font-mono' : ''}`}
        style={{ color: 'var(--color-star)' }}
      >
        {count.toLocaleString()}
      </span>
    </motion.div>
  );
}

interface StarBurstProps {
  count: number;
  onComplete?: () => void;
}

export function StarBurst({ count, onComplete }: StarBurstProps) {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            scale: 0,
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            scale: [0, 1.5, 1],
            x: Math.cos((i * 2 * Math.PI) / 10) * 150,
            y: Math.sin((i * 2 * Math.PI) / 10) * 150,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.05,
            ease: 'easeOut',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-[var(--color-star)]"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </motion.div>
      ))}
      <motion.div
        className="text-4xl font-bold text-[var(--color-star)]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        +{count}
      </motion.div>
    </motion.div>
  );
}
