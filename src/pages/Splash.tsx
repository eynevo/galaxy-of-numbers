import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/common/PageContainer';
import { useProfileStore } from '../stores/profileStore';
import { useSettingsStore } from '../stores/settingsStore';

export function Splash() {
  const navigate = useNavigate();
  const loadProfiles = useProfileStore(state => state.loadProfiles);
  const loadSettings = useSettingsStore(state => state.loadSettings);

  useEffect(() => {
    // Initialize the app
    const init = async () => {
      await Promise.all([loadProfiles(), loadSettings()]);

      // Wait for animation then navigate
      setTimeout(() => {
        navigate('/profiles', { replace: true });
      }, 2000);
    };

    init();
  }, [loadProfiles, loadSettings, navigate]);

  return (
    <PageContainer className="items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo/Title */}
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-pink-500/50 via-purple-500/50 to-blue-500/50 rounded-full" />

          {/* Stars around title */}
          <motion.span
            className="absolute -top-4 -left-4 text-3xl"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ⭐
          </motion.span>
          <motion.span
            className="absolute -top-2 -right-6 text-2xl"
            animate={{ rotate: -360, scale: [1, 1.3, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ✨
          </motion.span>
          <motion.span
            className="absolute -bottom-4 right-0 text-3xl"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          >
            🌟
          </motion.span>

          <h1 className="relative text-4xl font-bold text-white text-center leading-tight">
            Galaxy of
            <br />
            <span className="text-5xl bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Numbers
            </span>
          </h1>
        </motion.div>

        {/* Rocket animation */}
        <motion.div
          className="text-6xl"
          animate={{
            y: [-5, 5, -5],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🚀
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-white/50"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
