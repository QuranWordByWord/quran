/**
 * Quran Word-by-Word Data Generator
 *
 * Generates JSON files for all 114 surahs with:
 * - Arabic text (Uthmani script)
 * - English word translations
 * - Grammatical classification (5 types)
 *
 * Data Sources:
 * - Morphology: Quranic Arabic Corpus (corpus-morphology.txt)
 * - Translations: Quran.com API v4
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Surah metadata
const SURAH_INFO = [
  null, // 0 index placeholder
  { name: "Al-Fatiha", nameArabic: "الفاتحة", verses: 7 },
  { name: "Al-Baqarah", nameArabic: "البقرة", verses: 286 },
  { name: "Aal-E-Imran", nameArabic: "آل عمران", verses: 200 },
  { name: "An-Nisa", nameArabic: "النساء", verses: 176 },
  { name: "Al-Ma'idah", nameArabic: "المائدة", verses: 120 },
  { name: "Al-An'am", nameArabic: "الأنعام", verses: 165 },
  { name: "Al-A'raf", nameArabic: "الأعراف", verses: 206 },
  { name: "Al-Anfal", nameArabic: "الأنفال", verses: 75 },
  { name: "At-Tawbah", nameArabic: "التوبة", verses: 129 },
  { name: "Yunus", nameArabic: "يونس", verses: 109 },
  { name: "Hud", nameArabic: "هود", verses: 123 },
  { name: "Yusuf", nameArabic: "يوسف", verses: 111 },
  { name: "Ar-Ra'd", nameArabic: "الرعد", verses: 43 },
  { name: "Ibrahim", nameArabic: "إبراهيم", verses: 52 },
  { name: "Al-Hijr", nameArabic: "الحجر", verses: 99 },
  { name: "An-Nahl", nameArabic: "النحل", verses: 128 },
  { name: "Al-Isra", nameArabic: "الإسراء", verses: 111 },
  { name: "Al-Kahf", nameArabic: "الكهف", verses: 110 },
  { name: "Maryam", nameArabic: "مريم", verses: 98 },
  { name: "Taha", nameArabic: "طه", verses: 135 },
  { name: "Al-Anbiya", nameArabic: "الأنبياء", verses: 112 },
  { name: "Al-Hajj", nameArabic: "الحج", verses: 78 },
  { name: "Al-Mu'minun", nameArabic: "المؤمنون", verses: 118 },
  { name: "An-Nur", nameArabic: "النور", verses: 64 },
  { name: "Al-Furqan", nameArabic: "الفرقان", verses: 77 },
  { name: "Ash-Shu'ara", nameArabic: "الشعراء", verses: 227 },
  { name: "An-Naml", nameArabic: "النمل", verses: 93 },
  { name: "Al-Qasas", nameArabic: "القصص", verses: 88 },
  { name: "Al-Ankabut", nameArabic: "العنكبوت", verses: 69 },
  { name: "Ar-Rum", nameArabic: "الروم", verses: 60 },
  { name: "Luqman", nameArabic: "لقمان", verses: 34 },
  { name: "As-Sajdah", nameArabic: "السجدة", verses: 30 },
  { name: "Al-Ahzab", nameArabic: "الأحزاب", verses: 73 },
  { name: "Saba", nameArabic: "سبأ", verses: 54 },
  { name: "Fatir", nameArabic: "فاطر", verses: 45 },
  { name: "Ya-Sin", nameArabic: "يس", verses: 83 },
  { name: "As-Saffat", nameArabic: "الصافات", verses: 182 },
  { name: "Sad", nameArabic: "ص", verses: 88 },
  { name: "Az-Zumar", nameArabic: "الزمر", verses: 75 },
  { name: "Ghafir", nameArabic: "غافر", verses: 85 },
  { name: "Fussilat", nameArabic: "فصلت", verses: 54 },
  { name: "Ash-Shura", nameArabic: "الشورى", verses: 53 },
  { name: "Az-Zukhruf", nameArabic: "الزخرف", verses: 89 },
  { name: "Ad-Dukhan", nameArabic: "الدخان", verses: 59 },
  { name: "Al-Jathiyah", nameArabic: "الجاثية", verses: 37 },
  { name: "Al-Ahqaf", nameArabic: "الأحقاف", verses: 35 },
  { name: "Muhammad", nameArabic: "محمد", verses: 38 },
  { name: "Al-Fath", nameArabic: "الفتح", verses: 29 },
  { name: "Al-Hujurat", nameArabic: "الحجرات", verses: 18 },
  { name: "Qaf", nameArabic: "ق", verses: 45 },
  { name: "Adh-Dhariyat", nameArabic: "الذاريات", verses: 60 },
  { name: "At-Tur", nameArabic: "الطور", verses: 49 },
  { name: "An-Najm", nameArabic: "النجم", verses: 62 },
  { name: "Al-Qamar", nameArabic: "القمر", verses: 55 },
  { name: "Ar-Rahman", nameArabic: "الرحمن", verses: 78 },
  { name: "Al-Waqi'ah", nameArabic: "الواقعة", verses: 96 },
  { name: "Al-Hadid", nameArabic: "الحديد", verses: 29 },
  { name: "Al-Mujadila", nameArabic: "المجادلة", verses: 22 },
  { name: "Al-Hashr", nameArabic: "الحشر", verses: 24 },
  { name: "Al-Mumtahanah", nameArabic: "الممتحنة", verses: 13 },
  { name: "As-Saf", nameArabic: "الصف", verses: 14 },
  { name: "Al-Jumu'ah", nameArabic: "الجمعة", verses: 11 },
  { name: "Al-Munafiqun", nameArabic: "المنافقون", verses: 11 },
  { name: "At-Taghabun", nameArabic: "التغابن", verses: 18 },
  { name: "At-Talaq", nameArabic: "الطلاق", verses: 12 },
  { name: "At-Tahrim", nameArabic: "التحريم", verses: 12 },
  { name: "Al-Mulk", nameArabic: "الملك", verses: 30 },
  { name: "Al-Qalam", nameArabic: "القلم", verses: 52 },
  { name: "Al-Haqqah", nameArabic: "الحاقة", verses: 52 },
  { name: "Al-Ma'arij", nameArabic: "المعارج", verses: 44 },
  { name: "Nuh", nameArabic: "نوح", verses: 28 },
  { name: "Al-Jinn", nameArabic: "الجن", verses: 28 },
  { name: "Al-Muzzammil", nameArabic: "المزمل", verses: 20 },
  { name: "Al-Muddaththir", nameArabic: "المدثر", verses: 56 },
  { name: "Al-Qiyamah", nameArabic: "القيامة", verses: 40 },
  { name: "Al-Insan", nameArabic: "الإنسان", verses: 31 },
  { name: "Al-Mursalat", nameArabic: "المرسلات", verses: 50 },
  { name: "An-Naba", nameArabic: "النبأ", verses: 40 },
  { name: "An-Nazi'at", nameArabic: "النازعات", verses: 46 },
  { name: "Abasa", nameArabic: "عبس", verses: 42 },
  { name: "At-Takwir", nameArabic: "التكوير", verses: 29 },
  { name: "Al-Infitar", nameArabic: "الانفطار", verses: 19 },
  { name: "Al-Mutaffifin", nameArabic: "المطففين", verses: 36 },
  { name: "Al-Inshiqaq", nameArabic: "الانشقاق", verses: 25 },
  { name: "Al-Buruj", nameArabic: "البروج", verses: 22 },
  { name: "At-Tariq", nameArabic: "الطارق", verses: 17 },
  { name: "Al-A'la", nameArabic: "الأعلى", verses: 19 },
  { name: "Al-Ghashiyah", nameArabic: "الغاشية", verses: 26 },
  { name: "Al-Fajr", nameArabic: "الفجر", verses: 30 },
  { name: "Al-Balad", nameArabic: "البلد", verses: 20 },
  { name: "Ash-Shams", nameArabic: "الشمس", verses: 15 },
  { name: "Al-Lail", nameArabic: "الليل", verses: 21 },
  { name: "Ad-Duhaa", nameArabic: "الضحى", verses: 11 },
  { name: "Ash-Sharh", nameArabic: "الشرح", verses: 8 },
  { name: "At-Tin", nameArabic: "التين", verses: 8 },
  { name: "Al-Alaq", nameArabic: "العلق", verses: 19 },
  { name: "Al-Qadr", nameArabic: "القدر", verses: 5 },
  { name: "Al-Bayyinah", nameArabic: "البينة", verses: 8 },
  { name: "Az-Zalzalah", nameArabic: "الزلزلة", verses: 8 },
  { name: "Al-Adiyat", nameArabic: "العاديات", verses: 11 },
  { name: "Al-Qari'ah", nameArabic: "القارعة", verses: 11 },
  { name: "At-Takathur", nameArabic: "التكاثر", verses: 8 },
  { name: "Al-Asr", nameArabic: "العصر", verses: 3 },
  { name: "Al-Humazah", nameArabic: "الهمزة", verses: 9 },
  { name: "Al-Fil", nameArabic: "الفيل", verses: 5 },
  { name: "Quraysh", nameArabic: "قريش", verses: 4 },
  { name: "Al-Ma'un", nameArabic: "الماعون", verses: 7 },
  { name: "Al-Kawthar", nameArabic: "الكوثر", verses: 3 },
  { name: "Al-Kafirun", nameArabic: "الكافرون", verses: 6 },
  { name: "An-Nasr", nameArabic: "النصر", verses: 3 },
  { name: "Al-Masad", nameArabic: "المسد", verses: 5 },
  { name: "Al-Ikhlas", nameArabic: "الإخلاص", verses: 4 },
  { name: "Al-Falaq", nameArabic: "الفلق", verses: 5 },
  { name: "An-Nas", nameArabic: "الناس", verses: 6 }
];

// Divine names and attributes for context-based detection
// Using exact lemma forms from corpus.quran.com morphology data
const DIVINE_LEMMAS = new Set([
  // Core divine names
  'اللَّه',    // Allah
  'رَبّ',      // Lord (Rabb)
  'رَحْمٰن',   // Most Gracious (Rahman)
  'رَحِيم',    // Most Merciful (Raheem)
  // 99 Names of Allah (common ones appearing in Quran)
  'مَلِك', 'مالِك',  // King/Master
  'قُدُّوس',   // Holy
  'سَلام',     // Peace
  'مُؤْمِن',   // Guardian of Faith
  'مُهَيْمِن', // Protector
  'عَزِيز',    // Mighty
  'جَبّار',    // Compeller
  'مُتَكَبِّر', // Greatest
  'خالِق',     // Creator
  'بارِئ',     // Maker
  'مُصَوِّر',  // Fashioner
  'غَفّار',    // Forgiver
  'قَهّار',    // Subduer
  'وَهّاب',    // Bestower
  'رَزّاق',    // Provider
  'فَتّاح',    // Opener
  'عَلِيم',    // All-Knowing
  'سَمِيع',    // All-Hearing
  'بَصِير',    // All-Seeing
  'حَكِيم',    // Wise
  'لَطِيف',    // Subtle
  'خَبِير',    // Aware
  'حَلِيم',    // Forbearing
  'عَظِيم',    // Supreme
  'غَفُور',    // Forgiving
  'شَكُور',    // Appreciative
  'عَلِيّ',    // Most High
  'كَبِير',    // Great
  'حَفِيظ',    // Guardian
  'كَرِيم',    // Generous
  'رَقِيب',    // Watchful
  'مُجِيب',    // Responsive
  'واسِع',     // All-Encompassing
  'وَدُود',    // Loving
  'مَجِيد',    // Glorious
  'شَهِيد',    // Witness
  'حَقّ',      // Truth
  'وَكِيل',    // Trustee
  'قَوِيّ',    // Strong
  'مَتِين',    // Firm
  'وَلِيّ',    // Protector
  'حَمِيد',    // Praiseworthy
  'حَيّ',      // Ever-Living
  'قَيُّوم',   // Self-Subsisting
  'واحِد',     // One
  'أَحَد',     // Unique
  'صَمَد',     // Eternal
  'قادِر', 'قَدِير', // Powerful
  'أَوَّل',    // First
  'آخِر',      // Last
  'ظاهِر',     // Manifest
  'باطِن',     // Hidden
  'تَوّاب',    // Acceptor of Repentance
  'عَفُوّ',    // Pardoner
  'رَءُوف',    // Compassionate
  'غَنِيّ',    // Self-Sufficient
  'نُور',      // Light
  'هادِي',     // Guide
  'بَدِيع',    // Originator
]);

// Additional divine reference patterns (Arabic text patterns)
const DIVINE_PATTERNS = [
  /^ٱللَّه/,
  /^اللَّه/,
  /^لِلَّه/,
  /^بِاللَّه/,
  /^وَاللَّه/
];

/**
 * Parse the corpus morphology file
 * Format: surah:verse:word:segment \t arabic \t pos \t tags
 */
function parseMorphologyFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Structure: { "surah:verse:word" -> [segments] }
  const morphology = {};

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split('\t');
    if (parts.length < 3) continue;

    const [location, arabic, pos, tags = ''] = parts;
    const [surah, verse, word, segment] = location.split(':').map(Number);

    const key = `${surah}:${verse}:${word}`;

    if (!morphology[key]) {
      morphology[key] = [];
    }

    // Parse tags
    const tagParts = tags.split('|');
    const lemma = tagParts.find(t => t.startsWith('LEM:'))?.replace('LEM:', '') || '';
    const root = tagParts.find(t => t.startsWith('ROOT:'))?.replace('ROOT:', '') || '';

    morphology[key].push({
      segment,
      arabic,
      pos,
      tags,
      lemma,
      root,
      isPronounSuffix: tagParts.includes('SUFF') && (pos === 'N' && tagParts.some(t => t.includes('PRON'))),
      isPrefix: tagParts.includes('PREF') || tagParts.includes('DET')
    });
  }

  return morphology;
}

/**
 * Determine grammatical type for a word based on morphology segments
 */
function classifyWord(segments, prevWordType = null) {
  if (!segments || segments.length === 0) {
    return { type: 'noun', arabicParts: null };
  }

  // Check if this is a divine name/attribute
  const isDivineName = segments.some(seg => {
    // Check lemma against divine names
    if (DIVINE_LEMMAS.has(seg.lemma)) return true;
    // Check for Allah specifically (various representations)
    const lemmaLower = seg.lemma?.replace(/[\u0640\u064B-\u065F]/g, ''); // Remove tatweel and diacritics for comparison
    if (lemmaLower === 'الله' || lemmaLower === 'اللَّه' || lemmaLower === 'اللّه') return true;
    // Check POS for proper noun with divine lemma
    if (seg.pos === 'N' && seg.tags.includes('PN')) {
      if (seg.lemma?.includes('الله') || seg.lemma?.includes('اللَّه')) return true;
    }
    return false;
  });

  // Check for adjectives following Allah names (e.g., الرحمن الرحيم)
  const isAdjectiveFollowingDivine = prevWordType === 'allah-name' &&
    segments.some(seg => seg.tags.includes('ADJ') && DIVINE_LEMMAS.has(seg.lemma));

  if (isDivineName || isAdjectiveFollowingDivine) {
    // Check if it's a compound with prefix
    const hasPrefix = segments.some(seg => seg.isPrefix && seg.pos === 'P');
    const mainSegments = segments.filter(seg => !seg.isPrefix);

    if (hasPrefix && mainSegments.length > 0) {
      return {
        type: 'compound',
        arabicParts: segments.map(seg => ({
          text: seg.arabic,
          type: seg.isPrefix ? 'preposition' : 'allah-name'
        }))
      };
    }
    return { type: 'allah-name', arabicParts: null };
  }

  // Get the main POS types (excluding prefixes like DET)
  const mainSegments = segments.filter(seg => !seg.tags.includes('DET') && !seg.tags.includes('PREF') && !seg.tags.includes('SUFF'));
  const prefixSegments = segments.filter(seg =>
    (seg.isPrefix && seg.pos === 'P' && !seg.tags.includes('DET')) ||
    (seg.pos === 'P' && !seg.tags.includes('DET') && !seg.tags.includes('SUFF'))
  );

  // Check for compound words (preposition + other type)
  // This includes both prefixed prepositions (بِ، لِ) and standalone prepositions with suffix (عَلَيْهِمْ)
  if (segments.length > 1) {
    const hasPreposition = segments.some(seg =>
      seg.pos === 'P' && !seg.tags.includes('DET') && !seg.tags.includes('SUFF')
    );
    const hasPronounSuffix = segments.some(seg => seg.tags.includes('SUFF') && seg.tags.includes('PRON'));
    const hasNonPrepContent = segments.some(seg =>
      (seg.pos === 'N' || seg.pos === 'V') && !seg.tags.includes('SUFF')
    );

    // Preposition + pronoun suffix pattern (e.g., عَلَيْهِمْ, فِيهِ)
    if (hasPreposition && hasPronounSuffix && !hasNonPrepContent) {
      return {
        type: 'compound',
        arabicParts: segments.map(seg => ({
          text: seg.arabic,
          type: getSegmentType(seg, isDivineName)
        }))
      };
    }

    // Only mark as compound if prefix is a meaningful preposition (not just DET)
    if (prefixSegments.length > 0 && mainSegments.length > 0) {
      if (prefixSegments.some(seg => ['P', 'CONJ'].includes(seg.pos) ||
          seg.tags.includes('CONJ') ||
          ['ب', 'ل', 'و', 'ك', 'ف', 'س'].includes(seg.arabic))) {
        return {
          type: 'compound',
          arabicParts: segments.map(seg => ({
            text: seg.arabic,
            type: getSegmentType(seg, isDivineName)
          }))
        };
      }
    }
  }

  // Single type word
  return { type: getMainType(segments), arabicParts: null };
}

/**
 * Get the grammatical type for a single segment
 */
function getSegmentType(segment, isDivineName = false) {
  if (isDivineName || DIVINE_LEMMAS.has(segment.lemma)) {
    return 'allah-name';
  }

  const pos = segment.pos;
  const tags = segment.tags;

  // Verbs
  if (pos === 'V') return 'verb';

  // Prepositions and connectors
  if (pos === 'P' || tags.includes('P|') || tags.includes('CONJ') ||
      tags.includes('NEG') || tags.includes('COND') || tags.includes('RES') ||
      tags.includes('SUB') || tags.includes('INTG') || tags.includes('VOC') ||
      tags.includes('FUT') || tags.includes('EMPH') || tags.includes('CERT') ||
      tags.includes('REM') || tags.includes('PREV') || tags.includes('CIRC') ||
      tags.includes('DIST') || tags.includes('ADDR')) {
    return 'preposition';
  }

  // Nouns (including pronouns, adjectives, etc.)
  if (pos === 'N' || tags.includes('PRON') || tags.includes('DEM') ||
      tags.includes('REL') || tags.includes('ADJ')) {
    return 'noun';
  }

  // Quranic initials
  if (tags.includes('INL')) {
    return 'noun';
  }

  return 'noun'; // Default
}

/**
 * Get the main grammatical type for a word from its segments
 */
function getMainType(segments) {
  // Priority: verb > allah-name > noun > preposition
  for (const seg of segments) {
    if (seg.pos === 'V') return 'verb';
  }

  for (const seg of segments) {
    if (DIVINE_LEMMAS.has(seg.lemma)) return 'allah-name';
  }

  for (const seg of segments) {
    if (seg.pos === 'N' || seg.tags.includes('PRON') || seg.tags.includes('DEM') ||
        seg.tags.includes('REL')) {
      return 'noun';
    }
  }

  return 'preposition';
}

/**
 * Fetch word-by-word data from Quran.com API
 */
async function fetchSurahWords(surahNum) {
  const url = `https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?words=true&per_page=300&word_fields=text_uthmani&word_translation_language=en`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data.verses;
  } catch (error) {
    console.error(`Error fetching surah ${surahNum}:`, error.message);
    return null;
  }
}

/**
 * Format English translation with grammatical class spans
 */
function formatEnglishWithClasses(text, type, arabicParts) {
  if (!text) return '';

  // If compound with parts, we'd need more sophisticated parsing
  // For now, return the plain translation
  // The HTML rendering will handle the Arabic coloring
  return text;
}

/**
 * Generate data for a single surah
 */
async function generateSurahData(surahNum, morphology) {
  console.log(`Processing Surah ${surahNum}...`);

  const info = SURAH_INFO[surahNum];
  if (!info) {
    console.error(`No info for surah ${surahNum}`);
    return null;
  }

  const apiVerses = await fetchSurahWords(surahNum);
  if (!apiVerses) {
    console.error(`Failed to fetch API data for surah ${surahNum}`);
    return null;
  }

  const verses = [];
  let prevWordType = null;

  for (const apiVerse of apiVerses) {
    const verseNum = apiVerse.verse_number;
    const words = [];

    // Filter out verse end markers
    const apiWords = apiVerse.words.filter(w => w.char_type_name === 'word');

    for (let i = 0; i < apiWords.length; i++) {
      const apiWord = apiWords[i];
      const wordPosition = apiWord.position;
      const morphKey = `${surahNum}:${verseNum}:${wordPosition}`;
      const segments = morphology[morphKey] || [];

      // Get Arabic text (prefer Uthmani)
      const arabic = apiWord.text_uthmani || apiWord.text;

      // Get English translation
      const english = apiWord.translation?.text || '';

      // Classify the word
      const { type, arabicParts } = classifyWord(segments, prevWordType);
      prevWordType = type;

      const wordData = {
        arabic,
        english,
        type
      };

      // Add arabicParts for compound words
      if (arabicParts) {
        wordData.arabicParts = arabicParts;
      }

      words.push(wordData);
    }

    verses.push({
      number: verseNum,
      words
    });
  }

  return {
    name: info.name,
    nameArabic: info.nameArabic,
    verses
  };
}

/**
 * Main execution
 */
async function main() {
  const scriptDir = __dirname;
  const morphologyPath = path.join(scriptDir, 'corpus-morphology.txt');
  const outputDir = path.join(scriptDir, '..', 'public', 'data', 'surah');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Parsing morphology file...');
  const morphology = parseMorphologyFile(morphologyPath);
  console.log(`Loaded ${Object.keys(morphology).length} word entries`);

  // Process specific surahs or all
  const surahsToProcess = process.argv[2]
    ? process.argv[2].split(',').map(Number)
    : Array.from({ length: 114 }, (_, i) => i + 1);

  for (const surahNum of surahsToProcess) {
    const surahData = await generateSurahData(surahNum, morphology);

    if (surahData) {
      const outputPath = path.join(outputDir, `${surahNum}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(surahData, null, 2), 'utf-8');
      console.log(`  Saved: ${outputPath}`);
    }

    // Rate limiting - wait 500ms between API calls
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\nDone!');
}

main().catch(console.error);
