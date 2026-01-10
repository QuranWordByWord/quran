import type { AppSettings, FontConfig } from './types';
import { DEFAULT_RECITER_ID } from './reciters';
import { DEFAULT_TRANSLATION_ID } from './translations';

// Font options (centralized from useFont.ts)
export const FONT_OPTIONS: FontConfig[] = [
  {
    id: 'nastaleeq',
    name: 'KFGQPC Nastaleeq',
    className: 'font-nastaleeq',
    description: 'Default - QPC Nastaleeq style',
  },
  {
    id: 'madina',
    name: 'Madina Mushaf',
    className: 'font-madina',
    description: 'Modern Saudi standard (1420H)',
  },
  {
    id: 'old-madina',
    name: 'Old Madina',
    className: 'font-old-madina',
    description: 'Classic traditional style',
  },
  {
    id: 'indopak',
    name: 'IndoPak',
    className: 'font-indopak',
    description: 'South Asian Nastaliq style',
  },
];

export const DEFAULT_FONT_STYLE = 'nastaleeq';

export const DEFAULT_SETTINGS: AppSettings = {
  reciterId: DEFAULT_RECITER_ID,
  translationId: DEFAULT_TRANSLATION_ID,
  fontStyle: DEFAULT_FONT_STYLE,
  theme: 'light',
  verseNumberFormat: 'arabic',
  viewMode: 'wordforword',
  layoutMode: 'auto',
  // Mushaf settings (for DigitalKhatt renderer)
  mushafScript: 'indoPak15',
  tajweedEnabled: true,
  mushafZoom: 1,
};
