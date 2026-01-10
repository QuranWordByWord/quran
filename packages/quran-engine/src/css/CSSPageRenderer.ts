/**
 * @digitalkhatt/quran-engine - CSS Page Renderer
 *
 * Renders a complete page of Quran text using CSS-based text rendering.
 * Uses font-feature-settings for justification instead of SVG glyphs.
 * Extracted from otfmushaf/page_view.ts for framework-agnostic use.
 */

import type {
  MushafLayoutType,
  PageFormat,
  JustStyle,
  JustResultByLine,
  LineTextInfo,
} from '../core/types';
import {
  MushafLayoutType as MushafLayoutTypeEnum,
  JustStyle as JustStyleEnum,
  INTERLINE,
  MARGIN,
  PAGE_WIDTH,
  FONTSIZE,
} from '../core/types';
import type { QuranTextServiceLike } from '../core/justification';
import { analyzeLineForJust, justifyLine } from '../core/justification';
import { HarfBuzzFont, getWidth } from '../core/harfbuzz';

/**
 * Word click callback info
 */
export interface CSSWordClickInfo {
  pageIndex: number;
  lineIndex: number;
  wordIndex: number;
  text: string;
  element: HTMLElement;
}

/**
 * Options for CSS page rendering
 */
export interface CSSPageRenderOptions {
  /** Enable tajweed coloring */
  tajweedEnabled: boolean;
  /** Enable clickable words */
  enableWordClick?: boolean;
  /** Callback when a word is clicked */
  onWordClick?: (info: CSSWordClickInfo) => void;
  /** Justification style */
  justStyle?: JustStyle;
  /** Optional function to apply tajweed coloring (returns array of maps per line) */
  applyTajweed?: (pageIndex: number) => Array<Map<number, string>>;
}

/**
 * Configuration for CSSPageRenderer
 */
export interface CSSPageRendererConfig {
  /** HarfBuzz font instance for justification analysis */
  font: HarfBuzzFont;
  /** Quran text service for text and line info */
  textService: QuranTextServiceLike;
  /** Mushaf layout type */
  mushafType: MushafLayoutType;
}

/**
 * Highlight group for verses or words
 */
export interface CSSHighlightGroup {
  /** Verses to highlight (identified by surah:ayah) */
  verses?: Array<{ surah: number; ayah: number }>;
  /** Individual words to highlight (page, line, word indices) */
  words?: Array<{ page: number; line: number; word: number }>;
  /** Highlight background color */
  color: string;
}

/**
 * Result of rendering a full page
 */
export interface CSSPageRenderResult {
  /** Array of rendered line elements */
  lineElements: HTMLElement[];
  /** Time taken to render in milliseconds */
  renderTime: number;
  /** Word elements for hit testing */
  wordElements?: Map<string, HTMLElement>;
}

/**
 * Detect Safari browser for workarounds
 */
const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

/**
 * CSS Page Renderer
 *
 * Renders a complete page of Quran text using CSS-based text rendering.
 * This is a simpler approach than SVG glyph rendering, using the browser's
 * native text rendering with OpenType font features.
 */
export class CSSPageRenderer {
  private font: HarfBuzzFont;
  private textService: QuranTextServiceLike;
  private mushafType: MushafLayoutType;
  private spaceWidth: number;

  constructor(config: CSSPageRendererConfig) {
    this.font = config.font;
    this.textService = config.textService;
    this.mushafType = config.mushafType;
    this.spaceWidth = getWidth(' ', this.font, FONTSIZE, null);
  }

  /**
   * Render a complete page
   *
   * @param pageIndex - Zero-based page index
   * @param viewport - Page dimensions and font size
   * @param options - Rendering options
   * @returns Array of rendered line elements
   */
  renderPage(
    pageIndex: number,
    viewport: PageFormat,
    options: CSSPageRenderOptions
  ): CSSPageRenderResult {
    const startTime = performance.now();
    const quranText = this.textService.quranText;
    const lineCount = quranText[pageIndex].length;
    const lineElements: HTMLElement[] = [];
    const wordElements = new Map<string, HTMLElement>();

    const scale = viewport.width / PAGE_WIDTH;
    const defaultMargin = MARGIN * scale;
    const lineWidth = viewport.width - 2 * defaultMargin;
    const fontSizeLineWidthRatio = viewport.fontSize / lineWidth;
    const isFirstTwoPages = pageIndex === 0 || pageIndex === 1;

    // Get tajweed coloring if enabled
    let tajweedResult: Array<Map<number, string>> | undefined;
    if (options.tajweedEnabled && options.applyTajweed) {
      tajweedResult = options.applyTajweed(pageIndex);
    }

    // Render each line
    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      const isBism = isFirstTwoPages && lineIndex === 1;
      const lineInfo = this.textService.getLineInfo(pageIndex, lineIndex);
      const lineText = quranText[pageIndex][lineIndex];
      const lineElem = document.createElement('div');
      lineElem.classList.add('line');

      let margin = defaultMargin;

      // Line type 0: Content line (justified with HarfBuzz analysis + CSS)
      if (lineInfo.lineType === 0 && !isBism) {
        if (lineInfo.lineWidthRatio !== 1) {
          const newLineWidth = lineWidth * lineInfo.lineWidthRatio;
          margin += (lineWidth - newLineWidth) / 2;
        }

        lineElem.style.marginLeft = margin + 'px';
        lineElem.style.marginRight = lineElem.style.marginLeft;
        lineElem.style.height = INTERLINE * scale + 'px';

        // Analyze and justify the line using HarfBuzz
        const lineTextInfo = analyzeLineForJust(this.textService, pageIndex, lineIndex);
        const justResult = justifyLine(
          lineTextInfo,
          this.font,
          fontSizeLineWidthRatio / lineInfo.lineWidthRatio,
          this.spaceWidth,
          this.mushafType,
          options.justStyle ?? JustStyleEnum.SCLXAxis
        );

        const innerSpan = document.createElement('div');
        innerSpan.classList.add('justifyline');
        innerSpan.style.display = 'inline-block'; // Ensure proper width measurement

        // Apply font features from justification analysis
        const fontFeatures = this.buildFontFeatureSettings(justResult, lineTextInfo);
        if (fontFeatures) {
          innerSpan.style.fontFeatureSettings = fontFeatures;
        }

        // Note: scaleX is applied post-render by applyWidthCorrections()
        // to ensure correct width after CSS font-feature-settings are applied

        // Handle sajda (prostration) marking or word-level rendering
        if (options.enableWordClick) {
          this.renderLineWithWords(
            innerSpan,
            lineText,
            pageIndex,
            lineIndex,
            wordElements,
            options,
            lineInfo.sajda,
            tajweedResult?.[lineIndex],
            lineTextInfo
          );
        } else if (lineInfo.sajda) {
          innerSpan.innerHTML = this.renderSajdaText(lineText, lineInfo.sajda);
        } else if (tajweedResult?.[lineIndex] && options.tajweedEnabled) {
          // Render with tajweed colors
          this.renderLineWithTajweed(innerSpan, lineText, tajweedResult[lineIndex]);
        } else {
          innerSpan.textContent = lineText;
        }

        innerSpan.style.lineHeight = lineElem.style.height;
        innerSpan.style.fontSize = viewport.fontSize + 'px';
        lineElem.appendChild(innerSpan);

      } else if (lineInfo.lineType === 1) {
        // Sura header line
        lineElem.style.textAlign = 'center';
        lineElem.style.marginLeft = margin + 'px';
        lineElem.style.marginRight = lineElem.style.marginLeft;
        lineElem.style.height = INTERLINE * scale + 'px';
        lineElem.classList.add('linesuran');

        if (isFirstTwoPages) {
          lineElem.style.paddingBottom = 2 * scale * INTERLINE + 'px';
        }

        const innerSpan = document.createElement('span');
        innerSpan.textContent = lineText;
        innerSpan.classList.add('innersura');
        innerSpan.style.lineHeight = lineElem.style.height;
        innerSpan.style.fontSize = viewport.fontSize * 0.9 + 'px';
        lineElem.appendChild(innerSpan);

      } else if (lineInfo.lineType === 2 || isBism) {
        // Basmala line
        lineElem.style.textAlign = 'center';
        lineElem.style.marginLeft = margin + 'px';
        lineElem.style.marginRight = lineElem.style.marginLeft;
        lineElem.style.height = INTERLINE * scale + 'px';
        lineElem.classList.add('linebism');

        const innerSpan = document.createElement('span');
        innerSpan.textContent = lineText;

        if (isFirstTwoPages) {
          innerSpan.classList.add('bismfeature');
          if (isSafari) {
            if (this.mushafType !== MushafLayoutTypeEnum.IndoPak15Lines) {
              innerSpan.style.left = 350 * scale + 'px';
            }
            innerSpan.style.fontSize = viewport.fontSize + 'px';
          }
        } else {
          innerSpan.classList.add('basmfeature');
          if (isSafari) {
            if (this.mushafType === MushafLayoutTypeEnum.NewMadinah) {
              innerSpan.style.left = 700 * scale + 'px';
            } else if (this.mushafType === MushafLayoutTypeEnum.OldMadinah) {
              innerSpan.style.right = 1500 * scale + 'px';
            }
            innerSpan.style.fontSize = viewport.fontSize * 0.9 + 'px';
          }
        }

        innerSpan.style.lineHeight = lineElem.style.height;
        innerSpan.style.fontSize = viewport.fontSize * 0.95 + 'px';
        lineElem.appendChild(innerSpan);
      }

      lineElements.push(lineElem);
    }

    const endTime = performance.now();

    return {
      lineElements,
      renderTime: endTime - startTime,
      wordElements: wordElements.size > 0 ? wordElements : undefined,
    };
  }

  /**
   * Render a line with individual word spans for click handling
   */
  private renderLineWithWords(
    container: HTMLElement,
    lineText: string,
    pageIndex: number,
    lineIndex: number,
    wordElements: Map<string, HTMLElement>,
    options: CSSPageRenderOptions,
    sajda?: { text?: string },
    tajweedResult?: Map<number, string>,
    lineTextInfo?: LineTextInfo
  ): void {
    // Use word info from lineTextInfo if available for accurate word boundaries
    const wordInfos = lineTextInfo?.wordInfos;

    if (wordInfos) {
      // Use word boundaries from justification analysis
      wordInfos.forEach((wordInfo, wordIndex) => {
        if (wordInfo.text.length === 0) return;

        const wordSpan = document.createElement('span');
        wordSpan.classList.add('quran-word');

        // Render word with tajweed if available
        if (tajweedResult && options.tajweedEnabled) {
          this.renderWordWithTajweed(wordSpan, wordInfo.text, wordInfo.startIndex, tajweedResult);
        } else {
          wordSpan.textContent = wordInfo.text;
        }

        // Store word data attributes
        wordSpan.dataset.page = String(pageIndex);
        wordSpan.dataset.line = String(lineIndex);
        wordSpan.dataset.word = String(wordIndex);

        // Handle sajda marking on words
        if (sajda?.text && wordInfo.text.includes(sajda.text)) {
          wordSpan.classList.add('sajda');
        }

        // Add click handler if callback provided
        if (options.onWordClick) {
          wordSpan.style.cursor = 'pointer';
          wordSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            options.onWordClick!({
              pageIndex,
              lineIndex,
              wordIndex,
              text: wordInfo.text,
              element: wordSpan,
            });
          });
        }

        // Store in word elements map
        const key = `${pageIndex}:${lineIndex}:${wordIndex}`;
        wordElements.set(key, wordSpan);

        container.appendChild(wordSpan);

        // Add space between words (except last word)
        if (wordIndex < wordInfos.length - 1) {
          container.appendChild(document.createTextNode(' '));
        }
      });
    } else {
      // Fallback: Split line into words by spaces
      const words = lineText.split(' ');

      words.forEach((word, wordIndex) => {
        if (word.length === 0) return;

        const wordSpan = document.createElement('span');
        wordSpan.classList.add('quran-word');
        wordSpan.textContent = word;

        // Store word data attributes
        wordSpan.dataset.page = String(pageIndex);
        wordSpan.dataset.line = String(lineIndex);
        wordSpan.dataset.word = String(wordIndex);

        // Handle sajda marking on words
        if (sajda?.text && word.includes(sajda.text)) {
          wordSpan.classList.add('sajda');
        }

        // Add click handler if callback provided
        if (options.onWordClick) {
          wordSpan.style.cursor = 'pointer';
          wordSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            options.onWordClick!({
              pageIndex,
              lineIndex,
              wordIndex,
              text: word,
              element: wordSpan,
            });
          });
        }

        // Store in word elements map
        const key = `${pageIndex}:${lineIndex}:${wordIndex}`;
        wordElements.set(key, wordSpan);

        container.appendChild(wordSpan);

        // Add space between words (except last word)
        if (wordIndex < words.length - 1) {
          container.appendChild(document.createTextNode(' '));
        }
      });
    }
  }

  /**
   * Render text with sajda (prostration) marking
   */
  private renderSajdaText(lineText: string, sajda: { text?: string }): string {
    if (sajda.text) {
      return lineText.replace(sajda.text, `<span class='sajda'>${sajda.text}</span>`);
    }
    return lineText;
  }

  /**
   * Build CSS font-feature-settings string from justification result
   */
  private buildFontFeatureSettings(justResult: JustResultByLine, lineTextInfo: LineTextInfo): string {
    const features: string[] = [];

    // Add global features from justification (e.g., basm, bism)
    if (lineTextInfo.features) {
      for (const feat of lineTextInfo.features) {
        features.push(`"${feat.tag}" ${feat.value}`);
      }
    }

    // Add per-character features from justification
    // Note: CSS font-feature-settings applies to all text in the element,
    // so we collect unique features. Per-character features would need
    // character-level spans which we handle in renderWordWithTajweed.
    if (justResult.fontFeatures && justResult.fontFeatures.size > 0) {
      const uniqueFeatures = new Map<string, number>();

      for (const [, charFeatures] of justResult.fontFeatures) {
        for (const feat of charFeatures) {
          // For features like cv01, cv02, we take the max value across all characters
          const existing = uniqueFeatures.get(feat.name);
          if (existing === undefined || feat.value > existing) {
            uniqueFeatures.set(feat.name, feat.value);
          }
        }
      }

      for (const [name, value] of uniqueFeatures) {
        features.push(`"${name}" ${value}`);
      }
    }

    return features.join(', ');
  }

  /**
   * Render a line with tajweed coloring
   */
  private renderLineWithTajweed(
    container: HTMLElement,
    lineText: string,
    tajweedMap: Map<number, string>
  ): void {
    let currentClass: string | undefined;
    let currentSpan: HTMLSpanElement | null = null;

    for (let i = 0; i < lineText.length; i++) {
      const char = lineText[i];
      const tajweedClass = tajweedMap.get(i);

      if (tajweedClass !== currentClass) {
        // Start new span
        currentSpan = document.createElement('span');
        if (tajweedClass) {
          currentSpan.classList.add(tajweedClass);
        }
        container.appendChild(currentSpan);
        currentClass = tajweedClass;
      }

      if (currentSpan) {
        currentSpan.textContent += char;
      } else {
        // No span needed, append text directly
        container.appendChild(document.createTextNode(char));
      }
    }
  }

  /**
   * Render a word with tajweed coloring
   */
  private renderWordWithTajweed(
    wordSpan: HTMLElement,
    wordText: string,
    startIndex: number,
    tajweedMap: Map<number, string>
  ): void {
    let currentClass: string | undefined;
    let currentSpan: HTMLSpanElement | null = null;
    let plainText = '';

    for (let i = 0; i < wordText.length; i++) {
      const char = wordText[i];
      const lineIndex = startIndex + i;
      const tajweedClass = tajweedMap.get(lineIndex);

      if (tajweedClass !== currentClass) {
        // Append any accumulated plain text
        if (plainText) {
          wordSpan.appendChild(document.createTextNode(plainText));
          plainText = '';
        }

        // Finish current span if exists
        if (currentSpan) {
          wordSpan.appendChild(currentSpan);
        }

        // Start new span if we have a tajweed class
        if (tajweedClass) {
          currentSpan = document.createElement('span');
          currentSpan.classList.add(tajweedClass);
        } else {
          currentSpan = null;
        }
        currentClass = tajweedClass;
      }

      if (currentSpan) {
        currentSpan.textContent += char;
      } else {
        plainText += char;
      }
    }

    // Append remaining content
    if (plainText) {
      wordSpan.appendChild(document.createTextNode(plainText));
    }
    if (currentSpan) {
      wordSpan.appendChild(currentSpan);
    }
  }

  /**
   * Apply highlights to word elements
   */
  applyHighlights(
    wordElements: Map<string, Element>,
    highlightGroups: CSSHighlightGroup[],
    pageIndex: number
  ): void {
    // Clear existing highlights
    for (const [, element] of wordElements) {
      if (element instanceof HTMLElement) {
        element.style.backgroundColor = '';
      }
      element.classList.remove('highlighted');
    }

    // Apply each highlight group
    for (const group of highlightGroups) {
      if (group.words) {
        for (const word of group.words) {
          if (word.page === pageIndex) {
            const key = `${word.page}:${word.line}:${word.word}`;
            const element = wordElements.get(key);
            if (element) {
              if (element instanceof HTMLElement) {
                element.style.backgroundColor = group.color;
              }
              element.classList.add('highlighted');
            }
          }
        }
      }
    }
  }

  /**
   * Apply width corrections after elements are in the DOM
   * Call this after lineElements are appended to their container
   *
   * This fixes the issue where CSS font-feature-settings changes glyph widths
   * differently than what HarfBuzz predicted, causing text overflow or underflow.
   *
   * @param lineElements - The rendered line elements
   * @param viewport - Page format used during rendering
   * @param pageIndex - Zero-based page index
   */
  applyWidthCorrections(
    lineElements: HTMLElement[],
    viewport: PageFormat,
    pageIndex: number
  ): void {
    const scale = viewport.width / PAGE_WIDTH;
    const lineWidth = viewport.width - 2 * MARGIN * scale;
    const isFirstTwoPages = pageIndex === 0 || pageIndex === 1;

    lineElements.forEach((lineElem, lineIndex) => {
      const isBism = isFirstTwoPages && lineIndex === 1;
      const lineInfo = this.textService.getLineInfo(pageIndex, lineIndex);

      // Only apply corrections to content lines (lineType === 0)
      if (lineInfo.lineType !== 0 || isBism) return;

      const innerSpan = lineElem.querySelector('.justifyline') as HTMLElement;
      if (!innerSpan) {
        return;
      }

      // Calculate target width
      const targetWidth = lineWidth * (lineInfo.lineWidthRatio || 1);

      // Get actual rendered width
      const actualWidth = innerSpan.getBoundingClientRect().width;

      // Apply corrective scale if there's a significant difference
      // This handles both compression AND expansion
      if (actualWidth > 0 && Math.abs(actualWidth - targetWidth) > 1) {
        const correctedScale = targetWidth / actualWidth;

        innerSpan.style.transform = `scaleX(${correctedScale})`;
        innerSpan.style.transformOrigin = 'right';
      }
    });
  }
}
