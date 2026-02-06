import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer, PageHeader, PageContent } from '../../components/common/PageContainer';
import { Avatar } from '../../components/common/Avatar';
import { useSettingsStore } from '../../stores/settingsStore';
import {
  getProfile,
  getTableProgress,
  getFactStats,
  getStreak,
  getStarBalance,
  getQuizAttempts,
  updateProfile,
} from '../../db/database';
import type { Profile, TableProgress, FactStat, Streak, StarBalance, QuizAttempt, OperationType, DifficultyLevel } from '../../types';

interface ChildData {
  profile: Profile;
  progress: TableProgress[];
  factStats: FactStat[];
  streak: Streak | null;
  stars: StarBalance | null;
  recentQuizzes: QuizAttempt[];
}

interface StruggleFact {
  fact: string;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
}

export function ChildDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isPinVerified } = useSettingsStore();

  const [data, setData] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPinVerified) {
      // Redirect to PIN entry with the child detail page as the return destination
      navigate(`/parent/pin?redirect=child/${id}`, { replace: true });
      return;
    }

    if (!id) {
      navigate('/parent/dashboard', { replace: true });
      return;
    }

    const loadData = async () => {
      const [profile, progress, factStats, streak, stars, quizzes] = await Promise.all([
        getProfile(id),
        getTableProgress(id),
        getFactStats(id),
        getStreak(id),
        getStarBalance(id),
        getQuizAttempts(id),
      ]);

      if (!profile) {
        navigate('/parent/dashboard', { replace: true });
        return;
      }

      setData({
        profile,
        progress,
        factStats,
        streak: streak || null,
        stars: stars || null,
        recentQuizzes: quizzes.slice(-10).reverse(),
      });
      setLoading(false);
    };

    loadData();
  }, [id, isPinVerified, navigate]);

  if (loading || !data) {
    return (
      <PageContainer showStars={false}>
        <PageHeader title="Loading..." onBack={() => navigate('/parent/dashboard')} />
        <PageContent center>
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </PageContent>
      </PageContainer>
    );
  }

  const { profile, progress, factStats, streak, stars, recentQuizzes } = data;

  // Calculate statistics
  const masteredCount = progress.filter(p => p.status === 'mastered').length;
  const learningCount = progress.filter(p => p.status === 'learning' || p.status === 'practiced').length;
  const lockedCount = progress.filter(p => p.status === 'locked').length;

  // Find struggling facts (accuracy < 70% with at least 3 attempts)
  const strugglingFacts: StruggleFact[] = factStats
    .filter(s => {
      const total = s.correctCount + s.incorrectCount;
      const accuracy = total > 0 ? (s.correctCount / total) * 100 : 100;
      return total >= 3 && accuracy < 70;
    })
    .map(s => ({
      fact: s.fact,
      correctCount: s.correctCount,
      incorrectCount: s.incorrectCount,
      accuracy: Math.round((s.correctCount / (s.correctCount + s.incorrectCount)) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  // Find strong facts (accuracy >= 90% with at least 5 attempts)
  const strongFacts = factStats
    .filter(s => {
      const total = s.correctCount + s.incorrectCount;
      const accuracy = total > 0 ? (s.correctCount / total) * 100 : 0;
      return total >= 5 && accuracy >= 90;
    })
    .length;

  // Generate recommendations
  const recommendations: string[] = [];

  if (strugglingFacts.length > 0) {
    const factList = strugglingFacts.slice(0, 3).map(f => f.fact.replace('x', ' × ')).join(', ');
    recommendations.push(`Focus on these facts: ${factList}`);
  }

  if (streak && streak.currentStreak === 0) {
    recommendations.push('Encourage daily practice to build a streak!');
  } else if (streak && streak.currentStreak >= 3) {
    recommendations.push(`Great job maintaining a ${streak.currentStreak} day streak!`);
  }

  if (masteredCount < 3) {
    recommendations.push('Work through the teaching sections before quizzing.');
  }

  if (recentQuizzes.length > 0) {
    const recentAvg = recentQuizzes.reduce((sum, q) =>
      sum + (q.correctAnswers / q.totalProblems) * 100, 0) / recentQuizzes.length;
    if (recentAvg < 70) {
      recommendations.push('Recent scores suggest more practice time would help.');
    } else if (recentAvg >= 90) {
      recommendations.push('Excellent recent performance! Ready for new challenges.');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'text-green-400 bg-green-500/20';
      case 'practiced': return 'text-yellow-400 bg-yellow-500/20';
      case 'learning': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Get current settings with defaults for backwards compatibility
  const enabledOperations: OperationType[] = profile.enabledOperations || ['multiplication'];
  const difficultyLevel: DifficultyLevel = profile.difficultyLevel || 'medium';

  const handleToggleOperation = async (operation: OperationType) => {
    const isEnabled = enabledOperations.includes(operation);
    let newOperations: OperationType[];

    if (isEnabled) {
      // Don't allow removing the last operation
      if (enabledOperations.length <= 1) return;
      newOperations = enabledOperations.filter(op => op !== operation);
    } else {
      newOperations = [...enabledOperations, operation];
    }

    await updateProfile(profile.id, { enabledOperations: newOperations });
    setData(prev => prev ? {
      ...prev,
      profile: { ...prev.profile, enabledOperations: newOperations }
    } : null);
  };

  const handleChangeDifficulty = async (level: DifficultyLevel) => {
    await updateProfile(profile.id, { difficultyLevel: level });
    setData(prev => prev ? {
      ...prev,
      profile: { ...prev.profile, difficultyLevel: level }
    } : null);
  };

  const operationLabels: Record<OperationType, { label: string; symbol: string }> = {
    addition: { label: 'Addition', symbol: '+' },
    subtraction: { label: 'Subtraction', symbol: '−' },
    multiplication: { label: 'Multiplication', symbol: '×' },
    division: { label: 'Division', symbol: '÷' },
  };

  const difficultyLabels: Record<DifficultyLevel, { label: string; description: string }> = {
    easy: { label: 'Easy', description: 'Numbers 1-10' },
    medium: { label: 'Medium', description: 'Numbers 1-20' },
    hard: { label: 'Hard', description: 'Numbers 1-50' },
  };

  return (
    <PageContainer showStars={false}>
      <PageHeader title="Progress Details" onBack={() => navigate('/parent/dashboard')} />
      <PageContent className="gap-4 overflow-y-auto">
        {/* Profile header */}
        <motion.div
          className="flex items-center gap-4 p-4 rounded-2xl bg-white/5"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Avatar avatarId={profile.avatarId} size="lg" />
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <div className="flex gap-3 text-sm text-[var(--color-text-secondary)]">
              <span>⭐ {stars?.totalStars || 0} stars</span>
              <span>🔥 {streak?.currentStreak || 0} day streak</span>
            </div>
          </div>
        </motion.div>

        {/* Summary stats */}
        <motion.div
          className="grid grid-cols-3 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center p-3 rounded-xl bg-green-500/10">
            <div className="text-2xl font-bold text-green-400">{masteredCount}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Mastered</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-yellow-500/10">
            <div className="text-2xl font-bold text-yellow-400">{learningCount}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Learning</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-500/10">
            <div className="text-2xl font-bold text-gray-400">{lockedCount}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Locked</div>
          </div>
        </motion.div>

        {/* Math Operations Settings */}
        <motion.div
          className="p-4 rounded-2xl bg-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-sm font-semibold text-white mb-3">Math Operations</h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(operationLabels) as OperationType[]).map(operation => {
              const isEnabled = enabledOperations.includes(operation);
              const isOnlyEnabled = isEnabled && enabledOperations.length === 1;
              return (
                <button
                  key={operation}
                  onClick={() => handleToggleOperation(operation)}
                  disabled={isOnlyEnabled}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isEnabled
                      ? 'bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50'
                      : 'bg-white/5 border border-white/10'
                  } ${isOnlyEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={`text-xl font-bold ${isEnabled ? 'text-[var(--color-primary)]' : 'text-white/50'}`}>
                    {operationLabels[operation].symbol}
                  </span>
                  <span className={`text-sm ${isEnabled ? 'text-white' : 'text-white/50'}`}>
                    {operationLabels[operation].label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">
            At least one operation must be selected
          </p>
        </motion.div>

        {/* Difficulty Level Settings */}
        <motion.div
          className="p-4 rounded-2xl bg-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
        >
          <h3 className="text-sm font-semibold text-white mb-3">Difficulty Level</h3>
          <div className="flex gap-2">
            {(Object.keys(difficultyLabels) as DifficultyLevel[]).map(level => {
              const isSelected = difficultyLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => handleChangeDifficulty(level)}
                  className={`flex-1 p-3 rounded-xl text-center transition-colors ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-sm">{difficultyLabels[level].label}</div>
                  <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                    {difficultyLabels[level].description}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            className="p-4 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-2">
              💡 Recommendations
            </h3>
            <ul className="space-y-1">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-white">• {rec}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Problem areas */}
        {strugglingFacts.length > 0 && (
          <motion.div
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-red-400 mb-2">
              🎯 Facts to Practice
            </h3>
            <div className="space-y-2">
              {strugglingFacts.map((fact, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-white font-mono">
                    {fact.fact.replace('x', ' × ')}
                  </span>
                  <span className="text-red-400">{fact.accuracy}% accuracy</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Table progress grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-white mb-2">Tables Progress</h3>
          <div className="grid grid-cols-5 gap-2">
            {progress
              .sort((a, b) => a.tableNumber - b.tableNumber)
              .map(p => (
                <div
                  key={p.tableNumber}
                  className={`text-center p-2 rounded-lg ${getStatusColor(p.status)}`}
                >
                  <div className="font-bold">{p.tableNumber}s</div>
                  <div className="text-xs opacity-80">{p.masteryScore}%</div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Recent quizzes */}
        {recentQuizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-semibold text-white mb-2">Recent Quizzes</h3>
            <div className="space-y-2">
              {recentQuizzes.map((quiz, i) => {
                const score = Math.round((quiz.correctAnswers / quiz.totalProblems) * 100);
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 rounded-lg bg-white/5"
                  >
                    <div>
                      <span className="text-white font-medium">{quiz.tableNumber}s Table</span>
                      <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                        {new Date(quiz.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`font-bold ${
                      score >= 90 ? 'text-green-400' :
                      score >= 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {score}%
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Strong facts count */}
        {strongFacts > 0 && (
          <motion.div
            className="text-center p-4 rounded-2xl bg-green-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-3xl mb-1">🌟</div>
            <div className="text-white">
              <span className="font-bold text-green-400">{strongFacts}</span> facts mastered with 90%+ accuracy!
            </div>
          </motion.div>
        )}
      </PageContent>
    </PageContainer>
  );
}
