/**
 * @digitalkhatt/quran-engine - Margin Annotation Renderer
 *
 * Renders margin annotations such as Juz, Hizb, Manzil, Ruku, and Sajdah markers
 */

import type { MarginAnnotationConfig } from '../config/mushaf-config';
import type { MarginRenderContext, MarginRenderResult } from './types';
import {
  getPageAnnotations,
  getJuzForPage,
  getJuzName,
  toArabicIndic,
  type SajdahPosition,
} from './annotation-data';

const SVG_NS = 'http://www.w3.org/2000/svg';

export class MarginAnnotationRenderer {
  private config: MarginAnnotationConfig;

  constructor(config: MarginAnnotationConfig) {
    this.config = config;
  }

  /**
   * Render all margin annotations for a page
   */
  render(context: MarginRenderContext): MarginRenderResult {
    if (!this.config.enabled) {
      return {};
    }

    const result: MarginRenderResult = {};
    const annotations = getPageAnnotations(context.pageNumber);

    // Initialize margin groups
    const leftMarginGroup = document.createElementNS(SVG_NS, 'g');
    leftMarginGroup.setAttribute('class', 'margin-annotations margin-left');

    const rightMarginGroup = document.createElementNS(SVG_NS, 'g');
    rightMarginGroup.setAttribute('class', 'margin-annotations margin-right');

    const headerGroup = document.createElementNS(SVG_NS, 'g');
    headerGroup.setAttribute('class', 'margin-annotations margin-header');

    let hasLeftContent = false;
    let hasRightContent = false;
    let hasHeaderContent = false;

    // Render Juz marker if this page starts a new juz
    if (this.config.juz?.enabled && annotations.juz) {
      const juzElement = this.renderJuzMarker(annotations.juz.juz, context);
      const position = this.config.juz.position;

      if (position === 'left') {
        leftMarginGroup.appendChild(juzElement);
        hasLeftContent = true;
      } else if (position === 'right') {
        rightMarginGroup.appendChild(juzElement);
        hasRightContent = true;
      } else if (position === 'header') {
        headerGroup.appendChild(juzElement);
        hasHeaderContent = true;
      }
    }

    // Render Manzil marker if this page starts a new manzil
    if (this.config.manzil?.enabled && annotations.manzil) {
      const manzilElement = this.renderManzilMarker(annotations.manzil.manzil, context);
      const position = this.config.manzil.position;

      if (position === 'left') {
        leftMarginGroup.appendChild(manzilElement);
        hasLeftContent = true;
      } else if (position === 'right') {
        rightMarginGroup.appendChild(manzilElement);
        hasRightContent = true;
      } else if (position === 'header') {
        headerGroup.appendChild(manzilElement);
        hasHeaderContent = true;
      }
    }

    // Render Sajdah markers
    if (this.config.sajdah?.enabled && annotations.sajdah.length > 0) {
      result.sajdahMarkers = annotations.sajdah.map((sajdah) =>
        this.renderSajdahMarker(sajdah, context)
      );
    }

    // Add current juz indicator in header if configured
    if (this.config.juz?.enabled && this.config.juz.position === 'header' && !annotations.juz) {
      const currentJuz = getJuzForPage(context.pageNumber);
      const juzIndicator = this.renderJuzIndicator(currentJuz, context);
      headerGroup.appendChild(juzIndicator);
      hasHeaderContent = true;
    }

    // Set results
    if (hasLeftContent) {
      result.leftMargin = leftMarginGroup;
    }
    if (hasRightContent) {
      result.rightMargin = rightMarginGroup;
    }
    if (hasHeaderContent) {
      result.headerAnnotations = headerGroup;
    }

    return result;
  }

  /**
   * Render a Juz start marker
   */
  private renderJuzMarker(juzNumber: number, context: MarginRenderContext): SVGGElement {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'juz-marker juz-start');

    const config = this.config.juz!;

    // Create decorative frame
    const frame = document.createElementNS(SVG_NS, 'rect');
    const frameWidth = 60 * context.scale;
    const frameHeight = 30 * context.scale;
    frame.setAttribute('width', frameWidth.toString());
    frame.setAttribute('height', frameHeight.toString());
    frame.setAttribute('rx', (4 * context.scale).toString());
    frame.setAttribute('fill', '#F5F5DC');
    frame.setAttribute('stroke', '#DAA520');
    frame.setAttribute('stroke-width', (1 * context.scale).toString());
    g.appendChild(frame);

    // Create text
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', (frameWidth / 2).toString());
    text.setAttribute('y', (frameHeight / 2 + 4 * context.scale).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', (config.font?.size || 12 * context.scale).toString());
    text.setAttribute('font-family', config.font?.family || 'Arial');
    text.setAttribute('fill', config.font?.color || '#000000');

    // Format based on displayFormat
    let displayText: string;
    if (config.displayFormat === 'name') {
      displayText = getJuzName(juzNumber);
    } else if (config.displayFormat === 'both') {
      displayText = `${toArabicIndic(juzNumber)} - ${getJuzName(juzNumber)}`;
    } else {
      displayText = toArabicIndic(juzNumber);
    }
    text.textContent = displayText;
    g.appendChild(text);

    // Position the marker
    g.setAttribute('transform', `translate(10, ${context.topMargin})`);

    return g;
  }

  /**
   * Render a Juz indicator (shown on all pages, not just start)
   */
  private renderJuzIndicator(juzNumber: number, context: MarginRenderContext): SVGGElement {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'juz-indicator');

    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', (context.viewport.width / 2).toString());
    text.setAttribute('y', (context.topMargin / 2).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', (10 * context.scale).toString());
    text.setAttribute('font-family', 'Arial');
    text.setAttribute('fill', '#666666');
    text.textContent = `الجزء ${toArabicIndic(juzNumber)}`;
    g.appendChild(text);

    return g;
  }

  /**
   * Render a Manzil marker
   */
  private renderManzilMarker(manzilNumber: number, context: MarginRenderContext): SVGGElement {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'manzil-marker');

    // Create circle marker
    const circle = document.createElementNS(SVG_NS, 'circle');
    const radius = 15 * context.scale;
    circle.setAttribute('cx', radius.toString());
    circle.setAttribute('cy', radius.toString());
    circle.setAttribute('r', radius.toString());
    circle.setAttribute('fill', '#E8F5E9');
    circle.setAttribute('stroke', '#228B22');
    circle.setAttribute('stroke-width', (1.5 * context.scale).toString());
    g.appendChild(circle);

    // Create text
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', radius.toString());
    text.setAttribute('y', (radius + 4 * context.scale).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', (12 * context.scale).toString());
    text.setAttribute('font-family', 'Arial');
    text.setAttribute('fill', '#228B22');
    text.textContent = toArabicIndic(manzilNumber);
    g.appendChild(text);

    // Position the marker
    const yPosition = context.topMargin + 50 * context.scale;
    g.setAttribute('transform', `translate(10, ${yPosition})`);

    return g;
  }

  /**
   * Render a Ruku marker
   * Public method for rendering ruku markers when ruku data is available
   */
  renderRukuMarker(
    rukuNumber: number,
    lineNumber: number,
    context: MarginRenderContext
  ): SVGGElement {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'ruku-marker');

    const config = this.config.ruku;

    // Create symbol (عين for ruku)
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('font-size', (config?.font?.size || 14 * context.scale).toString());
    text.setAttribute('font-family', config?.font?.family || 'Arial');
    text.setAttribute('fill', config?.font?.color || '#8B4513');
    text.textContent = `ع${toArabicIndic(rukuNumber)}`;
    g.appendChild(text);

    // Position based on line number
    const yPosition = context.topMargin + (lineNumber - 1) * context.lineHeight;
    const xPosition = config?.position === 'left' ? 5 : context.viewport.width - 30 * context.scale;
    g.setAttribute('transform', `translate(${xPosition}, ${yPosition})`);

    return g;
  }

  /**
   * Render a Sajdah marker
   */
  private renderSajdahMarker(
    sajdah: SajdahPosition,
    context: MarginRenderContext
  ): { line: number; element: SVGElement } {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', `sajdah-marker sajdah-${sajdah.type}`);

    const config = this.config.sajdah!;
    const color = config.color || '#FF0000';

    if (config.style === 'underline' || config.style === 'both') {
      // Create underline
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', '0');
      line.setAttribute('x2', (context.viewport.width - 40 * context.scale).toString());
      line.setAttribute('y2', '0');
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', (2 * context.scale).toString());
      line.setAttribute('stroke-dasharray', sajdah.type === 'wajib' ? 'none' : '5,3');
      g.appendChild(line);
    }

    if (config.style === 'symbol' || config.style === 'both') {
      // Create sajdah symbol (۩)
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', '-20');
      text.setAttribute('y', '0');
      text.setAttribute('font-size', (16 * context.scale).toString());
      text.setAttribute('fill', color);
      text.textContent = '۩';
      g.appendChild(text);
    }

    // Position based on line number
    const yPosition = context.topMargin + sajdah.line * context.lineHeight;
    g.setAttribute('transform', `translate(20, ${yPosition})`);

    return { line: sajdah.line, element: g };
  }

  /**
   * Update configuration
   */
  updateConfig(config: MarginAnnotationConfig): void {
    this.config = config;
  }

  /**
   * Get current configuration
   */
  getConfig(): MarginAnnotationConfig {
    return this.config;
  }

  /**
   * Check if annotations are enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}
