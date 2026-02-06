import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageContent } from '../components/common/PageContainer';
import { Button } from '../components/common/Button';
import { useProfileStore } from '../stores/profileStore';
import { useProgressStore } from '../stores/progressStore';
import { useAudio } from '../hooks/useAudio';

interface ChallengeProblem {
  multiplicand: number;
  multiplier: number;
  correctAnswer: number;
}

const CHALLENGE_DURATION = 60; // 60 seconds
const TIME_BONUS_THRESHOLD = 3; // seconds for bonus points

function generateProblem(maxTable: number): ChallengeProblem {
  const table = Math.floor(Math.random() * maxTable) + 1;
  const multiplier = Math.floor(Math.random() * 10) + 1;
  const swap = Math.random() > 0.5;

  return {
    multiplicand: swap ? multiplier : table,
    multiplier: swap ? table : multiplier,
    correctAnswer: table * multiplier,
  };
}

function generateWrongAnswers(correct: number): number[] {
  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const offset = Math.floor(Math.random() * 15) - 7;
    const wrong = correct + offset;
    if (wrong !== correct && wrong > 0 && wrong <= 100) {
      wrongs.add(wrong);
    }
  }
  return Array.from(wrongs);
}

type ChallengePhase = 'menu' | 'countdown' | 'playing' | 'results';

export function Challenge() {
  const navigate = useNavigate();
  const currentProfile = useProfileStore(state => state.currentProfile);
  const { loadProgress, addStars } = useProgressStore();
  const { play } = useAudio();

  const [phase, setPhase] = useState<ChallengePhase>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_DURATION);
  const [problem, setProblem] = useState<ChallengeProblem | null>(null);
  const [choices, setChoices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [problemCount, setProblemCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const problemStartTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/profiles', { replace: true });
      return;
    }
    loadProgress(currentProfile.id);
  }, [currentProfile, navigate, loadProgress]);

  const maxTable = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 10;

  const nextProblem = useCallback(() => {
    const newProblem = generateProblem(maxTable);
    setProblem(newProblem);
    const wrongs = generateWrongAnswers(newProblem.correctAnswer);
    setChoices([newProblem.correctAnswer, ...wrongs].sort(() => Math.random() - 0.5));
    problemStartTime.current = Date.now();
  }, [maxTable]);

  const startChallenge = () => {
    setPhase('countdown');
    setCountdown(3);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setProblemCount(0);
    setTimeLeft(CHALLENGE_DURATION);
  };

  // Countdown timer
  useEffect(() => {
    if (phase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'countdown' && countdown === 0) {
      setPhase('playing');
      nextProblem();
    }
  }, [phase, countdown, nextProblem]);

  // Game timer
  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (phase === 'playing' && timeLeft === 0) {
      finishChallenge();
    }
  }, [phase, timeLeft]);

  const handleAnswer = (answer: number) => {
    if (showFeedback || !problem || phase !== 'playing') return;

    const correct = answer === problem.correctAnswer;
    const responseTime = (Date.now() - problemStartTime.current) / 1000;

    setIsCorrect(correct);
    setShowFeedback(true);
    setProblemCount(c => c + 1);

    if (correct) {
      // Base points + time bonus
      let points = 10;
      if (responseTime < TIME_BONUS_THRESHOLD) {
        points += Math.floor((TIME_BONUS_THRESHOLD - responseTime) * 5);
      }

      // Streak bonus
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      if (newStreak >= 3) points += newStreak * 2;

      setScore(s => s + points);
      play('correct');
    } else {
      setStreak(0);
      play('incorrect');
    }

    setTimeout(() => {
      setShowFeedback(false);
      nextProblem();
    }, correct ? 400 : 800);
  };

  const finishChallenge = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('results');
    play('complete');

    // Award stars based on score
    if (currentProfile) {
      const starsEarned = Math.floor(score / 20);
      if (starsEarned > 0) {
        await addStars(currentProfile.id, starsEarned);
      }
    }
  };

  if (!currentProfile) return null;

  // Menu phase
  if (phase === 'menu') {
    return (
      <PageContainer>
        <PageContent center className="gap-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">⚡</div>
            <h1 className="text-2xl font-bold text-white mb-2">Speed Challenge</h1>
            <p className="text-[var(--color-text-secondary)]">
              Answer as many as you can in 60 seconds!
            </p>
          </motion.div>

          <motion.div
            className="w-full max-w-xs space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-center text-[var(--color-text-secondary)]">
              Select Difficulty
            </p>
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  difficulty === d
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
                onClick={() => setDifficulty(d)}
              >
                <div className="font-bold capitalize">{d}</div>
                <div className="text-sm opacity-80">
                  {d === 'easy' ? 'Tables 1-5' : d === 'medium' ? 'Tables 1-8' : 'Tables 1-10'}
                </div>
              </button>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col gap-3 w-full max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button fullWidth onClick={startChallenge}>
              Start Challenge!
            </Button>
            <Button fullWidth variant="ghost" onClick={() => navigate('/menu')}>
              Back to Menu
            </Button>
          </motion.div>
        </PageContent>
      </PageContainer>
    );
  }

  // Countdown phase
  if (phase === 'countdown') {
    return (
      <PageContainer>
        <PageContent center>
          <motion.div
            key={countdown}
            className="text-9xl font-bold text-white"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
          >
            {countdown || 'GO!'}
          </motion.div>
        </PageContent>
      </PageContainer>
    );
  }

  // Results phase
  if (phase === 'results') {
    const starsEarned = Math.floor(score / 20);

    return (
      <PageContainer>
        <PageContent center className="gap-6">
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <div className="text-7xl mb-4">
              {score >= 200 ? '🏆' : score >= 100 ? '⭐' : '💪'}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h1>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-3 w-full max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-3xl font-bold text-[var(--color-primary)]">{score}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">Score</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-3xl font-bold text-white">{problemCount}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">Problems</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-3xl font-bold text-orange-400">{bestStreak}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">Best Streak</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-3xl font-bold text-[var(--color-star)]">+{starsEarned}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">Stars Earned</div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col gap-3 w-full max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button fullWidth onClick={startChallenge}>
              Try Again
            </Button>
            <Button fullWidth variant="secondary" onClick={() => setPhase('menu')}>
              Change Difficulty
            </Button>
            <Button fullWidth variant="ghost" onClick={() => navigate('/menu')}>
              Main Menu
            </Button>
          </motion.div>
        </PageContent>
      </PageContainer>
    );
  }

  // Playing phase
  return (
    <PageContainer>
      <PageContent center className="gap-4">
        {/* Timer and score */}
        <div className="w-full flex justify-between items-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}s
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">Time</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--color-primary)]">{score}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Score</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">
              {streak > 0 ? `🔥${streak}` : '-'}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">Streak</div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${timeLeft <= 10 ? 'bg-red-500' : 'bg-[var(--color-primary)]'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / CHALLENGE_DURATION) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Problem */}
        {problem && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${problem.multiplicand}x${problem.multiplier}`}
              className="flex flex-col items-center gap-6 flex-1 justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.15 }}
            >
              <div className="text-5xl font-bold text-white text-center">
                {problem.multiplicand} × {problem.multiplier}
              </div>

              {/* Quick feedback */}
              {showFeedback && (
                <motion.div
                  className={`text-4xl ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {isCorrect ? '✓' : `✗ ${problem.correctAnswer}`}
                </motion.div>
              )}

              {/* Choices */}
              {!showFeedback && (
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                  {choices.map((choice, index) => (
                    <motion.button
                      key={choice}
                      className="p-4 text-2xl font-bold rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] text-white transition-colors"
                      onClick={() => handleAnswer(choice)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {choice}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </PageContent>
    </PageContainer>
  );
}
