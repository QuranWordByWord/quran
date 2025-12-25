import { useState, useRef, useCallback, useEffect } from 'react';
import { buildAudioUrl, getVerseAudioUrl } from '../api/quran';

interface UseAudioResult {
  isPlaying: boolean;
  currentUrl: string | null;
  duration: number;
  currentTime: number;
  playWord: (audioUrl: string | null) => void;
  playVerse: (verseKey: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
}

export function useAudio(): UseAudioResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isStoppedRef = useRef(false);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();

    const audio = audioRef.current;

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
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
        audio.play();
        return;
      }
      // Already playing the same URL, do nothing
      return;
    }

    // Play new URL
    audio.src = url;
    audio.load();
    audio.play();
    setCurrentUrl(url);
  }, [currentUrl]);

  const playWord = useCallback((audioUrl: string | null) => {
    const fullUrl = buildAudioUrl(audioUrl);
    if (fullUrl) {
      playUrl(fullUrl);
    }
  }, [playUrl]);

  const playVerse = useCallback((verseKey: string) => {
    // Using Mishary Alafasy recitation (default)
    const url = getVerseAudioUrl(7, verseKey);
    playUrl(url);
  }, [playUrl]);

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
      audio.play();
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

  return {
    isPlaying,
    currentUrl,
    duration,
    currentTime,
    playWord,
    playVerse,
    pause,
    resume,
    stop,
    seek,
  };
}
