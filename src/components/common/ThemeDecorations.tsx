import { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../themes/themeContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));
}

// Sparkle theme decorations
const SparkleDecorations = memo(function SparkleDecorations() {
  const [particles] = useState(() => generateParticles(15));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 24 24"
            fill="none"
            className="text-pink-300"
          >
            <path
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
      ))}

      {/* Floating hearts */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          className="absolute text-pink-400/30"
          style={{
            left: `${10 + i * 20}%`,
            fontSize: `${20 + Math.random() * 20}px`,
          }}
          initial={{ y: '110vh', opacity: 0 }}
          animate={{ y: '-10vh', opacity: [0, 0.5, 0] }}
          transition={{
            duration: 15 + Math.random() * 10,
            delay: i * 3,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          ♥
        </motion.div>
      ))}
    </div>
  );
});

// Lego theme decorations
const LegoDecorations = memo(function LegoDecorations() {
  const [bricks] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      size: Math.random() * 20 + 15,
      color: ['#dc2626', '#2563eb', '#facc15', '#22c55e'][i % 4],
      delay: Math.random() * 8,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bricks.map((brick) => (
        <motion.div
          key={brick.id}
          className="absolute"
          style={{
            left: `${brick.x}%`,
            width: brick.size,
            height: brick.size * 0.6,
          }}
          initial={{ y: '-50px', rotate: 0, opacity: 0 }}
          animate={{
            y: ['calc(-50px)', 'calc(100vh + 50px)'],
            rotate: [0, 180],
            opacity: [0, 0.3, 0.3, 0],
          }}
          transition={{
            duration: 20,
            delay: brick.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          }}
        >
          {/* Lego brick shape */}
          <div
            className="relative w-full h-full rounded-sm"
            style={{ backgroundColor: brick.color }}
          >
            {/* Studs */}
            <div
              className="absolute -top-1 left-1/4 w-2 h-2 rounded-full"
              style={{ backgroundColor: brick.color, filter: 'brightness(1.2)' }}
            />
            <div
              className="absolute -top-1 right-1/4 w-2 h-2 rounded-full"
              style={{ backgroundColor: brick.color, filter: 'brightness(1.2)' }}
            />
          </div>
        </motion.div>
      ))}

      {/* Gear decorations in corners */}
      <motion.div
        className="absolute top-4 right-4 text-4xl opacity-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        ⚙️
      </motion.div>
      <motion.div
        className="absolute bottom-20 left-4 text-3xl opacity-10"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      >
        ⚙️
      </motion.div>
    </div>
  );
});

export function ThemeDecorations() {
  const { isSparkle } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Delay mounting to not affect initial render performance
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return isSparkle ? <SparkleDecorations /> : <LegoDecorations />;
}
