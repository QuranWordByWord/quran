// Chapter/Surah types
export interface Chapter {
  id: number;
  revelation_place: 'makkah' | 'madinah';
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

// Word types
export interface Word {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: 'word' | 'end' | 'pause';
  text_uthmani: string;
  text_indopak: string;
  text: string;
  line_number?: number;
  page_number?: number;
  translation: {
    text: string;
    language_name: string;
  };
  transliteration: {
    text: string;
    language_name: string;
  };
}

// Translation types
export interface Translation {
  id: number;
  resource_id: number;
  resource_name: string;
  text: string;
}

// Verse types
export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_number: number | null;
  page_number: number;
  juz_number: number;
  words: Word[];
  translations?: Translation[];
  text_uthmani?: string;
  text_indopak?: string;
}

// API Response types
export interface ChaptersResponse {
  chapters: Chapter[];
}

export interface VersesResponse {
  verses: Verse[];
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

export interface SearchResult {
  verse_key: string;
  verse_id: number;
  text: string;
  highlighted: string | null;
  words: Word[];
  translations: Translation[];
}

export interface SearchResponse {
  search: {
    query: string;
    total_results: number;
    current_page: number;
    total_pages: number;
    results: SearchResult[];
  };
}

// Audio/Recitation types
export interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface RecitersResponse {
  recitations: Reciter[];
}

export interface AudioFile {
  url: string;
  duration: number;
  format: string;
  segments: number[][];
}

export interface VerseAudioResponse {
  audio_files: AudioFile[];
}
