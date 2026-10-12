export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface SyllablePart {
  syllable: string;
  status?: 'correct' | 'needs_work' | 'pending';
}

export interface MonthInfo {
  id: number;
  name: string; // e.g. January
  vietnameseName: string; // e.g. Tháng Một
  season: Season;
  seasonVietnamese: string; // Mùa Xuân
  seasonColor: string; // Tailwind color theme
  seasonBg: string;
  ipa: string; // e.g. /ˈdʒæn.ju.ə.ri/
  syllables: string[]; // ['Jan', 'u', 'ar', 'y']
  stressedSyllableIndex: number; // 0
  phoneticBreakdown: string; // JAN-yoo-air-ee
  culturalEvent: string; // Tết Nguyên Đán, Bánh chưng, Lễ hội hoa trường Lê Kim Lăng
  schoolActivity: string; // Phong trào kế hoạch nhỏ, Lễ khai xuân TH Lê Kim Lăng
  mouthTip: string; // Chi tiết khẩu hình miệng cho học sinh
  mouthShapeType: 'round-pout' | 'wide-smile' | 'open-jaw' | 'teeth-lip' | 'tongue-roof';
  tonguePosition: string; // Vị trí lưỡi
  teethLipPosition: string; // Vị trí răng và môi
  commonMistake: string; // Điểm mù thường gặp của học sinh tiểu học
  exampleSentence: string;
  exampleSentenceVi: string;
  illustrationIcon: string;
}

export interface PronunciationResult {
  score: number; // 1 to 5 stars
  recognizedText: string;
  targetWord: string;
  aiComment: string;
  syllableFeedback: {
    syllable: string;
    status: 'correct' | 'needs_work';
  }[];
  soundNotice?: string;
  cheerQuote?: string;
  timestamp: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  className: string;
  avatar: string;
  vehicle: string;
  vehicleColor: string;
  totalStars: number;
  streakDays: number;
  studyMinutes: number;
  completedMonths: number;
  lastActive: string;
  status: 'Đạt' | 'Cần lưu ý' | 'Xuất sắc';
  problematicMonths: string[];
  badges: string[];
}

export interface TeacherErrorReport {
  monthName: string;
  vietnameseName: string;
  errorRate: number; // percentage, e.g., 70
  commonIssue: string;
  affectedCount: number;
  pedagogicalAdvice: string;
}
