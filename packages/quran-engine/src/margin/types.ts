/**
 * @digitalkhatt/quran-engine - Margin Annotation Types
 */

export interface MarginRenderContext {
  /** Page number (1-indexed) */
  pageNumber: number;
  /** Viewport dimensions */
  viewport: { width: number; height: number };
  /** Scale factor */
  scale: number;
  /** Line height in scaled units */
  lineHeight: number;
  /** Top margin offset */
  topMargin: number;
  /** Number of lines on the page */
  linesPerPage: number;
}

export interface MarginRenderResult {
  /** Left margin annotations */
  leftMargin?: SVGGElement;
  /** Right margin annotations */
  rightMargin?: SVGGElement;
  /** Header annotations (juz, hizb, etc.) */
  headerAnnotations?: SVGGElement;
  /** Sajdah markers with their line positions */
  sajdahMarkers?: Array<{ line: number; element: SVGElement }>;
}

export interface AnnotationPosition {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
  /** Width of the annotation */
  width: number;
  /** Height of the annotation */
  height: number;
}
