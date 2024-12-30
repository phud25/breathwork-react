import { useEffect, useRef, useState } from 'react';

interface AudioOptions {
  volume?: number;
  loop?: boolean;
}

export function useAudio(url: string, options: AudioOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(options.volume || 1);

  useEffect(() => {
    const audio = new Audio(url);
    audio.loop = options.loop || false;
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [url, options.loop]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Audio playback failed:', error);
      });
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const fadeIn = (duration: number = 1000) => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = 0;
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

    play();
    requestAnimationFrame(fade);
  };

  const fadeOut = (duration: number = 1000) => {
    if (!audioRef.current) return;
    
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
  };

  return {
    isPlaying,
    play,
    pause,
    stop,
    fadeIn,
    fadeOut,
    setVolume,
    volume
  };
}
