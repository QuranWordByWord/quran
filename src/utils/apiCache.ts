/**
 * API Cache Interceptor for quranhub.com API
 *
 * This module intercepts fetch requests to the quranhub API and caches responses
 * in both memory (for instant access) and localStorage (for persistence).
 *
 * This is necessary because:
 * 1. The misraj-mushaf-renderer library fetches data internally
 * 2. Service workers don't work in development mode
 * 3. We need caching to work immediately, not just after first visit in production
 */

const CACHE_PREFIX = 'quranhub-cache-';
const CACHE_VERSION = 'v1';
const CACHE_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// In-memory cache for instant access
const memoryCache = new Map<string, { data: unknown; timestamp: number }>();

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const hasLocalStorage = isLocalStorageAvailable();

// Get cache key from URL
function getCacheKey(url: string): string {
  return `${CACHE_PREFIX}${CACHE_VERSION}-${url}`;
}

// Get from memory cache
function getFromMemory(url: string): unknown | null {
  const cached = memoryCache.get(url);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_EXPIRY_MS) {
    memoryCache.delete(url);
    return null;
  }

  return cached.data;
}

// Get from localStorage
function getFromStorage(url: string): unknown | null {
  if (!hasLocalStorage) return null;

  try {
    const key = getCacheKey(url);
    const item = localStorage.getItem(key);
    if (!item) return null;

    const { data, timestamp } = JSON.parse(item);

    if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(key);
      return null;
    }

    // Also populate memory cache
    memoryCache.set(url, { data, timestamp });

    return data;
  } catch {
    return null;
  }
}

// Save to both caches
function saveToCache(url: string, data: unknown): void {
  const timestamp = Date.now();

  // Save to memory
  memoryCache.set(url, { data, timestamp });

  // Save to localStorage
  if (hasLocalStorage) {
    try {
      const key = getCacheKey(url);
      localStorage.setItem(key, JSON.stringify({ data, timestamp }));
    } catch {
      // localStorage might be full, try to clean old entries
      cleanOldCacheEntries();
    }
  }
}

// Clean old cache entries from localStorage
function cleanOldCacheEntries(): void {
  if (!hasLocalStorage) return;

  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const { timestamp } = JSON.parse(item);
          if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
            keysToRemove.push(key);
          }
        }
      } catch {
        keysToRemove.push(key!);
      }
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// Original fetch function
const originalFetch = window.fetch.bind(window);

// Intercepted fetch that caches quranhub API responses
async function cachedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  // Only intercept quranhub API calls
  if (!url.includes('api.quranhub.com')) {
    return originalFetch(input, init);
  }

  // Check memory cache first (instant)
  let cached = getFromMemory(url);

  // Check localStorage if not in memory
  if (!cached) {
    cached = getFromStorage(url);
  }

  // Return cached response if available
  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      statusText: 'OK (from cache)',
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
      },
    });
  }

  // Make the actual request
  const response = await originalFetch(input, init);

  // Clone response before reading body
  const responseClone = response.clone();

  // Cache successful responses
  if (response.ok) {
    try {
      const data = await responseClone.json();
      saveToCache(url, data);
    } catch {
      // Ignore JSON parse errors
    }
  }

  return response;
}

// Install the fetch interceptor
export function installApiCache(): void {
  // Only install once
  if ((window as unknown as { __apiCacheInstalled?: boolean }).__apiCacheInstalled) {
    return;
  }

  window.fetch = cachedFetch;
  (window as unknown as { __apiCacheInstalled?: boolean }).__apiCacheInstalled = true;

  // Clean old entries on startup
  cleanOldCacheEntries();
}

// Preload adjacent pages for smoother navigation
export function preloadPages(currentPage: number, dataId = 'quran-hafs'): void {
  const pagesToPreload = [currentPage - 1, currentPage + 1, currentPage + 2];

  pagesToPreload.forEach(page => {
    if (page >= 1 && page <= 604) {
      const url = `https://api.quranhub.com/v1/page/${page}/${dataId}?words=true`;

      // Skip if already cached
      if (getFromMemory(url) || getFromStorage(url)) {
        return;
      }

      // Fetch in background with low priority
      fetch(url, { priority: 'low' } as RequestInit).catch(() => {
        // Ignore errors for preload
      });
    }
  });
}

// Get cache statistics (useful for debugging)
export function getCacheStats(): { memoryEntries: number; storageEntries: number } {
  let storageEntries = 0;

  if (hasLocalStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        storageEntries++;
      }
    }
  }

  return {
    memoryEntries: memoryCache.size,
    storageEntries,
  };
}
