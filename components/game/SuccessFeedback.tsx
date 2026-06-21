'use client';

import { GameType } from '@/types/game';
import ScoreCounter from './ScoreCounter';

interface SuccessFeedbackProps {
  stationNumber: number;
  totalStations: number;
  answer: string;
  gameType?: GameType;
  onContinue: () => void;
  onBack?: () => void;
}

const REWARD_POINTS = 100;

export default function SuccessFeedback({
  stationNumber,
  totalStations,
  answer,
  gameType,
  onContinue,
  onBack,
}: SuccessFeedbackProps) {
  const isLast = stationNumber >= totalStations;
  const isLibrary = gameType === 'library';
  const unitLabel = isLibrary ? 'ספר' : 'תחנה';
  const nextLabel = isLibrary ? 'הספר הבא מחכה' : 'התחנה הבאה מחכה';
  const stageLabel = isLast ? 'המשימה הושלמה' : `${unitLabel} ${stationNumber} מתוך ${totalStations}`;

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center justify-center px-6 py-6 sm:py-8" dir="rtl">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22rem] h-[22rem] bg-[#00FBFB]/8 rounded-full blur-[140px] pointer-events-none" />

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

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full gap-3.5 sm:gap-4">
        <div
          className="anim-success-badge w-20 h-20 sm:w-[5.5rem] sm:h-[5.5rem] rounded-[1.55rem] bg-[#1a2a2a] border border-[#00FBFB]/35 flex items-center justify-center"
          style={{ boxShadow: '0 0 40px rgba(0,251,251,0.2), inset 0 0 0 1px rgba(255,255,255,0.06)' }}
        >
          <span className="text-[2.65rem] text-white drop-shadow-[0_0_16px_rgba(0,251,251,0.4)]">✓</span>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">
            {stageLabel}
          </p>
          <h1
            className="anim-success-title font-headline text-[3.7rem] sm:text-[4rem] font-bold text-white leading-none"
            style={{ animationDelay: '120ms', textShadow: '0 0 28px rgba(233,195,73,0.14)' }}
          >
            {isLast ? 'הצלחתם!' : 'נכון!'}
          </h1>
          <p className="w-full text-center text-[#e5e2e1]/58 text-[15px] sm:text-base leading-relaxed">
            {isLast ? 'פתרתם את כל החידות בהצלחה' : nextLabel}
          </p>
        </div>

        <div
          className="anim-success-chip inline-flex items-center gap-2.5 bg-[#161d1d] border border-[#00FBFB]/18 rounded-full px-4 py-2"
          style={{ animationDelay: '240ms', boxShadow: '0 0 16px rgba(0,251,251,0.07)' }}
        >
          <span className="text-lg">🏆</span>
          <span className="text-[#e9c349] text-sm font-semibold">קיבלת 100 נקודות</span>
        </div>

        <div
          className="anim-success-chip flex items-center gap-2.5 bg-[#131313] border border-[#00FBFB]/20 rounded-xl px-5 py-2.5"
          style={{ animationDelay: '320ms' }}
        >
          <span className="text-[#e5e2e1]/40 text-[11px] tracking-[0.18em]">הפתרון</span>
          <span
            className="font-headline font-bold text-[1.65rem] text-[#00FBFB] tracking-[0.12em]"
            style={{ textShadow: '0 0 20px rgba(0,251,251,0.5)' }}
          >
            {answer}
          </span>
        </div>

        <div
          className="anim-success-chip anim-success-reward-glow relative overflow-hidden w-full rounded-[1.6rem] border border-[#e9c349]/30 bg-[linear-gradient(180deg,rgba(32,28,18,0.98),rgba(18,18,18,0.98))] px-5 py-[1.125rem]"
          style={{ animationDelay: '420ms' }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#f7d569]/0 via-[#f7d569]/10 to-[#f7d569]/0"
            style={{ animation: 'shimmer 3.2s ease-in-out infinite' }}
          />
          <div className="relative">
            <p className="text-[11px] tracking-[0.3em] text-[#e9c349]/80 mb-1.5">נקודות</p>
            <div dir="ltr" className="flex items-end justify-center gap-1">
              <ScoreCounter
                targetValue={REWARD_POINTS}
                finalDisplay="100"
                delayMs={620}
                durationMs={820}
                className="font-headline font-bold text-[4.15rem] sm:text-[4.45rem] leading-none text-[#f7d569]"
                finishClassName="anim-success-score-finish"
              />
            </div>
          </div>
        </div>

        <div className="w-full anim-success-cta-enter pt-0.5" style={{ animationDelay: '1180ms' }}>
          <button
            onClick={onContinue}
            className="w-full relative overflow-hidden bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-[15px] tracking-[0.22em] uppercase py-[1.125rem] rounded-xl active:scale-[0.98] transition-all"
            style={{ boxShadow: '0 0 20px rgba(0,251,251,0.08)' }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#00FBFB]/0 via-[#00FBFB]/10 to-[#00FBFB]/0"
              style={{ animation: 'shimmer 2.8s ease-in-out infinite' }}
            />
            <span className="relative z-10">
              {isLast ? 'לסיכום הסופי' : 'המשיכו'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
