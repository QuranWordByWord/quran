import { useSettingsOptional } from '../contexts/SettingsContext';
import { FONT_OPTIONS } from '../config/defaults';
import type { FontConfig } from '../config/types';

export type FontStyle = 'nastaleeq' | 'madina' | 'old-madina' | 'indopak';

// Re-export FontConfig as FontOption for backward compatibility
export type FontOption = FontConfig;

// Re-export font options for backward compatibility
export const fontOptions: FontOption[] = FONT_OPTIONS;

export function useFont() {
  const settings = useSettingsOptional();

  // If SettingsContext is available, use it
  if (settings) {
    return {
      fontStyle: settings.fontStyle as FontStyle,
      setFontStyle: settings.setFontStyle,
      currentFont: settings.currentFont,
      fontOptions: settings.fontOptions,
      fontClassName: settings.fontClassName,
    };
  }

  // Fallback for when used outside of SettingsProvider (shouldn't happen normally)
  const defaultFont = FONT_OPTIONS[0];
  return {
    fontStyle: 'nastaleeq' as FontStyle,
    setFontStyle: () => {
      console.warn('useFont: SettingsProvider not found, font change ignored');
    },
    currentFont: defaultFont,
    fontOptions: FONT_OPTIONS,
    fontClassName: defaultFont.className,
  };
}
