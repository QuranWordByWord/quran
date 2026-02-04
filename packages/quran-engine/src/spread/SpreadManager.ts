/**
 * @digitalkhatt/quran-engine - Spread Manager
 *
 * Manages single and double page spread layouts for book-like viewing
 */

import type { PageSpreadConfig } from '../config/mushaf-config';
import type {
  SpreadMode,
  SpreadState,
  SpreadDimensions,
  SpreadNavigationInfo,
  SpreadRenderContext,
} from './types';

export class SpreadManager {
  private config: PageSpreadConfig;
  private currentMode: SpreadMode;
  private totalPages: number;
  private currentPage: number = 1;

  constructor(config: PageSpreadConfig, totalPages: number) {
    this.config = config;
    this.totalPages = totalPages;
    this.currentMode = this.resolveInitialMode();
  }

  /**
   * Resolve initial mode based on config
   */
  private resolveInitialMode(): SpreadMode {
    if (this.config.defaultMode === 'auto') {
      // Default to single until viewport is known
      return 'single';
    }
    return this.config.defaultMode;
  }

  /**
   * Update mode based on viewport width
   */
  updateModeForViewport(viewportWidth: number): SpreadMode {
    if (this.config.defaultMode !== 'auto') {
      return this.currentMode;
    }

    const breakpoint = this.config.autoBreakpoint || 800;
    this.currentMode = viewportWidth >= breakpoint ? 'double' : 'single';
    return this.currentMode;
  }

  /**
   * Get current spread mode
   */
  getMode(): SpreadMode {
    return this.currentMode;
  }

  /**
   * Set spread mode directly
   */
  setMode(mode: SpreadMode): void {
    this.currentMode = mode;
  }

  /**
   * Get spread state for a given page number
   */
  getSpreadState(pageNumber: number): SpreadState {
    this.currentPage = pageNumber;

    if (this.currentMode === 'single') {
      return {
        mode: 'single',
        leftPageNumber: pageNumber,
        rightPageNumber: pageNumber,
        totalPages: this.totalPages,
        isFirstSpread: pageNumber === 1,
        isLastSpread: pageNumber === this.totalPages,
      };
    }

    // Double page mode
    const rightPageParity = this.config.spread?.rightPageParity || 'even';
    const isRightPage =
      rightPageParity === 'even' ? pageNumber % 2 === 0 : pageNumber % 2 === 1;

    let leftPage: number;
    let rightPage: number;

    if (isRightPage) {
      leftPage = pageNumber - 1;
      rightPage = pageNumber;
    } else {
      leftPage = pageNumber;
      rightPage = pageNumber + 1;
    }

    // Handle edge cases
    if (leftPage < 1) {
      leftPage = 1;
      rightPage = 2;
    }
    if (rightPage > this.totalPages) {
      rightPage = this.totalPages;
      // For last page, if it's a left page, show it alone
      if (leftPage > this.totalPages) {
        leftPage = this.totalPages;
      }
    }

    return {
      mode: 'double',
      leftPageNumber: leftPage,
      rightPageNumber: rightPage,
      totalPages: this.totalPages,
      isFirstSpread: leftPage === 1,
      isLastSpread: rightPage === this.totalPages,
    };
  }

  /**
   * Calculate spread dimensions for rendering
   */
  calculateDimensions(context: SpreadRenderContext): SpreadDimensions {
    const { viewport, scale, pageAspectRatio } = context;

    if (this.currentMode === 'single') {
      // Single page - fit to viewport
      let pageWidth = viewport.width;
      let pageHeight = pageWidth * pageAspectRatio;

      if (pageHeight > viewport.height) {
        pageHeight = viewport.height;
        pageWidth = pageHeight / pageAspectRatio;
      }

      pageWidth *= scale;
      pageHeight *= scale;

      const x = (viewport.width - pageWidth) / 2;
      const y = (viewport.height - pageHeight) / 2;

      return {
        totalWidth: pageWidth,
        totalHeight: pageHeight,
        leftPage: { x, y, width: pageWidth, height: pageHeight },
        rightPage: { x, y, width: pageWidth, height: pageHeight },
      };
    }

    // Double page spread
    const pageGap = (this.config.spread?.pageGap || 10) * scale;
    const gutterWidth = (this.config.spread?.gutterWidth || 40) * scale;

    // Calculate page dimensions to fit both pages in viewport
    let pageWidth = (viewport.width - pageGap - gutterWidth) / 2;
    let pageHeight = pageWidth * pageAspectRatio;

    if (pageHeight > viewport.height) {
      pageHeight = viewport.height;
      pageWidth = pageHeight / pageAspectRatio;
    }

    pageWidth *= scale;
    pageHeight *= scale;

    const totalWidth = pageWidth * 2 + pageGap + gutterWidth;
    const startX = (viewport.width - totalWidth) / 2;
    const y = (viewport.height - pageHeight) / 2;

    // For RTL (Arabic), right page is on the left visually
    const leftPageX = startX + pageWidth + pageGap + gutterWidth;
    const rightPageX = startX;

    return {
      totalWidth,
      totalHeight: pageHeight,
      leftPage: { x: leftPageX, y, width: pageWidth, height: pageHeight },
      rightPage: { x: rightPageX, y, width: pageWidth, height: pageHeight },
      gutter: {
        x: startX + pageWidth,
        y,
        width: pageGap + gutterWidth,
        height: pageHeight,
      },
    };
  }

  /**
   * Get navigation information for current spread
   */
  getNavigationInfo(pageNumber: number): SpreadNavigationInfo {
    const state = this.getSpreadState(pageNumber);

    if (this.currentMode === 'single') {
      return {
        canGoPrevious: pageNumber > 1,
        canGoNext: pageNumber < this.totalPages,
        previousLeftPage: pageNumber > 1 ? pageNumber - 1 : null,
        nextLeftPage: pageNumber < this.totalPages ? pageNumber + 1 : null,
        spreadIndex: pageNumber - 1,
        totalSpreads: this.totalPages,
      };
    }

    // Double page mode
    const spreadIndex = Math.floor((state.leftPageNumber - 1) / 2);
    const totalSpreads = Math.ceil(this.totalPages / 2);

    return {
      canGoPrevious: state.leftPageNumber > 1,
      canGoNext: state.rightPageNumber < this.totalPages,
      previousLeftPage: state.leftPageNumber > 2 ? state.leftPageNumber - 2 : null,
      nextLeftPage:
        state.rightPageNumber < this.totalPages - 1 ? state.leftPageNumber + 2 : null,
      spreadIndex,
      totalSpreads,
    };
  }

  /**
   * Navigate to previous spread
   */
  goToPreviousSpread(): number | null {
    const nav = this.getNavigationInfo(this.currentPage);
    if (nav.canGoPrevious && nav.previousLeftPage !== null) {
      this.currentPage = nav.previousLeftPage;
      return this.currentPage;
    }
    return null;
  }

  /**
   * Navigate to next spread
   */
  goToNextSpread(): number | null {
    const nav = this.getNavigationInfo(this.currentPage);
    if (nav.canGoNext && nav.nextLeftPage !== null) {
      this.currentPage = nav.nextLeftPage;
      return this.currentPage;
    }
    return null;
  }

  /**
   * Navigate to a specific page
   */
  goToPage(pageNumber: number): SpreadState {
    const clampedPage = Math.max(1, Math.min(pageNumber, this.totalPages));
    this.currentPage = clampedPage;
    return this.getSpreadState(clampedPage);
  }

  /**
   * Navigate to a specific spread by index
   */
  goToSpread(spreadIndex: number): SpreadState {
    if (this.currentMode === 'single') {
      return this.goToPage(spreadIndex + 1);
    }

    // Double mode: spread index * 2 + 1 gives left page
    const pageNumber = spreadIndex * 2 + 1;
    return this.goToPage(pageNumber);
  }

  /**
   * Get page number from spread index
   */
  pageFromSpreadIndex(spreadIndex: number): number {
    if (this.currentMode === 'single') {
      return spreadIndex + 1;
    }
    return spreadIndex * 2 + 1;
  }

  /**
   * Get spread index from page number
   */
  spreadIndexFromPage(pageNumber: number): number {
    if (this.currentMode === 'single') {
      return pageNumber - 1;
    }
    return Math.floor((pageNumber - 1) / 2);
  }

  /**
   * Check if a page is visible in the current spread
   */
  isPageVisible(pageNumber: number): boolean {
    const state = this.getSpreadState(this.currentPage);
    if (this.currentMode === 'single') {
      return pageNumber === state.leftPageNumber;
    }
    return pageNumber === state.leftPageNumber || pageNumber === state.rightPageNumber;
  }

  /**
   * Get the visible pages for the current spread
   */
  getVisiblePages(): number[] {
    const state = this.getSpreadState(this.currentPage);
    if (this.currentMode === 'single') {
      return [state.leftPageNumber];
    }
    if (state.leftPageNumber === state.rightPageNumber) {
      return [state.leftPageNumber];
    }
    return [state.leftPageNumber, state.rightPageNumber];
  }

  /**
   * Update total pages count
   */
  setTotalPages(totalPages: number): void {
    this.totalPages = totalPages;
    // Ensure current page is still valid
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }
  }

  /**
   * Get total pages count
   */
  getTotalPages(): number {
    return this.totalPages;
  }

  /**
   * Get current page number
   */
  getCurrentPage(): number {
    return this.currentPage;
  }

  /**
   * Update configuration
   */
  updateConfig(config: PageSpreadConfig): void {
    this.config = config;
    if (config.defaultMode !== 'auto') {
      this.currentMode = config.defaultMode;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): PageSpreadConfig {
    return this.config;
  }
}
