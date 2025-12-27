// Reciter configuration
export interface ReciterConfig {
  id: number;
  name: string;
  arabicName: string;
  style: string | null;
  reciterPath: string; // e.g., "Alafasy", "AbdulBaset/AbdulSamad/Murattal"
}

// Translation configuration
export interface TranslationConfig {
  id: number;
  name: string;
  language: string;
  languageCode: string;
  authorName: string;
}

// Mushaf configuration
export interface MushafConfig {
  id: number;
  name: string;
  totalPages: number;
  type: 'qpc-nastaleeq' | 'standard-hafs' | 'other';
}

// Font configuration
export interface FontConfig {
  id: string;
  name: string;
  className: string;
  description?: string;
}

// API configuration
export interface ApiConfig {
  baseUrl: string;
  qdcBaseUrl: string;
  audioBaseUrl: string;
  verseAudioBaseUrl: string;
}

// Bookmark data structure
export interface Bookmark {
  id: string;                              // Unique ID (timestamp-based)
  pageNumber: number;                      // UI page number
  viewMode: 'mushaf' | 'wordforword';      // Which view was bookmarked
  surahId: number;                         // Chapter ID (1-114)
  surahName: string;                       // e.g., "Al-Baqara"
  createdAt: number;                       // Unix timestamp
  label?: string;                          // Optional custom label
}

// Complete app settings (user-modifiable)
export interface AppSettings {
  // Audio settings
  reciterId: number;

  // Translation settings
  translationId: number;

  // Display settings
  fontStyle: string;
  theme: 'light' | 'dark';
  verseNumberFormat: 'arabic' | 'english';

  // View settings
  viewMode: 'mushaf' | 'wordforword';
}

// Storage keys
export interface StorageKeys {
  settings: string;
  fontPreference: string;
  theme: string;
  verseNumberFormat: string;
  bookmarks: string;
  bookmarksSidebarExpanded: string;
}
