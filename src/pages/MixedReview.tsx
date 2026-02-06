import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageContent } from '../components/common/PageContainer';
import { Button } from '../components/common/Button';
import { useProfileStore } from '../stores/profileStore';
import { useProgressStore } from '../stores/progressStore';
import { useAudio } from '../hooks/useAudio';
import {
  generateProblems,
  generateWrongAnswers,
  getOperationSymbol,
} from '../utils/problemGenerator';
import type { MathProblem, OperationType, DifficultyLevel } from '../types';

const REVIEW_SIZE = 15;

export function MixedReview() {
  const navigate = useNavigate();
  const currentProfile = useProfileStore(state => state.currentProfile);
  const { loadProgress, recordFactAttempt, addStars } = useProgressStore();
  const { play } = useAudio();

  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);

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

  // Generate problems once profile is loaded
  useEffect(() => {
    if (currentProfile && problems.length === 0) {
      const generated = generateProblems(REVIEW_SIZE, enabledOperations, difficultyLevel);
      setProblems(generated);
    }
  }, [currentProfile, problems.length, enabledOperations.join(','), difficultyLevel]);

  // Generate choices when problem changes
  useEffect(() => {
    if (problems[currentIndex]) {
      const problem = problems[currentIndex];
      const wrongs = generateWrongAnswers(
        problem.correctAnswer,
        problem.operation,
        problem.operand1,
        problem.operand2
      );
      setChoices([problem.correctAnswer, ...wrongs].sort(() => Math.random() - 0.5));
    }
  }, [currentIndex, problems]);

  const handleAnswer = useCallback((answer: number) => {
    if (showFeedback || !currentProfile) return;

    const problem = problems[currentIndex];
    const correct = answer === problem.correctAnswer;

    setIsCorrect(correct);
    setShowFeedback(true);
    setResults(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    // Record the fact attempt with operation type
    const operationSymbol = problem.operation === 'multiplication' ? 'x' :
                          problem.operation === 'division' ? '÷' :
                          problem.operation === 'addition' ? '+' : '-';
    const fact = `${problem.operand1}${operationSymbol}${problem.operand2}`;
    recordFactAttempt(currentProfile.id, fact, correct);

    play(correct ? 'correct' : 'incorrect');

    setTimeout(() => {
      setShowFeedback(false);

      if (currentIndex < problems.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Review complete
        finishReview();
      }
    }, correct ? 800 : 1500);
  }, [currentIndex, problems, showFeedback, currentProfile, recordFactAttempt, play]);

  const finishReview = async () => {
    if (!currentProfile) return;

    // Award stars for mixed review
    const starsEarned = results.correct + (results.correct === results.total ? 5 : 0);
    await addStars(currentProfile.id, starsEarned);

    play('complete');
    setIsComplete(true);
  };

  if (!currentProfile) return null;

  // Results screen
  if (isComplete) {
    const percentage = Math.round((results.correct / results.total) * 100);

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
              {percentage >= 90 ? '🏆' : percentage >= 70 ? '⭐' : '💪'}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Mixed Review Complete!
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              You got {results.correct} out of {results.total} correct ({percentage}%)
            </p>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-[var(--color-surface)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-3xl">⭐</span>
            <div>
              <div className="text-xl font-bold text-[var(--color-star)]">
                +{results.correct + (results.correct === results.total ? 5 : 0)} Stars
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {results.correct === results.total ? 'Perfect bonus included!' : 'Keep practicing!'}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col gap-3 w-full max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button fullWidth onClick={() => {
              setProblems([]);
              setCurrentIndex(0);
              setResults({ correct: 0, total: 0 });
              setIsComplete(false);
            }}>
              Try Again
            </Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/practice')}>
              Back to Practice
            </Button>
            <Button fullWidth variant="ghost" onClick={() => navigate('/menu')}>
              Main Menu
            </Button>
          </motion.div>
        </PageContent>
      </PageContainer>
    );
  }

  // Loading state
  if (problems.length === 0) {
    return (
      <PageContainer>
        <PageContent center>
          <p className="text-[var(--color-text-secondary)]">Preparing review...</p>
        </PageContent>
      </PageContainer>
    );
  }

  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex) / problems.length) * 100;

  return (
    <PageContainer>
      <PageContent center className="gap-4">
        {/* Progress */}
        <div className="w-full">
          <div className="flex justify-between text-sm text-[var(--color-text-secondary)] mb-2">
            <span>Question {currentIndex + 1} of {problems.length}</span>
            <span>Mixed Review</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Operation indicator */}
        <div className="text-sm text-[var(--color-text-secondary)]">
          {currentProblem.operation.charAt(0).toUpperCase() + currentProblem.operation.slice(1)}
        </div>

        {/* Problem */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="flex flex-col items-center gap-6 flex-1 justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="text-5xl font-bold text-white text-center">
              {currentProblem.operand1} {getOperationSymbol(currentProblem.operation)} {currentProblem.operand2}
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
                      It's <span className="font-bold">{currentProblem.correctAnswer}</span>
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
        </AnimatePresence>

        {/* Exit button */}
        <Button variant="ghost" onClick={() => navigate('/practice')}>
          Exit Review
        </Button>
      </PageContent>
    </PageContainer>
  );
}
