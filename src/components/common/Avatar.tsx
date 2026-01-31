import { motion } from 'framer-motion';
import type { Theme } from '../../types';

// Avatar definitions for each theme
const SPARKLE_AVATARS = [
  { id: 'sparkle-1', emoji: '👸', name: 'Princess' },
  { id: 'sparkle-2', emoji: '🧚', name: 'Fairy' },
  { id: 'sparkle-3', emoji: '🦄', name: 'Unicorn' },
  { id: 'sparkle-4', emoji: '🌟', name: 'Star' },
  { id: 'sparkle-5', emoji: '🦋', name: 'Butterfly' },
  { id: 'sparkle-6', emoji: '🌸', name: 'Blossom' },
];

const LEGO_AVATARS = [
  { id: 'lego-1', emoji: '🤖', name: 'Robot' },
  { id: 'lego-2', emoji: '🚀', name: 'Rocket' },
  { id: 'lego-3', emoji: '👨‍🚀', name: 'Astronaut' },
  { id: 'lego-4', emoji: '🛸', name: 'UFO' },
  { id: 'lego-5', emoji: '🧱', name: 'Brick' },
  { id: 'lego-6', emoji: '⭐', name: 'Star' },
];

export function getAvatarsForTheme(theme: Theme) {
  return theme === 'sparkle' ? SPARKLE_AVATARS : LEGO_AVATARS;
}

export function getAvatarById(avatarId: string) {
  const allAvatars = [...SPARKLE_AVATARS, ...LEGO_AVATARS];
  return allAvatars.find(a => a.id === avatarId);
}

interface AvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  selected?: boolean;
  onClick?: () => void;
}

export function Avatar({ avatarId, size = 'md', selected = false, onClick }: AvatarProps) {
  const avatar = getAvatarById(avatarId);
  const isLego = avatarId.startsWith('lego');

  const sizeStyles = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
    xl: 'w-28 h-28 text-5xl',
  };

  const baseClasses = `
    flex items-center justify-center
    ${isLego ? 'rounded-lg' : 'rounded-full'}
    bg-[var(--color-surface)]
    ${selected ? 'ring-4 ring-[var(--color-primary)]' : ''}
    ${onClick ? 'cursor-pointer hover:bg-[var(--color-surface-elevated)]' : ''}
    transition-all duration-200
  `;

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={`${baseClasses} ${sizeStyles[size]}`}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      animate={selected ? { scale: [1, 1.1, 1] } : undefined}
    >
      {avatar?.emoji || '❓'}
    </Component>
  );
}

interface AvatarSelectorProps {
  theme: Theme;
  selectedId: string;
  onSelect: (avatarId: string) => void;
}

export function AvatarSelector({ theme, selectedId, onSelect }: AvatarSelectorProps) {
  const avatars = getAvatarsForTheme(theme);

  return (
    <div className="grid grid-cols-3 gap-4">
      {avatars.map(avatar => (
        <motion.div
          key={avatar.id}
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Avatar
            avatarId={avatar.id}
            size="lg"
            selected={selectedId === avatar.id}
            onClick={() => onSelect(avatar.id)}
          />
          <span className="text-sm text-[var(--color-text-secondary)]">{avatar.name}</span>
        </motion.div>
      ))}
    </div>
  );
}
