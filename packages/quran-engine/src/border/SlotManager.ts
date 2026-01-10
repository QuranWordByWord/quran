/**
 * @digitalkhatt/quran-engine - SVG Slot Manager
 *
 * Manages named slots within SVG templates for content injection
 */

import type { SlotDefinition } from '../config/mushaf-config';

export class SlotManager {
  private template: SVGSVGElement;
  private slots: Map<string, Element> = new Map();
  private slotDefinitions: Record<string, SlotDefinition>;

  constructor(
    svgTemplate: string | SVGSVGElement,
    slotDefinitions: Record<string, SlotDefinition>
  ) {
    this.slotDefinitions = slotDefinitions;

    if (typeof svgTemplate === 'string') {
      this.template = this.parseTemplate(svgTemplate);
    } else {
      this.template = svgTemplate.cloneNode(true) as SVGSVGElement;
    }

    this.findSlots();
  }

  private parseTemplate(svg: string): SVGSVGElement {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error(`Failed to parse SVG template: ${parseError.textContent}`);
    }
    return doc.documentElement as unknown as SVGSVGElement;
  }

  private findSlots(): void {
    // Find slots by data-slot attribute
    const dataSlotElements = this.template.querySelectorAll('[data-slot]');
    dataSlotElements.forEach((el) => {
      const slotName = el.getAttribute('data-slot');
      if (slotName) {
        this.slots.set(slotName, el);
      }
    });

    // Find slots by selector from definitions
    for (const [name, definition] of Object.entries(this.slotDefinitions)) {
      if (!this.slots.has(name) && definition.selector) {
        const element = this.template.querySelector(definition.selector);
        if (element) {
          this.slots.set(name, element);
        }
      }
    }
  }

  /**
   * Check if a slot exists in the template
   */
  hasSlot(slotName: string): boolean {
    return this.slots.has(slotName);
  }

  /**
   * Get all available slot names
   */
  getSlotNames(): string[] {
    return Array.from(this.slots.keys());
  }

  /**
   * Get a slot element by name
   */
  getSlot(slotName: string): Element | undefined {
    return this.slots.get(slotName);
  }

  /**
   * Inject text content into a slot
   */
  injectText(slotName: string, text: string): void {
    const slot = this.slots.get(slotName);
    if (!slot) return;
    slot.textContent = text;
  }

  /**
   * Inject SVG content into a slot
   */
  injectSVG(slotName: string, svgContent: SVGElement | string): void {
    const slot = this.slots.get(slotName);
    if (!slot) return;
    slot.innerHTML = '';
    if (typeof svgContent === 'string') {
      slot.innerHTML = svgContent;
    } else {
      slot.appendChild(svgContent.cloneNode(true));
    }
  }

  /**
   * Inject HTML content into a slot
   */
  injectHTML(slotName: string, htmlContent: HTMLElement | string): void {
    const slot = this.slots.get(slotName);
    if (!slot) return;
    slot.innerHTML = '';
    if (typeof htmlContent === 'string') {
      slot.innerHTML = htmlContent;
    } else {
      // For HTML elements in SVG, we need to use foreignObject
      const foreignObject = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'foreignObject'
      );
      foreignObject.appendChild(htmlContent.cloneNode(true));
      slot.appendChild(foreignObject);
    }
  }

  /**
   * Apply styles to a slot
   */
  applyStyles(slotName: string, styles: Record<string, string>): void {
    const slot = this.slots.get(slotName);
    if (!slot || !(slot instanceof SVGElement || slot instanceof HTMLElement)) return;

    for (const [property, value] of Object.entries(styles)) {
      (slot as SVGElement).style.setProperty(property, value);
    }
  }

  /**
   * Get the bounding box of a slot element
   */
  getSlotBounds(slotName: string): DOMRect | null {
    const slot = this.slots.get(slotName);
    if (!slot || !(slot instanceof SVGGraphicsElement)) return null;
    try {
      return slot.getBBox();
    } catch {
      // getBBox can fail if element is not rendered
      return null;
    }
  }

  /**
   * Get slot bounds from attributes (x, y, width, height)
   * This is useful when getBBox is not available (e.g., rect elements)
   */
  getSlotBoundsFromAttributes(slotName: string): {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null {
    const slot = this.slots.get(slotName);
    if (!slot) return null;

    const x = parseFloat(slot.getAttribute('x') || '0');
    const y = parseFloat(slot.getAttribute('y') || '0');
    const width = parseFloat(slot.getAttribute('width') || '0');
    const height = parseFloat(slot.getAttribute('height') || '0');

    if (width === 0 || height === 0) return null;

    return { x, y, width, height };
  }

  /**
   * Render the template with all injected content
   */
  render(): SVGSVGElement {
    return this.template.cloneNode(true) as SVGSVGElement;
  }

  /**
   * Get the original template (without cloning)
   */
  getTemplate(): SVGSVGElement {
    return this.template;
  }
}
