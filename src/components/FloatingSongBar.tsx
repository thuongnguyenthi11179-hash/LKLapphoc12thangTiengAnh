import React, { useState } from 'react';
import { useSong } from '../context/SongContext';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Music } from 'lucide-react';

export const FloatingSongBar: React.FC = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    toggleSong,
    restartSong,
    isMuted,
    toggleSongMute,
    formatTime,
  } = useSong();

  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // If paused or dismissed by user, do not render floating bar
  if (!isPlaying && isDismissed) return null;
  if (!isPlaying) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border-2 border-purple-400 flex flex-col gap-2 ring-4 ring-purple-500/20">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Icon & Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Music className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black truncate text-white leading-tight">
                Bài Hát 12 Tháng Tiếng Anh
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-purple-200 mt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration || 111)}</span>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Replay */}
            <button
              onClick={restartSong}
              title="Phát lại từ đầu"
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={toggleSong}
              title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
              className="w-8 h-8 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer font-black"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Mute */}
            <button
              onClick={toggleSongMute}
              title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Dismiss */}
            <button
              onClick={() => setIsDismissed(true)}
              title="Thu gọn thanh phát nhạc"
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mini progress line */}
        <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-pink-400 h-full transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
