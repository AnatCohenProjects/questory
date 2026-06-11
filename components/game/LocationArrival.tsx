'use client';

import { GameType } from '@/types/game';

interface LocationArrivalProps {
  stationNumber: number;
  gameType?: GameType;
  bookTitle?: string;
  bookAuthor?: string;
  onContinue: () => void;
  onBack?: () => void;
}

export default function LocationArrival({
  stationNumber,
  gameType,
  bookTitle,
  bookAuthor,
  onContinue,
  onBack,
}: LocationArrivalProps) {
  const isLibrary = gameType === 'library';
  const stationLabel = isLibrary ? 'ספר' : 'תחנה';
  const arrivedLabel = isLibrary ? 'הגעתם לספר' : 'הגעתם לתחנה';
  const icon = isLibrary ? '📖' : '📍';

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center justify-center px-6" dir="rtl">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00FBFB]/6 rounded-full blur-[140px] pointer-events-none" />

      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#0E0E0E]/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="w-8 h-8 rounded-full border border-[#3a4a49]/50 text-[#e5e2e1]/60 active:scale-95 transition-transform flex items-center justify-center"
            >
              →
            </button>
          )}
          <div className="w-8 h-8 rounded-full border border-[#00FBFB]/30 flex items-center justify-center bg-[#131313]">
            <span className="text-[#00FBFB] text-sm font-bold font-headline">Q</span>
          </div>
          <span className="font-headline tracking-[0.2em] text-base font-bold text-[#00FBFB]">QUESTORY</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">
          {stationLabel} {stationNumber}
        </span>
      </header>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full gap-6 anim-fade-up">
        {!isLibrary && (
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-[#00FBFB]/40" />
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">אות זוהה</p>
            <div className="h-px w-10 bg-[#00FBFB]/40" />
          </div>
        )}

        <div className="space-y-1">
          <h1 className="font-headline text-5xl font-bold tracking-tight text-white leading-none">
            {arrivedLabel}
          </h1>
          {isLibrary && bookTitle ? (
            <div className="mt-4 space-y-1">
              <h2
                className="font-headline text-3xl font-bold text-[#00FBFB] leading-snug"
                style={{ textShadow: '0 0 30px rgba(0,251,251,0.5)' }}
              >
                {bookTitle}
              </h2>
              {bookAuthor && <p className="text-[#e5e2e1]/40 text-sm">{bookAuthor}</p>}
            </div>
          ) : !isLibrary ? (
            <h2
              className="font-headline text-5xl font-bold text-[#00FBFB] leading-none"
              style={{ textShadow: '0 0 30px rgba(0,251,251,0.5)' }}
            >
              {stationNumber}
            </h2>
          ) : null}
        </div>

        <div
          className="w-20 h-20 rounded-2xl bg-[#131313] border border-[#00FBFB]/20 flex items-center justify-center"
          style={{ boxShadow: '0 0 30px rgba(0,251,251,0.15)' }}
        >
          <span className="text-4xl">{icon}</span>
        </div>

        <div className="w-full mt-2">
          <button
            onClick={onContinue}
            className="w-full bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-lg tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all"
            style={{ boxShadow: '0 0 20px rgba(0,251,251,0.08)' }}
          >
            המשיכו
          </button>
        </div>
      </div>
    </div>
  );
}
