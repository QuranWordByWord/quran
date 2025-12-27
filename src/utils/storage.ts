import { STORAGE_KEYS } from '../config/constants';
import { DEFAULT_SETTINGS } from '../config/defaults';
import type { AppSettings } from '../config/types';

// Get all settings from localStorage
export function loadSettings(): AppSettings {
  try {
    // Try to load unified settings first
    const stored = localStorage.getItem(STORAGE_KEYS.settings);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }

    // Migration: Load from individual keys (backward compatibility)
    const settings: AppSettings = { ...DEFAULT_SETTINGS };

    const theme = localStorage.getItem(STORAGE_KEYS.theme);
    if (theme === 'light' || theme === 'dark') {
      settings.theme = theme;
    }

    const font = localStorage.getItem(STORAGE_KEYS.fontPreference);
    if (font) {
      settings.fontStyle = font;
    }

    const verseFormat = localStorage.getItem(STORAGE_KEYS.verseNumberFormat);
    if (verseFormat === 'arabic' || verseFormat === 'english') {
      settings.verseNumberFormat = verseFormat;
    }

    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Save all settings to localStorage
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));

    // Also save to individual keys for backward compatibility during transition
    localStorage.setItem(STORAGE_KEYS.theme, settings.theme);
    localStorage.setItem(STORAGE_KEYS.fontPreference, settings.fontStyle);
    localStorage.setItem(STORAGE_KEYS.verseNumberFormat, settings.verseNumberFormat);
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// Update a single setting
export function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): AppSettings {
  const current = loadSettings();
  const updated = { ...current, [key]: value };
  saveSettings(updated);
  return updated;
}
