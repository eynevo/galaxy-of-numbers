import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader, PageContent } from '../components/common/PageContainer';
import { StarDisplay } from '../components/common/StarDisplay';
import { useProfileStore } from '../stores/profileStore';
import { useProgressStore } from '../stores/progressStore';
import type { TableProgress } from '../types';

// Planet data for the space map
const PLANETS = [
  { number: 1, name: 'Luna', emoji: '🌙', color: 'from-gray-400 to-gray-600' },
  { number: 10, name: 'Decima', emoji: '🪐', color: 'from-amber-400 to-amber-600' },
  { number: 2, name: 'Duo', emoji: '🌍', color: 'from-blue-400 to-blue-600' },
  { number: 5, name: 'Penta', emoji: '🔴', color: 'from-red-400 to-red-600' },
  { number: 3, name: 'Tri', emoji: '🟢', color: 'from-green-400 to-green-600' },
  { number: 4, name: 'Quad', emoji: '🟣', color: 'from-purple-400 to-purple-600' },
  { number: 9, name: 'Nova', emoji: '⭐', color: 'from-yellow-400 to-yellow-600' },
  { number: 6, name: 'Hexa', emoji: '🔵', color: 'from-cyan-400 to-cyan-600' },
  { number: 7, name: 'Septa', emoji: '🟠', color: 'from-orange-400 to-orange-600' },
  { number: 8, name: 'Octa', emoji: '💎', color: 'from-indigo-400 to-indigo-600' },
];

export function Adventure() {
  const navigate = useNavigate();
  const currentProfile = useProfileStore(state => state.currentProfile);
  const { tableProgress, starBalance, loadProgress } = useProgressStore();

  useEffect(() => {
    if (!currentProfile) {
      navigate('/profiles', { replace: true });
      return;
    }
    loadProgress(currentProfile.id);
  }, [currentProfile, navigate, loadProgress]);

  if (!currentProfile) return null;

  const getProgressForTable = (tableNumber: number): TableProgress | undefined => {
    return tableProgress.find(p => p.tableNumber === tableNumber);
  };

  const getStatusIcon = (status: TableProgress['status'] | undefined) => {
    switch (status) {
      case 'mastered': return '⭐';
      case 'practiced': return '✅';
      case 'learning': return '📚';
      case 'locked':
      default: return '🔒';
    }
  };

  const getStatusColor = (status: TableProgress['status'] | undefined) => {
    switch (status) {
      case 'mastered': return 'ring-yellow-400 ring-4';
      case 'practiced': return 'ring-green-400 ring-2';
      case 'learning': return 'ring-blue-400 ring-2 animate-pulse-glow';
      case 'locked':
      default: return 'opacity-50 grayscale';
    }
  };

  const handlePlanetClick = (planet: typeof PLANETS[0]) => {
    const progress = getProgressForTable(planet.number);
    if (progress?.status === 'locked') return;

    navigate(`/learning/${planet.number}`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Space Map"
        onBack={() => navigate('/menu')}
        rightElement={<StarDisplay count={starBalance?.totalStars || 0} size="sm" />}
      />

      <PageContent className="gap-4">
        {/* Introduction */}
        <motion.p
          className="text-center text-[var(--color-text-secondary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Tap a planet to explore its multiplication table!
        </motion.p>

        {/* Planet Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1 content-start">
          {PLANETS.map((planet, index) => {
            const progress = getProgressForTable(planet.number);
            const isLocked = !progress || progress.status === 'locked';

            return (
              <motion.button
                key={planet.number}
                className={`
                  relative p-4 rounded-2xl
                  bg-gradient-to-br ${planet.color}
                  flex flex-col items-center gap-2
                  ${getStatusColor(progress?.status)}
                  ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                onClick={() => handlePlanetClick(planet)}
                disabled={isLocked}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileTap={!isLocked ? { scale: 0.95 } : undefined}
              >
                {/* Status icon */}
                <span className="absolute top-2 right-2 text-lg">
                  {getStatusIcon(progress?.status)}
                </span>

                {/* Planet emoji */}
                <motion.span
                  className="text-4xl"
                  animate={!isLocked ? { rotate: [0, 10, -10, 0] } : undefined}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {planet.emoji}
                </motion.span>

                {/* Planet name and table number */}
                <div className="text-center">
                  <div className="font-bold text-white">{planet.name}</div>
                  <div className="text-white/80 text-sm">×{planet.number} Table</div>
                </div>

                {/* Progress bar for practiced/learning */}
                {progress && progress.masteryScore > 0 && (
                  <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white/80"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.masteryScore}%` }}
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <motion.div
          className="flex justify-center gap-4 text-sm text-[var(--color-text-secondary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>🔒 Locked</span>
          <span>📚 Learning</span>
          <span>✅ Practiced</span>
          <span>⭐ Mastered</span>
        </motion.div>
      </PageContent>
    </PageContainer>
  );
}
