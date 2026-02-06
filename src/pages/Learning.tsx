import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer, PageHeader, PageContent } from '../components/common/PageContainer';
import { Button } from '../components/common/Button';
import { useProfileStore } from '../stores/profileStore';
import { useProgressStore } from '../stores/progressStore';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { getTableTeaching } from '../data/tables';
import type { TeachingStep, PatternTeaching, GuidedProblem } from '../types';

type LearningPhase = 'concept' | 'patterns' | 'practice' | 'ready';

export function Learning() {
  const navigate = useNavigate();
  const { tableNumber: tableParam } = useParams();
  const tableNumber = parseInt(tableParam || '1', 10);

  const currentProfile = useProfileStore(state => state.currentProfile);
  const { completeTeaching, completeGuidedPractice } = useProgressStore();
  const { speak, stop } = useTextToSpeech();

  const [phase, setPhase] = useState<LearningPhase>('concept');
  const [stepIndex, setStepIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);

  const teaching = getTableTeaching(tableNumber);

  useEffect(() => {
    if (!currentProfile || !teaching) {
      navigate('/adventure', { replace: true });
    }
  }, [currentProfile, teaching, navigate]);

  // Speak content when phase or step changes
  useEffect(() => {
    if (!teaching) return;

    const timer = setTimeout(() => {
      if (phase === 'concept' && teaching.conceptIntro[stepIndex]) {
        speak(teaching.conceptIntro[stepIndex].content);
      } else if (phase === 'patterns' && teaching.patterns[stepIndex]) {
        const pattern = teaching.patterns[stepIndex];
        const text = `${pattern.title}. ${pattern.description}${pattern.tip ? `. Tip: ${pattern.tip}` : ''}`;
        speak(text);
      } else if (phase === 'ready') {
        speak(`You're ready! Time to show what you've learned about the ${tableNumber}s table!`);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [phase, stepIndex, teaching, tableNumber, speak, stop]);

  // Speak hint when shown
  useEffect(() => {
    if (showHint && teaching && phase === 'practice') {
      const problem = teaching.guidedPractice[practiceIndex];
      if (problem) {
        speak(problem.hint);
      }
    }
  }, [showHint, teaching, phase, practiceIndex, speak]);

  // Speak result feedback
  useEffect(() => {
    if (showResult && teaching && phase === 'practice') {
      const problem = teaching.guidedPractice[practiceIndex];
      const correctAnswer = problem.multiplicand * problem.multiplier;
      const isCorrect = parseInt(userAnswer) === correctAnswer;

      if (isCorrect) {
        speak(`Great job! ${problem.explanation}`);
      } else {
        speak(`The answer is ${correctAnswer}. ${problem.explanation}`);
      }
    }
  }, [showResult, teaching, phase, practiceIndex, userAnswer, speak]);

  if (!currentProfile || !teaching) return null;

  const handleNextStep = () => {
    if (phase === 'concept') {
      if (stepIndex < teaching.conceptIntro.length - 1) {
        setStepIndex(prev => prev + 1);
      } else {
        setPhase('patterns');
        setStepIndex(0);
      }
    } else if (phase === 'patterns') {
      if (stepIndex < teaching.patterns.length - 1) {
        setStepIndex(prev => prev + 1);
      } else {
        // Mark teaching as complete
        completeTeaching(currentProfile.id, tableNumber);
        setPhase('practice');
        setPracticeIndex(0);
      }
    }
  };

  const handlePracticeSubmit = () => {
    setShowResult(true);

    setTimeout(() => {
      if (practiceIndex < teaching.guidedPractice.length - 1) {
        setPracticeIndex(prev => prev + 1);
        setUserAnswer('');
        setShowHint(false);
        setShowResult(false);
      } else {
        // Complete guided practice
        completeGuidedPractice(currentProfile.id, tableNumber);
        setPhase('ready');
      }
    }, 2000);
  };

  const handleStartQuiz = () => {
    navigate(`/quiz/${tableNumber}`);
  };

  const renderConceptStep = (step: TeachingStep) => (
    <motion.div
      key={stepIndex}
      className="flex flex-col items-center gap-3 text-center"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      {step.type === 'visual' && step.example && (
        <div className="flex flex-wrap justify-center gap-2 max-w-xs">
          {Array.from({ length: step.example.multiplicand }).map((_, groupIndex) => (
            <motion.div
              key={groupIndex}
              className="p-2 rounded-lg bg-white/10 flex flex-wrap gap-1 justify-center max-w-[70px]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: groupIndex * 0.2 }}
            >
              {Array.from({ length: step.example!.multiplier }).map((_, itemIndex) => (
                <motion.span
                  key={itemIndex}
                  className="text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: groupIndex * 0.2 + itemIndex * 0.1 }}
                >
                  ⭐
                </motion.span>
              ))}
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-sm text-white leading-relaxed">{step.content}</p>
    </motion.div>
  );

  const renderPattern = (pattern: PatternTeaching) => (
    <motion.div
      key={stepIndex}
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <h3 className="text-xl font-bold text-[var(--color-primary)]">{pattern.title}</h3>
      <p className="text-sm text-white text-center">{pattern.description}</p>

      <div className="flex flex-wrap justify-center gap-2">
        {pattern.examples.map((example, i) => (
          <motion.div
            key={i}
            className="px-3 py-2 rounded-lg bg-white/10 text-base font-mono text-[var(--color-accent)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            {example}
          </motion.div>
        ))}
      </div>

      {pattern.tip && (
        <motion.div
          className="p-3 rounded-lg bg-[var(--color-surface)] max-w-sm border border-[var(--color-primary)]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-2xl mr-2">💡</span>
          <span className="text-[var(--color-text-secondary)]">{pattern.tip}</span>
        </motion.div>
      )}
    </motion.div>
  );

  const renderPractice = (problem: GuidedProblem) => {
    const correctAnswer = problem.multiplicand * problem.multiplier;
    const isCorrect = parseInt(userAnswer) === correctAnswer;

    return (
      <motion.div
        key={practiceIndex}
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
      >
        <h3 className="text-xl text-[var(--color-text-secondary)]">
          Practice {practiceIndex + 1} of {teaching.guidedPractice.length}
        </h3>

        <div className="text-4xl font-bold text-white">
          {problem.multiplicand} × {problem.multiplier} = ?
        </div>

        {!showResult ? (
          <>
            <input
              type="tel"
              inputMode="numeric"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value.replace(/\D/g, ''))}
              className="w-24 h-14 text-3xl text-center font-bold bg-white/10 border-2 border-white/20 rounded-2xl text-white focus:outline-none focus:border-[var(--color-primary)]"
              autoFocus
            />

            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowHint(true)}
                disabled={showHint}
              >
                💡 Show Hint
              </Button>
              <Button onClick={handlePracticeSubmit} disabled={!userAnswer}>
                Check
              </Button>
            </div>

            {showHint && (
              <motion.p
                className="text-[var(--color-text-secondary)] text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {problem.hint}
              </motion.p>
            )}
          </>
        ) : (
          <motion.div
            className={`p-6 rounded-2xl text-center ${
              isCorrect ? 'bg-green-500/20' : 'bg-orange-500/20'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-3xl mb-1">{isCorrect ? '✨' : '🤔'}</div>
            <p className="text-lg font-bold text-white">
              {isCorrect ? 'Great job!' : `The answer is ${correctAnswer}`}
            </p>
            <p className="text-[var(--color-text-secondary)]">{problem.explanation}</p>
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderReady = () => (
    <motion.div
      className="flex flex-col items-center gap-4 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="text-6xl"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
      >
        🚀
      </motion.div>

      <h2 className="text-2xl font-bold text-white">You're Ready!</h2>
      <p className="text-lg text-[var(--color-text-secondary)]">
        Time to show what you've learned about the {tableNumber}s table!
      </p>

      <Button onClick={handleStartQuiz}>
        Start Quiz! ⭐
      </Button>
    </motion.div>
  );

  return (
    <PageContainer>
      <PageHeader
        title={teaching.title}
        onBack={() => navigate('/adventure')}
      />

      <PageContent center className="gap-3 overflow-hidden">
        {/* Progress indicator */}
        <div className="flex gap-2 w-full max-w-xs">
          {(['concept', 'patterns', 'practice', 'ready'] as LearningPhase[]).map(p => (
            <div
              key={p}
              className={`h-2 flex-1 rounded-full ${
                p === phase ? 'bg-[var(--color-primary)]' :
                ['concept', 'patterns', 'practice', 'ready'].indexOf(p) <
                ['concept', 'patterns', 'practice', 'ready'].indexOf(phase)
                  ? 'bg-[var(--color-primary)]/50'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 'concept' && renderConceptStep(teaching.conceptIntro[stepIndex])}
            {phase === 'patterns' && renderPattern(teaching.patterns[stepIndex])}
            {phase === 'practice' && renderPractice(teaching.guidedPractice[practiceIndex])}
            {phase === 'ready' && renderReady()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {(phase === 'concept' || phase === 'patterns') && (
          <Button onClick={handleNextStep}>
            Next →
          </Button>
        )}
      </PageContent>
    </PageContainer>
  );
}
