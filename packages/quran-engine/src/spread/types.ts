/**
 * @digitalkhatt/quran-engine - Page Spread Types
 */

export type SpreadMode = 'single' | 'double';

export interface SpreadState {
  /** Current display mode */
  mode: SpreadMode;
  /** Left page number (in double mode) or current page (in single mode) */
  leftPageNumber: number;
  /** Right page number (in double mode, same as left in single mode) */
  rightPageNumber: number;
  /** Total number of pages */
  totalPages: number;
  /** Is this the first spread (containing page 1)? */
  isFirstSpread: boolean;
  /** Is this the last spread? */
  isLastSpread: boolean;
}

export interface SpreadDimensions {
  /** Total width of the spread */
  totalWidth: number;
  /** Total height of the spread */
  totalHeight: number;
  /** Left page bounds */
  leftPage: PageBounds;
  /** Right page bounds (same as left in single mode) */
  rightPage: PageBounds;
  /** Gutter area between pages (in double mode) */
  gutter?: GutterBounds;
}

export interface PageBounds {
  /** X position */
  x: number;
  /** Y position */
  y: number;
  /** Page width */
  width: number;
  /** Page height */
  height: number;
}

export interface GutterBounds {
  /** X position of gutter */
  x: number;
  /** Y position */
  y: number;
  /** Gutter width */
  width: number;
  /** Gutter height */
  height: number;
}

export interface SpreadNavigationInfo {
  /** Can navigate to previous spread */
  canGoPrevious: boolean;
  /** Can navigate to next spread */
  canGoNext: boolean;
  /** Previous spread's left page number */
  previousLeftPage: number | null;
  /** Next spread's left page number */
  nextLeftPage: number | null;
  /** Current spread index (0-based) */
  spreadIndex: number;
  /** Total number of spreads */
  totalSpreads: number;
}

export interface SpreadRenderContext {
  /** Viewport dimensions */
  viewport: { width: number; height: number };
  /** Scale factor */
  scale: number;
  /** Page aspect ratio (height / width) */
  pageAspectRatio: number;
}
