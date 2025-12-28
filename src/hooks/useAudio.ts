import { useState, useRef, useCallback, useEffect } from 'react';
import { buildAudioUrl, getVerseAudioUrl } from '../api/quran';
import { useSettingsOptional } from '../contexts/SettingsContext';
import { DEFAULT_RECITER_ID } from '../config/reciters';

interface UseAudioResult {
  isPlaying: boolean;
  currentUrl: string | null;
  duration: number;
  currentTime: number;
  isLooping: boolean;
  playWord: (audioUrl: string | null) => void;
  playVerse: (verseKey: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  toggleLoop: () => void;
}

export function useAudio(): UseAudioResult {
  const settings = useSettingsOptional();
  const reciterId = settings?.reciter.id ?? DEFAULT_RECITER_ID;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isStoppedRef = useRef(false);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();

    const audio = audioRef.current;

    audio.addEventListener('ended', () => {
      // Loop handling is done via the audio.loop property
      if (!audio.loop) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (!isStoppedRef.current) {
        setCurrentTime(audio.currentTime);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (!isStoppedRef.current && audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    });

    audio.addEventListener('play', () => {
      isStoppedRef.current = false;
      setIsPlaying(true);
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playUrl = useCallback((url: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    // If playing the same URL
    if (currentUrl === url) {
      if (audio.paused) {
        // If audio ended, restart from beginning
        if (audio.currentTime >= audio.duration || audio.ended) {
          audio.currentTime = 0;
        }
        audio.play().catch(() => {
          // Ignore autoplay errors
        });
        return;
      }
      // Already playing the same URL, do nothing
      return;
    }

    // Play new URL - wait for canplay event before playing to avoid race condition
    audio.src = url;

    const handleCanPlay = () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.play().catch(() => {
        // Ignore autoplay errors (e.g., user hasn't interacted with page yet)
      });
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.load();
    setCurrentUrl(url);
  }, [currentUrl]);

  const playWord = useCallback((audioUrl: string | null) => {
    const fullUrl = buildAudioUrl(audioUrl);
    if (fullUrl) {
      playUrl(fullUrl);
    }
  }, [playUrl]);

  const playVerse = useCallback(
    (verseKey: string) => {
      // Use reciter from settings (or default)
      const url = getVerseAudioUrl(reciterId, verseKey);
      playUrl(url);
    },
    [playUrl, reciterId]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      // If audio ended, restart from beginning
      if (audio.currentTime >= audio.duration || audio.ended) {
        audio.currentTime = 0;
      }
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      isStoppedRef.current = true;
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      setCurrentUrl(null);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
    }
  }, []);

  const toggleLoop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.loop = !audio.loop;
      setIsLooping(audio.loop);
    }
  }, []);

  return {
    isPlaying,
    currentUrl,
    duration,
    currentTime,
    isLooping,
    playWord,
    playVerse,
    pause,
    resume,
    stop,
    seek,
    toggleLoop,
  };
}
