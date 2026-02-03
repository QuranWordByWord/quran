import { STORAGE_KEYS } from '../config/constants';
import type { FavoriteJuz } from '../config/types';

/**
 * Load all favorite Juz from localStorage
 */
export function loadFavoriteJuz(): FavoriteJuz[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.favoriteJuz);
    if (stored) {
      const favorites = JSON.parse(stored) as FavoriteJuz[];
      // Sort by juzNumber ascending for consistent display
      return favorites.sort((a, b) => a.juzNumber - b.juzNumber);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Save favorite Juz to localStorage
 */
export function saveFavoriteJuz(favorites: FavoriteJuz[]): void {
  try {
    // Sort by juzNumber ascending before saving
    const sorted = [...favorites].sort((a, b) => a.juzNumber - b.juzNumber);
    localStorage.setItem(STORAGE_KEYS.favoriteJuz, JSON.stringify(sorted));
  } catch (error) {
    console.error('Failed to save favorite Juz:', error);
  }
}

/**
 * Check if a Juz is favorited
 */
export function isJuzFavorited(juzNumber: number): boolean {
  const favorites = loadFavoriteJuz();
  return favorites.some(f => f.juzNumber === juzNumber);
}

/**
 * Get favorite for a specific Juz
 */
export function getFavoriteJuz(juzNumber: number): FavoriteJuz | null {
  const favorites = loadFavoriteJuz();
  return favorites.find(f => f.juzNumber === juzNumber) || null;
}

/**
 * Load Juz sidebar expanded state
 */
export function loadJuzSidebarExpanded(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.favoriteJuzSidebarExpanded);
    return stored === 'true';
  } catch {
    return false;
  }
}

/**
 * Save Juz sidebar expanded state
 */
export function saveJuzSidebarExpanded(expanded: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.favoriteJuzSidebarExpanded, String(expanded));
  } catch {
    // Ignore errors
  }
}
