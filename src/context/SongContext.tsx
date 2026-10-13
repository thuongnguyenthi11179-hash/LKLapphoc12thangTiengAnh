import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import songAudioFile from '../assets/audio/months-of-the-year-song.mp3';

interface SongContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playSong: () => void;
  pauseSong: () => void;
  toggleSong: () => void;
  seekSong: (time: number) => void;
  skipSong: (seconds: number) => void;
  restartSong: () => void;
  setSongVolume: (volume: number) => void;
  toggleSongMute: () => void;
  formatTime: (seconds: number) => string;
}

const SongContext = createContext<SongContextType | undefined>(undefined);

const SONG_AUDIO_SRC = songAudioFile || '/audio/months-of-the-year-song.mp3';

export const SongProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(SONG_AUDIO_SRC);
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playSong = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio play failed:', err);
      });
    }
  };

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleSong = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  };

  const seekSong = (time: number) => {
    if (audioRef.current) {
      const validTime = Math.max(0, Math.min(time, duration || audioRef.current.duration || 111));
      audioRef.current.currentTime = validTime;
      setCurrentTime(validTime);
    }
  };

  const skipSong = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration || 111));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const restartSong = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      playSong();
    }
  };

  const setSongVolume = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  const toggleSongMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SongContext.Provider
      value={{
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playSong,
        pauseSong,
        toggleSong,
        seekSong,
        skipSong,
        restartSong,
        setSongVolume,
        toggleSongMute,
        formatTime,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};

export const useSong = (): SongContextType => {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error('useSong must be used within a SongProvider');
  }
  return context;
};
