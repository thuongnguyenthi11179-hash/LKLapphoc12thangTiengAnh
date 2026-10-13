import React from 'react';
import { StudentProfile } from '../types';
import {
  GraduationCap,
  Star,
  Flame,
  RefreshCw,
  Trophy,
  Zap,
  BookOpen,
  UserCheck,
  Edit3,
  Music,
  Pause,
} from 'lucide-react';
import { useSong } from '../context/SongContext';

interface HeaderProps {
  currentTab: 'study' | 'racing' | 'leaderboard' | 'teacher';
  onSelectTab: (tab: 'study' | 'racing' | 'leaderboard' | 'teacher') => void;
  student: StudentProfile;
  isOnline: boolean;
  syncTimestamp: string;
  isSyncing: boolean;
  onTriggerSync: () => void;
  onOpenStudentModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  student,
  isOnline,
  syncTimestamp,
  isSyncing,
  onTriggerSync,
  onOpenStudentModal,
}) => {
  const { isPlaying, toggleSong } = useSong();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: School Logo & App Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md text-xl shrink-0 ring-2 ring-amber-200">
              🏫
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-slate-900 text-sm md:text-base lg:text-lg tracking-tight leading-snug">
                  App học 12 tháng Tiếng Anh
                </h1>
                <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200 uppercase">
                  Tiểu Học Lê Kim Lăng
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                Dành cho học sinh trường tiểu học Lê Kim Lăng - Phường Hòa Xuân - TP. Đà Nẵng
              </p>
            </div>
          </div>

          {/* Center / Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            <button
              onClick={() => onSelectTab('study')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 ${
                currentTab === 'study'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Học 12 Tháng</span>
            </button>

            {/* Nút bấm nghe bài hát 12 Tháng */}
            <button
              onClick={toggleSong}
              title={isPlaying ? 'Bấm để tạm dừng bài hát' : 'Bấm vào để nghe bài hát 12 Tháng Tiếng Anh'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 shadow-sm active:scale-95 ${
                isPlaying
                  ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-300 animate-pulse'
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Tạm Dừng Bài Hát 🎵</span>
                </>
              ) : (
                <>
                  <Music className="w-4 h-4" />
                  <span>Nghe Bài Hát 12 Tháng 🎵</span>
                </>
              )}
            </button>

            <button
              onClick={() => onSelectTab('racing')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 ${
                currentTab === 'racing'
                  ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-300'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Đua Xe LKL 🏎️</span>
            </button>

            <button
              onClick={() => onSelectTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 ${
                currentTab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Vinh Danh 🌟</span>
            </button>

            <button
              onClick={() => onSelectTab('teacher')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 ${
                currentTab === 'teacher'
                  ? 'bg-blue-900 text-white shadow-md ring-2 ring-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Bàn Giáo Viên</span>
            </button>
          </nav>

          {/* Right: Student Profile & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Nút ghi họ và tên học sinh, lớp */}
            {onOpenStudentModal && (
              <button
                onClick={onOpenStudentModal}
                title="Ghi họ và tên học sinh, lớp trước khi bắt đầu học để giáo viên tiện theo dõi"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md border border-amber-300 transition-all cursor-pointer active:scale-95"
              >
                <UserCheck className="w-4 h-4 text-slate-950" />
                <span>Ghi Họ Tên & Lớp</span>
              </button>
            )}

            {/* Sync Badge */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden sm:inline font-semibold text-slate-600 text-[11px]">
                {isOnline ? 'Đã đồng bộ' : 'Bộ nhớ tạm'}
              </span>
              <button
                onClick={onTriggerSync}
                title="Đồng bộ dữ liệu học tập lên máy chủ"
                disabled={isSyncing}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>

            {/* Student mini chip (Clickable to edit) */}
            <button
              onClick={onOpenStudentModal}
              title="Nhấn để đổi tên hoặc lớp học sinh"
              className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-300 px-3 py-1 rounded-2xl transition-all cursor-pointer text-left group"
            >
              <span className="text-xl">{student.avatar}</span>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {student.name}
                  </p>
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold">
                  <span className="bg-amber-200 text-amber-900 px-1 rounded text-[9px] font-black">
                    {student.className}
                  </span>
                  <span>•</span>
                  <span className="text-amber-700 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline" />
                    {student.totalStars}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
