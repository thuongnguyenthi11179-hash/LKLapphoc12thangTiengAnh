import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { UserCheck, Sparkles, X, School, BookOpen, Check } from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentProfile;
  onSaveStudent: (updatedStudent: StudentProfile) => void;
}

const AVAILABLE_AVATARS = ['👦', '👧', '🦁', '🐼', '🦊', '🐯', '🚀', '🏎️', '⭐', '🐱', '🐶', '🦄'];
const POPULAR_CLASSES = [
  'Lớp 1/1', 'Lớp 1/2', 'Lớp 2/1', 'Lớp 2/2',
  'Lớp 3/1', 'Lớp 3/2', 'Lớp 3/3', 'Lớp 4/1',
  'Lớp 4/2', 'Lớp 5/1', 'Lớp 5/2'
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onSaveStudent,
}) => {
  const [name, setName] = useState(currentStudent.name || '');
  const [className, setClassName] = useState(currentStudent.className || 'Lớp 3/1');
  const [customClass, setCustomClass] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(currentStudent.avatar || '👦');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim();
    const finalClass = (customClass.trim() || className).trim();

    if (!finalName) {
      setError('Vui lòng nhập họ và tên của học sinh.');
      return;
    }

    if (!finalClass) {
      setError('Vui lòng chọn hoặc nhập lớp học.');
      return;
    }

    const updatedProfile: StudentProfile = {
      ...currentStudent,
      name: finalName,
      className: finalClass,
      avatar: selectedAvatar,
      lastActive: 'Vừa xong',
    };

    onSaveStudent(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-300 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1">
              <School className="w-3 h-3" /> TH Lê Kim Lăng - Hòa Xuân - Đà Nẵng
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span>📝 Thông Tin Học Sinh Trước Khi Học</span>
          </h2>
          <p className="text-xs text-amber-100 mt-1">
            Ghi họ tên và lớp để giáo viên theo dõi tiến độ luyện phát âm tiếng Anh 12 tháng của con!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-shake">
              ⚠️ {error}
            </div>
          )}

          {/* Chọn avatar */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">
              1. Chọn hình đại diện ngộ nghĩnh:
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`text-2xl p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedAvatar === av
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300 scale-105 shadow-sm'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
              2. Họ và tên học sinh <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Nhập họ và tên (Ví dụ: Trần Minh Quân)..."
              autoFocus
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none text-slate-800 font-bold text-sm md:text-base placeholder:text-slate-400 placeholder:font-normal bg-amber-50/20"
            />
          </div>

          {/* Lớp học */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
              3. Lớp học <span className="text-rose-500">*</span>:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {POPULAR_CLASSES.map((cls) => (
                <button
                  type="button"
                  key={cls}
                  onClick={() => {
                    setClassName(cls);
                    setCustomClass('');
                    if (error) setError(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    className === cls && !customClass
                      ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-sm ring-1 ring-amber-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">Hoặc nhập lớp khác:</span>
              <input
                type="text"
                value={customClass}
                onChange={(e) => {
                  setCustomClass(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ví dụ: Lớp 3/4..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Lời nhắc sư phạm */}
          <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
            <span className="text-base">👩‍🏫</span>
            <p>
              <strong>Giáo viên lưu ý:</strong> Sau khi học sinh ghi họ tên & lớp, hệ thống sẽ tự động cập nhật vào <strong>Bàn Giáo Viên</strong> để thầy cô theo dõi số sao, thời lượng học và các từ cần sửa âm!
            </p>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs md:text-sm transition-all cursor-pointer"
            >
              Để sau
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs md:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-slate-950" />
              <span>Lưu & Bắt Đầu Học Ngay 🚀</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
