'use client';

interface MapNextStepProps {
  stationNumber: number;
  totalStations: number;
  navigationHint?: string;
  triggerType: 'code' | 'qr' | 'gps';
  onReady: () => void;
  onBack?: () => void;
}

const FIRST_STATION_FALLBACK = 'המשחק מתחיל עכשיו. מצאו את התחנה הראשונה, הזינו את הקוד, ופתחו את המשימה הראשונה.';
const MIDDLE_STATION_FALLBACK = 'אתם מתקדמים יפה. התחנה הבאה כבר מחכה – מצאו אותה, הזינו את הקוד, ופתחו את המשימה הבאה.';
const LAST_STATION_FALLBACK = 'זו התחנה האחרונה במשחק. מצאו אותה, הזינו את הקוד, ופתחו את המשימה המסכמת.';

export default function MapNextStep({ stationNumber, totalStations, navigationHint, triggerType, onReady, onBack }: MapNextStepProps) {
  const previousStation = stationNumber > 1 ? stationNumber - 1 : null;
  const nextStation = stationNumber < totalStations ? stationNumber + 1 : null;
  const fallbackHint = stationNumber === 1
    ? FIRST_STATION_FALLBACK
    : nextStation
      ? MIDDLE_STATION_FALLBACK
      : LAST_STATION_FALLBACK;
  const displayHint = navigationHint?.trim() || fallbackHint;
  const formatStationNumber = (value: number) => value.toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center" dir="rtl">

      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#00FBFB]/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-md lg:max-w-6xl flex justify-between items-center px-6 lg:px-8 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="w-9 h-9 rounded-full border border-[#3a4a49]/50 text-[#e5e2e1]/60 active:scale-95 transition-transform"
            >
              →
            </button>
          )}
          <span className="font-headline tracking-[0.2em] text-sm font-bold text-[#00FBFB]">QUESTORY</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">תחנה {stationNumber}</span>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-md lg:max-w-6xl px-6 lg:px-8 pt-8 lg:pt-10 pb-8 lg:pb-12 gap-6 lg:gap-8">

        {/* Label + title */}
        <div className="space-y-2 anim-fade-up lg:max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">הצעד הבא</p>
          <h1 className="font-headline text-4xl lg:text-5xl font-bold text-white leading-tight">
            לאן ממשיכים?
          </h1>
        </div>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(360px,1fr)_minmax(340px,0.82fr)] lg:items-start lg:gap-8">

        {/* Progress path */}
        <section className="relative overflow-hidden rounded-2xl border border-[#3a4a49]/40 bg-[#101616] px-5 lg:px-7 py-5 lg:py-7 anim-fade-up lg:min-h-[460px]" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,251,251,0.16),transparent_45%)]" />
          <div className="relative">
            <p className="font-headline text-sm lg:text-base font-bold text-white mb-5 lg:mb-7">התקדמות במשחק</p>

            <div className="relative min-h-[220px] lg:min-h-[360px]">
              <div className="absolute right-6 top-8 bottom-8 w-px bg-[#00FBFB]/70 shadow-[0_0_18px_rgba(0,251,251,0.7)]" />

              <div className="relative z-10 flex flex-col justify-between min-h-[220px] lg:min-h-[360px]">
                <div className="flex items-center gap-4">
                  <div className="w-12 flex justify-center">
                    {previousStation ? (
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
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#00FBFB]/70">
                      {previousStation ? 'הושלם' : 'התחלה'}
                    </p>
                    <p className="font-headline text-base font-bold text-white mt-1">
                      {previousStation ? `תחנה ${formatStationNumber(previousStation)}` : 'יוצאים לדרך'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 flex justify-center">
                    <div className="relative w-12 h-12 rounded-full bg-[#00FBFB] border border-white/40 flex items-center justify-center shadow-[0_0_28px_rgba(0,251,251,0.85)] animate-pulse">
                      <span className="w-4 h-4 rounded-full bg-white/85" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#00FBFB]">אתם כאן</p>
                    <p className="font-headline text-xl font-bold text-white mt-1">
                      תחנה {formatStationNumber(stationNumber)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 flex justify-center">
                    <div className="w-9 h-9 rounded-full bg-[#1b2020] border border-[#3a4a49] flex items-center justify-center text-[#e5e2e1]/35">
                      {nextStation ? (
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
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#e5e2e1]/35">
                      {nextStation ? 'הבא' : 'סיום'}
                    </p>
                    <p className="font-headline text-base font-bold text-[#e5e2e1]/45 mt-1">
                      {nextStation ? `תחנה ${formatStationNumber(nextStation)}` : 'השלמת המשחק'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6 lg:pt-6">

        {/* Navigation hint */}
        <div className="bg-[#131313] border border-[#00FBFB]/15 rounded-2xl p-5 space-y-3 anim-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg border border-[#e9c349]/30 bg-[#1b1a12] flex items-center justify-center shadow-[0_0_16px_rgba(233,195,73,0.18)]">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="w-5 h-5 text-[#e9c349] drop-shadow-[0_0_5px_rgba(233,195,73,0.35)]"
                fill="none"
              >
                <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M15.8 8.2l-2.2 5.4-5.4 2.2 2.2-5.4 5.4-2.2Z" fill="currentColor" />
                <path d="M12 3.8v2M12 18.2v2M3.8 12h2M18.2 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#00FBFB]/60">התחנה הבאה</p>
          </div>
          <p className="text-[#e5e2e1]/80 text-base leading-relaxed">{displayHint}</p>
        </div>

        {/* GPS button — only if geolocation trigger */}
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

        {/* Spacer */}
        <div className="flex-1 lg:hidden" />

        {/* CTA */}
        <div className="space-y-3 anim-scale-in" style={{ animationDelay: '200ms' }}>
          <button
            onClick={onReady}
            className="anim-pulse-cta w-full relative overflow-hidden bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-base tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            style={{ boxShadow: '0 0 20px rgba(0,251,251,0.07)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00FBFB]/0 via-[#00FBFB]/8 to-[#00FBFB]/0"
              style={{ animation: 'shimmer 2.5s ease-in-out infinite' }}
            />
            <span className="relative z-10">הגעתי לתחנה</span>
          </button>
        </div>

        </div>

        </div>

      </main>
    </div>
  );
}
