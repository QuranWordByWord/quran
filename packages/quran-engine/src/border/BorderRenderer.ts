/**
 * @digitalkhatt/quran-engine - Border Renderer
 *
 * Renders page borders using SVG templates or CSS fallback styles
 */

import type { MushafBorderConfig, SVGBorderTemplate } from '../config/mushaf-config';
import type { BorderRenderContext, BorderRenderResult, SlotContent } from './types';
import { SlotManager } from './SlotManager';

export class BorderRenderer {
  private config: MushafBorderConfig;
  private slotManagers: Map<string, SlotManager> = new Map();
  private initialized = false;

  constructor(config: MushafBorderConfig) {
    this.config = config;
  }

  /**
   * Initialize the border renderer by loading all templates
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled || this.initialized) return;

    const templates = [
      { key: 'default', template: this.config.template },
      { key: 'odd', template: this.config.oddPageTemplate },
      { key: 'even', template: this.config.evenPageTemplate },
    ];

    for (const { key, template } of templates) {
      if (template) {
        await this.loadTemplate(key, template);
      }
    }

    this.initialized = true;
  }

  /**
   * Load and parse an SVG template
   */
  private async loadTemplate(key: string, template: SVGBorderTemplate): Promise<void> {
    let svgString: string;

    if (
      template.svg instanceof URL ||
      (typeof template.svg === 'string' && template.svg.startsWith('http'))
    ) {
      const url = template.svg instanceof URL ? template.svg.toString() : template.svg;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load border template from ${url}`);
      }
      svgString = await response.text();
    } else {
      svgString = template.svg as string;
    }

    // Build slot definitions from template config
    const slotDefinitions: Record<string, { selector: string; type: 'text' | 'svg' | 'html' }> = {};

    if (template.slots.content) {
      slotDefinitions.content = template.slots.content;
    }
    if (template.slots.header) {
      slotDefinitions.header = template.slots.header;
    }
    if (template.slots.footer) {
      slotDefinitions.footer = template.slots.footer;
    }
    if (template.slots.leftMargin) {
      slotDefinitions.leftMargin = template.slots.leftMargin;
    }
    if (template.slots.rightMargin) {
      slotDefinitions.rightMargin = template.slots.rightMargin;
    }

    const slotManager = new SlotManager(svgString, slotDefinitions);
    this.slotManagers.set(key, slotManager);
  }

  /**
   * Get the appropriate template for a page
   */
  private getTemplateForPage(isOddPage: boolean): SlotManager | null {
    if (isOddPage && this.slotManagers.has('odd')) {
      return this.slotManagers.get('odd')!;
    }
    if (!isOddPage && this.slotManagers.has('even')) {
      return this.slotManagers.get('even')!;
    }
    return this.slotManagers.get('default') || null;
  }

  /**
   * Render the border for a page
   */
  render(context: BorderRenderContext, slotContents?: SlotContent[]): BorderRenderResult | null {
    if (!this.config.enabled) return null;

    const slotManager = this.getTemplateForPage(context.isOddPage);
    if (slotManager) {
      return this.renderSVGBorder(slotManager, context, slotContents);
    }
    return this.renderCSSBorder(context);
  }

  /**
   * Render border using SVG template
   */
  private renderSVGBorder(
    slotManager: SlotManager,
    context: BorderRenderContext,
    slotContents?: SlotContent[]
  ): BorderRenderResult {
    // Inject any provided slot contents
    if (slotContents) {
      for (const slot of slotContents) {
        switch (slot.type) {
          case 'text':
            slotManager.injectText(slot.name, slot.content as string);
            break;
          case 'svg':
            slotManager.injectSVG(slot.name, slot.content as SVGElement | string);
            break;
          case 'html':
            slotManager.injectHTML(slot.name, slot.content as HTMLElement | string);
            break;
        }
      }
    }

    const svg = slotManager.render();
    svg.setAttribute('width', context.viewport.width.toString());
    svg.setAttribute('height', context.viewport.height.toString());

    // Calculate content bounds
    const contentBounds = this.calculateContentBounds(slotManager, context);

    return { borderElement: svg, contentBounds };
  }

  /**
   * Calculate the content area bounds within the border
   */
  private calculateContentBounds(
    slotManager: SlotManager,
    context: BorderRenderContext
  ): { x: number; y: number; width: number; height: number } {
    // Try to get bounds from the content slot
    let bounds = slotManager.getSlotBoundsFromAttributes('content');

    if (!bounds) {
      bounds = slotManager.getSlotBounds('content') as {
        x: number;
        y: number;
        width: number;
        height: number;
      } | null;
    }

    // Get the template's viewBox for scaling
    const template =
      this.config.template || this.config.oddPageTemplate || this.config.evenPageTemplate;
    const viewBox = template?.viewBox || { width: 1700, height: 2700 };

    const scaleX = context.viewport.width / viewBox.width;
    const scaleY = context.viewport.height / viewBox.height;

    if (bounds) {
      return {
        x: bounds.x * scaleX,
        y: bounds.y * scaleY,
        width: bounds.width * scaleX,
        height: bounds.height * scaleY,
      };
    }

    // Default: full viewport with small margin
    const margin = 10 * context.scale;
    return {
      x: margin,
      y: margin,
      width: context.viewport.width - 2 * margin,
      height: context.viewport.height - 2 * margin,
    };
  }

  /**
   * Render border using CSS styles (fallback when no SVG template)
   */
  private renderCSSBorder(context: BorderRenderContext): BorderRenderResult {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', context.viewport.width.toString());
    svg.setAttribute('height', context.viewport.height.toString());
    svg.setAttribute('viewBox', `0 0 ${context.viewport.width} ${context.viewport.height}`);

    const styles = this.config.cssStyles;
    if (styles) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

      // Parse border width to get stroke width
      let strokeWidth = 2;
      if (styles.borderWidth) {
        const match = styles.borderWidth.match(/(\d+)/);
        if (match) {
          strokeWidth = parseInt(match[1], 10);
        }
      }

      // Position rect inside the stroke
      const halfStroke = strokeWidth / 2;
      rect.setAttribute('x', halfStroke.toString());
      rect.setAttribute('y', halfStroke.toString());
      rect.setAttribute('width', (context.viewport.width - strokeWidth).toString());
      rect.setAttribute('height', (context.viewport.height - strokeWidth).toString());
      rect.setAttribute('fill', 'none');

      if (styles.borderColor) {
        rect.setAttribute('stroke', styles.borderColor);
      }
      rect.setAttribute('stroke-width', strokeWidth.toString());

      // Handle border style
      if (styles.borderStyle === 'dashed') {
        rect.setAttribute('stroke-dasharray', '10,5');
      } else if (styles.borderStyle === 'dotted') {
        rect.setAttribute('stroke-dasharray', '2,2');
      } else if (styles.borderStyle === 'double') {
        // For double border, create two rects
        const outerRect = rect.cloneNode() as SVGRectElement;
        const innerOffset = strokeWidth * 2;
        rect.setAttribute('x', (halfStroke + innerOffset).toString());
        rect.setAttribute('y', (halfStroke + innerOffset).toString());
        rect.setAttribute('width', (context.viewport.width - strokeWidth - innerOffset * 2).toString());
        rect.setAttribute('height', (context.viewport.height - strokeWidth - innerOffset * 2).toString());
        svg.appendChild(outerRect);
      }

      // Handle border radius
      if (styles.borderRadius) {
        const radiusMatch = styles.borderRadius.match(/(\d+)/);
        if (radiusMatch) {
          const radius = parseInt(radiusMatch[1], 10);
          rect.setAttribute('rx', radius.toString());
          rect.setAttribute('ry', radius.toString());
        }
      }

      svg.appendChild(rect);
    }

    // Render inner frame if configured
    if (this.config.innerFrame) {
      this.renderInnerFrame(svg, context);
    }

    // Render corner decorations if configured
    if (this.config.corners) {
      this.renderCorners(svg, context);
    }

    // Calculate content bounds
    const margin = styles?.borderWidth ? parseInt(styles.borderWidth, 10) * 2 + 10 : 10;
    return {
      borderElement: svg,
      contentBounds: {
        x: margin,
        y: margin,
        width: context.viewport.width - 2 * margin,
        height: context.viewport.height - 2 * margin,
      },
    };
  }

  /**
   * Render inner frame within the border
   */
  private renderInnerFrame(svg: SVGSVGElement, _context: BorderRenderContext): void {
    const frame = this.config.innerFrame;
    if (!frame) return;

    if (frame.path) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', frame.path);
      if (frame.strokeColor) path.setAttribute('stroke', frame.strokeColor);
      if (frame.strokeWidth) path.setAttribute('stroke-width', frame.strokeWidth.toString());
      if (frame.fillColor) {
        path.setAttribute('fill', frame.fillColor);
      } else {
        path.setAttribute('fill', 'none');
      }
      svg.appendChild(path);
    }
  }

  /**
   * Render corner decorations
   */
  private renderCorners(svg: SVGSVGElement, context: BorderRenderContext): void {
    const corners = this.config.corners;
    if (!corners) return;

    const positions = [
      { key: 'topLeft' as const, x: 0, y: 0, transform: '' },
      { key: 'topRight' as const, x: context.viewport.width, y: 0, transform: 'scale(-1, 1)' },
      { key: 'bottomLeft' as const, x: 0, y: context.viewport.height, transform: 'scale(1, -1)' },
      {
        key: 'bottomRight' as const,
        x: context.viewport.width,
        y: context.viewport.height,
        transform: 'scale(-1, -1)',
      },
    ];

    for (const pos of positions) {
      const cornerSvg = corners[pos.key];
      if (!cornerSvg) continue;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${pos.x}, ${pos.y}) ${pos.transform}`);

      if (typeof cornerSvg === 'string' && !cornerSvg.startsWith('http')) {
        // Inline SVG content
        g.innerHTML = cornerSvg;
      } else {
        // URL - would need async loading, skip for now
        // Could be implemented with use element if pre-loaded
      }

      svg.appendChild(g);
    }
  }

  /**
   * Check if the renderer is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if borders are enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get the current configuration
   */
  getConfig(): MushafBorderConfig {
    return this.config;
  }

  /**
   * Update the configuration
   */
  updateConfig(config: MushafBorderConfig): void {
    this.config = config;
    this.initialized = false;
    this.slotManagers.clear();
  }
}
