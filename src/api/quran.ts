import type {
  ChaptersResponse,
  VersesResponse,
  SearchResponse,
  RecitersResponse,
  Chapter,
  Verse,
} from '../types/quran';

const BASE_URL = 'https://api.quran.com/api/v4';
const QDC_BASE_URL = 'https://api.qurancdn.com/api/qdc';

// Default translation ID (Sahih International)
const DEFAULT_TRANSLATION = 131;

// Mushaf IDs
const MUSHAF_QPC_NASTALEEQ_15 = 14; // QPC Hafs Nastaleeq 15 lines (610 pages)

// Total pages in QPC Hafs Nastaleeq 15 lines Mushaf (API pages)
export const TOTAL_MUSHAF_PAGES = 610;

// Total UI pages (includes intro page)
export const TOTAL_UI_PAGES = TOTAL_MUSHAF_PAGES + 1; // 611 pages (1 intro + 610 Quran pages)

// Convert UI page number to API page number
export function uiPageToApiPage(uiPage: number): number {
  return uiPage - 1; // UI page 2 = API page 1, etc.
}

// Convert API page number to UI page number
export function apiPageToUiPage(apiPage: number): number {
  return apiPage + 1; // API page 1 = UI page 2, etc.
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Get all chapters
export async function getChapters(): Promise<Chapter[]> {
  const data = await fetchApi<ChaptersResponse>('/chapters');
  return data.chapters;
}

// Get a single chapter's info
export async function getChapter(chapterId: number): Promise<Chapter> {
  const data = await fetchApi<{ chapter: Chapter }>(`/chapters/${chapterId}`);
  return data.chapter;
}

// Get verses for a chapter with word-by-word data
export async function getVerses(
  chapterId: number,
  page: number = 1,
  perPage: number = 50,
  translationId: number = DEFAULT_TRANSLATION
): Promise<VersesResponse> {
  const params = new URLSearchParams({
    words: 'true',
    translations: translationId.toString(),
    word_fields: 'text_uthmani,text_indopak,audio_url',
    translation_fields: 'text,resource_name',
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const data = await fetchApi<VersesResponse>(`/verses/by_chapter/${chapterId}?${params}`);
  fixVerseAudioUrls(data.verses);
  return data;
}

// Get all verses for a chapter (handles pagination)
export async function getAllVerses(
  chapterId: number,
  translationId: number = DEFAULT_TRANSLATION
): Promise<Verse[]> {
  const allVerses: Verse[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await getVerses(chapterId, page, 50, translationId);
    allVerses.push(...response.verses);
    hasMore = response.pagination.next_page !== null;
    page++;
  }

  return allVerses;
}

// Search the Quran
export async function searchQuran(
  query: string,
  page: number = 1,
  perPage: number = 20,
  _translationId: number = DEFAULT_TRANSLATION
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    size: perPage.toString(),
    page: page.toString(),
    language: 'en',
  });

  return fetchApi<SearchResponse>(`/search?${params}`);
}

// Get available reciters
export async function getReciters(): Promise<RecitersResponse> {
  return fetchApi<RecitersResponse>('/resources/recitations');
}

// Get audio URL for a verse
export function getVerseAudioUrl(
  _reciterId: number,
  verseKey: string
): string {
  // Format: https://verses.quran.com/{reciterId}/{verseKey}.mp3
  // Example: https://verses.quran.com/AbdulBaset/AbdulSamad/Murattal/mp3/001001.mp3
  const [chapter, verse] = verseKey.split(':');
  const paddedChapter = chapter.padStart(3, '0');
  const paddedVerse = verse.padStart(3, '0');
  return `https://verses.quran.com/Alafasy/mp3/${paddedChapter}${paddedVerse}.mp3`;
}

// Build full audio URL from relative path
export function buildAudioUrl(relativePath: string | null): string | null {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `https://audio.qurancdn.com/${relativePath}`;
}

// Generate correct word audio URL based on verse key and word position
// The API's audio_url field is incorrect for words that come after waqf marks
// because it skips waqf mark positions, but the actual audio files don't have gaps
export function getWordAudioUrl(verseKey: string, wordPosition: number): string {
  const [chapter, verse] = verseKey.split(':');
  const paddedChapter = chapter.padStart(3, '0');
  const paddedVerse = verse.padStart(3, '0');
  const paddedPosition = wordPosition.toString().padStart(3, '0');
  return `wbw/${paddedChapter}_${paddedVerse}_${paddedPosition}.mp3`;
}

// Fix audio URLs for words in verses - the API's audio_url field is incorrect for words
// that come after waqf marks because it skips waqf mark positions in the numbering,
// but the actual audio files use sequential numbering without gaps
function fixVerseAudioUrls(verses: Verse[]): void {
  verses.forEach(verse => {
    let wordPosition = 0;
    verse.words.forEach(word => {
      if (word.char_type_name === 'word') {
        wordPosition++;
        // Generate correct audio URL based on sequential word position
        word.audio_url = getWordAudioUrl(verse.verse_key, wordPosition);
      }
      // 'end' markers don't have audio, leave as null
    });
  });
}

// Get verses by Mushaf page number (for QPC Hafs Nastaleeq 15-line layout)
export async function getVersesByPage(
  pageNumber: number
): Promise<VersesResponse> {
  const params = new URLSearchParams({
    mushaf: MUSHAF_QPC_NASTALEEQ_15.toString(),
    words: 'true',
    word_fields: 'text_uthmani,text_indopak,audio_url',
    per_page: '50',
  });

  const response = await fetch(`${QDC_BASE_URL}/verses/by_page/${pageNumber}?${params}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  const data: VersesResponse = await response.json();
  fixVerseAudioUrls(data.verses);
  return data;
}


