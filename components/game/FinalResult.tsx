'use client';

import { GameSession, GameType } from '@/types/game';

interface FinalResultProps {
  session: GameSession;
  gameTitle: string;
  totalStations: number;
  gameType?: GameType;
  onRestart: () => void;
  onBack?: () => void;
}

export default function FinalResult({ session, gameTitle, totalStations, gameType, onRestart, onBack }: FinalResultProps) {
  const stationsLabel = gameType === 'library' ? 'ספרים' : 'תחנות';
  const completedCount = session.completedStations.length;
  const skippedCount = session.completedStations.filter(s => s.discovery === 'דולג').length;
  const solvedCount = completedCount - skippedCount;
  const totalHints = session.completedStations.reduce((acc, s) => acc + s.hintsUsed, 0);

  // ניקוד פשוט
  const score = solvedCount * 100 - totalHints * 10;

  // דירוג
  const rank = score >= 250 ? 'מגלה אגדי' : score >= 150 ? 'חוקר מנוסה' : 'חוקר מתחיל';
  const rankIcon = score >= 250 ? '🏆' : score >= 150 ? '⭐' : '🔍';

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center" dir="rtl">

      {/* Ambient */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00FBFB]/6 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-72 h-72 bg-[#e9c349]/4 rounded-full blur-[120px] pointer-events-none" />
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

      <main className="relative z-10 flex flex-col w-full max-w-md px-6 pt-16 pb-12 gap-8">

        {/* Header */}
        <div className="text-center space-y-2 anim-fade-up">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">משימה הושלמה</p>
          <h1 className="font-headline text-5xl font-bold text-white leading-none">סיכום</h1>
          <p className="text-[#e5e2e1]/40 text-sm">{gameTitle}</p>
        </div>

        {/* Rank badge */}
        <div
          className="flex flex-col items-center gap-3 bg-[#131313] border border-[#e9c349]/20 rounded-2xl py-8 anim-scale-in"
          style={{ animationDelay: '150ms', boxShadow: '0 0 30px rgba(233,195,73,0.06)' }}
        >
          <span className="text-5xl">{rankIcon}</span>
          <p className="font-headline font-bold text-2xl text-[#e9c349]">{rank}</p>
          <p className="font-headline font-bold text-4xl text-white">{score} נק׳</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 anim-fade-up" style={{ animationDelay: '200ms' }}>
          {[
            { label: stationsLabel, value: `${solvedCount}/${totalStations}`, color: 'text-[#00FBFB]' },
            { label: 'רמזים', value: totalHints, color: 'text-[#e9c349]' },
            { label: 'דולגו', value: skippedCount, color: 'text-[#e5e2e1]/50' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#131313] border border-[#3a4a49]/40 rounded-xl py-4 text-center">
              <p className={`font-headline font-bold text-2xl ${color}`}>{value}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Station breakdown */}
        <div className="bg-[#131313] border border-[#3a4a49]/40 rounded-2xl overflow-hidden anim-fade-up" style={{ animationDelay: '250ms' }}>
          <div className="px-5 py-4 border-b border-[#3a4a49]/30">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#00FBFB]/60">פירוט {stationsLabel}</p>
          </div>
          {session.completedStations.map((s, i) => (
            <div key={s.stationId} className="flex items-center justify-between px-5 py-4 border-b border-[#3a4a49]/20 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  s.discovery === 'דולג' ? 'bg-[#1c1b1b] text-[#e5e2e1]/30' : 'bg-[#1a2a2a] text-[#00FBFB]'
                }`}>
                  {i + 1}
                </div>
                <span className="text-[#e5e2e1]/70 text-sm">{s.name}</span>
              </div>
              <span className={`text-sm font-mono ${s.discovery === 'דולג' ? 'text-[#e5e2e1]/25' : 'text-[#00FBFB]'}`}>
                {s.discovery === 'דולג' ? 'דולג' : s.discovery}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3 anim-fade-up" style={{ animationDelay: '300ms' }}>
          <button
            onClick={onRestart}
            className="w-full bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-base tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all"
            style={{ boxShadow: '0 0 20px rgba(0,251,251,0.08)' }}
          >
            שחקו שוב
          </button>
          <button className="w-full text-[#e5e2e1]/25 text-[11px] uppercase tracking-widest py-3">
            שתפו את התוצאה
          </button>
        </div>

      </main>
    </div>
  );
}
