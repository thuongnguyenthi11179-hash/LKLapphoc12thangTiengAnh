import React from 'react';
import { useSong } from '../context/SongContext';
import { MONTHS_DATA } from '../data/monthsData';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Music,
  Sparkles,
} from 'lucide-react';

interface SongPlayerCardProps {
  currentMonthId: number;
  onSelectMonth: (monthId: number) => void;
}

export const SongPlayerCard: React.FC<SongPlayerCardProps> = ({
  currentMonthId,
  onSelectMonth,
}) => {
  const {
    isPlaying,
    currentTime,
    duration,
    toggleSong,
    seekSong,
    skipSong,
    restartSong,
    isMuted,
    toggleSongMute,
    formatTime,
  } = useSong();

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 rounded-3xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden border-2 border-purple-300">
      {/* Background decorative music notes */}
      <div className="absolute right-3 top-2 text-7xl opacity-10 pointer-events-none select-none">
        🎼
      </div>
      <div className="absolute right-28 bottom-2 text-6xl opacity-10 pointer-events-none select-none">
        🎶
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header Badge & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md text-xl shrink-0 ${isPlaying ? 'animate-bounce' : ''}`}>
              🎵
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
                  Giai điệu học tập vui nhộn
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-200">
                  <Sparkles className="w-3.5 h-3.5" /> Chuẩn bản xứ
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight flex items-center gap-2">
                Bài Hát 12 Tháng Tiếng Anh
                <span className="text-xs sm:text-sm font-bold text-purple-200 font-normal">
                  (The Months of the Year Song)
                </span>
              </h2>
            </div>
          </div>

          <p className="text-xs text-purple-100 font-medium sm:text-right max-w-xs">
            Bấm nút bên dưới để nghe bài hát, cùng vỗ tay và hát theo tên 12 tháng nhé!
          </p>
        </div>

        {/* Main Playback Bar & Big Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-3">
          {/* Main Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Main Play / Pause Button */}
              <button
                onClick={toggleSong}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isPlaying
                    ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-rose-400/50'
                    : 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 ring-4 ring-amber-300/40'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Tạm Dừng Bài Hát</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Bấm Vào Để Nghe Bài Hát 🎵</span>
                  </>
                )}
              </button>

              {/* Rewind 10s */}
              <button
                onClick={() => skipSong(-10)}
                title="Lùi lại 10 giây"
                className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white cursor-pointer"
              >
                <Rewind className="w-4 h-4" />
              </button>

              {/* Forward 10s */}
              <button
                onClick={() => skipSong(10)}
                title="Tua tới 10 giây"
                className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white cursor-pointer"
              >
                <FastForward className="w-4 h-4" />
              </button>

              {/* Replay */}
              <button
                onClick={restartSong}
                title="Phát lại từ đầu"
                className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden md:inline">Từ đầu</span>
              </button>
            </div>

            {/* Right: Sound Mute & Equalizer Status */}
            <div className="flex items-center gap-3">
              {isPlaying && (
                <div className="flex items-end gap-1 h-5 px-2 py-1 bg-white/15 rounded-lg">
                  <span className="w-1 bg-amber-300 rounded-full animate-pulse h-4" />
                  <span className="w-1 bg-pink-300 rounded-full animate-pulse h-2" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 bg-cyan-300 rounded-full animate-pulse h-5" style={{ animationDelay: '300ms' }} />
                  <span className="w-1 bg-amber-300 rounded-full animate-pulse h-3" style={{ animationDelay: '450ms' }} />
                </div>
              )}

              <button
                onClick={toggleSongMute}
                title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
                className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-all text-white cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Progress Timeline Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="relative w-full flex items-center">
              <input
                type="range"
                min="0"
                max={duration > 0 ? duration : 111}
                step="0.5"
                value={currentTime}
                onChange={(e) => seekSong(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-black/30 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300 transition-all"
              />
            </div>
            <div className="flex justify-between items-center text-xs font-mono font-bold text-purple-100">
              <span className="bg-black/20 px-2 py-0.5 rounded">{formatTime(currentTime)}</span>
              <span className="text-[11px] font-sans font-semibold opacity-80">
                {isPlaying ? '🎶 Đang phát theo điệu nhạc vui nhộn...' : 'Nhấn nút phát để bắt đầu'}
              </span>
              <span className="bg-black/20 px-2 py-0.5 rounded">{formatTime(duration || 111)}</span>
            </div>
          </div>
        </div>

        {/* 12 Months Sing-Along Tag Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-purple-100">
            <span className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-amber-300" />
              12 Tháng trong bài hát (Bấm vào tên tháng để chuyển bài học):
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 sm:gap-2">
            {MONTHS_DATA.map((month) => {
              const isSelected = month.id === currentMonthId;
              return (
                <button
                  key={month.id}
                  onClick={() => onSelectMonth(month.id)}
                  title={`Xem bài học tháng ${month.id}: ${month.name}`}
                  className={`px-2 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-between border ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105 ring-2 ring-white/50'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  }`}
                >
                  <span className="truncate">{month.name}</span>
                  <span className="text-[10px] opacity-80 font-mono ml-1">T{month.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
