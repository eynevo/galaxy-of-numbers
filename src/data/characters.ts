import type { Character, Theme } from '../types';

// Sparkle theme characters - space princesses, magical creatures, sparkly friends
export const sparkleCharacters: Character[] = [
  // Table mastery rewards
  {
    id: 'sparkle-star-princess',
    name: 'Star Princess Luna',
    description: 'The princess of the first star system',
    theme: 'sparkle',
    unlockCondition: { type: 'table_mastery', tableNumber: 1 },
    imageUrl: '', // Using emoji fallback
  },
  {
    id: 'sparkle-cosmic-cat',
    name: 'Cosmic Kitty',
    description: 'A magical space cat who loves to nap on stars',
    theme: 'sparkle',
    unlockCondition: { type: 'table_mastery', tableNumber: 10 },
    imageUrl: '',
  },
  {
    id: 'sparkle-rainbow-unicorn',
    name: 'Rainbow Stardust',
    description: 'A unicorn made of pure rainbow light',
    theme: 'sparkle',
    unlockCondition: { type: 'table_mastery', tableNumber: 2 },
    imageUrl: '',
  },
  {
    id: 'sparkle-moon-fairy',
    name: 'Moonbeam Fairy',
    description: 'She sprinkles stardust wherever she flies',
    theme: 'sparkle',
    unlockCondition: { type: 'table_mastery', tableNumber: 5 },
    imageUrl: '',
  },
  {
    id: 'sparkle-crystal-dragon',
    name: 'Crystal Dragon',
    description: 'A gentle dragon with crystal scales',
    theme: 'sparkle',
    unlockCondition: { type: 'table_mastery', tableNumber: 3 },
    imageUrl: '',
  },
  {
    id: 'sparkle-glitter-bunny',
    name: 'Glitter Bunny',
    description: 'Hops between planets leaving sparkles',
    theme: 'sparkle',
    unlockCondition: { type: 'table_mastery', tableNumber: 4 },
    imageUrl: '',
  },
  {
    id: 'sparkle-nebula-fox',
    name: 'Nebula Fox',
    description: 'Her tail is made of colorful nebula clouds',
    theme: 'sparkle',
    unlockCondition: { type: 'table_mastery', tableNumber: 9 },
    imageUrl: '',
  },
  {
    id: 'sparkle-aurora-owl',
    name: 'Aurora Owl',
    description: 'Wise owl who paints the northern lights',
    theme: 'sparkle',
    unlockCondition: { type: 'table_mastery', tableNumber: 6 },
    imageUrl: '',
  },
  {
    id: 'sparkle-comet-dolphin',
    name: 'Comet Dolphin',
    description: 'Swims through space leaving comet trails',
    theme: 'sparkle',
    unlockCondition: { type: 'table_mastery', tableNumber: 7 },
    imageUrl: '',
  },
  {
    id: 'sparkle-galaxy-queen',
    name: 'Galaxy Queen',
    description: 'The ruler of all sparkle galaxies',
    theme: 'sparkle',
    unlockCondition: { type: 'table_mastery', tableNumber: 8 },
    imageUrl: '',
  },
  // Star threshold rewards
  {
    id: 'sparkle-star-collector',
    name: 'Twinkle the Star Sprite',
    description: 'Collects fallen stars and makes wishes',
    theme: 'sparkle',
    unlockCondition: { type: 'star_threshold', stars: 50 },
    imageUrl: '',
  },
  {
    id: 'sparkle-shimmer-butterfly',
    name: 'Shimmer Butterfly',
    description: 'Wings made of pure starlight',
    theme: 'sparkle',
    unlockCondition: { type: 'star_threshold', stars: 100 },
    imageUrl: '',
  },
  {
    id: 'sparkle-dream-pegasus',
    name: 'Dream Pegasus',
    description: 'Flies through dreams spreading magic',
    theme: 'sparkle',
    unlockCondition: { type: 'star_threshold', stars: 200 },
    imageUrl: '',
  },
  // Streak rewards
  {
    id: 'sparkle-streak-sprite',
    name: 'Spark the Fire Sprite',
    description: 'Burns bright with dedication',
    theme: 'sparkle',
    unlockCondition: { type: 'streak', days: 3 },
    imageUrl: '',
  },
  {
    id: 'sparkle-streak-phoenix',
    name: 'Stellar Phoenix',
    description: 'Rises from stardust each day',
    theme: 'sparkle',
    unlockCondition: { type: 'streak', days: 7 },
    imageUrl: '',
  },
];

// Lego theme characters - space explorers, robots, adventurers
export const legoCharacters: Character[] = [
  // Table mastery rewards
  {
    id: 'lego-space-cadet',
    name: 'Space Cadet Max',
    description: 'First-time space explorer ready for adventure',
    theme: 'lego',
    unlockCondition: { type: 'table_mastery', tableNumber: 1 },
    imageUrl: '',
  },
  {
    id: 'lego-rocket-bot',
    name: 'Rocket Bot RX-10',
    description: 'A helpful robot that counts super fast',
    theme: 'lego',
    unlockCondition: { type: 'table_mastery', tableNumber: 10 },
    imageUrl: '',
  },
  {
    id: 'lego-twin-pilots',
    name: 'The Twin Pilots',
    description: 'Best duo in the galaxy',
    theme: 'lego',
    unlockCondition: { type: 'table_mastery', tableNumber: 2 },
    imageUrl: '',
  },
  {
    id: 'lego-captain-five',
    name: 'Captain High-Five',
    description: 'Always ready with a high five!',
    theme: 'lego',
    unlockCondition: { type: 'table_mastery', tableNumber: 5 },
    imageUrl: '',
  },
  {
    id: 'lego-trio-squad',
    name: 'Triple Threat Squad',
    description: 'Three heroes working as one',
    theme: 'lego',
    unlockCondition: { type: 'table_mastery', tableNumber: 3 },
    imageUrl: '',
  },
  {
    id: 'lego-quad-racer',
    name: 'Quad Racer Team',
    description: 'Four-wheeled speed demons',
    theme: 'lego',
    unlockCondition: { type: 'table_mastery', tableNumber: 4 },
    imageUrl: '',
  },
  {
    id: 'lego-power-nine',
    name: 'Power Nine Commander',
    description: 'Leader of the elite nine squad',
    theme: 'lego',
    unlockCondition: { type: 'table_mastery', tableNumber: 9 },
    imageUrl: '',
  },
  {
    id: 'lego-hex-engineer',
    name: 'Hex the Engineer',
    description: 'Builds amazing things with six arms',
    theme: 'lego',
    unlockCondition: { type: 'table_mastery', tableNumber: 6 },
    imageUrl: '',
  },
  {
    id: 'lego-lucky-seven',
    name: 'Lucky Seven',
    description: 'The luckiest explorer in space',
    theme: 'lego',
    unlockCondition: { type: 'table_mastery', tableNumber: 7 },
    imageUrl: '',
  },
  {
    id: 'lego-octo-mechanic',
    name: 'Octo Mechanic',
    description: 'Eight tools for eight tough jobs',
    theme: 'lego',
    unlockCondition: { type: 'table_mastery', tableNumber: 8 },
    imageUrl: '',
  },
  // Star threshold rewards
  {
    id: 'lego-brick-collector',
    name: 'Brick Collector Bot',
    description: 'Collects special bricks from everywhere',
    theme: 'lego',
    unlockCondition: { type: 'star_threshold', stars: 50 },
    imageUrl: '',
  },
  {
    id: 'lego-mega-builder',
    name: 'Mega Builder',
    description: 'Can build anything from space bricks',
    theme: 'lego',
    unlockCondition: { type: 'star_threshold', stars: 100 },
    imageUrl: '',
  },
  {
    id: 'lego-master-architect',
    name: 'Master Architect',
    description: 'Designs the greatest space stations',
    theme: 'lego',
    unlockCondition: { type: 'star_threshold', stars: 200 },
    imageUrl: '',
  },
  // Streak rewards
  {
    id: 'lego-streak-runner',
    name: 'Streak Runner',
    description: 'Never misses a day of building',
    theme: 'lego',
    unlockCondition: { type: 'streak', days: 3 },
    imageUrl: '',
  },
  {
    id: 'lego-streak-champion',
    name: 'Week Champion',
    description: 'A whole week of awesome!',
    theme: 'lego',
    unlockCondition: { type: 'streak', days: 7 },
    imageUrl: '',
  },
];

// Get all characters for a theme
export function getCharactersForTheme(theme: Theme): Character[] {
  return theme === 'sparkle' ? sparkleCharacters : legoCharacters;
}

// Get character by ID
export function getCharacterById(id: string): Character | undefined {
  return [...sparkleCharacters, ...legoCharacters].find(c => c.id === id);
}

// Get emoji for character (fallback when no image)
export function getCharacterEmoji(character: Character): string {
  const emojiMap: Record<string, string> = {
    // Sparkle characters
    'sparkle-star-princess': '👸',
    'sparkle-cosmic-cat': '🐱',
    'sparkle-rainbow-unicorn': '🦄',
    'sparkle-moon-fairy': '🧚',
    'sparkle-crystal-dragon': '🐉',
    'sparkle-glitter-bunny': '🐰',
    'sparkle-nebula-fox': '🦊',
    'sparkle-aurora-owl': '🦉',
    'sparkle-comet-dolphin': '🐬',
    'sparkle-galaxy-queen': '👑',
    'sparkle-star-collector': '✨',
    'sparkle-shimmer-butterfly': '🦋',
    'sparkle-dream-pegasus': '🎠',
    'sparkle-streak-sprite': '🔥',
    'sparkle-streak-phoenix': '🌟',
    // Lego characters
    'lego-space-cadet': '👨‍🚀',
    'lego-rocket-bot': '🤖',
    'lego-twin-pilots': '👯',
    'lego-captain-five': '🖐️',
    'lego-trio-squad': '🎖️',
    'lego-quad-racer': '🏎️',
    'lego-power-nine': '🎯',
    'lego-hex-engineer': '🔧',
    'lego-lucky-seven': '🍀',
    'lego-octo-mechanic': '🐙',
    'lego-brick-collector': '🧱',
    'lego-mega-builder': '🏗️',
    'lego-master-architect': '📐',
    'lego-streak-runner': '🏃',
    'lego-streak-champion': '🏆',
  };
  return emojiMap[character.id] || '⭐';
}

// Check if a character should be unlocked based on progress
export function checkCharacterUnlock(
  character: Character,
  masteredTables: number[],
  totalStars: number,
  currentStreak: number
): boolean {
  const condition = character.unlockCondition;

  switch (condition.type) {
    case 'table_mastery':
      return masteredTables.includes(condition.tableNumber);
    case 'star_threshold':
      return totalStars >= condition.stars;
    case 'streak':
      return currentStreak >= condition.days;
    case 'total_problems':
      return false; // Would need to track this separately
    default:
      return false;
  }
}

// Get unlock description for a character
export function getUnlockDescription(character: Character): string {
  const condition = character.unlockCondition;

  switch (condition.type) {
    case 'table_mastery':
      return `Master the ${condition.tableNumber}s table`;
    case 'star_threshold':
      return `Collect ${condition.stars} stars`;
    case 'streak':
      return `${condition.days} day streak`;
    case 'total_problems':
      return `Solve ${condition.count} problems`;
    default:
      return 'Unknown';
  }
}
