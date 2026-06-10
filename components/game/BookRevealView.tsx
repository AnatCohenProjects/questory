'use client';

import { GameType } from '@/types/game';

interface BookRevealViewProps {
  targetBook: { title: string; author?: string; location?: string };
  gameType?: GameType;
  onContinue: () => void;
  onBack?: () => void;
}

export default function BookRevealView({ targetBook, gameType, onContinue, onBack }: BookRevealViewProps) {
  const isLibrary = gameType === 'library';
  const arrivedLabel = isLibrary ? 'הספר הבא שלכם' : 'היעד הבא שלכם';
  const ctaLabel = isLibrary ? 'הגעתי לספר' : 'הגעתי ליעד';

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center justify-center px-6" dir="rtl">

      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#e9c349]/5 rounded-full blur-[140px] pointer-events-none" />

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

      <div className="relative z-10 flex flex-col w-full max-w-sm gap-8 anim-fade-up">

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#e9c349]/80 mb-1">{arrivedLabel}</p>
        </div>

        <div
          className="bg-[#131313] border border-[#e9c349]/25 rounded-2xl p-6 space-y-3 text-center"
          style={{ boxShadow: '0 0 30px rgba(233,195,73,0.06)' }}
        >
          <div className="text-4xl mb-2">📖</div>
          <h2 className="font-headline font-bold text-2xl text-white">{targetBook.title}</h2>
          {targetBook.author && (
            <p className="text-[#e5e2e1]/50 text-sm">{targetBook.author}</p>
          )}
          {targetBook.location && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-[#e9c349]/60 mb-1">מיקום</p>
              <p className="text-[#e5e2e1]/70 text-sm">{targetBook.location}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-[#e5e2e1]/40 text-sm text-center">גשו למצוא את הספר על המדף, ולחצו כשהוא בידיכם.</p>
          <button
            onClick={onContinue}
            className="w-full bg-[#1a1810] border border-[#e9c349]/30 text-[#e9c349] font-headline font-bold tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
