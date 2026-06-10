'use client';

import { useState } from 'react';
import { GameType } from '@/types/game';

interface TransitionRiddleData {
  prompt: string;
  answer?: string;
  media?: { type: 'image' | 'video' | 'audio'; url: string; caption?: string };
  targetBook?: { title: string; author?: string; location?: string };
}

interface MapNextStepProps {
  stationNumber: number;
  totalStations: number;
  navigationHint?: string;
  navigationAnswer?: string;
  currentBook?: { title: string; author?: string; location?: string };
  triggerType: 'code' | 'qr' | 'gps';
  gameType?: GameType;
  transitionRiddle?: TransitionRiddleData;
  onReady: () => void;
  onBack?: () => void;
}

function checkAnswer(input: string, correct: string): boolean {
  const accepted = correct.split('|').map(a => a.trim().toUpperCase());
  return accepted.includes(input.trim().toUpperCase());
}

function getLabels(gameType?: GameType) {
  const isLibrary = gameType === 'library';
  return {
    stationLabel: isLibrary ? 'ספר' : 'תחנה',
    nextLabel: isLibrary ? 'הספר הבא' : 'התחנה הבאה',
    arrivedCta: 'הגעתי ליעד',
    firstFallback: isLibrary
      ? 'המשחק מתחיל עכשיו. מצאו את הספר הראשון, הזינו את הקוד, ופתחו את המשימה הראשונה.'
      : 'המשחק מתחיל עכשיו. מצאו את התחנה הראשונה, הזינו את הקוד, ופתחו את המשימה הראשונה.',
    middleFallback: isLibrary
      ? 'אתם מתקדמים יפה. הספר הבא כבר מחכה. מצאו אותו, הזינו את הקוד, ופתחו את המשימה הבאה.'
      : 'אתם מתקדמים יפה. התחנה הבאה כבר מחכה. מצאו אותה, הזינו את הקוד, ופתחו את המשימה הבאה.',
    lastFallback: isLibrary
      ? 'זהו הספר האחרון במשחק. מצאו אותו, הזינו את הקוד, ופתחו את המשימה המסכמת.'
      : 'זו התחנה האחרונה במשחק. מצאו אותה, הזינו את הקוד, ופתחו את המשימה המסכמת.',
  };
}

export default function MapNextStep({
  stationNumber,
  totalStations,
  navigationHint,
  navigationAnswer,
  currentBook,
  triggerType,
  gameType,
  transitionRiddle,
  onReady,
  onBack,
}: MapNextStepProps) {
  const [riddleInput, setRiddleInput] = useState('');
  const [riddleError, setRiddleError] = useState('');
  const [riddleSolved, setRiddleSolved] = useState(false);

  const labels = getLabels(gameType);
  const isFirst = stationNumber === 1;
  const nextStation = stationNumber < totalStations ? stationNumber + 1 : null;
  const prevStation = stationNumber > 1 ? stationNumber - 1 : null;
  const formatNum = (n: number) => n.toString().padStart(2, '0');

  const fallbackHint = isFirst
    ? labels.firstFallback
    : nextStation
      ? labels.middleFallback
      : labels.lastFallback;
  const displayHint = navigationHint?.trim() || fallbackHint;

  function submitRiddle() {
    if (!riddleInput.trim()) return;
    const correctAnswer = transitionRiddle?.answer ?? navigationAnswer;
    if (!correctAnswer || checkAnswer(riddleInput, correctAnswer)) {
      setRiddleError('');
      setRiddleSolved(true);
    } else {
      setRiddleError('לא בדיוק. נסו שוב.');
    }
  }

  // ── Progress path rows ───────────────────────────────────────────────────────

  // Row 1: start position OR previous station
  const row1 = isFirst
    ? { pulse: true,  done: false, topLabel: 'אתם כאן', name: 'יוצאים לדרך' }
    : { pulse: false, done: true,  topLabel: 'הושלם',   name: `${labels.stationLabel} ${formatNum(prevStation!)}` };

  // Row 2: current destination OR station 1 (when first)
  const row2 = isFirst
    ? { pulse: false, done: false, topLabel: 'הבא',     name: `${labels.stationLabel} ${formatNum(stationNumber)}` }
    : { pulse: true,  done: false, topLabel: 'אתם כאן', name: `${labels.stationLabel} ${formatNum(stationNumber)}` };

  // Row 3: further ahead
  const row3Next = isFirst ? nextStation : (stationNumber < totalStations ? stationNumber + 1 : null);
  const row3 = row3Next
    ? { topLabel: 'הבא',  name: `${labels.stationLabel} ${formatNum(row3Next)}` }
    : { topLabel: 'סיום', name: 'השלמת המשחק' };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center" dir="rtl">

      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#00FBFB]/5 rounded-full blur-[130px] pointer-events-none" />

      <header className="w-full max-w-md lg:max-w-6xl flex justify-between items-center px-6 lg:px-8 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="w-9 h-9 rounded-full border border-[#3a4a49]/50 text-[#e5e2e1]/60 active:scale-95 transition-transform flex items-center justify-center"
            >
              →
            </button>
          )}
          <span className="font-headline tracking-[0.2em] text-sm font-bold text-[#00FBFB]">QUESTORY</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">{labels.stationLabel} {stationNumber}</span>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-md lg:max-w-6xl px-6 lg:px-8 pt-8 lg:pt-10 pb-8 lg:pb-12 gap-6 lg:gap-8">

        <div className="space-y-2 anim-fade-up lg:max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">הצעד הבא</p>
          <h1 className="font-headline text-4xl lg:text-5xl font-bold text-white leading-tight">לאן ממשיכים?</h1>
        </div>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(360px,1fr)_minmax(340px,0.82fr)] lg:items-start lg:gap-8">

          {/* Progress path */}
          <section
            className="relative overflow-hidden rounded-2xl border border-[#3a4a49]/40 bg-[#101616] px-5 lg:px-7 py-5 lg:py-7 anim-fade-up lg:min-h-[460px]"
            style={{ animationDelay: '100ms' }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,251,251,0.16),transparent_45%)]" />
            <div className="relative">
              <p className="font-headline text-sm lg:text-base font-bold text-white mb-5 lg:mb-7">התקדמות במשחק</p>

              <div className="relative min-h-[220px] lg:min-h-[360px]">
                <div className="absolute right-6 top-8 bottom-8 w-px bg-[#00FBFB]/70 shadow-[0_0_18px_rgba(0,251,251,0.7)]" />

                <div className="relative z-10 flex flex-col justify-between min-h-[220px] lg:min-h-[360px]">

                  {/* Row 1 */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex justify-center">
                      {row1.pulse ? (
                        <div className="relative w-12 h-12 rounded-full bg-[#00FBFB] border border-white/40 flex items-center justify-center shadow-[0_0_28px_rgba(0,251,251,0.85)] animate-pulse">
                          <span className="w-4 h-4 rounded-full bg-white/85" />
                        </div>
                      ) : row1.done ? (
                        <div className="w-9 h-9 rounded-full bg-[#00FBFB] text-[#0E0E0E] border border-[#00FBFB] flex items-center justify-center text-sm font-bold shadow-[0_0_16px_rgba(0,251,251,0.45)]">
                          ✓
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#141f1f] border border-[#00FBFB]/35 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-[#00FBFB]/70" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[10px] uppercase tracking-[0.25em] ${row1.pulse ? 'text-[#00FBFB]' : 'text-[#00FBFB]/70'}`}>{row1.topLabel}</p>
                      <p className="font-headline text-base font-bold text-white mt-1">{row1.name}</p>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex justify-center">
                      {row2.pulse ? (
                        <div className="relative w-12 h-12 rounded-full bg-[#00FBFB] border border-white/40 flex items-center justify-center shadow-[0_0_28px_rgba(0,251,251,0.85)] animate-pulse">
                          <span className="w-4 h-4 rounded-full bg-white/85" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#1b2020] border border-[#3a4a49] flex items-center justify-center text-[#e5e2e1]/35">
                          <span className="relative block w-3.5 h-3 rounded-[3px] border border-current">
                            <span className="absolute left-1/2 -top-2 h-2 w-2.5 -translate-x-1/2 rounded-t-full border border-current border-b-0" />
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[10px] uppercase tracking-[0.25em] ${row2.pulse ? 'text-[#00FBFB]' : 'text-[#e5e2e1]/35'}`}>{row2.topLabel}</p>
                      <p className={`font-headline text-${row2.pulse ? 'xl' : 'base'} font-bold ${row2.pulse ? 'text-white' : 'text-[#e5e2e1]/45'} mt-1`}>
                        {row2.name}
                      </p>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex justify-center">
                      <div className="w-9 h-9 rounded-full bg-[#1b2020] border border-[#3a4a49] flex items-center justify-center text-[#e5e2e1]/35">
                        {row3Next ? (
                          <span className="relative block w-3.5 h-3 rounded-[3px] border border-current">
                            <span className="absolute left-1/2 -top-2 h-2 w-2.5 -translate-x-1/2 rounded-t-full border border-current border-b-0" />
                          </span>
                        ) : (
                          <span className="relative block h-5 w-4">
                            <span className="absolute right-1 top-0 h-5 w-px bg-current" />
                            <span className="absolute right-1 top-0 h-2.5 w-3 rounded-sm border border-current border-r-0" />
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#e5e2e1]/35">{row3.topLabel}</p>
                      <p className="font-headline text-base font-bold text-[#e5e2e1]/45 mt-1">{row3.name}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* Right panel */}
          <div className="flex flex-col gap-6 lg:pt-6">

            {transitionRiddle && !riddleSolved && (
              <>
                {/* Riddle panel */}
                <div
                  className="bg-[#131313] border border-[#9745FF]/25 rounded-2xl p-5 space-y-4 anim-fade-up"
                  style={{ animationDelay: '150ms' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg border border-[#9745FF]/30 bg-[#1a1428] flex items-center justify-center text-base">🔍</span>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#9745FF]/80">
                      {gameType === 'library' ? 'רמז לספר הבא' : 'חידת מעבר'}
                    </p>
                  </div>
                  <p className="text-[#e5e2e1]/80 text-base leading-relaxed">{transitionRiddle.prompt}</p>
                  {transitionRiddle.media?.url && transitionRiddle.media.type === 'image' && (
                    <div className="rounded-xl overflow-hidden border border-[#9745FF]/15">
                      <img
                        src={transitionRiddle.media.url}
                        alt={transitionRiddle.media.caption || ''}
                        className="w-full object-cover max-h-48"
                      />
                      {transitionRiddle.media.caption && (
                        <p className="text-[10px] text-[#e5e2e1]/40 text-center px-3 py-1.5">{transitionRiddle.media.caption}</p>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={riddleInput}
                      placeholder="הקלידו את התשובה"
                      onChange={e => { setRiddleInput(e.target.value); setRiddleError(''); }}
                      onKeyDown={e => e.key === 'Enter' && submitRiddle()}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e1] text-base outline-none focus:border-[#9745FF]/50 transition-colors"
                    />
                    {riddleError && <p className="text-red-400/80 text-sm">{riddleError}</p>}
                    <button
                      onClick={submitRiddle}
                      disabled={!riddleInput.trim()}
                      className="w-full bg-[#1a1428] border border-[#9745FF]/30 text-[#9745FF] font-headline font-bold tracking-[0.3em] uppercase py-4 rounded-xl active:scale-[0.98] transition-all disabled:opacity-30"
                    >
                      {gameType === 'library' ? 'גלו את הספר הבא' : 'גלו את התחנה הבאה'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {transitionRiddle && riddleSolved && (
              <>
                {/* Book reveal */}
                <div
                  className="bg-[#131313] border border-[#e9c349]/25 rounded-2xl p-5 space-y-3 anim-fade-up"
                  style={{ animationDelay: '0ms' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#e9c349] text-sm">✓</span>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#e9c349]/80">
                      {gameType === 'library' ? 'הספר הבא שלכם' : 'היעד הבא שלכם'}
                    </p>
                  </div>
                  <div className="text-center py-2">
                    <div className="text-4xl mb-2">📖</div>
                    <h2 className="font-headline font-bold text-xl text-white">
                      {transitionRiddle.targetBook?.title ?? displayHint}
                    </h2>
                    {transitionRiddle.targetBook?.author && (
                      <p className="text-[#e5e2e1]/50 text-sm mt-1">{transitionRiddle.targetBook.author}</p>
                    )}
                    {transitionRiddle.targetBook?.location && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-[#e9c349]/60 mb-1">מיקום</p>
                        <p className="text-[#e5e2e1]/70 text-sm">{transitionRiddle.targetBook.location}</p>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[#e5e2e1]/40 text-sm text-center">
                  {gameType === 'library' ? 'גשו למצוא את הספר על המדף, ולחצו כשאתם ליד הספר.' : 'גשו אל היעד ולחצו כשהגעתם.'}
                </p>

                <button
                  onClick={onReady}
                  className="anim-pulse-cta w-full relative overflow-hidden bg-[#1a1810] border border-[#e9c349]/30 text-[#e9c349] font-headline font-bold text-base tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all"
                >
                  {labels.arrivedCta}
                </button>
              </>
            )}

            {!transitionRiddle && gameType === 'library' && !riddleSolved && (
              <>
                {/* First station: navigationHint as riddle with answer input */}
                <div
                  className="bg-[#131313] border border-[#9745FF]/25 rounded-2xl p-5 space-y-4 anim-fade-up"
                  style={{ animationDelay: '150ms' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg border border-[#9745FF]/30 bg-[#1a1428] flex items-center justify-center text-base">🔍</span>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#9745FF]/80">רמז לספר הבא</p>
                  </div>
                  <p className="text-[#e5e2e1]/80 text-base leading-relaxed">{displayHint}</p>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={riddleInput}
                      placeholder="הקלידו את התשובה"
                      onChange={e => { setRiddleInput(e.target.value); setRiddleError(''); }}
                      onKeyDown={e => e.key === 'Enter' && submitRiddle()}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-[#e5e2e1] text-base outline-none focus:border-[#9745FF]/50 transition-colors"
                    />
                    {riddleError && <p className="text-red-400/80 text-sm">{riddleError}</p>}
                    <button
                      onClick={submitRiddle}
                      disabled={!riddleInput.trim()}
                      className="w-full bg-[#1a1428] border border-[#9745FF]/30 text-[#9745FF] font-headline font-bold tracking-[0.3em] uppercase py-4 rounded-xl active:scale-[0.98] transition-all disabled:opacity-30"
                    >
                      גלו את הספר הבא
                    </button>
                  </div>
                </div>
              </>
            )}

            {!transitionRiddle && gameType === 'library' && riddleSolved && (
              <>
                <div
                  className="bg-[#131313] border border-[#e9c349]/25 rounded-2xl p-5 space-y-3 anim-fade-up"
                  style={{ animationDelay: '0ms' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#e9c349] text-sm">✓</span>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#e9c349]/80">הספר שלכם</p>
                  </div>
                  <div className="text-center py-2">
                    <div className="text-4xl mb-2">📖</div>
                    <h2 className="font-headline font-bold text-xl text-white">
                      {currentBook?.title ?? riddleInput.trim()}
                    </h2>
                    {currentBook?.author && (
                      <p className="text-[#e5e2e1]/50 text-sm mt-1">{currentBook.author}</p>
                    )}
                    {currentBook?.location && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-[#e9c349]/60 mb-1">מיקום</p>
                        <p className="text-[#e5e2e1]/70 text-sm">{currentBook.location}</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[#e5e2e1]/40 text-sm text-center">גשו למצוא את הספר על המדף, ולחצו כשאתם ליד הספר.</p>
                <button
                  onClick={onReady}
                  className="anim-pulse-cta w-full relative overflow-hidden bg-[#1a1810] border border-[#e9c349]/30 text-[#e9c349] font-headline font-bold text-base tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all"
                >
                  הגעתי ליעד
                </button>
              </>
            )}

            {!transitionRiddle && gameType !== 'library' && (
              <>
                {/* Urban: regular navigation hint + arrived button */}
                <div
                  className="bg-[#131313] border border-[#00FBFB]/15 rounded-2xl p-5 space-y-3 anim-fade-up"
                  style={{ animationDelay: '150ms' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg border border-[#e9c349]/30 bg-[#1b1a12] flex items-center justify-center shadow-[0_0_16px_rgba(233,195,73,0.18)]">
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 text-[#e9c349]" fill="none">
                        <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M15.8 8.2l-2.2 5.4-5.4 2.2 2.2-5.4 5.4-2.2Z" fill="currentColor" />
                        <path d="M12 3.8v2M12 18.2v2M3.8 12h2M18.2 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#00FBFB]/60">{labels.nextLabel}</p>
                  </div>
                  <p className="text-[#e5e2e1]/80 text-base leading-relaxed">{displayHint}</p>
                </div>

                {triggerType === 'gps' && (
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-[#131313] border border-[#3a4a49]/50 rounded-xl py-4 text-[#e5e2e1]/60 text-sm active:scale-[0.98] transition-transform"
                  >
                    <span className="text-lg">📍</span>
                    <span>פתח ניווט במפות</span>
                  </a>
                )}

                <div className="flex-1 lg:hidden" />

                <div className="space-y-3 anim-scale-in" style={{ animationDelay: '200ms' }}>
                  <button
                    onClick={onReady}
                    className="anim-pulse-cta w-full relative overflow-hidden bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-base tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center"
                    style={{ boxShadow: '0 0 20px rgba(0,251,251,0.07)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00FBFB]/0 via-[#00FBFB]/8 to-[#00FBFB]/0" style={{ animation: 'shimmer 2.5s ease-in-out infinite' }} />
                    <span className="relative z-10">{labels.arrivedCta}</span>
                  </button>
                </div>
              </>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
