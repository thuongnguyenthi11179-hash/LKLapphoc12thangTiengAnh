import React, { useState, useEffect, useRef } from 'react';
import { MonthInfo, PronunciationResult, StudentProfile } from '../types';
import { MouthVisualizer } from './MouthVisualizer';
import { SongPlayerCard } from './SongPlayerCard';
import { useSong } from '../context/SongContext';
import {
  Volume2,
  Mic,
  MicOff,
  Star,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Flag,
  Award,
  Check,
  AlertCircle,
  HelpCircle,
  VolumeX,
  Play,
} from 'lucide-react';
import {
  speakEnglishWord,
  speakVietnameseComment,
  stopAllSpeech,
  playStarSuccessSound,
  playGoodAttemptSound,
  playEncourageSound,
  playClickSound,
} from '../utils/audioUtils';
import confetti from 'canvas-confetti';

interface MonthStudyViewProps {
  currentMonth: MonthInfo;
  student: StudentProfile;
  completedMonthIds: number[];
  onSelectMonth: (monthId: number) => void;
  onUpdateStars: (starsEarned: number, monthId: number) => void;
  onOpenRacingMode: () => void;
  onOpenStudentModal?: () => void;
}

export const MonthStudyView: React.FC<MonthStudyViewProps> = ({
  currentMonth,
  student,
  completedMonthIds,
  onSelectMonth,
  onUpdateStars,
  onOpenRacingMode,
  onOpenStudentModal,
}) => {
  const { pauseSong, isPlaying: isSongPlaying } = useSong();
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isSpeakingComment, setIsSpeakingComment] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualTest, setShowManualTest] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Auto welcome greeting voice cue
  const greetingText = `Chào mừng ${student.name} ${student.className} đã sẵn sàng! Hôm nay chúng mình cùng học ${currentMonth.vietnameseName} (${currentMonth.name}) nhé!`;

  // Play voice cue
  const handlePlayGreeting = () => {
    if (isSongPlaying) pauseSong();
    stopAllSpeech();
    setIsSpeakingComment(true);
    speakVietnameseComment(greetingText).finally(() => setIsSpeakingComment(false));
  };

  // Play native English audio
  const handlePlayEnglishAudio = async () => {
    if (isSongPlaying) pauseSong();
    playClickSound();
    stopAllSpeech();
    setIsAudioPlaying(true);
    await speakEnglishWord(currentMonth.name, 0.85);
    setIsAudioPlaying(false);
  };

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
        setSpokenTranscript('');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setSpokenTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicError('Quyền sử dụng Micro bị chặn. Con có thể bấm cho phép hoặc dùng nút thử nhanh bên dưới.');
        } else if (event.error === 'no-speech') {
          setMicError('Chưa nghe thấy giọng đọc. Con bấm micro và đọc to rõ lại nhé!');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setMicError('Trình duyệt chưa hỗ trợ Web Speech trực tiếp. Con có thể sử dụng chế độ luyện tập thay thế.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      stopAllSpeech();
    };
  }, []);

  // When spokenTranscript is recorded or submitted, analyze it
  const handleStartListening = () => {
    if (isSongPlaying) pauseSong();
    playClickSound();
    setResult(null);
    setMicError(null);
    setSpokenTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.start();
        } catch (_) {}
      }
    } else {
      setShowManualTest(true);
    }
  };

  const handleStopListeningAndEvaluate = (textOverride?: string) => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);

    const speechToAnalyze = textOverride !== undefined ? textOverride : spokenTranscript;
    evaluateSpeech(speechToAnalyze);
  };

  // Submit and evaluate with AI
  const evaluateSpeech = async (spoken: string) => {
    setIsAnalyzing(true);
    const text = spoken.trim() || 'Thử đọc';

    try {
      const res = await fetch('/api/analyze-pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetWord: currentMonth.name,
          studentSpoken: text,
          targetMonthInfo: currentMonth,
          studentName: student.name,
        }),
      });

      const data = await res.json();
      const score = data.score || 3;

      const evalResult: PronunciationResult = {
        score,
        recognizedText: text,
        targetWord: currentMonth.name,
        aiComment: data.aiComment,
        syllableFeedback: data.syllableFeedback || [
          { syllable: currentMonth.name, status: score >= 4 ? 'correct' : 'needs_work' },
        ],
        soundNotice: data.soundNotice,
        cheerQuote: data.cheerQuote,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      };

      setResult(evalResult);
      onUpdateStars(score, currentMonth.id);

      // Sound & confetti effects according to score
      if (score === 5) {
        playStarSuccessSound();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6'],
        });
      } else if (score >= 3) {
        playGoodAttemptSound();
      } else {
        playEncourageSound();
      }

      // Voice readback of AI comment
      speakVietnameseComment(data.aiComment);
    } catch (err) {
      console.error(err);
      // Fallback evaluation
      const fallbackScore = text.toLowerCase().includes(currentMonth.name.toLowerCase().slice(0, 3)) ? 4 : 2;
      const fallbackResult: PronunciationResult = {
        score: fallbackScore,
        recognizedText: text,
        targetWord: currentMonth.name,
        aiComment:
          fallbackScore >= 4
            ? `Khen ngợi ${student.name}! Con phát âm rất tốt, âm điệu tự nhiên! ⭐⭐⭐⭐`
            : `Động viên ${student.name}! Con hãy nghe kỹ âm mẫu và nhìn khẩu hình miệng để đọc chuẩn hơn nhé!`,
        syllableFeedback: currentMonth.syllables.map((syl) => ({
          syllable: syl,
          status: fallbackScore >= 4 ? 'correct' : 'needs_work',
        })),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      };
      setResult(fallbackResult);
      onUpdateStars(fallbackScore, currentMonth.id);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextMonth = () => {
    playClickSound();
    stopAllSpeech();
    setResult(null);
    setSpokenTranscript('');
    const nextId = currentMonth.id === 12 ? 1 : currentMonth.id + 1;
    onSelectMonth(nextId);
  };

  const handlePrevMonth = () => {
    playClickSound();
    stopAllSpeech();
    setResult(null);
    setSpokenTranscript('');
    const prevId = currentMonth.id === 1 ? 12 : currentMonth.id - 1;
    onSelectMonth(prevId);
  };

  return (
    <div className="space-y-5">
      {/* THẺ GHI HỌ TÊN & LỚP TRƯỚC KHI BẮT ĐẦU HỌC ĐỂ GIÁO VIÊN THEO DÕI */}
      <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-50 border-2 border-amber-300 rounded-3xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <span className="text-4xl p-2 bg-white rounded-2xl shadow-sm border border-amber-200 shrink-0">
            {student.avatar}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Học sinh đang học:</span>
              <h3 className="text-base md:text-lg font-black text-slate-900">{student.name}</h3>
              <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs border border-amber-500">
                {student.className}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              ✨ Giáo viên đang theo dõi: <strong className="text-amber-800">{student.totalStars} ⭐</strong> • Tiến trình: <strong className="text-amber-800">{completedMonthIds.length}/12 tháng</strong> • Cập nhật trực tiếp lên Bàn Giáo Viên
            </p>
          </div>
        </div>

        {onOpenStudentModal && (
          <button
            onClick={onOpenStudentModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs md:text-sm shadow-md transition-all cursor-pointer shrink-0 active:scale-95 border border-amber-400"
          >
            <span>📝 Ghi / Đổi Họ Tên & Lớp Trước Khi Học</span>
          </button>
        )}
      </div>

      {/* 1. LỜI CHÀO / CHỈ DẪN GIỌNG NÓI & 2. TRẠNG THÁI NHIỆM VỤ */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-4 md:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-15 pointer-events-none flex items-center pr-6 text-8xl">
          {currentMonth.illustrationIcon}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>🏫 Trường Tiểu học Lê Kim Lăng - Hòa Xuân - Đà Nẵng</span>
              <span>•</span>
              <span>App học 12 tháng Tiếng Anh</span>
            </div>

            {/* Voice cue text with speech button */}
            <div className="flex items-start gap-3">
              <button
                onClick={handlePlayGreeting}
                title="Bấm để nghe cô AI đọc lời chào"
                className="mt-1 w-9 h-9 rounded-full bg-white text-orange-600 flex items-center justify-center hover:bg-orange-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
              >
                {isSpeakingComment ? (
                  <Volume2 className="w-5 h-5 animate-pulse text-rose-600" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
              <div>
                <h2 className="text-lg md:text-2xl font-black leading-snug">
                  {greetingText}
                </h2>
                <p className="text-amber-100 text-xs md:text-sm mt-1">
                  Mùa: <span className="font-bold underline">{currentMonth.seasonVietnamese}</span> • Chủ đề:{' '}
                  {currentMonth.culturalEvent}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Trạng thái Nhiệm vụ (Tiến trình hoàn thành) */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/25 shrink-0 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span>Tiến trình hoàn thành:</span>
              <span className="text-amber-200 text-sm">
                {completedMonthIds.length} / 12 tháng
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-amber-300 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.round((completedMonthIds.length / 12) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-amber-100">
              <span>Tổng số sao: {student.totalStars} ⭐</span>
              <button
                onClick={onOpenRacingMode}
                className="font-bold text-white underline hover:text-amber-200 transition-colors cursor-pointer"
              >
                Vào Đua xe 🏎️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BÀI HÁT 12 THÁNG TIẾNG ANH (AUDIO BÀI HÁT THE MONTHS OF THE YEAR) */}
      <SongPlayerCard
        currentMonthId={currentMonth.id}
        onSelectMonth={onSelectMonth}
      />

      {/* MONTH HEADER NAVIGATION & MULTIMEDIA CARD */}
      <div className="bg-white rounded-3xl p-5 md:p-7 border-2 border-amber-200/80 shadow-lg">
        {/* Navigation between months */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <button
            onClick={handlePrevMonth}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 font-bold text-xs md:text-sm transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Tháng trước
          </button>

          {/* Month selector pills */}
          <div className="text-center">
            <span
              className={`inline-block text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-1 ${currentMonth.seasonBg}`}
            >
              {currentMonth.seasonVietnamese} ({currentMonth.season})
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl md:text-4xl">{currentMonth.illustrationIcon}</span>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                {currentMonth.name}
              </h1>
              <span className="text-base md:text-xl font-bold text-slate-500">
                ({currentMonth.vietnameseName})
              </span>
            </div>
          </div>

          <button
            onClick={handleNextMonth}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 font-bold text-xs md:text-sm transition-all cursor-pointer"
          >
            Tháng sau <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* CULTURAL ACTIVITY & AUDIO SAMPLE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: Native audio button + Pronunciation sample + Cultural lore */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 md:p-5 rounded-2xl border border-amber-200">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-800 bg-amber-200/70 px-2.5 py-1 rounded-lg">
                  🔊 Mẫu phát âm chuẩn
                </span>
                <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {currentMonth.ipa}
                </span>
              </div>

              {/* Big listen button */}
              <button
                onClick={handlePlayEnglishAudio}
                className={`w-full py-4 px-5 rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md ${
                  isAudioPlaying
                    ? 'bg-amber-500 text-white scale-[0.99] ring-4 ring-amber-300'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:brightness-105 active:scale-98'
                }`}
              >
                <Volume2 className={`w-7 h-7 ${isAudioPlaying ? 'animate-bounce' : ''}`} />
                <span>{isAudioPlaying ? 'Đang phát âm mẫu...' : `Nghe phát âm: "${currentMonth.name}"`}</span>
              </button>

              <p className="text-center text-xs text-slate-500 mt-2">
                Nhấn nhiều lần để nghe giọng bản xứ đọc chuẩn từng âm tiết
              </p>
            </div>

            {/* Cultural & Le Kim Lang School lore */}
            <div className="space-y-2 pt-3 border-t border-amber-200/60">
              <div className="bg-white/90 p-3 rounded-xl border border-amber-200">
                <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <span>🎏 Lễ hội & Văn hóa Việt Nam:</span>
                </p>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {currentMonth.culturalEvent}
                </p>
              </div>

              <div className="bg-white/90 p-3 rounded-xl border border-amber-200">
                <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                  <span>🎒 Hoạt động trường Lê Kim Lăng:</span>
                </p>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {currentMonth.schoolActivity}
                </p>
              </div>

              <div className="bg-amber-100/70 p-2.5 rounded-xl border border-amber-300 text-xs text-amber-900">
                <span className="font-bold">Mẫu câu ứng dụng: </span>
                <span className="italic">"{currentMonth.exampleSentence}"</span>
                <span className="block text-[11px] text-amber-800 mt-0.5">
                  ({currentMonth.exampleSentenceVi})
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Mouth Articulation Visualizer */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <MouthVisualizer month={currentMonth} />
          </div>
        </div>

        {/* 3. QUY TRÌNH PHÂN TÍCH PHÁT ÂM & PHẢN HỒI (AI FEEDBACK LOOP) */}
        <div className="mt-6 pt-6 border-t-2 border-dashed border-amber-200">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 md:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Thầy/Cô AI LKL Chấm Điểm
                </span>
                <h3 className="text-xl md:text-2xl font-black mt-2 text-white">
                  Đến lượt {student.name} phát âm từ "{currentMonth.name}"!
                </h3>
                <p className="text-slate-300 text-xs md:text-sm mt-1">
                  Bấm nút micro lớn màu đỏ bên dưới, đọc thật to và rõ ràng nhé!
                </p>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2">
                {isListening && (
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full text-xs font-bold animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    Đang lắng nghe giọng con...
                  </span>
                )}
                {isAnalyzing && (
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold">
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    AI LKL đang phân tích từng âm...
                  </span>
                )}
              </div>
            </div>

            {/* BIG MICROPHONE INTERACTION ZONE */}
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="relative">
                {/* Glow ring when listening */}
                {isListening && (
                  <>
                    <div className="absolute -inset-4 rounded-full bg-red-500/30 animate-ping pointer-events-none" />
                    <div className="absolute -inset-8 rounded-full bg-red-500/15 animate-pulse pointer-events-none" />
                  </>
                )}

                <button
                  onClick={
                    isListening ? () => handleStopListeningAndEvaluate() : handleStartListening
                  }
                  className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-2xl cursor-pointer ${
                    isListening
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 ring-8 ring-red-400/40 text-white animate-pulse'
                      : 'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-white hover:scale-105 ring-4 ring-white/20'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-10 h-10 md:w-12 md:h-12" />
                      <span className="text-[11px] font-black uppercase mt-1">Dừng & Chấm</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-10 h-10 md:w-12 md:h-12" />
                      <span className="text-[11px] font-black uppercase mt-1">Bấm để nói</span>
                    </>
                  )}
                </button>
              </div>

              {/* Recognized text speech bubble */}
              {spokenTranscript && (
                <div className="bg-slate-800/90 border border-amber-400/50 rounded-2xl px-5 py-2.5 max-w-md text-center">
                  <p className="text-xs text-amber-300 font-semibold mb-0.5">Giọng đọc nhận diện được:</p>
                  <p className="text-lg font-bold text-white tracking-wide">"{spokenTranscript}"</p>
                </div>
              )}

              {/* Mic error / fallback message */}
              {micError && (
                <div className="bg-amber-900/60 border border-amber-500/40 rounded-xl px-4 py-2 text-xs text-amber-200 flex items-center gap-2 max-w-md">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{micError}</span>
                </div>
              )}

              {/* Testing / Manual speech options for demo & accessibility */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleStopListeningAndEvaluate(currentMonth.name)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
                >
                  🌟 Thử đọc chuẩn mẫu (5 ⭐)
                </button>
                <button
                  onClick={() =>
                    handleStopListeningAndEvaluate(
                      currentMonth.name.length > 5 ? currentMonth.name.slice(0, 4) : 'Wrong'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all cursor-pointer"
                >
                  ⚡ Thử đọc gần đúng (3-4 ⭐)
                </button>
                <button
                  onClick={() => setShowManualTest(!showManualTest)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                >
                  ⌨️ Nhập giọng thử
                </button>
              </div>

              {showManualTest && (
                <div className="flex items-center gap-2 max-w-sm w-full mt-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={`Gõ từ đã đọc (vd: ${currentMonth.name})...`}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => {
                      if (manualInput.trim()) {
                        handleStopListeningAndEvaluate(manualInput.trim());
                        setManualInput('');
                      }
                    }}
                    className="px-3 py-2 bg-amber-500 text-slate-900 rounded-xl font-bold text-xs hover:bg-amber-400 transition-all cursor-pointer"
                  >
                    Chấm điểm
                  </button>
                </div>
              )}
            </div>

            {/* 3. KẾT QUẢ PHÂN TÍCH PHÁT ÂM (OUTPUT FORMAT THEO ĐÚNG ĐẶC TẢ) */}
            {result && (
              <div className="mt-6 pt-6 border-t border-slate-800 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-slate-800/90 rounded-2xl p-5 md:p-6 border-2 border-amber-400/40 shadow-inner space-y-4">
                  {/* Header of result */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {result.score === 5 ? '🏆' : result.score >= 3 ? '👏' : '💪'}
                      </span>
                      <div>
                        <h4 className="font-black text-lg md:text-xl text-white">
                          Kết quả Phân tích Phát âm
                        </h4>
                        <p className="text-xs text-slate-400">Thời điểm: {result.timestamp}</p>
                      </div>
                    </div>

                    {/* Star Rating Display */}
                    <div className="flex items-center gap-1.5 bg-slate-900/80 px-4 py-2 rounded-xl border border-amber-400/50">
                      <span className="text-xs font-bold text-amber-200 mr-1">Score:</span>
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-6 h-6 ${
                            starIdx <= result.score
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-bounce'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-base font-black text-amber-300">
                        {result.score}/5 ⭐
                      </span>
                    </div>
                  </div>

                  {/* Visual Feedback (Màu xanh: Đúng / Màu đỏ: Sai ở âm nào) */}
                  <div>
                    <p className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                      Phân tích trực quan từng âm tiết (Visual Feedback):
                    </p>
                    <div className="flex flex-wrap gap-2.5 items-center">
                      {result.syllableFeedback.map((item, idx) => (
                        <div
                          key={idx}
                          className={`px-4 py-2.5 rounded-xl font-black text-sm md:text-base flex items-center gap-2 border-2 transition-all ${
                            item.status === 'correct'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                              : 'bg-rose-950/80 text-rose-300 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.2)] animate-pulse'
                          }`}
                        >
                          {item.status === 'correct' ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                          )}
                          <span>{item.syllable}</span>
                          <span className="text-[10px] font-normal opacity-80">
                            {item.status === 'correct' ? '(Chuẩn)' : '(Cần sửa)'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Màu xanh: Đúng âm
                      </span>
                      <span className="flex items-center gap-1 text-rose-400 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Màu đỏ: Cần sửa khẩu hình
                      </span>
                    </p>
                  </div>

                  {/* AI Comment bằng tiếng Việt */}
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      result.score === 5
                        ? 'bg-emerald-900/40 border-emerald-500 text-emerald-100'
                        : result.score >= 3
                        ? 'bg-amber-900/40 border-amber-500 text-amber-100'
                        : 'bg-rose-900/40 border-rose-500 text-rose-100'
                    }`}
                  >
                    <button
                      onClick={() => speakVietnameseComment(result.aiComment)}
                      title="Nghe lại lời nhận xét"
                      className="mt-0.5 p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white shrink-0 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                        Lời nhận xét từ Thầy/Cô AI LKL:
                      </p>
                      <p className="text-sm md:text-base font-semibold leading-relaxed">
                        {result.aiComment}
                      </p>
                      {result.soundNotice && (
                        <p className="text-xs opacity-90 pt-1 text-amber-300">
                          📌 Nhắc nhở âm vị: {result.soundNotice}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons after result */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={handleStartListening}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs md:text-sm font-bold transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Luyện đọc lại lần nữa
                    </button>

                    <button
                      onClick={handleNextMonth}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs md:text-sm transition-all shadow-md cursor-pointer ml-auto"
                    >
                      Học tháng tiếp theo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK MONTH NAVIGATION THUMBNAILS (4 SEASONS GRID) */}
      <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-sm">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
          Bản đồ 12 Tháng Trường Lê Kim Lăng (Chọn nhanh):
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((mId) => {
            const isSelected = mId === currentMonth.id;
            const isCompleted = completedMonthIds.includes(mId);
            return (
              <button
                key={mId}
                onClick={() => {
                  playClickSound();
                  stopAllSpeech();
                  setResult(null);
                  onSelectMonth(mId);
                }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-900 border-amber-500 font-black ring-2 ring-amber-400 shadow-md scale-105'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 font-semibold'
                }`}
              >
                <span className="text-xs">T.{mId}</span>
                <span className="text-[10px] truncate max-w-[65px]">
                  {isCompleted ? '⭐ Đạt' : 'Chưa học'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
