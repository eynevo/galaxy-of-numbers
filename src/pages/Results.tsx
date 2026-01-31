import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageContainer, PageContent } from '../components/common/PageContainer';
import { Button } from '../components/common/Button';
import { StarBurst } from '../components/common/StarDisplay';
import { useProfileStore } from '../stores/profileStore';
import { useProgressStore } from '../stores/progressStore';
import type { QuizAttempt } from '../types';

export function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentProfile = useProfileStore(state => state.currentProfile);
  const { addStars, starBalance } = useProgressStore();

  const [showStarBurst, setShowStarBurst] = useState(true);
  const [starsEarned, setStarsEarned] = useState(0);

  const attempt = location.state?.attempt as QuizAttempt | undefined;

  useEffect(() => {
    if (!currentProfile || !attempt) {
      navigate('/adventure', { replace: true });
      return;
    }

    // Calculate stars earned
    const baseStars = attempt.correctAnswers;
    const bonusStars = attempt.correctAnswers === attempt.totalProblems ? 5 : 0;
    const totalStars = baseStars + bonusStars;

    setStarsEarned(totalStars);
    addStars(currentProfile.id, totalStars);

    // Hide star burst after animation
    setTimeout(() => setShowStarBurst(false), 2000);
  }, [currentProfile, attempt, navigate, addStars]);

  if (!currentProfile || !attempt) return null;

  const percentage = Math.round((attempt.correctAnswers / attempt.totalProblems) * 100);
  const isPerfect = percentage === 100;
  const isMastery = percentage >= 90;

  const getMessage = () => {
    if (isPerfect) return { emoji: '🏆', text: 'PERFECT SCORE!', subtext: 'You are a multiplication master!' };
    if (isMastery) return { emoji: '⭐', text: 'Excellent!', subtext: 'You\'ve mastered this table!' };
    if (percentage >= 70) return { emoji: '👏', text: 'Great Job!', subtext: 'Keep practicing!' };
    if (percentage >= 50) return { emoji: '💪', text: 'Good Effort!', subtext: 'You\'re learning!' };
    return { emoji: '🌱', text: 'Keep Going!', subtext: 'Practice makes perfect!' };
  };

  const message = getMessage();

  return (
    <PageContainer>
      {showStarBurst && <StarBurst count={starsEarned} />}

      <PageContent center className="gap-8">
        {/* Result emoji and message */}
        <motion.div
          className="text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
        >
          <motion.div
            className="text-8xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {message.emoji}
          </motion.div>
          <h1 className="text-3xl font-bold text-white">{message.text}</h1>
          <p className="text-[var(--color-text-secondary)]">{message.subtext}</p>
        </motion.div>

        {/* Score display */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-48 h-48 rounded-full border-8 border-[var(--color-surface)] flex items-center justify-center relative">
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="8"
                strokeDasharray={`${percentage * 5.52} 552`}
                className="transition-all duration-1000"
              />
            </svg>

            <div className="text-center">
              <div className="text-5xl font-bold text-white">{percentage}%</div>
              <div className="text-[var(--color-text-secondary)]">
                {attempt.correctAnswers}/{attempt.totalProblems}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stars earned */}
        <motion.div
          className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-[var(--color-surface)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <span className="text-4xl">⭐</span>
          <div>
            <div className="text-2xl font-bold text-[var(--color-star)]">+{starsEarned} Stars</div>
            <div className="text-sm text-[var(--color-text-secondary)]">
              Total: {(starBalance?.totalStars || 0)} stars
            </div>
          </div>
        </motion.div>

        {/* Mastery badge */}
        {isMastery && (
          <motion.div
            className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
          >
            🎉 Table Mastered! 🎉
          </motion.div>
        )}

        {/* Problem summary */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3">Review</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {attempt.problems.map((problem, index) => (
              <div
                key={index}
                className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                  problem.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
              >
                <span className="text-white">
                  {problem.multiplicand} × {problem.multiplier}
                </span>
                <span className={problem.isCorrect ? 'text-green-400' : 'text-red-400'}>
                  {problem.isCorrect ? '✓' : `✗ (${problem.correctAnswer})`}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col gap-3 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Button fullWidth onClick={() => navigate(`/quiz/${attempt.tableNumber}`)}>
            Try Again
          </Button>
          <Button fullWidth variant="secondary" onClick={() => navigate('/adventure')}>
            Back to Space Map
          </Button>
          <Button fullWidth variant="ghost" onClick={() => navigate('/menu')}>
            Main Menu
          </Button>
        </motion.div>
      </PageContent>
    </PageContainer>
  );
}
