import React, { useState, useEffect } from 'react';
import { MONTHS_DATA } from './data/monthsData';
import { StudentProfile } from './types';
import { Header } from './components/Header';
import { MonthStudyView } from './components/MonthStudyView';
import { RacingGameModal } from './components/RacingGameModal';
import { HallOfFame } from './components/HallOfFame';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentProfileModal } from './components/StudentProfileModal';

const LOCAL_STORAGE_KEY = 'lkl_smart_tutor_student_v1';

export default function App() {
  // Current student profile (1 học sinh mẫu duy nhất theo yêu cầu)
  const [student, setStudent] = useState<StudentProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {}
      }
    }
    return {
      id: 'LKL-30101',
      name: 'Nguyễn Minh Khang',
      className: 'Lớp 3/1',
      avatar: '👦',
      vehicle: 'Tia Chớp Đỏ LKL',
      vehicleColor: '#ef4444',
      totalStars: 48,
      streakDays: 6,
      studyMinutes: 45,
      completedMonths: 11,
      lastActive: 'Vừa xong',
      status: 'Xuất sắc',
      problematicMonths: ['February'],
      badges: ['Búp Sen Hồng LKL', 'Tay Đua Siêu Tốc'],
    };
  });

  const [completedMonthIds, setCompletedMonthIds] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lkl_completed_months');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {}
      }
    }
    return [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  });

  const [currentMonthId, setCurrentMonthId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'study' | 'racing' | 'leaderboard' | 'teacher'>('study');
  const [isRacingModalOpen, setIsRacingModalOpen] = useState<boolean>(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncTimestamp, setSyncTimestamp] = useState<string>('14:30');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Student roster for teacher dashboard
  const [studentsRoster, setStudentsRoster] = useState<any[]>([]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial fetch of students
    fetchStudentsRoster();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save student data locally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(student));
    }
  }, [student]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lkl_completed_months', JSON.stringify(completedMonthIds));
    }
  }, [completedMonthIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchStudentsRoster = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        if (data.students) {
          setStudentsRoster(data.students);
        }
      }
    } catch (_) {}
  };

  // Sync to school server
  const triggerSync = async (dataToSync = student) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentData: dataToSync }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOnline(true);
        setSyncTimestamp(data.timestamp || new Date().toLocaleTimeString('vi-VN'));
        showToast('🟢 Đã đồng bộ an toàn dữ liệu lên máy chủ TH Lê Kim Lăng!');
        fetchStudentsRoster();
      }
    } catch (err) {
      console.warn('Sync failed (offline mode active)');
      setIsOnline(false);
      showToast('🟡 Đang lưu vào bộ nhớ tạm (Offline mode). Tự động gửi lại khi có mạng.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Save student profile from modal
  const handleSaveStudent = async (updatedStudent: StudentProfile) => {
    setStudent(updatedStudent);
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentData: updatedStudent }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOnline(true);
        setSyncTimestamp(data.timestamp || new Date().toLocaleTimeString('vi-VN'));
        showToast(`✅ Đã lưu thông tin: ${updatedStudent.name} (${updatedStudent.className})! Giáo viên đã có thể theo dõi.`);
        fetchStudentsRoster();
      }
    } catch (_) {
      showToast(`✅ Đã lưu học sinh: ${updatedStudent.name} (${updatedStudent.className}) vào bộ nhớ máy.`);
    } finally {
      setIsSyncing(false);
    }
  };

  // When a student earns stars from pronunciation
  const handleUpdateStars = (starsEarned: number, monthId: number) => {
    const updated = {
      ...student,
      totalStars: student.totalStars + starsEarned,
      studyMinutes: student.studyMinutes + 2,
      lastActive: 'Vừa xong',
    };
    setStudent(updated);

    if (starsEarned >= 3 && !completedMonthIds.includes(monthId)) {
      setCompletedMonthIds((prev) => [...prev, monthId]);
    }

    // Auto sync in background
    triggerSync(updated);
  };

  const handleAddRacingStars = (bonus: number) => {
    const updated = {
      ...student,
      totalStars: student.totalStars + bonus,
    };
    setStudent(updated);
    showToast(`🎉 Đã cộng +${bonus} sao từ đường đua Lê Kim Lăng!`);
    triggerSync(updated);
  };

  const currentMonth = MONTHS_DATA.find((m) => m.id === currentMonthId) || MONTHS_DATA[0];

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-amber-400 flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'racing') {
            setIsRacingModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        student={student}
        isOnline={isOnline}
        syncTimestamp={syncTimestamp}
        isSyncing={isSyncing}
        onTriggerSync={() => triggerSync(student)}
        onOpenStudentModal={() => setIsStudentModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'study' && (
          <MonthStudyView
            currentMonth={currentMonth}
            student={student}
            completedMonthIds={completedMonthIds}
            onSelectMonth={(id) => setCurrentMonthId(id)}
            onUpdateStars={handleUpdateStars}
            onOpenRacingMode={() => setIsRacingModalOpen(true)}
            onOpenStudentModal={() => setIsStudentModalOpen(true)}
          />
        )}

        {activeTab === 'leaderboard' && <HallOfFame currentStudent={student} />}

        {activeTab === 'teacher' && (
          <TeacherDashboard
            students={studentsRoster.length > 0 ? studentsRoster : [student]}
            isOnline={isOnline}
            syncTimestamp={syncTimestamp}
            onRefreshData={fetchStudentsRoster}
          />
        )}
      </main>

      {/* Student Profile Input Modal */}
      <StudentProfileModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        currentStudent={student}
        onSaveStudent={handleSaveStudent}
      />

      {/* Racing Gamification Modal */}
      <RacingGameModal
        student={student}
        isOpen={isRacingModalOpen}
        onClose={() => setIsRacingModalOpen(false)}
        onAddStars={handleAddRacingStars}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-amber-200/80 py-6 px-4 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-bold text-slate-800 flex items-center justify-center gap-1.5 text-sm">
            <span>🏫 Trường Tiểu học Lê Kim Lăng - Phường Hòa Xuân - Thành phố Đà Nẵng</span>
          </p>
          <p className="text-xs text-slate-700 font-bold">
            App học 12 tháng Tiếng aNh dành cho học sinh trường tiểu học Lê Kim Lăng-Phường Hòa Xuân -thành phố Đà Nẵng
          </p>
          <p className="text-[11px] text-slate-500">
            Hỗ trợ học sinh luyện phát âm 12 tháng tiếng Anh chuẩn bản xứ qua 4 mùa lễ hội Việt Nam • Báo cáo chuyên cần dành cho giáo viên
          </p>
          <p className="text-[10px] text-slate-400">
            Tối ưu cho học sinh tiểu học (6 - 11 tuổi) • Hỗ trợ học tập ngoại tuyến & Đồng bộ an toàn
          </p>
        </div>
      </footer>
    </div>
  );
}
