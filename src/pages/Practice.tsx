import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader, PageContent } from '../components/common/PageContainer';
import { Button } from '../components/common/Button';
import { useProfileStore } from '../stores/profileStore';
import { useProgressStore } from '../stores/progressStore';
import { useAudio } from '../hooks/useAudio';
import {
  generateProblem as generateMathProblem,
  generateWrongAnswers as generateMathWrongAnswers,
  getOperationSymbol,
} from '../utils/problemGenerator';
import type { MathProblem, OperationType, DifficultyLevel } from '../types';

export function Practice() {
  const navigate = useNavigate();
  const currentProfile = useProfileStore(state => state.currentProfile);
  const { tableProgress, loadProgress } = useProgressStore();
  const { play } = useAudio();

  const [isPracticing, setIsPracticing] = useState(false);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [choices, setChoices] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Get enabled operations and difficulty from profile (with defaults)
  const enabledOperations: OperationType[] = currentProfile?.enabledOperations || ['multiplication'];
  const difficultyLevel: DifficultyLevel = currentProfile?.difficultyLevel || 'medium';

  useEffect(() => {
    if (!currentProfile) {
      navigate('/profiles', { replace: true });
      return;
    }
    loadProgress(currentProfile.id);
  }, [currentProfile, navigate, loadProgress]);

  // Get unlocked tables (for display purposes)
  const unlockedTables = tableProgress
    .filter(p => p.status !== 'locked')
    .map(p => p.tableNumber)
    .sort((a, b) => a - b);

  const startPractice = () => {
    setIsPracticing(true);
    setScore({ correct: 0, total: 0 });
    nextProblem();
  };

  const nextProblem = () => {
    const newProblem = generateMathProblem(enabledOperations, difficultyLevel);
    const fullProblem: MathProblem = {
      ...newProblem,
      userAnswer: null,
      isCorrect: false,
      timeToAnswerMs: 0,
    };
    setProblem(fullProblem);
    const wrongs = generateMathWrongAnswers(
      newProblem.correctAnswer,
      newProblem.operation,
      newProblem.operand1,
      newProblem.operand2
    );
    setChoices([newProblem.correctAnswer, ...wrongs].sort(() => Math.random() - 0.5));
  };

  const handleAnswer = (answer: number) => {
    if (showFeedback || !problem) return;

    const correct = answer === problem.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    play(correct ? 'correct' : 'incorrect');

    setTimeout(() => {
      setShowFeedback(false);
      nextProblem();
    }, correct ? 800 : 1500);
  };

  const exitPractice = () => {
    setIsPracticing(false);
    setProblem(null);
    setScore({ correct: 0, total: 0 });
  };

  // Helper to get operation label
  const getOperationLabel = (op: OperationType): string => {
    switch (op) {
      case 'addition': return 'Addition (+)';
      case 'subtraction': return 'Subtraction (−)';
      case 'multiplication': return 'Multiplication (×)';
      case 'division': return 'Division (÷)';
    }
  };

  if (!currentProfile) return null;

  // Start view - show enabled operations and start button
  if (!isPracticing) {
    return (
      <PageContainer>
        <PageHeader title="Practice" onBack={() => navigate('/menu')} />
        <PageContent className="gap-4">
          <div className="text-center mb-4">
            <p className="text-[var(--color-text-secondary)]">
              Free play mode - practice at your own pace!
            </p>
          </div>

          {/* Show enabled operations */}
          <motion.div
            className="p-4 rounded-2xl bg-white/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-sm font-semibold text-white mb-3">Your Operations</h3>
            <div className="flex flex-wrap gap-2">
              {enabledOperations.map(op => (
                <span
                  key={op}
                  className="px-3 py-1 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm"
                >
                  {getOperationLabel(op)}
                </span>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-2">
              Difficulty: {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              fullWidth
              onClick={startPractice}
              className="mt-4"
            >
              Start Practice
            </Button>
          </motion.div>

          {/* Mixed review option */}
          {unlockedTables.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                fullWidth
                variant="secondary"
                onClick={() => navigate('/mixed-review')}
                className="mt-2"
              >
                Mixed Review (Scored)
              </Button>
            </motion.div>
          )}

          <p className="text-xs text-center text-[var(--color-text-secondary)] mt-4">
            Parents can change operations in the Parent Dashboard
          </p>
        </PageContent>
      </PageContainer>
    );
  }

  // Practice view
  return (
    <PageContainer>
      <PageContent center className="gap-4">
        {/* Header with score */}
        <div className="w-full flex justify-between items-center">
          <button
            onClick={exitPractice}
            className="text-[var(--color-text-secondary)] hover:text-white"
          >
            ← Back
          </button>
          <div className="text-center">
            <div className="text-sm text-[var(--color-text-secondary)]">
              Practice Mode
            </div>
            <div className="text-lg font-bold text-white">
              {score.correct} / {score.total}
            </div>
          </div>
          <div className="w-12" /> {/* Spacer for alignment */}
        </div>

        {/* Problem display */}
        {problem && (
          <motion.div
            key={`${problem.operation}:${problem.operand1}:${problem.operand2}`}
            className="flex flex-col items-center gap-6 flex-1 justify-center"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-5xl font-bold text-white text-center">
              {problem.operand1} {getOperationSymbol(problem.operation)} {problem.operand2}
            </div>

            {/* Feedback overlay */}
            {showFeedback && (
              <motion.div
                className={`absolute inset-0 flex items-center justify-center ${
                  isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <div className="text-5xl">{isCorrect ? '✨' : '💪'}</div>
                  {!isCorrect && (
                    <div className="text-xl text-white mt-2">
                      It's <span className="font-bold">{problem.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Choices */}
            {!showFeedback && (
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                {choices.map((choice, index) => (
                  <motion.button
                    key={choice}
                    className="p-5 text-2xl font-bold rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] text-white transition-colors"
                    onClick={() => handleAnswer(choice)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {choice}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Exit button */}
        <Button variant="ghost" onClick={exitPractice}>
          End Practice
        </Button>
      </PageContent>
    </PageContainer>
  );
}
