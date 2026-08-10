'use client';

import { useState } from 'react';
import { GameType } from '@/types/game';

const HOLOGRAPHIC_BOOK_SRC = '/images/library/holographic-book-reveal.png';

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
  /** כשמופעל, מדלגים על דרישת הקלדת התשובה (חידה א׳ עצמה — האתגר של התחנה — משמשת כעת לזיהוי הספר) */
  skipRiddle?: boolean;
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
      ? 'המשחק מתחיל עכשיו. פתרו את האתגר, מצאו את הספר הראשון, ופתחו את המשימה הראשונה.'
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
  skipRiddle,
  onReady,
  onBack,
}: MapNextStepProps) {
  const [riddleInput, setRiddleInput] = useState('');
  const [riddleError, setRiddleError] = useState('');
  const [riddleSolved, setRiddleSolved] = useState(false);
  const [bookRevealImageFailed, setBookRevealImageFailed] = useState(false);

  const labels = getLabels(gameType);
  const isLibraryReveal = gameType === 'library' && riddleSolved;
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

      <main className={`flex-1 flex flex-col w-full max-w-md lg:max-w-6xl px-6 lg:px-8 ${isLibraryReveal ? 'pt-2 lg:pt-4 pb-4 lg:pb-8 gap-2 lg:gap-4' : 'pt-8 lg:pt-10 pb-8 lg:pb-12 gap-6 lg:gap-8'}`}>

        <div className={`anim-fade-up ${isLibraryReveal ? 'space-y-1 lg:max-w-lg' : 'space-y-2 lg:max-w-xl'}`}>
          {!isLibraryReveal && (
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">הצעד הבא</p>
          )}
          <h1 className={`font-headline font-bold text-white leading-tight ${isLibraryReveal ? 'text-[28px] lg:text-4xl' : 'text-4xl lg:text-5xl'}`}>
            {isLibraryReveal ? 'הספר הבא נחשף!' : 'לאן ממשיכים?'}
          </h1>
          {isLibraryReveal && (
            <p className="text-[#e5e2e1]/70 text-base lg:text-sm leading-snug">
              פתרתם את חידת המעבר. עכשיו מצאו את הספר בספרייה.
            </p>
          )}
        </div>

        <div className={`flex flex-col lg:grid lg:grid-cols-[minmax(360px,1fr)_minmax(340px,0.82fr)] lg:items-start ${isLibraryReveal ? 'gap-2 lg:gap-5' : 'gap-6 lg:gap-8'}`}>

          {/* Progress path */}
          <section
            className={`relative overflow-hidden rounded-2xl border border-[#3a4a49]/40 bg-[#101616] px-5 lg:px-7 py-5 lg:py-7 anim-fade-up lg:min-h-[460px] ${isLibraryReveal ? 'hidden lg:block' : ''}`}
            style={{ animationDelay: '100ms' }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,251,251,0.16),transparent_45%)]" />
            {isLibraryReveal && !bookRevealImageFailed && (
              <div className="pointer-events-none absolute left-7 top-1/2 z-0 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex xl:left-10">
                <p className="font-headline text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]/80">
                  גילוי חדש
                </p>
                <img
                  src={HOLOGRAPHIC_BOOK_SRC}
                  alt=""
                  aria-hidden="true"
                  onError={() => setBookRevealImageFailed(true)}
                  className="library-book-hero w-44 max-w-full rounded-lg object-contain xl:w-52"
                />
              </div>
            )}
            <div className="relative z-10">
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
          <div className={`flex flex-col ${isLibraryReveal ? 'gap-2 lg:gap-3 lg:pt-0' : 'gap-6 lg:pt-6'}`}>

            {transitionRiddle && !riddleSolved && (
              <>
                {/* Riddle panel */}
                <div
                  className={`border rounded-2xl p-5 space-y-4 anim-fade-up ${gameType === 'library' ? 'library-panel' : 'bg-[#131313] border-[#9745FF]/25'}`}
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
                      className={`w-full border rounded-xl px-4 py-3 text-[#e5e2e1] text-base outline-none transition-all ${gameType === 'library' ? 'library-input' : 'bg-[#0a0a0a] border-white/10 focus:border-[#9745FF]/50'}`}
                    />
                    {riddleError && <p className="text-red-400/80 text-sm">{riddleError}</p>}
                    <button
                      onClick={submitRiddle}
                      disabled={!riddleInput.trim()}
                      className={`w-full border font-headline font-bold tracking-[0.3em] uppercase py-4 rounded-xl active:scale-[0.98] transition-all disabled:opacity-30 ${gameType === 'library' ? 'library-cta' : 'bg-[#1a1428] border-[#9745FF]/30 text-[#9745FF]'}`}
                    >
                      {gameType === 'library' ? 'גלו את הספר הבא' : 'גלו את התחנה הבאה'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {transitionRiddle && riddleSolved && (
              <>
                {gameType === 'library' && !bookRevealImageFailed && (
                  <div className="flex justify-center -my-1 lg:hidden">
                    <img
                      src={HOLOGRAPHIC_BOOK_SRC}
                      alt=""
                      aria-hidden="true"
                      onError={() => setBookRevealImageFailed(true)}
                      className="library-book-hero w-[124px] sm:w-32 lg:w-48 max-w-full rounded-lg object-contain"
                    />
                  </div>
                )}

                {/* Book reveal */}
                <div
                  className={`relative overflow-hidden border rounded-2xl p-3 lg:p-5 space-y-2 lg:space-y-3 anim-book-reveal ${gameType === 'library' ? 'library-panel' : 'bg-[#131313] border-[#e9c349]/35 shadow-[0_0_34px_rgba(233,195,73,0.08),0_0_26px_rgba(0,251,251,0.04)]'}`}
                  style={{ animationDelay: '0ms' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#e9c349] text-sm">✓</span>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#e9c349]/80">
                      {gameType === 'library' ? 'גילוי חדש' : 'היעד הבא שלכם'}
                    </p>
                  </div>
                  <div className="relative text-center py-2">
                    <div className="mx-auto mb-2 flex h-11 w-11 lg:h-14 lg:w-14 items-center justify-center rounded-2xl border border-[#e9c349]/30 bg-[#1a1810] text-[#e9c349] shadow-[0_0_24px_rgba(233,195,73,0.18),0_0_18px_rgba(0,251,251,0.08)]">
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 lg:h-8 lg:w-8" fill="none">
                        <path d="M5 5.5c0-.9.7-1.6 1.6-1.6H11c.8 0 1.5.3 2 .9.5-.6 1.2-.9 2-.9h4.4c.9 0 1.6.7 1.6 1.6v13.1c0 .6-.6 1-1.1.7-.9-.4-2-.6-3.1-.6-1.6 0-2.9.4-3.8 1.2-.9-.8-2.2-1.2-3.8-1.2-1.1 0-2.2.2-3.1.6-.5.3-1.1-.1-1.1-.7V5.5Z" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M13 4.8v15M8 8h2.2M8 11h2.2M16 8h2.2M16 11h2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h2 className="font-headline font-bold text-xl lg:text-2xl text-white text-glow-cyan">
                      {transitionRiddle.targetBook?.title ?? displayHint}
                    </h2>
                    {transitionRiddle.targetBook?.author && (
                      <p className="text-[#e9c349]/85 text-[15px] font-semibold mt-1 lg:mt-2">{transitionRiddle.targetBook.author}</p>
                    )}
                    {transitionRiddle.targetBook?.location && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-[#e9c349]/60 mb-1">מיקום</p>
                        <p className="text-[#e5e2e1]/75 text-[15px]">{transitionRiddle.targetBook.location}</p>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[#e5e2e1]/65 text-[15px] leading-snug text-center">
                  {gameType === 'library' ? 'גשו למדף, מצאו את הספר, ולחצו כשאתם לידו.' : 'גשו אל היעד ולחצו כשהגעתם.'}
                </p>

                <button
                  onClick={onReady}
                  className={`anim-pulse-cta w-full relative overflow-hidden border font-headline font-bold text-base uppercase rounded-xl active:scale-[0.98] transition-all ${gameType === 'library' ? 'library-cta py-4 lg:py-5 tracking-[0.14em] lg:tracking-[0.3em]' : 'bg-[#1a1810] border-[#e9c349]/30 text-[#e9c349] py-5 tracking-[0.3em]'}`}
                >
                  {gameType === 'library' ? 'מצאתי את הספר' : labels.arrivedCta}
                </button>
                {gameType === 'library' && (
                  <div className="lg:hidden rounded-xl border border-[#00FBFB]/15 bg-[#101616] px-4 py-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#00FBFB]/70">
                      ספר {formatNum(stationNumber)} מתוך {formatNum(totalStations)}
                    </p>
                  </div>
                )}
              </>
            )}

            {!transitionRiddle && gameType === 'library' && !riddleSolved && !skipRiddle && (
              <>
                {/* First station: navigationHint as riddle with answer input */}
                <div
                  className="library-panel border rounded-2xl p-5 space-y-4 anim-fade-up"
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
                      className="library-input w-full border rounded-xl px-4 py-3 text-[#e5e2e1] text-base outline-none transition-all"
                    />
                    {riddleError && <p className="text-red-400/80 text-sm">{riddleError}</p>}
                    <button
                      onClick={submitRiddle}
                      disabled={!riddleInput.trim()}
                      className="library-cta w-full border font-headline font-bold tracking-[0.3em] uppercase py-4 rounded-xl active:scale-[0.98] transition-all disabled:opacity-30"
                    >
                      גלו את הספר הבא
                    </button>
                  </div>
                </div>
              </>
            )}

            {!transitionRiddle && gameType === 'library' && riddleSolved && (
              <>
                {!bookRevealImageFailed && (
                  <div className="flex justify-center -my-1 lg:hidden">
                    <img
                      src={HOLOGRAPHIC_BOOK_SRC}
                      alt=""
                      aria-hidden="true"
                      onError={() => setBookRevealImageFailed(true)}
                      className="library-book-hero w-[124px] sm:w-32 lg:w-48 max-w-full rounded-lg object-contain"
                    />
                  </div>
                )}

                <div
                  className={`relative overflow-hidden border rounded-2xl p-3 lg:p-5 space-y-2 lg:space-y-3 anim-book-reveal ${gameType === 'library' ? 'library-panel' : 'bg-[#131313] border-[#e9c349]/35 shadow-[0_0_34px_rgba(233,195,73,0.08),0_0_26px_rgba(0,251,251,0.04)]'}`}
                  style={{ animationDelay: '0ms' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#e9c349] text-sm">✓</span>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#e9c349]/80">גילוי חדש</p>
                  </div>
                  <div className="relative text-center py-2">
                    <div className="mx-auto mb-2 flex h-11 w-11 lg:h-14 lg:w-14 items-center justify-center rounded-2xl border border-[#e9c349]/30 bg-[#1a1810] text-[#e9c349] shadow-[0_0_24px_rgba(233,195,73,0.18),0_0_18px_rgba(0,251,251,0.08)]">
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 lg:h-8 lg:w-8" fill="none">
                        <path d="M5 5.5c0-.9.7-1.6 1.6-1.6H11c.8 0 1.5.3 2 .9.5-.6 1.2-.9 2-.9h4.4c.9 0 1.6.7 1.6 1.6v13.1c0 .6-.6 1-1.1.7-.9-.4-2-.6-3.1-.6-1.6 0-2.9.4-3.8 1.2-.9-.8-2.2-1.2-3.8-1.2-1.1 0-2.2.2-3.1.6-.5.3-1.1-.1-1.1-.7V5.5Z" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M13 4.8v15M8 8h2.2M8 11h2.2M16 8h2.2M16 11h2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h2 className="font-headline font-bold text-xl lg:text-2xl text-white text-glow-cyan">
                      {currentBook?.title ?? riddleInput.trim()}
                    </h2>
                    {currentBook?.author && (
                      <p className="text-[#e9c349]/85 text-[15px] font-semibold mt-1 lg:mt-2">{currentBook.author}</p>
                    )}
                    {currentBook?.location && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-[#e9c349]/60 mb-1">מיקום</p>
                        <p className="text-[#e5e2e1]/75 text-[15px]">{currentBook.location}</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[#e5e2e1]/65 text-[15px] leading-snug text-center">
                  גשו למדף, מצאו את הספר, ולחצו כשאתם לידו.
                </p>
                <button
                  onClick={onReady}
                  className={`anim-pulse-cta w-full relative overflow-hidden border font-headline font-bold text-base uppercase py-4 lg:py-5 rounded-xl active:scale-[0.98] transition-all ${gameType === 'library' ? 'library-cta tracking-[0.14em] lg:tracking-[0.3em]' : 'bg-[#1a1810] border-[#e9c349]/30 text-[#e9c349] tracking-[0.3em]'}`}
                >
                  מצאתי את הספר
                </button>
                <div className="lg:hidden rounded-xl border border-[#00FBFB]/15 bg-[#101616] px-4 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#00FBFB]/70">
                    ספר {formatNum(stationNumber)} מתוך {formatNum(totalStations)}
                  </p>
                </div>
              </>
            )}

            {!transitionRiddle && (gameType !== 'library' || skipRiddle) && (
              <>
                {/* Urban, or library with the pre-station riddle skipped: hint + continue button */}
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
                    <span className="relative z-10">{skipRiddle ? 'המשיכו' : labels.arrivedCta}</span>
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
