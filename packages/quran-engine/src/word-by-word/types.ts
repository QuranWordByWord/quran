/**
 * @digitalkhatt/quran-engine - Word-by-Word Types
 */

export interface WordData {
  /** Unique key: "surah:ayah:wordIndex" */
  key: string;
  /** Arabic text of the word */
  arabic: string;
  /** Transliteration (optional) */
  transliteration?: string;
  /** Translations by language code */
  translations: Record<string, string>;
  /** Surah number */
  surah: number;
  /** Ayah number */
  ayah: number;
  /** Word index within the ayah (0-indexed) */
  wordIndex: number;
}

export interface WordByWordRenderContext {
  /** Page number (1-indexed) */
  pageNumber: number;
  /** Viewport dimensions */
  viewport: { width: number; height: number };
  /** Scale factor */
  scale: number;
  /** Content area bounds (after border) */
  contentBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface WordRowLayout {
  /** Words in this row */
  words: WordLayoutInfo[];
  /** Y position of the row */
  y: number;
  /** Height of the row */
  height: number;
  /** Background color for this row (for alternating colors) */
  backgroundColor?: string;
  /** Verse reference if all words belong to same verse */
  verseRef?: { surah: number; ayah: number };
}

export interface WordLayoutInfo {
  /** Word data */
  word: WordData;
  /** X position */
  x: number;
  /** Width of the word stack */
  width: number;
  /** Height of the word stack */
  height: number;
  /** Individual component positions */
  components: WordComponentLayout[];
}

export interface WordComponentLayout {
  /** Component type */
  type: 'arabic' | 'transliteration' | 'translation';
  /** Language code (for translations) */
  language?: string;
  /** Text content */
  text: string;
  /** Y offset within the word stack */
  yOffset: number;
  /** Font size */
  fontSize: number;
  /** Font family */
  fontFamily: string;
  /** Text color */
  color: string;
  /** Font weight */
  fontWeight?: string;
}

export interface PageWordsData {
  /** Page number */
  pageNumber: number;
  /** All words on this page */
  words: WordData[];
  /** Words grouped by verse */
  verseGroups: VerseWordGroup[];
}

export interface VerseWordGroup {
  /** Surah number */
  surah: number;
  /** Ayah number */
  ayah: number;
  /** Words in this verse (on this page) */
  words: WordData[];
  /** Is this verse complete on this page? */
  isComplete: boolean;
  /** Is this the start of the verse? */
  isStart: boolean;
}
