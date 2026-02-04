/**
 * @digitalkhatt/quran-engine - Border System Types
 */

export interface BorderRenderContext {
  /** Page number (1-indexed) */
  pageNumber: number;
  /** Is this an odd page? */
  isOddPage: boolean;
  /** Viewport dimensions */
  viewport: { width: number; height: number };
  /** Scale factor */
  scale: number;
}

export interface SlotContent {
  /** Slot name */
  name: string;
  /** Content to inject */
  content: string | SVGElement | HTMLElement;
  /** Content type */
  type: 'text' | 'svg' | 'html';
}

export interface BorderRenderResult {
  /** The complete border SVG element */
  borderElement: SVGSVGElement;
  /** Content area bounds (where Quran text goes) */
  contentBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ParsedBorderTemplate {
  /** The parsed SVG document */
  svg: SVGSVGElement;
  /** Map of slot names to elements */
  slots: Map<string, Element>;
  /** Original viewBox */
  viewBox: { x: number; y: number; width: number; height: number };
}
