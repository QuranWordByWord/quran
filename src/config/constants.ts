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

// Import MushafScript type from types.ts
import type { MushafScript } from './types';

// Page counts for each mushaf script
export const MUSHAF_PAGE_COUNTS: Record<MushafScript, number> = {
  indoPak15: 610,
  newMadinah: 604,
  oldMadinah: 604,
} as const;

// Mushaf script options for UI
export const MUSHAF_SCRIPTS: readonly { id: MushafScript; name: string; pages: number }[] = [
  { id: 'indoPak15', name: 'IndoPak 15-Line', pages: 610 },
  { id: 'newMadinah', name: 'New Madinah', pages: 604 },
  { id: 'oldMadinah', name: 'Old Madinah', pages: 604 },
] as const;

// Storage keys - centralized
export const STORAGE_KEYS: StorageKeys = {
  settings: 'quran-app-settings',
  fontPreference: 'quran-font-preference',
  theme: 'theme',
  verseNumberFormat: 'verseNumberFormat',
  bookmarks: 'quran-app-bookmarks',
  bookmarksSidebarExpanded: 'quran-bookmarks-sidebar-expanded',
};
