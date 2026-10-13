import React from 'react';
import { StudentProfile } from '../types';
import { Award, Star, Flame, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';

interface HallOfFameProps {
  currentStudent: StudentProfile;
}

export const HallOfFame: React.FC<HallOfFameProps> = ({ currentStudent }) => {
  // Danh sách vinh danh (chỉ để lại 1 học sinh mẫu theo yêu cầu)
  const weeklyStars = [
    {
      rank: 1,
      name: currentStudent.name || 'Nguyễn Minh Khang',
      className: currentStudent.className || 'Lớp 3/1',
      stars: currentStudent.totalStars || 48,
      streak: currentStudent.streakDays || 6,
      avatar: currentStudent.avatar || '👦',
      title: 'Ngôi sao Sáng Nhất Tuần',
      badge: '🌸 Búp sen hồng LKL',
      isCurrent: true,
    },
  ];

  const badgesList = [
    {
      name: 'Búp Sen Hồng LKL',
      desc: 'Hoàn thành trọn vẹn 12 tháng tiếng Anh',
      icon: '🪷',
      unlocked: currentStudent.completedMonths >= 10,
    },
    {
      name: 'Chiến Binh Phát Âm',
      desc: 'Đạt từ 5 sao nhiều lần đọc',
      icon: '⭐',
      unlocked: currentStudent.totalStars >= 30,
    },
    {
      name: 'Tay Đua Siêu Tốc',
      desc: 'Chiến thắng chế độ đua xe trường Lê Kim Lăng',
      icon: '🏎️',
      unlocked: true,
    },
    {
      name: 'Chuyên Cần 7 Ngày',
      desc: 'Giữ vững ngọn lửa học tập 7 ngày liên tiếp',
      icon: '🔥',
      unlocked: currentStudent.streakDays >= 5,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            🏛️ BẢNG VÀNG DANH DỰ TRƯỜNG TIỂU HỌC LÊ KIM LĂNG - HÒA XUÂN - ĐÀ NẴNG
          </span>
          <h2 className="text-2xl md:text-3xl font-black mt-2">
            Ngôi Sao Học Tập Của Tuần 🌟
          </h2>
          <p className="text-amber-100 text-xs md:text-sm mt-1">
            Vinh danh học sinh chăm chỉ, phát âm chuẩn xác nhất trên App học 12 tháng Tiếng Anh!
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shrink-0">
          <Trophy className="w-10 h-10 text-amber-300" />
          <div>
            <p className="text-xs text-amber-100">Tuần thi đua thứ</p>
            <p className="text-xl font-black">28 (Năm học 2026)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Leaderboard list */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 md:p-6 border border-amber-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-black text-slate-800 text-base md:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Bảng Xếp Hạng Ngôi Sao (Toàn trường)
            </h3>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">
              Cập nhật trực tiếp
            </span>
          </div>

          <div className="space-y-3">
            {weeklyStars.map((st) => (
              <div
                key={st.rank}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  st.isCurrent
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                      st.rank === 1
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                        : st.rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : st.rank === 3
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {st.rank === 1 ? '🥇' : st.rank === 2 ? '🥈' : st.rank === 3 ? '🥉' : st.rank}
                  </div>

                  {/* Student Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{st.avatar}</span>
                      <h4 className="font-black text-slate-900 text-sm md:text-base">
                        {st.name} {st.isCurrent && <span className="text-xs text-rose-600 font-bold">(Con)</span>}
                      </h4>
                      <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                        {st.className}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="text-amber-700 font-medium">{st.badge}</span>
                      <span>•</span>
                      <span className="text-slate-600">{st.title}</span>
                    </div>
                  </div>
                </div>

                {/* Score stats */}
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-sm font-black text-amber-600">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>{st.stars} sao</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs text-orange-600 font-bold mt-0.5">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                    <span>{st.streak} ngày</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Badges Collection (Huy hiệu danh dự LKL) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 md:p-6 border border-amber-200 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
              <Award className="w-5 h-5 text-rose-500" />
              <h3 className="font-black text-slate-800 text-base">Huy Hiệu Danh Dự LKL</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Thu thập trọn bộ huy hiệu danh dự trường Tiểu học Lê Kim Lăng để trở thành Trạng Nguyên Tiếng Anh!
            </p>

            <div className="space-y-3">
              {badgesList.map((bg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    bg.unlocked
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="text-3xl shrink-0 p-1 bg-white rounded-xl shadow-sm border border-slate-100">
                    {bg.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs md:text-sm text-slate-900">{bg.name}</h4>
                      {bg.unlocked ? (
                        <span className="text-[10px] bg-emerald-200 text-emerald-800 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã đạt
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">Chưa mở</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{bg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center text-xs text-amber-900 font-medium">
            💡 <span className="font-bold">Mẹo nhận thưởng:</span> Luyện phát âm mỗi ngày 10 phút để duy trì chuỗi học và nhận thêm sao!
          </div>
        </div>
      </div>
    </div>
  );
};
