import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  showStars?: boolean;
}

export function PageContainer({ children, className = '', showStars = true }: PageContainerProps) {
  return (
    <motion.div
      className={`
        flex-1 flex flex-col
        h-screen h-[100dvh] max-h-screen max-h-[100dvh]
        overflow-hidden
        safe-area-top safe-area-bottom
        ${showStars ? 'stars-bg' : ''}
        ${className}
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: ReactNode;
}

export function PageHeader({ title, onBack, rightElement }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-black/20 backdrop-blur-sm">
      <div className="w-12">
        {onBack && (
          <motion.button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        )}
      </div>

      <h1 className="text-xl font-bold text-white text-center">{title}</h1>

      <div className="w-12 flex justify-end">{rightElement}</div>
    </header>
  );
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
  center?: boolean;
}

export function PageContent({ children, className = '', center = false }: PageContentProps) {
  const centerStyles = center ? 'items-center justify-center' : '';

  return (
    <main className={`flex-1 flex flex-col p-4 min-h-0 ${centerStyles} ${className}`}>
      {children}
    </main>
  );
}
