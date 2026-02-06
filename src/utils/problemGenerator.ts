import type { OperationType, DifficultyLevel, MathProblem } from '../types';

// Difficulty ranges for each operation
const DIFFICULTY_RANGES = {
  easy: {
    addition: { min: 1, max: 10 },
    subtraction: { min: 1, max: 10 },
    multiplication: { tables: [1, 2, 3, 4, 5] },
    division: { tables: [1, 2, 3, 4, 5] },
  },
  medium: {
    addition: { min: 1, max: 20 },
    subtraction: { min: 1, max: 20 },
    multiplication: { tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    division: { tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  },
  hard: {
    addition: { min: 1, max: 50 },
    subtraction: { min: 1, max: 50 },
    multiplication: { tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    division: { tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAdditionProblem(difficulty: DifficultyLevel): Omit<MathProblem, 'userAnswer' | 'isCorrect' | 'timeToAnswerMs'> {
  const range = DIFFICULTY_RANGES[difficulty].addition;
  const operand1 = randomInt(range.min, range.max);
  const operand2 = randomInt(range.min, range.max);

  return {
    operand1,
    operand2,
    operation: 'addition',
    correctAnswer: operand1 + operand2,
  };
}

function generateSubtractionProblem(difficulty: DifficultyLevel): Omit<MathProblem, 'userAnswer' | 'isCorrect' | 'timeToAnswerMs'> {
  const range = DIFFICULTY_RANGES[difficulty].subtraction;
  // Generate two numbers and ensure the larger one is first (positive result)
  const a = randomInt(range.min, range.max);
  const b = randomInt(range.min, range.max);
  const operand1 = Math.max(a, b);
  const operand2 = Math.min(a, b);

  // Avoid 0 - 0 or trivial subtractions
  if (operand1 === operand2 && operand1 < range.max) {
    return generateSubtractionProblem(difficulty);
  }

  return {
    operand1,
    operand2,
    operation: 'subtraction',
    correctAnswer: operand1 - operand2,
  };
}

function generateMultiplicationProblem(difficulty: DifficultyLevel): Omit<MathProblem, 'userAnswer' | 'isCorrect' | 'timeToAnswerMs'> {
  const tables = DIFFICULTY_RANGES[difficulty].multiplication.tables;
  const operand1 = randomChoice(tables);
  const operand2 = randomInt(1, 10);

  // 50% chance to swap operands (commutative property practice)
  const shouldSwap = Math.random() > 0.5;

  return {
    operand1: shouldSwap ? operand2 : operand1,
    operand2: shouldSwap ? operand1 : operand2,
    operation: 'multiplication',
    correctAnswer: operand1 * operand2,
  };
}

function generateDivisionProblem(difficulty: DifficultyLevel): Omit<MathProblem, 'userAnswer' | 'isCorrect' | 'timeToAnswerMs'> {
  const tables = DIFFICULTY_RANGES[difficulty].division.tables;
  // Generate a multiplication fact and reverse it for division
  const divisor = randomChoice(tables);
  const quotient = randomInt(1, 10);
  const dividend = divisor * quotient;

  return {
    operand1: dividend,
    operand2: divisor,
    operation: 'division',
    correctAnswer: quotient,
  };
}

export function generateProblem(
  operations: OperationType[],
  difficulty: DifficultyLevel
): Omit<MathProblem, 'userAnswer' | 'isCorrect' | 'timeToAnswerMs'> {
  const operation = randomChoice(operations);

  switch (operation) {
    case 'addition':
      return generateAdditionProblem(difficulty);
    case 'subtraction':
      return generateSubtractionProblem(difficulty);
    case 'multiplication':
      return generateMultiplicationProblem(difficulty);
    case 'division':
      return generateDivisionProblem(difficulty);
  }
}

export function generateProblems(
  count: number,
  operations: OperationType[],
  difficulty: DifficultyLevel
): MathProblem[] {
  const problems: MathProblem[] = [];
  const usedProblems = new Set<string>();

  while (problems.length < count) {
    const problem = generateProblem(operations, difficulty);
    const key = `${problem.operation}:${problem.operand1}:${problem.operand2}`;

    // Avoid duplicates in the first half of problems
    if (!usedProblems.has(key) || problems.length >= count / 2) {
      usedProblems.add(key);
      problems.push({
        ...problem,
        userAnswer: null,
        isCorrect: false,
        timeToAnswerMs: 0,
      });
    }
  }

  return problems;
}

export function generateWrongAnswers(
  correctAnswer: number,
  operation: OperationType,
  operand1: number,
  operand2: number
): number[] {
  const wrongs = new Set<number>();

  // Generate operation-specific plausible wrong answers
  switch (operation) {
    case 'addition':
      // Common mistakes: off by 1, off by 10, digit swap confusion
      while (wrongs.size < 3) {
        const strategies = [
          correctAnswer + randomInt(-3, 3),  // Small offset
          correctAnswer + 10,                 // Added extra 10
          correctAnswer - 10,                 // Subtracted 10
          operand1 * operand2,                // Did multiplication instead
        ];
        const wrong = randomChoice(strategies);
        if (wrong !== correctAnswer && wrong > 0 && wrong <= 100) {
          wrongs.add(wrong);
        }
      }
      break;

    case 'subtraction':
      while (wrongs.size < 3) {
        const strategies = [
          correctAnswer + randomInt(-3, 3),  // Small offset
          operand1 + operand2,                // Did addition instead
          operand2 - operand1 + operand1 * 2, // Reversed operands (made positive)
        ];
        const wrong = randomChoice(strategies);
        if (wrong !== correctAnswer && wrong > 0 && wrong <= 100) {
          wrongs.add(wrong);
        }
      }
      break;

    case 'multiplication':
      while (wrongs.size < 3) {
        const strategies = [
          correctAnswer + randomInt(-5, 5),   // Small offset
          correctAnswer + operand1,            // Added instead of multiplied
          correctAnswer + operand2,            // Added instead of multiplied
          (operand1 + 1) * operand2,           // Off by one on first operand
          operand1 * (operand2 + 1),           // Off by one on second operand
        ];
        const wrong = randomChoice(strategies);
        if (wrong !== correctAnswer && wrong > 0 && wrong <= 144) {
          wrongs.add(wrong);
        }
      }
      break;

    case 'division':
      while (wrongs.size < 3) {
        const strategies = [
          correctAnswer + randomInt(-2, 2),   // Small offset
          correctAnswer + 1,                   // Off by one
          correctAnswer - 1,                   // Off by one
          operand2,                            // Confused divisor with quotient
        ];
        const wrong = randomChoice(strategies);
        if (wrong !== correctAnswer && wrong > 0 && wrong <= 12) {
          wrongs.add(wrong);
        }
      }
      break;
  }

  // Fallback: add random offsets if we don't have enough
  while (wrongs.size < 3) {
    const offset = randomInt(-10, 10);
    const wrong = correctAnswer + offset;
    if (wrong !== correctAnswer && wrong > 0) {
      wrongs.add(wrong);
    }
  }

  return Array.from(wrongs);
}

export function getOperationSymbol(operation: OperationType): string {
  switch (operation) {
    case 'addition': return '+';
    case 'subtraction': return '−';
    case 'multiplication': return '×';
    case 'division': return '÷';
  }
}

export function formatProblemText(problem: MathProblem | Omit<MathProblem, 'userAnswer' | 'isCorrect' | 'timeToAnswerMs'>): string {
  return `${problem.operand1} ${getOperationSymbol(problem.operation)} ${problem.operand2}`;
}
