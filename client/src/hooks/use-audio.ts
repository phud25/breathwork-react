import { useEffect, useRef, useState } from 'react';

interface AudioOptions {
  volume?: number;
  loop?: boolean;
}

export function useAudio(url: string, options: AudioOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(options.volume || 1);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Create audio context to ensure browser supports audio
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      const audio = new Audio();
      audio.src = url;
      audio.loop = options.loop || false;
      audio.volume = volume;

      // Preload the audio
      audio.load();

      audioRef.current = audio;
      setIsInitialized(true);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
        audioContext.close();
      };
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      setIsInitialized(false);
    }
  }, [url, options.loop]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = async () => {
    if (!audioRef.current || !isInitialized) return;

    try {
      // Handle autoplay restrictions by checking if context is suspended
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
      }
    } catch (error) {
      console.warn('Audio playback failed:', error);
      setIsPlaying(false);
    }
  };

  const pause = () => {
    if (!audioRef.current || !isInitialized) return;
    try {
      audioRef.current.pause();
      setIsPlaying(false);
    } catch (error) {
      console.warn('Audio pause failed:', error);
    }
  };

  const stop = () => {
    if (!audioRef.current || !isInitialized) return;
    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } catch (error) {
      console.warn('Audio stop failed:', error);
    }
  };

  const fadeIn = async (duration: number = 1000) => {
    if (!audioRef.current || !isInitialized) return;

    try {
      audioRef.current.volume = 0;
      await play();

      const startTime = performance.now();
      const targetVolume = volume;

      const fade = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (audioRef.current) {
          audioRef.current.volume = progress * targetVolume;
        }

        if (progress < 1) {
          requestAnimationFrame(fade);
        }
      };

      requestAnimationFrame(fade);
    } catch (error) {
      console.warn('Audio fade in failed:', error);
    }
  };

  const fadeOut = (duration: number = 1000) => {
    if (!audioRef.current || !isInitialized) return;

    try {
      const startTime = performance.now();
      const startVolume = audioRef.current.volume;

      const fade = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (audioRef.current) {
          audioRef.current.volume = startVolume * (1 - progress);
        }

        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          pause();
        }
      };

      requestAnimationFrame(fade);
    } catch (error) {
      console.warn('Audio fade out failed:', error);
    }
  };

  return {
    isPlaying,
    isInitialized,
    play,
    pause,
    stop,
    fadeIn,
    fadeOut,
    setVolume,
    volume
  };
}