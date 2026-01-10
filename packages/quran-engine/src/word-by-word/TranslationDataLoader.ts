/**
 * @digitalkhatt/quran-engine - Translation Data Loader
 *
 * Loads and caches word-by-word translation data from various sources
 */

import type {
  WordTranslationData,
  WordTranslationConfig,
} from '../config/mushaf-config';

export class TranslationDataLoader {
  private cache: Map<string, WordTranslationData> = new Map();
  private loadingPromises: Map<string, Promise<WordTranslationData>> = new Map();

  /**
   * Load translation data from config
   * Handles both inline data and URL-based loading with caching
   */
  async loadTranslation(config: WordTranslationConfig): Promise<WordTranslationData> {
    // If data is inline, return it directly
    if (typeof config.data !== 'string') {
      return config.data;
    }

    const url = config.data;

    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Start loading
    const loadPromise = this.fetchTranslationData(url);
    this.loadingPromises.set(url, loadPromise);

    try {
      const data = await loadPromise;
      this.cache.set(url, data);
      return data;
    } finally {
      this.loadingPromises.delete(url);
    }
  }

  /**
   * Fetch translation data from URL
   */
  private async fetchTranslationData(url: string): Promise<WordTranslationData> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load translation data from ${url}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Load multiple translations in parallel
   */
  async loadTranslations(configs: WordTranslationConfig[]): Promise<Map<string, WordTranslationData>> {
    const results = new Map<string, WordTranslationData>();

    await Promise.all(
      configs.map(async (config) => {
        const data = await this.loadTranslation(config);
        results.set(config.language, data);
      })
    );

    return results;
  }

  /**
   * Get word translation for a specific word
   */
  getWordTranslation(
    data: WordTranslationData,
    surah: number,
    ayah: number,
    wordIndex: number
  ): string | undefined {
    const key = `${surah}:${ayah}:${wordIndex}`;
    return data.translations[key];
  }

  /**
   * Get word transliteration for a specific word
   */
  getWordTransliteration(
    data: WordTranslationData,
    surah: number,
    ayah: number,
    wordIndex: number
  ): string | undefined {
    if (!data.transliterations) return undefined;
    const key = `${surah}:${ayah}:${wordIndex}`;
    return data.transliterations[key];
  }

  /**
   * Get all translations for a word from multiple translation sources
   */
  getWordTranslations(
    translations: Map<string, WordTranslationData>,
    surah: number,
    ayah: number,
    wordIndex: number
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [language, data] of translations) {
      const translation = this.getWordTranslation(data, surah, ayah, wordIndex);
      if (translation) {
        result[language] = translation;
      }
    }

    return result;
  }

  /**
   * Preload translation data for a range of pages
   * Useful for preloading data before the user navigates
   */
  async preloadForPages(
    configs: WordTranslationConfig[],
    _startPage: number,
    _endPage: number
  ): Promise<void> {
    // For now, just load all translation data
    // Future optimization: load only data needed for specific pages
    await this.loadTranslations(configs);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if translation data is cached
   */
  isCached(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
