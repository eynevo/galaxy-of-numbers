import type { TableTeaching } from '../../types';

// Teaching content for each multiplication table
export const TABLE_TEACHINGS: Record<number, TableTeaching> = {
  1: {
    tableNumber: 1,
    title: 'The Ones Table',
    conceptIntro: [
      {
        type: 'text',
        content: 'The 1s table is the easiest! When you multiply any number by 1, the answer is always that same number.',
      },
      {
        type: 'visual',
        content: 'Imagine you have 1 group of stars. How many stars? Just count the group!',
        visualType: 'groups',
        example: { multiplicand: 1, multiplier: 5 },
      },
    ],
    patterns: [
      {
        title: 'The Magic Rule',
        description: 'Any number × 1 = that same number!',
        examples: ['1 × 7 = 7', '1 × 3 = 3', '9 × 1 = 9'],
        tip: 'Think of it as: "One group of 7 is just 7!"',
      },
    ],
    guidedPractice: [
      { multiplicand: 1, multiplier: 4, hint: '1 group of 4 is just...', explanation: '1 × 4 = 4. One group of four equals four!' },
      { multiplicand: 1, multiplier: 8, hint: 'Any number times 1 equals...', explanation: '1 × 8 = 8. The number stays the same!' },
      { multiplicand: 6, multiplier: 1, hint: '6 times 1 is the same as...', explanation: '6 × 1 = 6. Six groups of one equals six!' },
    ],
  },

  2: {
    tableNumber: 2,
    title: 'The Twos Table',
    conceptIntro: [
      {
        type: 'text',
        content: 'The 2s table is all about DOUBLING! When you multiply by 2, you just add the number to itself.',
      },
      {
        type: 'visual',
        content: 'Imagine 2 groups of stars. Count them together!',
        visualType: 'groups',
        example: { multiplicand: 2, multiplier: 4 },
      },
    ],
    patterns: [
      {
        title: 'The Double Trick',
        description: 'Multiply by 2 = Double the number (add it to itself)',
        examples: ['2 × 3 = 3 + 3 = 6', '2 × 7 = 7 + 7 = 14', '2 × 9 = 9 + 9 = 18'],
        tip: 'If you can add, you can do 2s!',
      },
      {
        title: 'Skip Counting',
        description: 'Count by 2s: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20',
        examples: ['2 × 1 = 2', '2 × 2 = 4', '2 × 3 = 6'],
        tip: 'These are all the even numbers!',
      },
    ],
    guidedPractice: [
      { multiplicand: 2, multiplier: 5, hint: 'Double 5 is 5 + 5 = ...', explanation: '2 × 5 = 10. Five plus five equals ten!' },
      { multiplicand: 2, multiplier: 7, hint: 'What is 7 + 7?', explanation: '2 × 7 = 14. Double seven is fourteen!' },
      { multiplicand: 2, multiplier: 8, hint: '8 doubled is...', explanation: '2 × 8 = 16. Eight plus eight equals sixteen!' },
    ],
  },

  3: {
    tableNumber: 3,
    title: 'The Threes Table',
    conceptIntro: [
      {
        type: 'text',
        content: 'The 3s table has a cool pattern! You can skip count by 3s or use what you know about 2s.',
      },
      {
        type: 'visual',
        content: '3 groups of objects - count them all!',
        visualType: 'groups',
        example: { multiplicand: 3, multiplier: 4 },
      },
    ],
    patterns: [
      {
        title: 'Skip Counting by 3s',
        description: 'Count by 3s: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30',
        examples: ['3 × 1 = 3', '3 × 2 = 6', '3 × 3 = 9'],
      },
      {
        title: 'Use Your 2s!',
        description: '3 times a number = 2 times the number + the number once more',
        examples: ['3 × 4 = (2 × 4) + 4 = 8 + 4 = 12'],
        tip: 'Double it, then add one more!',
      },
    ],
    guidedPractice: [
      { multiplicand: 3, multiplier: 3, hint: 'Skip count: 3, 6, ...', explanation: '3 × 3 = 9. Three, six, nine!' },
      { multiplicand: 3, multiplier: 5, hint: 'Double 5 is 10, plus 5 more...', explanation: '3 × 5 = 15. Ten plus five equals fifteen!' },
      { multiplicand: 3, multiplier: 6, hint: 'Skip count: 3, 6, 9, 12, 15, ...', explanation: '3 × 6 = 18. You got it!' },
    ],
  },

  4: {
    tableNumber: 4,
    title: 'The Fours Table',
    conceptIntro: [
      {
        type: 'text',
        content: 'The 4s table has a super trick: just DOUBLE your 2s answer! 4 = 2 × 2',
      },
      {
        type: 'visual',
        content: '4 groups - that\'s like 2 groups, doubled!',
        visualType: 'groups',
        example: { multiplicand: 4, multiplier: 3 },
      },
    ],
    patterns: [
      {
        title: 'Double the Doubles',
        description: '4 × a number = Double the number, then double again!',
        examples: ['4 × 3 = double 3 = 6, double 6 = 12', '4 × 7 = double 7 = 14, double 14 = 28'],
        tip: 'Or: Find 2 × the number, then double that answer!',
      },
    ],
    guidedPractice: [
      { multiplicand: 4, multiplier: 4, hint: '2 × 4 = 8, double 8 = ...', explanation: '4 × 4 = 16. Double double!' },
      { multiplicand: 4, multiplier: 6, hint: '2 × 6 = 12, now double 12...', explanation: '4 × 6 = 24. Twelve doubled is twenty-four!' },
      { multiplicand: 4, multiplier: 8, hint: '2 × 8 = 16, double it...', explanation: '4 × 8 = 32. Sixteen doubled is thirty-two!' },
    ],
  },

  5: {
    tableNumber: 5,
    title: 'The Fives Table',
    conceptIntro: [
      {
        type: 'text',
        content: 'The 5s are easy to spot! They always end in 0 or 5. Just like counting nickels!',
      },
      {
        type: 'visual',
        content: 'Count by 5s like counting fingers on hands!',
        visualType: 'groups',
        example: { multiplicand: 5, multiplier: 4 },
      },
    ],
    patterns: [
      {
        title: 'The 0 and 5 Pattern',
        description: '5s always end in 0 (even numbers) or 5 (odd numbers)',
        examples: ['5 × 2 = 10 (ends in 0)', '5 × 3 = 15 (ends in 5)', '5 × 4 = 20 (ends in 0)'],
        tip: 'Even × 5 = ends in 0. Odd × 5 = ends in 5!',
      },
      {
        title: 'Half of 10s',
        description: '5 × a number = half of 10 × that number',
        examples: ['5 × 6 = half of 60 = 30', '5 × 8 = half of 80 = 40'],
      },
    ],
    guidedPractice: [
      { multiplicand: 5, multiplier: 5, hint: 'Skip count: 5, 10, 15, 20, ...', explanation: '5 × 5 = 25. Five fives make twenty-five!' },
      { multiplicand: 5, multiplier: 7, hint: '7 is odd, so it ends in...', explanation: '5 × 7 = 35. Odd number, ends in 5!' },
      { multiplicand: 5, multiplier: 8, hint: '8 is even, so it ends in...', explanation: '5 × 8 = 40. Even number, ends in 0!' },
    ],
  },

  6: {
    tableNumber: 6,
    title: 'The Sixes Table',
    conceptIntro: [
      {
        type: 'text',
        content: 'The 6s combine what you know! 6 = 5 + 1 or 6 = 3 × 2',
      },
    ],
    patterns: [
      {
        title: 'Use Your 5s Plus One More',
        description: '6 × a number = (5 × that number) + that number',
        examples: ['6 × 4 = (5 × 4) + 4 = 20 + 4 = 24'],
      },
      {
        title: 'Double Your 3s',
        description: '6 × a number = 3 × that number, doubled',
        examples: ['6 × 7 = (3 × 7) × 2 = 21 × 2 = 42'],
      },
    ],
    guidedPractice: [
      { multiplicand: 6, multiplier: 4, hint: '5 × 4 = 20, plus 4 more...', explanation: '6 × 4 = 24!' },
      { multiplicand: 6, multiplier: 6, hint: '5 × 6 = 30, plus 6 more...', explanation: '6 × 6 = 36!' },
      { multiplicand: 6, multiplier: 7, hint: '5 × 7 = 35, plus 7 more...', explanation: '6 × 7 = 42!' },
    ],
  },

  7: {
    tableNumber: 7,
    title: 'The Sevens Table',
    conceptIntro: [
      {
        type: 'text',
        content: 'The 7s are tricky, but you can use rhymes and what you already know!',
      },
    ],
    patterns: [
      {
        title: 'Famous Rhymes',
        description: 'Some 7s have rhymes to help remember:',
        examples: [
          '7 × 7 = 49 (Seven times seven is 49 - sounds like "heaven!")',
          '7 × 8 = 56 (5, 6, 7, 8 → 56 = 7 × 8)',
        ],
        tip: '5, 6, 7, 8 makes 56 = 7 × 8!',
      },
      {
        title: 'Use What You Know',
        description: 'Break it down using easier facts',
        examples: ['7 × 6 = (7 × 5) + 7 = 35 + 7 = 42'],
      },
    ],
    guidedPractice: [
      { multiplicand: 7, multiplier: 5, hint: 'Skip count by 7: 7, 14, 21, 28, ...', explanation: '7 × 5 = 35!' },
      { multiplicand: 7, multiplier: 7, hint: 'Seven times seven - the famous one!', explanation: '7 × 7 = 49! Forty-nine, like heaven!' },
      { multiplicand: 7, multiplier: 8, hint: '5, 6, 7, 8 → 56 = ...', explanation: '7 × 8 = 56! Remember: 5, 6, 7, 8!' },
    ],
  },

  8: {
    tableNumber: 8,
    title: 'The Eights Table',
    conceptIntro: [
      {
        type: 'text',
        content: 'The 8s are DOUBLE DOUBLE DOUBLE! 8 = 2 × 2 × 2',
      },
    ],
    patterns: [
      {
        title: 'Triple Double',
        description: 'Double the number three times!',
        examples: ['8 × 3 = (double 3 = 6, double 6 = 12, double 12 = 24)'],
        tip: 'Or just double your 4s answer!',
      },
      {
        title: 'Double the 4s',
        description: '8 × a number = (4 × that number) × 2',
        examples: ['8 × 7 = (4 × 7) × 2 = 28 × 2 = 56'],
      },
    ],
    guidedPractice: [
      { multiplicand: 8, multiplier: 4, hint: '4 × 4 = 16, double it...', explanation: '8 × 4 = 32!' },
      { multiplicand: 8, multiplier: 6, hint: '4 × 6 = 24, double it...', explanation: '8 × 6 = 48!' },
      { multiplicand: 8, multiplier: 8, hint: '4 × 8 = 32, double it...', explanation: '8 × 8 = 64! Eight eights are sixty-four!' },
    ],
  },

  9: {
    tableNumber: 9,
    title: 'The Nines Table',
    conceptIntro: [
      {
        type: 'text',
        content: 'The 9s have AMAZING tricks! The finger trick and the digits trick!',
      },
    ],
    patterns: [
      {
        title: 'The Finger Trick',
        description: 'Hold up 10 fingers. Put down finger #X. The answer is the fingers on each side!',
        examples: ['9 × 3: Put down finger 3. See 2 fingers, then 7 = 27!'],
        tip: 'Works for 9 × 1 through 9 × 10!',
      },
      {
        title: 'Digits Add to 9',
        description: 'In any 9s answer, the digits always add up to 9!',
        examples: ['9 × 2 = 18 (1+8=9)', '9 × 7 = 63 (6+3=9)', '9 × 9 = 81 (8+1=9)'],
      },
      {
        title: '10s Minus One',
        description: '9 × a number = (10 × that number) - that number',
        examples: ['9 × 6 = 60 - 6 = 54', '9 × 8 = 80 - 8 = 72'],
      },
    ],
    guidedPractice: [
      { multiplicand: 9, multiplier: 4, hint: '10 × 4 = 40, minus 4...', explanation: '9 × 4 = 36! (And 3+6=9!)' },
      { multiplicand: 9, multiplier: 6, hint: 'Finger trick: put down finger 6...', explanation: '9 × 6 = 54! Five fingers, then four!' },
      { multiplicand: 9, multiplier: 9, hint: '10 × 9 = 90, minus 9...', explanation: '9 × 9 = 81! Eight-one, digits add to 9!' },
    ],
  },

  10: {
    tableNumber: 10,
    title: 'The Tens Table',
    conceptIntro: [
      {
        type: 'text',
        content: 'The 10s are super easy! Just add a zero to the end of the number!',
      },
      {
        type: 'visual',
        content: 'Ten groups - just like counting by tens!',
        visualType: 'groups',
        example: { multiplicand: 10, multiplier: 4 },
      },
    ],
    patterns: [
      {
        title: 'Add a Zero!',
        description: 'To multiply by 10, just add a 0 to the end!',
        examples: ['10 × 5 = 50', '10 × 7 = 70', '10 × 12 = 120'],
        tip: 'This is the easiest trick in multiplication!',
      },
    ],
    guidedPractice: [
      { multiplicand: 10, multiplier: 4, hint: 'Add a 0 to 4...', explanation: '10 × 4 = 40! Just add a zero!' },
      { multiplicand: 10, multiplier: 7, hint: 'What is 7 with a 0 added?', explanation: '10 × 7 = 70! So simple!' },
      { multiplicand: 10, multiplier: 9, hint: '9 with a zero is...', explanation: '10 × 9 = 90! You\'re a pro!' },
    ],
  },
};

export function getTableTeaching(tableNumber: number): TableTeaching | undefined {
  return TABLE_TEACHINGS[tableNumber];
}
