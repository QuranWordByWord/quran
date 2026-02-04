/**
 * @digitalkhatt/quran-engine - Word Stack Layout
 *
 * Calculates layout for word-by-word display with stacked components
 */

import type {
  WordByWordConfig,
  WordByWordLayoutConfig,
} from '../config/mushaf-config';
import type {
  WordData,
  WordLayoutInfo,
  WordRowLayout,
  WordComponentLayout,
  VerseWordGroup,
} from './types';

export class WordStackLayout {
  private config: WordByWordConfig;
  private layoutConfig: WordByWordLayoutConfig;

  constructor(config: WordByWordConfig) {
    this.config = config;
    this.layoutConfig = config.layout;
  }

  /**
   * Calculate layout for a single word stack
   */
  calculateWordLayout(
    word: WordData,
    x: number,
    scale: number
  ): WordLayoutInfo {
    const components: WordComponentLayout[] = [];
    let yOffset = 0;
    let maxWidth = 0;

    // Arabic text (always first in vertical arrangement)
    const arabicFontSize = this.config.arabic.fontSize * scale;
    components.push({
      type: 'arabic',
      text: word.arabic,
      yOffset,
      fontSize: arabicFontSize,
      fontFamily: this.config.arabic.fontFamily,
      color: this.config.arabic.color,
      fontWeight: this.config.arabic.fontWeight,
    });
    yOffset += arabicFontSize * 1.2;
    maxWidth = Math.max(maxWidth, this.estimateTextWidth(word.arabic, arabicFontSize));

    // Transliteration (if enabled)
    if (this.config.transliteration?.enabled && word.transliteration) {
      const translitFontSize = this.config.transliteration.fontSize * scale;
      components.push({
        type: 'transliteration',
        text: word.transliteration,
        yOffset,
        fontSize: translitFontSize,
        fontFamily: this.config.transliteration.fontFamily,
        color: this.config.transliteration.color,
      });
      yOffset += translitFontSize * 1.2;
      maxWidth = Math.max(maxWidth, this.estimateTextWidth(word.transliteration, translitFontSize));
    }

    // Translations
    for (const transConfig of this.config.translations) {
      const translation = word.translations[transConfig.language];
      if (translation) {
        const transFontSize = transConfig.style.fontSize * scale;
        components.push({
          type: 'translation',
          language: transConfig.language,
          text: translation,
          yOffset,
          fontSize: transFontSize,
          fontFamily: transConfig.style.fontFamily,
          color: transConfig.style.color,
          fontWeight: transConfig.style.fontWeight,
        });
        yOffset += transFontSize * 1.2;
        maxWidth = Math.max(maxWidth, this.estimateTextWidth(translation, transFontSize));
      }
    }

    // Add component spacing
    const totalHeight = yOffset + (this.layoutConfig.componentSpacing * scale);

    return {
      word,
      x,
      width: maxWidth + (this.layoutConfig.wordSpacing * scale),
      height: totalHeight,
      components,
    };
  }

  /**
   * Calculate layout for a row of words
   */
  calculateRowLayout(
    words: WordData[],
    rowIndex: number,
    availableWidth: number,
    startY: number,
    scale: number
  ): WordRowLayout {
    const wordLayouts: WordLayoutInfo[] = [];
    let currentX = availableWidth; // Start from right for RTL

    // Calculate layout for each word (RTL order)
    for (const word of words) {
      const layout = this.calculateWordLayout(word, 0, scale);
      currentX -= layout.width;
      layout.x = currentX;
      wordLayouts.push(layout);
    }

    // Calculate row height (max of all words)
    const rowHeight = Math.max(...wordLayouts.map((w) => w.height));

    // Determine background color
    let backgroundColor: string | undefined;
    if (this.layoutConfig.rowColoring?.enabled) {
      const colors = this.layoutConfig.rowColoring.colors;
      backgroundColor = colors[rowIndex % colors.length];
    }

    // Check if all words belong to same verse
    let verseRef: { surah: number; ayah: number } | undefined;
    if (words.length > 0) {
      const firstWord = words[0];
      const allSameVerse = words.every(
        (w) => w.surah === firstWord.surah && w.ayah === firstWord.ayah
      );
      if (allSameVerse) {
        verseRef = { surah: firstWord.surah, ayah: firstWord.ayah };
      }
    }

    return {
      words: wordLayouts,
      y: startY,
      height: rowHeight,
      backgroundColor,
      verseRef,
    };
  }

  /**
   * Calculate layout for an entire page of words
   */
  calculatePageLayout(
    words: WordData[],
    contentBounds: { x: number; y: number; width: number; height: number },
    scale: number
  ): WordRowLayout[] {
    const rows: WordRowLayout[] = [];
    const wordsPerRow = this.layoutConfig.wordsPerRow || 4;
    let currentY = contentBounds.y;
    let rowIndex = 0;

    // Group words by verse if using verse-based row coloring
    let wordGroups: WordData[][];
    if (this.layoutConfig.rowColoring?.groupBy === 'verse') {
      wordGroups = this.groupWordsByVerse(words);
    } else {
      // Group by word count
      wordGroups = this.chunkArray(words, wordsPerRow);
    }

    for (const group of wordGroups) {
      // Split group into rows if larger than wordsPerRow
      const groupRows = this.chunkArray(group, wordsPerRow);

      for (const rowWords of groupRows) {
        const rowLayout = this.calculateRowLayout(
          rowWords,
          rowIndex,
          contentBounds.width,
          currentY,
          scale
        );

        rows.push(rowLayout);
        currentY += rowLayout.height + (this.layoutConfig.componentSpacing * scale);
        rowIndex++;

        // Check if we've exceeded the content area
        if (currentY > contentBounds.y + contentBounds.height) {
          break;
        }
      }
    }

    return rows;
  }

  /**
   * Group words by verse
   */
  groupWordsByVerse(words: WordData[]): WordData[][] {
    const groups: WordData[][] = [];
    let currentGroup: WordData[] = [];
    let currentVerse = { surah: -1, ayah: -1 };

    for (const word of words) {
      if (word.surah !== currentVerse.surah || word.ayah !== currentVerse.ayah) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [];
        currentVerse = { surah: word.surah, ayah: word.ayah };
      }
      currentGroup.push(word);
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Create verse word groups from word data
   */
  createVerseGroups(words: WordData[]): VerseWordGroup[] {
    const groups: VerseWordGroup[] = [];
    let currentGroup: VerseWordGroup | null = null;

    for (const word of words) {
      if (
        !currentGroup ||
        currentGroup.surah !== word.surah ||
        currentGroup.ayah !== word.ayah
      ) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          surah: word.surah,
          ayah: word.ayah,
          words: [],
          isComplete: false,
          isStart: word.wordIndex === 0,
        };
      }
      currentGroup.words.push(word);
    }

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Estimate text width (simplified calculation)
   */
  private estimateTextWidth(text: string, fontSize: number): number {
    // Rough estimation: average character width is about 0.5 * fontSize for Latin
    // and about 0.7 * fontSize for Arabic
    const isArabic = /[\u0600-\u06FF]/.test(text);
    const avgCharWidth = isArabic ? 0.7 : 0.5;
    return text.length * fontSize * avgCharWidth;
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Update configuration
   */
  updateConfig(config: WordByWordConfig): void {
    this.config = config;
    this.layoutConfig = config.layout;
  }

  /**
   * Get current configuration
   */
  getConfig(): WordByWordConfig {
    return this.config;
  }
}
