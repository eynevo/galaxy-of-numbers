import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageContent } from '../components/common/PageContainer';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { StarDisplay } from '../components/common/StarDisplay';
import { useProfileStore } from '../stores/profileStore';
import { useProgressStore } from '../stores/progressStore';

export function MainMenu() {
  const navigate = useNavigate();
  const currentProfile = useProfileStore(state => state.currentProfile);
  const { starBalance, streak, loadProgress } = useProgressStore();

  useEffect(() => {
    if (!currentProfile) {
      navigate('/profiles', { replace: true });
      return;
    }
    loadProgress(currentProfile.id);
  }, [currentProfile, navigate, loadProgress]);

  if (!currentProfile) return null;

  const menuItems = [
    {
      id: 'adventure',
      title: 'Adventure',
      subtitle: 'Learn & progress through space',
      emoji: '🚀',
      color: 'from-pink-500 to-purple-500',
      path: '/adventure',
    },
    {
      id: 'practice',
      title: 'Practice',
      subtitle: 'Free play any table',
      emoji: '🎯',
      color: 'from-blue-500 to-cyan-500',
      path: '/practice',
    },
    {
      id: 'collection',
      title: 'Collection',
      subtitle: 'View your characters',
      emoji: '🏆',
      color: 'from-yellow-500 to-orange-500',
      path: '/collection',
    },
  ];

  return (
    <PageContainer>
      <PageContent className="gap-3 overflow-hidden">
        {/* Profile Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <Avatar avatarId={currentProfile.avatarId} size="md" />
            <div>
              <h2 className="text-lg font-bold text-white">{currentProfile.name}</h2>
              {streak && streak.currentStreak > 0 && (
                <span className="text-sm text-[var(--color-text-secondary)]">
                  🔥 {streak.currentStreak} day streak
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StarDisplay count={starBalance?.totalStars || 0} />
            <motion.button
              onClick={() => navigate('/profiles')}
              className="p-2 rounded-full hover:bg-white/10"
              whileTap={{ scale: 0.9 }}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/70" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {/* Welcome message */}
        <motion.div
          className="text-center py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-xl font-bold text-white">
            Welcome back, {currentProfile.name}!
          </h1>
          <p className="text-[var(--color-text-secondary)]">Ready for your space mission?</p>
        </motion.div>

        {/* Menu Items */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              className={`
                relative overflow-hidden
                flex items-center gap-3 p-4
                rounded-2xl bg-gradient-to-r ${item.color}
                text-left
              `}
              onClick={() => navigate(item.path)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-3xl">{item.emoji}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-white/80 text-sm">{item.subtitle}</p>
              </div>

              {/* Arrow */}
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-white/50 ml-auto"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          ))}
        </div>

        {/* Settings button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="ghost"
            fullWidth
            onClick={() => navigate('/settings')}
          >
            ⚙️ Settings
          </Button>
        </motion.div>
      </PageContent>
    </PageContainer>
  );
}
