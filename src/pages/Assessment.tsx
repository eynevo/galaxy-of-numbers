import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageContent } from '../components/common/PageContainer';
import { Button } from '../components/common/Button';
import { useProfileStore } from '../stores/profileStore';
import { useProgressStore } from '../stores/progressStore';
import { saveAssessmentResult, updateTableProgress, getTableProgress } from '../db/database';
import type { AssessmentResult, TableProgress } from '../types';

// Quick assessment: 2 problems per table (1s and 10s are easy, skip those)
// Test tables 2, 5, 3, 4, 9, 6, 7, 8 - that's 16 problems total
const ASSESSMENT_TABLES = [2, 5, 3, 4, 9, 6, 7, 8];

interface AssessmentProblem {
  tableNumber: number;
  multiplicand: number;
  multiplier: number;
  correctAnswer: number;
  userAnswer: number | null;
  isCorrect: boolean | null;
}

function generateAssessmentProblems(): AssessmentProblem[] {
  const problems: AssessmentProblem[] = [];

  for (const table of ASSESSMENT_TABLES) {
    // Pick 2 random multipliers for each table (between 2 and 9)
    const multipliers = new Set<number>();
    while (multipliers.size < 2) {
      multipliers.add(Math.floor(Math.random() * 8) + 2);
    }

    for (const mult of multipliers) {
      // Randomly swap order for commutative property
      const swap = Math.random() > 0.5;
      const multiplicand = swap ? mult : table;
      const multiplier = swap ? table : mult;

      problems.push({
        tableNumber: table,
        multiplicand,
        multiplier,
        correctAnswer: multiplicand * multiplier,
        userAnswer: null,
        isCorrect: null,
      });
    }
  }

  // Shuffle the problems
  return problems.sort(() => Math.random() - 0.5);
}

function generateWrongAnswers(correct: number): number[] {
  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const offset = Math.floor(Math.random() * 20) - 10;
    const wrong = correct + offset;
    if (wrong !== correct && wrong > 0 && wrong <= 100) {
      wrongs.add(wrong);
    }
  }
  return Array.from(wrongs);
}

export function Assessment() {
  const navigate = useNavigate();
  const currentProfile = useProfileStore(state => state.currentProfile);
  const loadProgress = useProgressStore(state => state.loadProgress);

  const [phase, setPhase] = useState<'intro' | 'quiz' | 'complete'>('intro');
  const [problems, setProblems] = useState<AssessmentProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/profiles', { replace: true });
    }
  }, [currentProfile, navigate]);

  useEffect(() => {
    if (problems[currentIndex]) {
      const correct = problems[currentIndex].correctAnswer;
      const wrongs = generateWrongAnswers(correct);
      const allChoices = [correct, ...wrongs].sort(() => Math.random() - 0.5);
      setChoices(allChoices);
    }
  }, [currentIndex, problems]);

  const startAssessment = () => {
    setProblems(generateAssessmentProblems());
    setPhase('quiz');
  };

  const skipAssessment = async () => {
    if (!currentProfile) return;

    // Save assessment with no known tables (start from beginning)
    const result: AssessmentResult = {
      profileId: currentProfile.id,
      knownTables: [],
      suggestedStartTable: 1,
      completedAt: new Date(),
    };
    await saveAssessmentResult(result);
    navigate('/menu', { replace: true });
  };

  const handleAnswer = useCallback(async (answer: number) => {
    if (showFeedback || !currentProfile) return;

    const problem = problems[currentIndex];
    const correct = answer === problem.correctAnswer;

    // Update problem
    const updatedProblems = [...problems];
    updatedProblems[currentIndex] = {
      ...problem,
      userAnswer: answer,
      isCorrect: correct,
    };
    setProblems(updatedProblems);
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(async () => {
      setShowFeedback(false);

      if (currentIndex < problems.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Assessment complete - calculate results
        await finishAssessment(updatedProblems);
      }
    }, correct ? 800 : 1500);
  }, [currentIndex, problems, showFeedback, currentProfile]);

  const finishAssessment = async (finalProblems: AssessmentProblem[]) => {
    if (!currentProfile) return;

    // Calculate which tables the child knows (got both problems correct)
    const tableResults: Record<number, { correct: number; total: number }> = {};

    for (const problem of finalProblems) {
      if (!tableResults[problem.tableNumber]) {
        tableResults[problem.tableNumber] = { correct: 0, total: 0 };
      }
      tableResults[problem.tableNumber].total++;
      if (problem.isCorrect) {
        tableResults[problem.tableNumber].correct++;
      }
    }

    // A table is "known" if both problems were answered correctly
    const knownTables: number[] = [];
    for (const [table, result] of Object.entries(tableResults)) {
      if (result.correct === result.total) {
        knownTables.push(parseInt(table));
      }
    }

    // Determine starting table based on what they don't know
    // Unlock order: 1, 10, 2, 5, 3, 4, 9, 6, 7, 8
    const unlockOrder = [1, 10, 2, 5, 3, 4, 9, 6, 7, 8];
    let suggestedStart = 1;

    // 1s and 10s are always unlocked for everyone
    // Find the first table in unlock order that they don't know
    for (const table of unlockOrder) {
      if (table === 1 || table === 10) continue; // Skip easy tables
      if (!knownTables.includes(table)) {
        suggestedStart = table;
        break;
      }
    }

    // Save assessment result
    const result: AssessmentResult = {
      profileId: currentProfile.id,
      knownTables,
      suggestedStartTable: suggestedStart,
      completedAt: new Date(),
    };
    await saveAssessmentResult(result);

    // Update table progress - unlock/master known tables
    const tableProgress = await getTableProgress(currentProfile.id);

    for (const progress of tableProgress) {
      let updated = false;
      let newProgress: TableProgress = { ...progress };

      // 1s and 10s are always unlocked
      if (progress.tableNumber === 1 || progress.tableNumber === 10) {
        if (progress.status === 'locked') {
          newProgress = { ...newProgress, status: 'learning' };
          updated = true;
        }
      }

      // Known tables get mastered status
      if (knownTables.includes(progress.tableNumber)) {
        newProgress = {
          ...newProgress,
          status: 'mastered',
          masteryScore: 100,
          teachingCompleted: true,
          guidedPracticeCompleted: true,
        };
        updated = true;
      }

      // Unlock the suggested start table
      if (progress.tableNumber === suggestedStart && progress.status === 'locked') {
        newProgress = { ...newProgress, status: 'learning' };
        updated = true;
      }

      if (updated) {
        await updateTableProgress(newProgress);
      }
    }

    // Reload progress and navigate
    await loadProgress(currentProfile.id);
    setPhase('complete');
  };

  if (!currentProfile) return null;

  // Intro phase
  if (phase === 'intro') {
    return (
      <PageContainer>
        <PageContent center className="gap-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">🚀</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Quick Space Check!
            </h1>
            <p className="text-[var(--color-text-secondary)] max-w-sm">
              Let's see what multiplication facts you already know so we can find the perfect starting point for your adventure!
            </p>
          </motion.div>

          <motion.div
            className="text-center text-[var(--color-text-secondary)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm">16 quick questions</p>
            <p className="text-sm">No pressure - just do your best!</p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-3 w-full max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button fullWidth onClick={startAssessment}>
              Start Space Check
            </Button>
            <Button fullWidth variant="ghost" onClick={skipAssessment}>
              Skip (Start from beginning)
            </Button>
          </motion.div>
        </PageContent>
      </PageContainer>
    );
  }

  // Complete phase
  if (phase === 'complete') {
    const knownCount = problems.filter(p => p.isCorrect).length;
    const percentage = Math.round((knownCount / problems.length) * 100);

    return (
      <PageContainer>
        <PageContent center className="gap-6">
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🌟' : percentage >= 50 ? '🚀' : '🌱'}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Assessment Complete!
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              You got {knownCount} out of {problems.length} correct ({percentage}%)
            </p>
          </motion.div>

          <motion.div
            className="text-center p-6 rounded-2xl bg-[var(--color-surface)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {percentage >= 80 ? (
              <p className="text-white">
                Wow! You already know a lot! We've unlocked several tables for you.
              </p>
            ) : percentage >= 50 ? (
              <p className="text-white">
                Great job! We've found the perfect starting point for your space adventure.
              </p>
            ) : (
              <p className="text-white">
                No worries! We'll start from the beginning and teach you everything step by step.
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button onClick={() => navigate('/menu', { replace: true })}>
              Start Adventure!
            </Button>
          </motion.div>
        </PageContent>
      </PageContainer>
    );
  }

  // Quiz phase
  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex) / problems.length) * 100;

  return (
    <PageContainer>
      <PageContent center className="gap-4">
        {/* Progress */}
        <div className="w-full">
          <div className="flex justify-between text-sm text-[var(--color-text-secondary)] mb-2">
            <span>Question {currentIndex + 1} of {problems.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
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
              {currentProblem.multiplicand} × {currentProblem.multiplier}
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
      </PageContent>
    </PageContainer>
  );
}
