import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AppSettings, ReciterConfig, TranslationConfig, FontConfig, MushafScript } from '../config/types';
import { FONT_OPTIONS } from '../config/defaults';
import { RECITERS, getReciterById, DEFAULT_RECITER_ID } from '../config/reciters';
import { TRANSLATIONS, getTranslationById, DEFAULT_TRANSLATION_ID } from '../config/translations';
import { loadSettings, saveSettings } from '../utils/storage';

interface SettingsContextType {
  // Current settings
  settings: AppSettings;

  // Reciter
  reciter: ReciterConfig;
  setReciterId: (id: number) => void;
  availableReciters: ReciterConfig[];

  // Translation
  translation: TranslationConfig;
  setTranslationId: (id: number) => void;
  availableTranslations: TranslationConfig[];

  // Font
  fontStyle: string;
  setFontStyle: (style: string) => void;
  currentFont: FontConfig;
  fontOptions: FontConfig[];
  fontClassName: string;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Verse number format
  verseNumberFormat: 'arabic' | 'english';
  setVerseNumberFormat: (format: 'arabic' | 'english') => void;

  // View mode
  viewMode: 'mushaf' | 'wordforword';
  setViewMode: (mode: 'mushaf' | 'wordforword') => void;

  // Layout mode
  layoutMode: 'auto' | 'desktop' | 'mobile';
  setLayoutMode: (mode: 'auto' | 'desktop' | 'mobile') => void;

  // Mushaf settings (for DigitalKhatt renderer)
  mushafScript: MushafScript;
  setMushafScript: (script: MushafScript) => void;
  tajweedEnabled: boolean;
  setTajweedEnabled: (enabled: boolean) => void;
  mushafZoom: number;
  setMushafZoom: (zoom: number) => void;

  // Highlighted verse (shared between views, session-only, not persisted)
  highlightedVerseKey: string | null;
  setHighlightedVerseKey: (verseKey: string | null) => void;

  // Bulk update
  updateSettings: (partial: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Optional hook that returns null if not in provider (for gradual migration)
export function useSettingsOptional(): SettingsContextType | null {
  return useContext(SettingsContext);
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  // Session-only state for highlighted verse (shared between views, not persisted)
  const [highlightedVerseKey, setHighlightedVerseKey] = useState<string | null>(null);

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Memoized derived values
  const reciter = useMemo(
    () => getReciterById(settings.reciterId) || getReciterById(DEFAULT_RECITER_ID)!,
    [settings.reciterId]
  );

  const translation = useMemo(
    () => getTranslationById(settings.translationId) || getTranslationById(DEFAULT_TRANSLATION_ID)!,
    [settings.translationId]
  );

  const currentFont = useMemo(
    () => FONT_OPTIONS.find((f) => f.id === settings.fontStyle) || FONT_OPTIONS[0],
    [settings.fontStyle]
  );

  // Update functions
  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const setReciterId = useCallback(
    (id: number) => {
      updateSettings({ reciterId: id });
    },
    [updateSettings]
  );

  const setTranslationId = useCallback(
    (id: number) => {
      updateSettings({ translationId: id });
    },
    [updateSettings]
  );

  const setFontStyle = useCallback(
    (style: string) => {
      updateSettings({ fontStyle: style });
    },
    [updateSettings]
  );

  const setTheme = useCallback(
    (theme: 'light' | 'dark') => {
      updateSettings({ theme });
    },
    [updateSettings]
  );

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  }, []);

  const setVerseNumberFormat = useCallback(
    (format: 'arabic' | 'english') => {
      updateSettings({ verseNumberFormat: format });
    },
    [updateSettings]
  );

  const setViewMode = useCallback(
    (mode: 'mushaf' | 'wordforword') => {
      updateSettings({ viewMode: mode });
    },
    [updateSettings]
  );

  const setLayoutMode = useCallback(
    (mode: 'auto' | 'desktop' | 'mobile') => {
      updateSettings({ layoutMode: mode });
    },
    [updateSettings]
  );

  const setMushafScript = useCallback(
    (script: MushafScript) => {
      updateSettings({ mushafScript: script });
    },
    [updateSettings]
  );

  const setTajweedEnabled = useCallback(
    (enabled: boolean) => {
      updateSettings({ tajweedEnabled: enabled });
    },
    [updateSettings]
  );

  const setMushafZoom = useCallback(
    (zoom: number) => {
      updateSettings({ mushafZoom: zoom });
    },
    [updateSettings]
  );

  const value: SettingsContextType = {
    settings,
    reciter,
    setReciterId,
    availableReciters: RECITERS,
    translation,
    setTranslationId,
    availableTranslations: TRANSLATIONS,
    fontStyle: settings.fontStyle,
    setFontStyle,
    currentFont,
    fontOptions: FONT_OPTIONS,
    fontClassName: currentFont.className,
    theme: settings.theme,
    setTheme,
    toggleTheme,
    verseNumberFormat: settings.verseNumberFormat,
    setVerseNumberFormat,
    viewMode: settings.viewMode,
    setViewMode,
    layoutMode: settings.layoutMode,
    setLayoutMode,
    mushafScript: settings.mushafScript,
    setMushafScript,
    tajweedEnabled: settings.tajweedEnabled,
    setTajweedEnabled,
    mushafZoom: settings.mushafZoom,
    setMushafZoom,
    highlightedVerseKey,
    setHighlightedVerseKey,
    updateSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
