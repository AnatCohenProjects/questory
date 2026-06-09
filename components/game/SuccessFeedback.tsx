'use client';

import { GameType } from '@/types/game';

interface SuccessFeedbackProps {
  stationNumber: number;
  totalStations: number;
  answer: string;
  gameType?: GameType;
  onContinue: () => void;
  onBack?: () => void;
}

export default function SuccessFeedback({ stationNumber, totalStations, answer, gameType, onContinue, onBack }: SuccessFeedbackProps) {
  const isLast = stationNumber >= totalStations;
  const isLibrary = gameType === 'library';
  const unitLabel = isLibrary ? 'ספרים' : 'תחנות';
  const nextLabel = isLibrary ? 'הספר הבא מחכה' : 'התחנה הבאה מחכה';

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center justify-center px-6" dir="rtl">

      {/* Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00FBFB]/8 rounded-full blur-[140px] pointer-events-none" />
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="fixed top-4 right-6 z-20 w-9 h-9 rounded-full border border-[#3a4a49]/50 text-[#e5e2e1]/60 active:scale-95 transition-transform flex items-center justify-center"
        >
          →
        </button>
      )}

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full gap-8 anim-scale-in">

        {/* Icon */}
        <div
          className="w-24 h-24 rounded-2xl bg-[#1a2a2a] border border-[#00FBFB]/30 flex items-center justify-center"
          style={{ boxShadow: '0 0 40px rgba(0,251,251,0.2)' }}
        >
          <span className="text-5xl">✓</span>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">
            {isLast ? 'משימה הושלמה' : `${isLibrary ? 'ספר' : 'תחנה'} ${stationNumber} מתוך ${totalStations}`}
          </p>
          <h1 className="font-headline text-5xl font-bold text-white leading-none">
            {isLast ? 'הצלחתם!' : 'נכון!'}
          </h1>
          <p className="text-[#e5e2e1]/50 text-base leading-relaxed">
            {isLast ? 'פתרתם את כל החידות בהצלחה' : nextLabel}
          </p>
        </div>

        {/* Answer badge */}
        <div className="flex items-center gap-3 bg-[#131313] border border-[#00FBFB]/20 rounded-xl px-6 py-3">
          <span className="text-[#e5e2e1]/40 text-xs uppercase tracking-widest">הפתרון</span>
          <span
            className="font-headline font-bold text-2xl text-[#00FBFB] tracking-widest"
            style={{ textShadow: '0 0 20px rgba(0,251,251,0.5)' }}
          >
            {answer}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 text-center">
          <div>
            <p className="font-headline font-bold text-2xl text-white">{stationNumber}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30 mt-1">{unitLabel}</p>
          </div>
          <div className="w-px bg-[#3a4a49]/40" />
          <div>
            <p className="font-headline font-bold text-2xl text-[#e9c349]">+100</p>
            <p className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30 mt-1">נקודות</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          className="w-full bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-base tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all"
          style={{ boxShadow: '0 0 20px rgba(0,251,251,0.08)' }}
        >
          {isLast ? 'לסיכום הסופי' : 'המשיכו'}
        </button>

      </div>
    </div>
  );
}
