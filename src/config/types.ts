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
  juzNumber?: number;                      // Juz number (1-30)
  label?: string;                          // Optional custom label
}

// Favorite Juz data structure
export interface FavoriteJuz {
  id: string;                              // Unique ID (timestamp-based)
  juzNumber: number;                       // Juz number (1-30)
  createdAt: number;                       // Unix timestamp
}

// Mushaf script type for DigitalKhatt renderer
export type MushafScript = 'indoPak15' | 'newMadinah' | 'oldMadinah';

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

  // Layout mode: 'auto' follows device, 'desktop' forces desktop, 'mobile' forces mobile
  layoutMode: 'auto' | 'desktop' | 'mobile';

  // Mushaf settings (for DigitalKhatt renderer)
  mushafScript: MushafScript;
  tajweedEnabled: boolean;
  mushafZoom: number;
  mushafFontScale: number; // Font size scale (0.5 to 1.2, default 0.75)
  ruledLinesEnabled: boolean; // Show ruled lines between text lines in mushaf view
}

// Storage keys
export interface StorageKeys {
  settings: string;
  fontPreference: string;
  theme: string;
  verseNumberFormat: string;
  bookmarks: string;
  bookmarksSidebarExpanded: string;
  favoriteJuz: string;
  favoriteJuzSidebarExpanded: string;
}
