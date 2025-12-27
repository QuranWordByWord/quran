import type { ApiConfig, MushafConfig, StorageKeys } from './types';

// API Configuration
export const API_CONFIG: ApiConfig = {
  baseUrl: 'https://api.quran.com/api/v4',
  qdcBaseUrl: 'https://api.qurancdn.com/api/qdc',
  audioBaseUrl: 'https://audio.qurancdn.com',
  verseAudioBaseUrl: 'https://verses.quran.com',
};

// Mushaf configurations
export const MUSHAF_CONFIGS: Record<string, MushafConfig> = {
  'qpc-nastaleeq-15': {
    id: 14,
    name: 'QPC Hafs Nastaleeq 15 lines',
    totalPages: 610,
    type: 'qpc-nastaleeq',
  },
  'standard-hafs': {
    id: 1,
    name: 'Standard Hafs Mushaf',
    totalPages: 604,
    type: 'standard-hafs',
  },
};

// Current active mushaf (for word-for-word view)
export const ACTIVE_MUSHAF = MUSHAF_CONFIGS['qpc-nastaleeq-15'];

// Renderer mushaf (misraj-mushaf-renderer uses standard 604 pages)
export const RENDERER_MUSHAF = MUSHAF_CONFIGS['standard-hafs'];

// Storage keys - centralized
export const STORAGE_KEYS: StorageKeys = {
  settings: 'quran-app-settings',
  fontPreference: 'quran-font-preference',
  theme: 'theme',
  verseNumberFormat: 'verseNumberFormat',
};
