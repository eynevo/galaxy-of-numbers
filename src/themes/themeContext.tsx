import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useProfileStore } from '../stores/profileStore';
import type { Theme } from '../types';

interface ThemeContextValue {
  theme: Theme;
  isSparkle: boolean;
  isLego: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'sparkle',
  isSparkle: true,
  isLego: false,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const currentProfile = useProfileStore(state => state.currentProfile);
  const theme: Theme = currentProfile?.theme ?? 'sparkle';

  useEffect(() => {
    // Update data-theme attribute on document for CSS variables
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value: ThemeContextValue = {
    theme,
    isSparkle: theme === 'sparkle',
    isLego: theme === 'lego',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Theme-specific styling utilities
export function getThemeClasses(baseClasses: string, sparkleClasses: string, legoClasses: string) {
  return (theme: Theme) => {
    const themeSpecific = theme === 'sparkle' ? sparkleClasses : legoClasses;
    return `${baseClasses} ${themeSpecific}`.trim();
  };
}
