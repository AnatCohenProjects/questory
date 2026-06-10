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
  const arrivedLabel = isLibrary ? 'הספר הבא נחשף!' : 'היעד הבא שלכם';
  const supportText = isLibrary
    ? 'פתרתם את חידת המעבר. עכשיו מצאו את הספר בספרייה.'
    : 'גשו אל היעד ולחצו כשהגעתם.';
  const ctaLabel = isLibrary ? 'מצאתי את הספר' : 'הגעתי ליעד';

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

      <div className="relative z-10 flex flex-col w-full max-w-sm gap-6 anim-fade-up">

        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#e9c349]/80">הישג נפתח</p>
          <h1 className="font-headline text-4xl font-bold text-white leading-tight">{arrivedLabel}</h1>
          <p className="text-[#e5e2e1]/55 text-sm leading-relaxed">{supportText}</p>
        </div>

        <div
          className="relative overflow-hidden bg-[#131313] border border-[#e9c349]/35 rounded-2xl p-6 space-y-3 text-center anim-book-reveal shadow-[0_0_34px_rgba(233,195,73,0.08),0_0_26px_rgba(0,251,251,0.04)]"
        >
          <div className="relative mx-auto mb-3 flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl border border-[#e9c349]/30 bg-[#1a1810] text-[#e9c349] shadow-[0_0_24px_rgba(233,195,73,0.18),0_0_18px_rgba(0,251,251,0.08)]">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 lg:h-9 lg:w-9" fill="none">
              <path d="M5 5.5c0-.9.7-1.6 1.6-1.6H11c.8 0 1.5.3 2 .9.5-.6 1.2-.9 2-.9h4.4c.9 0 1.6.7 1.6 1.6v13.1c0 .6-.6 1-1.1.7-.9-.4-2-.6-3.1-.6-1.6 0-2.9.4-3.8 1.2-.9-.8-2.2-1.2-3.8-1.2-1.1 0-2.2.2-3.1.6-.5.3-1.1-.1-1.1-.7V5.5Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13 4.8v15M8 8h2.2M8 11h2.2M16 8h2.2M16 11h2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="relative font-headline font-bold text-2xl text-white text-glow-cyan">{targetBook.title}</h2>
          {targetBook.author && (
            <p className="relative text-[#e9c349]/80 text-sm font-semibold">{targetBook.author}</p>
          )}
          {targetBook.location && (
            <div className="relative mt-3 pt-3 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-[#e9c349]/60 mb-1">מיקום</p>
              <p className="text-[#e5e2e1]/70 text-sm">{targetBook.location}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
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
