import React from 'react';
import { MonthInfo } from '../types';
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MouthVisualizerProps {
  month: MonthInfo;
}

export const MouthVisualizer: React.FC<MouthVisualizerProps> = ({ month }) => {
  // Render distinct mouth shape illustration based on month's mouthShapeType
  const renderMouthShape = () => {
    switch (month.mouthShapeType) {
      case 'teeth-lip': // February (/f/), November (/v/), September (/s/)
        return (
          <svg viewBox="0 0 160 120" className="w-full h-36">
            <defs>
              <linearGradient id="lipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
            {/* Upper Lip */}
            <path
              d="M 30,50 Q 80,30 130,50 Q 80,42 30,50 Z"
              fill="url(#lipGrad)"
              stroke="#be123c"
              strokeWidth="2"
            />
            {/* Upper Teeth visible touching lower lip */}
            <rect x="55" y="48" width="12" height="15" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <rect x="68" y="47" width="12" height="16" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <rect x="81" y="47" width="12" height="16" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <rect x="94" y="48" width="12" height="15" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Lower Lip curled slightly inward touching teeth */}
            <path
              d="M 35,58 Q 80,78 125,58 Q 80,68 35,58 Z"
              fill="url(#lipGrad)"
              stroke="#be123c"
              strokeWidth="2"
            />
            {/* Airflow / vibration glow */}
            <circle cx="80" cy="58" r="8" fill="#38bdf8" opacity="0.4" className="animate-ping" />
            <text x="80" y="98" textAnchor="middle" fill="#0284c7" fontSize="11" fontWeight="bold">
              Răng trên cắn nhẹ môi dưới
            </text>
          </svg>
        );

      case 'round-pout': // January (/dʒ/), June (/dʒ/), October (/ɒ/)
        return (
          <svg viewBox="0 0 160 120" className="w-full h-36">
            <defs>
              <linearGradient id="roundLipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
            {/* Mouth opening is rounded circle */}
            <ellipse cx="80" cy="55" rx="30" ry="24" fill="#881337" />
            {/* Tongue inside */}
            <ellipse cx="80" cy="62" rx="20" ry="12" fill="#f43f5e" opacity="0.9" />
            {/* Rounded Pouted Lips */}
            <path
              d="M 40,55 C 40,32 120,32 120,55 C 120,78 40,78 40,55 Z"
              fill="none"
              stroke="url(#roundLipGrad)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Air blast arrows */}
            <path d="M 80,45 L 80,25 M 75,30 L 80,22 L 85,30" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <text x="80" y="100" textAnchor="middle" fill="#d97706" fontSize="11" fontWeight="bold">
              Tròn môi chu ra phía trước
            </text>
          </svg>
        );

      case 'wide-smile': // April (/eɪ/), May (/meɪ/)
        return (
          <svg viewBox="0 0 160 120" className="w-full h-36">
            <defs>
              <linearGradient id="smileLipGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            {/* Oral cavity */}
            <path d="M 25,50 Q 80,72 135,50 Q 80,56 25,50 Z" fill="#9f1239" />
            {/* Upper Teeth in smile */}
            <rect x="45" y="48" width="10" height="9" rx="1" fill="#ffffff" />
            <rect x="56" y="47" width="11" height="10" rx="1" fill="#ffffff" />
            <rect x="68" y="46" width="12" height="11" rx="1" fill="#ffffff" />
            <rect x="81" y="46" width="12" height="11" rx="1" fill="#ffffff" />
            <rect x="94" y="47" width="11" height="10" rx="1" fill="#ffffff" />
            <rect x="106" y="48" width="10" height="9" rx="1" fill="#ffffff" />
            {/* Upper Lip stretched smile */}
            <path
              d="M 20,48 Q 80,38 140,48 Q 80,44 20,48 Z"
              fill="url(#smileLipGrad)"
              stroke="#be123c"
              strokeWidth="2"
            />
            {/* Lower Lip stretched smile */}
            <path
              d="M 22,50 Q 80,74 138,50 Q 80,64 22,50 Z"
              fill="url(#smileLipGrad)"
              stroke="#be123c"
              strokeWidth="2"
            />
            <text x="80" y="100" textAnchor="middle" fill="#059669" fontSize="11" fontWeight="bold">
              Mở rộng môi như đang mỉm cười
            </text>
          </svg>
        );

      case 'open-jaw': // March (/ɑː/), July (/laɪ/), August (/ɔː/)
      default:
        return (
          <svg viewBox="0 0 160 120" className="w-full h-36">
            <defs>
              <linearGradient id="openLipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
            {/* Deep open mouth cavity */}
            <ellipse cx="80" cy="54" rx="28" ry="26" fill="#4c0519" />
            {/* Tongue low in bottom of mouth */}
            <path d="M 58,62 Q 80,76 102,62 Q 80,55 58,62 Z" fill="#f43f5e" />
            {/* Upper lip arched high */}
            <path
              d="M 35,46 Q 80,24 125,46 Q 80,36 35,46 Z"
              fill="url(#openLipGrad)"
              stroke="#be123c"
              strokeWidth="2"
            />
            {/* Lower lip lowered */}
            <path
              d="M 38,62 Q 80,86 122,62 Q 80,74 38,62 Z"
              fill="url(#openLipGrad)"
              stroke="#be123c"
              strokeWidth="2"
            />
            <text x="80" y="102" textAnchor="middle" fill="#7c3aed" fontSize="11" fontWeight="bold">
              Mở rộng hàm, hạ thấp lưỡi
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border-2 border-amber-200 shadow-md">
      <div className="flex items-center justify-between mb-3 border-b border-amber-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">👄</span>
          <h3 className="font-bold text-slate-800 text-base md:text-lg">
            Khẩu hình miệng & Vị trí phát âm
          </h3>
        </div>
        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full border border-amber-300">
          Mô hình chuẩn LKL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left: Graphic display */}
        <div className="bg-gradient-to-b from-amber-50/70 to-rose-50/60 rounded-xl p-3 border border-amber-100 flex flex-col items-center justify-center">
          {renderMouthShape()}
          <div className="mt-2 text-center text-xs font-semibold text-slate-600 bg-white/90 px-3 py-1 rounded-lg border border-slate-200 shadow-sm w-full">
            Phiên âm: <span className="font-mono text-rose-600 font-bold text-sm">{month.ipa}</span>
          </div>
        </div>

        {/* Right: Detailed instructions for child */}
        <div className="space-y-2.5 text-xs md:text-sm">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Vị trí Răng & Môi:</p>
              <p className="text-emerald-800">{month.teethLipPosition}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-blue-900">Vị trí Lưỡi:</p>
              <p className="text-blue-800">{month.tonguePosition}</p>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-rose-900">Điểm mù cần tránh:</p>
              <p className="text-rose-800">{month.commonMistake}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Syllable Breakdown with Stress Indicator */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
          Cách ngắt nhịp và nhấn trọng âm:
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          {month.syllables.map((syl, idx) => {
            const isStressed = idx === month.stressedSyllableIndex;
            return (
              <div
                key={idx}
                className={`px-3 py-2 rounded-xl text-center transition-all ${
                  isStressed
                    ? 'bg-amber-400 text-slate-900 font-black shadow-md ring-2 ring-amber-500 scale-105'
                    : 'bg-slate-100 text-slate-700 font-semibold'
                }`}
              >
                <div className="text-sm md:text-base">{syl}</div>
                <div className="text-[10px] mt-0.5 font-normal">
                  {isStressed ? '🔥 Trọng âm (Nhấn mạnh)' : 'Âm nhẹ'}
                </div>
              </div>
            );
          })}
          <div className="ml-auto text-xs text-slate-500 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Đọc liền: <span className="font-bold text-slate-800">{month.phoneticBreakdown}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
