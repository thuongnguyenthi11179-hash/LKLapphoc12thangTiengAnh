import React, { useState, useEffect } from 'react';
import { MonthInfo, StudentProfile } from '../types';
import { MONTHS_DATA } from '../data/monthsData';
import {
  Trophy,
  Zap,
  Flag,
  RotateCcw,
  Volume2,
  X,
  Sparkles,
  Award,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  speakEnglishWord,
  playStarSuccessSound,
  playTurboBoostSound,
  playClickSound,
} from '../utils/audioUtils';
import confetti from 'canvas-confetti';

interface RacingGameModalProps {
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onAddStars: (stars: number) => void;
}

interface RacerState {
  id: string;
  name: string;
  avatar: string;
  vehicle: string;
  progress: number; // 0 to 100%
  speed: number;
  starsEarned: number;
  rank: number;
  isPlayer?: boolean;
}

export const RacingGameModal: React.FC<RacingGameModalProps> = ({
  student,
  isOpen,
  onClose,
  onAddStars,
}) => {
  if (!isOpen) return null;

  const [gameState, setGameState] = useState<'ready' | 'racing' | 'finished'>('ready');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [targetMonth, setTargetMonth] = useState<MonthInfo>(MONTHS_DATA[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [boostActive, setBoostActive] = useState(false);
  const [lapTime, setLapTime] = useState(0);

  // Racers
  const [racers, setRacers] = useState<RacerState[]>([
    {
      id: 'player',
      name: `${student.name} (${student.className})`,
      avatar: '🏎️',
      vehicle: student.vehicle || 'Tia Chớp Đỏ LKL',
      progress: 0,
      speed: 1,
      starsEarned: 0,
      rank: 1,
      isPlayer: true,
    },
    {
      id: 'bot-1',
      name: 'Bạn Thỏ Thông Thái (3/1)',
      avatar: '🐰',
      vehicle: 'Tàu Bay Cà Rốt',
      progress: 0,
      speed: 0.9,
      starsEarned: 0,
      rank: 2,
    },
    {
      id: 'bot-2',
      name: 'Bạn Sóc Nhanh Nhẹn (3/2)',
      avatar: '🐿️',
      vehicle: 'Xe Hạt Dẻ Thần Tốc',
      progress: 0,
      speed: 0.85,
      starsEarned: 0,
      rank: 3,
    },
    {
      id: 'bot-3',
      name: 'Bạn Rùa Siêu Tốc (3/3)',
      avatar: '🐢',
      vehicle: 'Tên Lửa Mai Vàng',
      progress: 0,
      speed: 0.75,
      starsEarned: 0,
      rank: 4,
    },
  ]);

  // Setup new question
  const prepareQuestion = (idx: number) => {
    const month = MONTHS_DATA[idx % MONTHS_DATA.length];
    setTargetMonth(month);

    // Generate 3 choices (1 correct, 2 distractors)
    const otherMonths = MONTHS_DATA.filter((m) => m.id !== month.id);
    const shuffledOthers = [...otherMonths].sort(() => 0.5 - Math.random());
    const choices = [month.name, shuffledOthers[0].name, shuffledOthers[1].name].sort(
      () => 0.5 - Math.random()
    );
    setOptions(choices);
    setFeedback(null);
  };

  const startRace = () => {
    playTurboBoostSound();
    setGameState('racing');
    setCurrentQuestionIndex(0);
    setLapTime(0);
    setRacers((prev) =>
      prev.map((r) => ({
        ...r,
        progress: 0,
        starsEarned: 0,
      }))
    );
    prepareQuestion(0);
  };

  // Bot progress interval during race
  useEffect(() => {
    if (gameState !== 'racing') return;

    const timer = setInterval(() => {
      setLapTime((t) => t + 1);

      setRacers((prev) => {
        const updated = prev.map((racer) => {
          if (racer.isPlayer) return racer;
          // Random slight bot increment
          const botStep = Math.random() * 2.5 + 1.2;
          const newProgress = Math.min(100, racer.progress + botStep);
          return {
            ...racer,
            progress: newProgress,
          };
        });

        // Calculate rankings
        const sorted = [...updated].sort((a, b) => b.progress - a.progress);
        const withRanks = updated.map((racer) => ({
          ...racer,
          rank: sorted.findIndex((s) => s.id === racer.id) + 1,
        }));

        // Check finish
        const anyFinished = withRanks.some((r) => r.progress >= 100);
        if (anyFinished) {
          setTimeout(() => finishRace(withRanks), 500);
        }

        return withRanks;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [gameState]);

  const handleAnswer = (chosenName: string) => {
    if (gameState !== 'racing') return;

    if (chosenName === targetMonth.name) {
      // Correct! Boost player
      playTurboBoostSound();
      setBoostActive(true);
      setTimeout(() => setBoostActive(false), 800);
      setFeedback(`Chính xác! "${targetMonth.name}" nghĩa là ${targetMonth.vietnameseName}! ⚡ NITRO BOOST!`);

      setRacers((prev) => {
        const next = prev.map((r) => {
          if (r.isPlayer) {
            const nextProg = Math.min(100, r.progress + 22);
            return {
              ...r,
              progress: nextProg,
              starsEarned: r.starsEarned + 2,
            };
          }
          return r;
        });

        const playerRacer = next.find((r) => r.isPlayer);
        if (playerRacer && playerRacer.progress >= 100) {
          finishRace(next);
        }
        return next;
      });

      // Next question after brief pause
      setTimeout(() => {
        const nextIdx = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIdx);
        prepareQuestion(nextIdx);
      }, 700);
    } else {
      // Wrong choice
      setFeedback(`Chưa chính xác rồi con ơi! Con nghe kỹ lại từ "${targetMonth.name}" nhé!`);
      speakEnglishWord(targetMonth.name);
    }
  };

  const finishRace = (finalRacers: RacerState[]) => {
    setGameState('finished');
    playStarSuccessSound();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
    const player = finalRacers.find((r) => r.isPlayer);
    if (player) {
      const rewardStars = player.rank === 1 ? 10 : player.rank === 2 ? 6 : 4;
      onAddStars(rewardStars);
    }
  };

  const playerRacer = racers.find((r) => r.isPlayer);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto text-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏎️</span>
            <div>
              <h2 className="font-black text-lg md:text-xl">
                Đường Đua 12 Tháng Trường Lê Kim Lăng
              </h2>
              <p className="text-xs text-amber-100">
                Tốc độ & Phát âm chuẩn đưa bạn nhỏ Lê Kim Lăng về đích!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 md:p-6 space-y-6 flex-1">
          {/* TRACK VISUALIZER */}
          <div className="bg-slate-950/90 rounded-2xl p-4 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1 font-bold text-amber-300">
                <Flag className="w-3.5 h-3.5" /> Xuất phát: Cổng trường LKL
              </span>
              <span>Đường đua qua 4 Mùa Lễ Hội</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                🏁 Đích: Cúp Vàng Danh Dự
              </span>
            </div>

            {/* Racers lanes */}
            <div className="space-y-3 py-1">
              {racers.map((racer) => (
                <div key={racer.id} className="relative">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">{racer.avatar}</span>
                      <span className={racer.isPlayer ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                        {racer.name}
                      </span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Hạng {racer.rank} • {Math.round(racer.progress)}%
                    </span>
                  </div>

                  {/* Lane bar */}
                  <div className="h-6 bg-slate-800 rounded-full relative overflow-hidden border border-slate-700">
                    {/* Track stripes */}
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        racer.isPlayer
                          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${Math.max(5, racer.progress)}%` }}
                    />
                    {/* Car icon pinned at head */}
                    <div
                      className="absolute top-0 bottom-0 flex items-center transition-all duration-300 transform -translate-x-1/2"
                      style={{ left: `${Math.max(4, Math.min(96, racer.progress))}%` }}
                    >
                      <span className="text-sm drop-shadow">{racer.avatar}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GAME STATE: READY */}
          {gameState === 'ready' && (
            <div className="text-center py-6 space-y-4">
              <div className="text-5xl animate-bounce">🏁</div>
              <h3 className="text-2xl font-black text-amber-400">
                Sẵn sàng tranh tài cùng bạn bè LKL!
              </h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Mỗi câu trả lời đúng từ vựng tháng tiếng Anh sẽ tăng tốc độ xe vượt lên dẫn đầu.
                Đạt hạng 1 nhận ngay 10 Ngôi sao danh dự ⭐!
              </p>
              <button
                onClick={startRace}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-lg transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                <Zap className="w-5 h-5 fill-current" /> BẮT ĐẦU ĐUA XE NGAY!
              </button>
            </div>
          )}

          {/* GAME STATE: RACING */}
          {gameState === 'racing' && (
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-amber-400/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" /> Thử thách tăng tốc xe:
                </span>
                <span className="text-xs bg-slate-900 px-3 py-1 rounded-full text-slate-300">
                  Thời gian: {lapTime}s
                </span>
              </div>

              {/* The prompt question */}
              <div className="text-center space-y-2 py-2">
                <p className="text-xs text-slate-400">
                  Hãy chọn đúng tên tiếng Anh của tháng này:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">{targetMonth.illustrationIcon}</span>
                  <h4 className="text-2xl md:text-3xl font-black text-white">
                    {targetMonth.vietnameseName}
                  </h4>
                </div>
                <p className="text-xs text-amber-200">
                  (Gợi ý: Mùa {targetMonth.seasonVietnamese} • {targetMonth.culturalEvent})
                </p>

                <button
                  onClick={() => speakEnglishWord(targetMonth.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-200 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Nghe phát âm gợi ý
                </button>
              </div>

              {/* Options buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className="p-4 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 hover:border-amber-400 font-black text-base md:text-lg transition-all active:scale-95 cursor-pointer shadow-md text-white text-center"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Feedback text */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl text-center text-xs md:text-sm font-bold animate-in fade-in ${
                    feedback.includes('Chính xác')
                      ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-500'
                      : 'bg-rose-900/50 text-rose-200 border border-rose-500'
                  }`}
                >
                  {feedback}
                </div>
              )}
            </div>
          )}

          {/* GAME STATE: FINISHED */}
          {gameState === 'finished' && (
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
              <div className="text-6xl animate-bounce">
                {playerRacer?.rank === 1 ? '🥇' : playerRacer?.rank === 2 ? '🥈' : '🥉'}
              </div>
              <div>
                <h3 className="text-3xl font-black text-amber-300">
                  {playerRacer?.rank === 1
                    ? 'XUẤT SẮC! BẠN ĐÃ VỀ ĐÍCH HẠNG NHẤT!'
                    : `CHÚC MỪNG CON ĐÃ VỀ ĐÍCH HẠNG ${playerRacer?.rank}!`}
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  Đội tuyển học sinh Trường Tiểu học Lê Kim Lăng tự hào về nỗ lực của con!
                </p>
              </div>

              {/* Stars earned badge */}
              <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-lg shadow-lg">
                <Trophy className="w-6 h-6" />
                <span>
                  Thưởng: +{playerRacer?.rank === 1 ? 10 : playerRacer?.rank === 2 ? 6 : 4} Sao Danh Dự! ⭐
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={startRace}
                  className="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Đua lại chặng mới
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm transition-all cursor-pointer shadow-md"
                >
                  Quay lại Luyện tập
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
