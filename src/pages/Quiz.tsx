import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer, PageContent } from '../components/common/PageContainer';
import { Button } from '../components/common/Button';
import { useProfileStore } from '../stores/profileStore';
import { useProgressStore } from '../stores/progressStore';
import { useAudio } from '../hooks/useAudio';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import {
  generateProblems as generateMathProblems,
  generateWrongAnswers as generateMathWrongAnswers,
  getOperationSymbol,
} from '../utils/problemGenerator';
import type { QuizProblem, QuizAttempt, MathProblem, OperationType, DifficultyLevel } from '../types';

const QUIZ_SIZE = 10;

export function Quiz() {
  const navigate = useNavigate();
  const { tableNumber: tableParam } = useParams();
  const tableNumber = parseInt(tableParam || '1', 10);

  const currentProfile = useProfileStore(state => state.currentProfile);
  const { updateMastery, recordFactAttempt, saveQuiz, updateDailyStreak } = useProgressStore();
  const { play } = useAudio();
  const { speak } = useTextToSpeech();

  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(new Date());
  const [problemStartTime, setProblemStartTime] = useState(Date.now());
  const [choices, setChoices] = useState<number[]>([]);

  const inputMethod = currentProfile?.inputMethod || 'multiple-choice';

  // Get enabled operations and difficulty from profile (with defaults for backwards compatibility)
  const enabledOperations: OperationType[] = currentProfile?.enabledOperations || ['multiplication'];
  const difficultyLevel: DifficultyLevel = currentProfile?.difficultyLevel || 'medium';

  useEffect(() => {
    if (!currentProfile) {
      navigate('/profiles', { replace: true });
      return;
    }
    // Generate problems using the profile's enabled operations and difficulty
    const generatedProblems = generateMathProblems(QUIZ_SIZE, enabledOperations, difficultyLevel);
    setProblems(generatedProblems);
  }, [currentProfile, tableNumber, navigate, enabledOperations.join(','), difficultyLevel]);

  useEffect(() => {
    // Generate choices for multiple choice mode
    if (problems[currentIndex]) {
      const problem = problems[currentIndex];
      const wrongs = generateMathWrongAnswers(
        problem.correctAnswer,
        problem.operation,
        problem.operand1,
        problem.operand2
      );
      const allChoices = [problem.correctAnswer, ...wrongs].sort(() => Math.random() - 0.5);
      setChoices(allChoices);
    }
    setProblemStartTime(Date.now());
  }, [currentIndex, problems]);

  const handleAnswer = useCallback((answer: number) => {
    if (showFeedback) return;

    const problem = problems[currentIndex];
    const correct = answer === problem.correctAnswer;
    const timeToAnswer = Date.now() - problemStartTime;

    // Update problem with answer
    const updatedProblems = [...problems];
    updatedProblems[currentIndex] = {
      ...problem,
      userAnswer: answer,
      isCorrect: correct,
      timeToAnswerMs: timeToAnswer,
    };
    setProblems(updatedProblems);

    // Record fact attempt with operation type
    const operationSymbol = problem.operation === 'multiplication' ? 'x' :
                          problem.operation === 'division' ? '÷' :
                          problem.operation === 'addition' ? '+' : '-';
    const fact = `${problem.operand1}${operationSymbol}${problem.operand2}`;
    recordFactAttempt(currentProfile!.id, fact, correct);

    setIsCorrect(correct);
    setShowFeedback(true);

    // Play sound effect
    play(correct ? 'correct' : 'incorrect');

    // Speak the correct answer if wrong
    if (!correct) {
      speak(`The answer is ${problem.correctAnswer}`);
    }

    // Move to next problem or finish
    setTimeout(() => {
      setShowFeedback(false);
      setUserAnswer('');

      if (currentIndex < problems.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Quiz complete - calculate and save results
        finishQuiz(updatedProblems);
      }
    }, correct ? 1000 : 2000);
  }, [currentIndex, problems, problemStartTime, currentProfile, recordFactAttempt, showFeedback, play]);

  const finishQuiz = async (finalProblems: MathProblem[]) => {
    const correctCount = finalProblems.filter(p => p.isCorrect).length;
    const score = Math.round((correctCount / finalProblems.length) * 100);

    // Convert MathProblems to QuizProblems for storage compatibility
    const quizProblems: QuizProblem[] = finalProblems.map(p => ({
      multiplicand: p.operand1,
      multiplier: p.operand2,
      correctAnswer: p.correctAnswer,
      userAnswer: p.userAnswer,
      isCorrect: p.isCorrect,
      timeToAnswerMs: p.timeToAnswerMs,
    }));

    // Save quiz attempt
    const attempt: QuizAttempt = {
      id: crypto.randomUUID(),
      profileId: currentProfile!.id,
      tableNumber,
      date: new Date(),
      totalProblems: finalProblems.length,
      correctAnswers: correctCount,
      timeSpentSeconds: Math.round((Date.now() - startTime.getTime()) / 1000),
      problems: quizProblems,
    };
    await saveQuiz(attempt);

    // Update mastery (for multiplication tables journey)
    if (enabledOperations.includes('multiplication')) {
      await updateMastery(currentProfile!.id, tableNumber, score);
    }

    // Update streak
    await updateDailyStreak(currentProfile!.id);

    // Navigate to results
    navigate(`/results/${attempt.id}`, { state: { attempt } });
  };

  const handleNumberPadSubmit = () => {
    const answer = parseInt(userAnswer);
    if (!isNaN(answer)) {
      handleAnswer(answer);
    }
  };

  if (!currentProfile || problems.length === 0) return null;

  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex) / problems.length) * 100;

  return (
    <PageContainer>
      <PageContent center className="gap-6">
        {/* Progress bar */}
        <div className="w-full">
          <div className="flex justify-between text-sm text-[var(--color-text-secondary)] mb-2">
            <span>Question {currentIndex + 1} of {problems.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Problem display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="flex flex-col items-center gap-8 flex-1 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* The problem */}
            <div className="text-6xl font-bold text-white text-center">
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
                  <div className="text-6xl mb-4">{isCorrect ? '✨' : '💪'}</div>
                  {!isCorrect && (
                    <div className="text-2xl text-white">
                      The answer is <span className="font-bold">{currentProblem.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Answer input */}
            {!showFeedback && (
              inputMethod === 'multiple-choice' ? (
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  {choices.map((choice, index) => (
                    <motion.button
                      key={choice}
                      className="p-6 text-3xl font-bold rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] text-white transition-colors"
                      onClick={() => handleAnswer(choice)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {choice}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value.replace(/\D/g, ''))}
                    className="w-40 h-20 text-4xl text-center font-bold bg-white/10 border-2 border-white/20 rounded-2xl text-white focus:outline-none focus:border-[var(--color-primary)]"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleNumberPadSubmit()}
                  />

                  {/* Number pad */}
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                      <motion.button
                        key={num}
                        className={`w-16 h-16 text-2xl font-bold rounded-xl bg-white/10 text-white ${
                          num === 0 ? 'col-start-2' : ''
                        }`}
                        onClick={() => setUserAnswer(prev => prev + num)}
                        whileTap={{ scale: 0.9 }}
                      >
                        {num}
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => setUserAnswer('')}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleNumberPadSubmit}
                      disabled={!userAnswer}
                    >
                      Check ✓
                    </Button>
                  </div>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>

        {/* Exit button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/adventure')}
        >
          Exit Quiz
        </Button>
      </PageContent>
    </PageContainer>
  );
}
