import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { FavoriteJuz } from '../config/types';
import { loadFavoriteJuz, saveFavoriteJuz } from '../utils/favoriteJuzStorage';

interface FavoriteJuzContextType {
  favoriteJuz: FavoriteJuz[];
  addFavorite: (juzNumber: number) => FavoriteJuz;
  removeFavorite: (id: string) => void;
  toggleFavorite: (juzNumber: number) => { added: boolean; favorite?: FavoriteJuz };
  isFavorited: (juzNumber: number) => boolean;
  getFavorite: (juzNumber: number) => FavoriteJuz | null;
}

const FavoriteJuzContext = createContext<FavoriteJuzContextType | null>(null);

interface FavoriteJuzProviderProps {
  children: ReactNode;
}

export function FavoriteJuzProvider({ children }: FavoriteJuzProviderProps) {
  const [favoriteJuz, setFavoriteJuz] = useState<FavoriteJuz[]>(() => loadFavoriteJuz());
  // Track if we're currently updating to prevent storage event loops
  const isUpdatingRef = useRef(false);

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    isUpdatingRef.current = true;
    saveFavoriteJuz(favoriteJuz);
    // Reset flag after a small delay to allow storage event to fire
    const timeout = setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
    return () => clearTimeout(timeout);
  }, [favoriteJuz]);

  // Sync with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Ignore if we triggered this change
      if (isUpdatingRef.current) return;
      if (e.key === 'quran-app-favorite-juz') {
        setFavoriteJuz(loadFavoriteJuz());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addFavorite = useCallback((juzNumber: number): FavoriteJuz => {
    const newFavorite: FavoriteJuz = {
      id: `fav-juz-${juzNumber}-${Date.now()}`,
      juzNumber,
      createdAt: Date.now(),
    };

    setFavoriteJuz(prev => {
      // Check if already favorited
      if (prev.some(f => f.juzNumber === juzNumber)) {
        return prev;
      }
      const updated = [...prev, newFavorite];
      return updated.sort((a, b) => a.juzNumber - b.juzNumber);
    });

    return newFavorite;
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavoriteJuz(prev => prev.filter(f => f.id !== id));
  }, []);

  const toggleFavorite = useCallback((juzNumber: number): { added: boolean; favorite?: FavoriteJuz } => {
    let result: { added: boolean; favorite?: FavoriteJuz } = { added: false };

    setFavoriteJuz(prev => {
      const existing = prev.find(f => f.juzNumber === juzNumber);

      if (existing) {
        result = { added: false };
        return prev.filter(f => f.id !== existing.id);
      } else {
        const newFavorite: FavoriteJuz = {
          id: `fav-juz-${juzNumber}-${Date.now()}`,
          juzNumber,
          createdAt: Date.now(),
        };
        result = { added: true, favorite: newFavorite };
        const updated = [...prev, newFavorite];
        return updated.sort((a, b) => a.juzNumber - b.juzNumber);
      }
    });

    return result;
  }, []);

  const isFavorited = useCallback((juzNumber: number): boolean => {
    return favoriteJuz.some(f => f.juzNumber === juzNumber);
  }, [favoriteJuz]);

  const getFavorite = useCallback((juzNumber: number): FavoriteJuz | null => {
    return favoriteJuz.find(f => f.juzNumber === juzNumber) || null;
  }, [favoriteJuz]);

  return (
    <FavoriteJuzContext.Provider
      value={{
        favoriteJuz,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorited,
        getFavorite,
      }}
    >
      {children}
    </FavoriteJuzContext.Provider>
  );
}

export function useFavoriteJuz() {
  const context = useContext(FavoriteJuzContext);
  if (!context) {
    throw new Error('useFavoriteJuz must be used within a FavoriteJuzProvider');
  }
  return context;
}
