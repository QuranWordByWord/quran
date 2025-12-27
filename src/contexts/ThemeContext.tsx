// Re-export theme functionality from SettingsContext for backward compatibility
import { useSettingsOptional } from './SettingsContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Hook that wraps useSettings for theme functionality
export function useTheme(): ThemeContextType {
  const settings = useSettingsOptional();

  if (settings) {
    return {
      theme: settings.theme,
      setTheme: settings.setTheme,
      toggleTheme: settings.toggleTheme,
    };
  }

  // Fallback when used outside of SettingsProvider
  return {
    theme: 'light',
    setTheme: () => console.warn('useTheme: SettingsProvider not found'),
    toggleTheme: () => console.warn('useTheme: SettingsProvider not found'),
  };
}

// ThemeProvider is no longer needed - SettingsProvider handles theme
// Kept for backward compatibility but just passes through children
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
