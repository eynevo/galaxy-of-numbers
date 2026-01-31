import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTheme } from '../../themes/themeContext';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  const { isLego } = useTheme();

  const baseStyles = `
    inline-flex items-center justify-center
    font-semibold
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    touch-target
  `;

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  const variantStyles = {
    primary: `
      bg-[var(--color-primary)] text-white
      hover:brightness-110 active:brightness-90
      ${isLego ? 'shadow-[4px_4px_0_rgba(0,0,0,0.3)]' : 'shadow-lg shadow-[var(--color-primary)]/30'}
    `,
    secondary: `
      bg-[var(--color-secondary)] text-white
      hover:brightness-110 active:brightness-90
      ${isLego ? 'shadow-[4px_4px_0_rgba(0,0,0,0.3)]' : 'shadow-lg shadow-[var(--color-secondary)]/30'}
    `,
    ghost: `
      bg-transparent text-[var(--color-text-primary)]
      hover:bg-white/10 active:bg-white/5
      border border-white/20
    `,
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  // Lego theme gets more blocky, sparkle gets more rounded
  const themeStyle = isLego ? 'rounded-lg' : '';

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${themeStyle} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
