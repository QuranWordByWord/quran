/**
 * @digitalkhatt/quran-engine - Word-by-Word Renderer
 *
 * Renders word-by-word Quran layout with translations and transliterations
 */

import type { WordByWordConfig, WordTranslationData } from '../config/mushaf-config';
import type {
  WordData,
  WordByWordRenderContext,
  WordRowLayout,
  WordLayoutInfo,
} from './types';
import { TranslationDataLoader } from './TranslationDataLoader';
import { WordStackLayout } from './WordStackLayout';

const SVG_NS = 'http://www.w3.org/2000/svg';

export interface WordByWordRenderResult {
  /** The rendered SVG group */
  element: SVGGElement;
  /** Layout information for each row */
  rows: WordRowLayout[];
  /** Total height of rendered content */
  totalHeight: number;
}

export class WordByWordRenderer {
  private config: WordByWordConfig;
  private translationLoader: TranslationDataLoader;
  private layoutCalculator: WordStackLayout;
  private loadedTranslations: Map<string, WordTranslationData> = new Map();
  private initialized = false;

  constructor(config: WordByWordConfig) {
    this.config = config;
    this.translationLoader = new TranslationDataLoader();
    this.layoutCalculator = new WordStackLayout(config);
  }

  /**
   * Initialize the renderer by loading all translation data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load all configured translations
    this.loadedTranslations = await this.translationLoader.loadTranslations(
      this.config.translations
    );

    this.initialized = true;
  }

  /**
   * Check if renderer is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if word-by-word mode is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Render a page of words
   */
  renderPage(
    words: WordData[],
    context: WordByWordRenderContext
  ): WordByWordRenderResult {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'word-by-word-page');

    // Determine content bounds
    const contentBounds = context.contentBounds || {
      x: 0,
      y: 0,
      width: context.viewport.width,
      height: context.viewport.height,
    };

    // Enrich words with translations
    const enrichedWords = this.enrichWordsWithTranslations(words);

    // Calculate layout
    const rows = this.layoutCalculator.calculatePageLayout(
      enrichedWords,
      contentBounds,
      context.scale
    );

    // Render each row
    let totalHeight = 0;
    for (const row of rows) {
      const rowElement = this.renderRow(row, context);
      g.appendChild(rowElement);
      totalHeight = row.y + row.height;
    }

    return {
      element: g,
      rows,
      totalHeight,
    };
  }

  /**
   * Render a single row of words
   */
  private renderRow(row: WordRowLayout, context: WordByWordRenderContext): SVGGElement {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'word-row');
    g.setAttribute('transform', `translate(0, ${row.y})`);

    // Render background if configured
    if (row.backgroundColor) {
      const contentBounds = context.contentBounds || {
        x: 0,
        width: context.viewport.width,
      };
      const bg = document.createElementNS(SVG_NS, 'rect');
      bg.setAttribute('x', contentBounds.x.toString());
      bg.setAttribute('y', '0');
      bg.setAttribute('width', contentBounds.width.toString());
      bg.setAttribute('height', row.height.toString());
      bg.setAttribute('fill', row.backgroundColor);
      g.appendChild(bg);
    }

    // Render each word
    for (const wordLayout of row.words) {
      const wordElement = this.renderWord(wordLayout);
      g.appendChild(wordElement);
    }

    return g;
  }

  /**
   * Render a single word stack
   */
  private renderWord(layout: WordLayoutInfo): SVGGElement {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'word-stack');
    g.setAttribute('transform', `translate(${layout.x}, 0)`);
    g.setAttribute('data-surah', layout.word.surah.toString());
    g.setAttribute('data-ayah', layout.word.ayah.toString());
    g.setAttribute('data-word', layout.word.wordIndex.toString());

    // Render each component
    for (const component of layout.components) {
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('class', `word-${component.type}`);
      text.setAttribute('x', (layout.width / 2).toString());
      text.setAttribute('y', component.yOffset.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', component.fontSize.toString());
      text.setAttribute('font-family', component.fontFamily);
      text.setAttribute('fill', component.color);

      if (component.fontWeight) {
        text.setAttribute('font-weight', component.fontWeight);
      }

      // Set direction based on component type
      if (component.type === 'arabic') {
        text.setAttribute('direction', 'rtl');
      }

      if (component.language) {
        text.setAttribute('data-language', component.language);
      }

      text.textContent = component.text;
      g.appendChild(text);
    }

    return g;
  }

  /**
   * Enrich word data with loaded translations
   */
  private enrichWordsWithTranslations(words: WordData[]): WordData[] {
    return words.map((word) => {
      const translations = this.translationLoader.getWordTranslations(
        this.loadedTranslations,
        word.surah,
        word.ayah,
        word.wordIndex
      );

      // Get transliteration if available
      let transliteration = word.transliteration;
      if (!transliteration) {
        for (const data of this.loadedTranslations.values()) {
          const translit = this.translationLoader.getWordTransliteration(
            data,
            word.surah,
            word.ayah,
            word.wordIndex
          );
          if (translit) {
            transliteration = translit;
            break;
          }
        }
      }

      return {
        ...word,
        translations: { ...word.translations, ...translations },
        transliteration,
      };
    });
  }

  /**
   * Create word data from basic word info
   */
  createWordData(
    arabic: string,
    surah: number,
    ayah: number,
    wordIndex: number
  ): WordData {
    const key = `${surah}:${ayah}:${wordIndex}`;

    // Get translations from loaded data
    const translations = this.translationLoader.getWordTranslations(
      this.loadedTranslations,
      surah,
      ayah,
      wordIndex
    );

    // Get transliteration
    let transliteration: string | undefined;
    for (const data of this.loadedTranslations.values()) {
      const translit = this.translationLoader.getWordTransliteration(
        data,
        surah,
        ayah,
        wordIndex
      );
      if (translit) {
        transliteration = translit;
        break;
      }
    }

    return {
      key,
      arabic,
      surah,
      ayah,
      wordIndex,
      translations,
      transliteration,
    };
  }

  /**
   * Update configuration
   */
  async updateConfig(config: WordByWordConfig): Promise<void> {
    this.config = config;
    this.layoutCalculator.updateConfig(config);

    // Reload translations if changed
    const newLanguages = new Set(config.translations.map((t) => t.language));
    const currentLanguages = new Set(this.loadedTranslations.keys());

    const needsReload =
      newLanguages.size !== currentLanguages.size ||
      [...newLanguages].some((lang) => !currentLanguages.has(lang));

    if (needsReload) {
      this.initialized = false;
      this.loadedTranslations.clear();
      await this.initialize();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): WordByWordConfig {
    return this.config;
  }

  /**
   * Get the translation loader instance
   */
  getTranslationLoader(): TranslationDataLoader {
    return this.translationLoader;
  }

  /**
   * Get the layout calculator instance
   */
  getLayoutCalculator(): WordStackLayout {
    return this.layoutCalculator;
  }
}
