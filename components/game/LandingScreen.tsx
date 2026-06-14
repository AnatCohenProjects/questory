'use client';

import { Game } from '@/types/game';

interface LandingScreenProps {
  game: Game;
  onEnter: () => void;
}

export default function LandingScreen({ game, onEnter }: LandingScreenProps) {
  const stationCount = game.stations.length;
  const rawGameTitle = game.title?.trim();
  const gameTitle = rawGameTitle && rawGameTitle !== 'משחק ללא שם' ? rawGameTitle : 'חוויה לדוגמה';
  const meta = [game.duration, `${stationCount} תחנות`].filter(Boolean).join(' · ');
  return (
    <div className="relative min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center overflow-hidden">

      {/* Ambient glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00FBFB]/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-72 h-72 bg-[#e9c349]/4 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero — full bleed on mobile, split layout on wide screens */}
      <div className={`relative w-full max-w-md lg:max-w-6xl lg:min-h-screen lg:flex lg:items-center lg:px-8 lg:py-12 overflow-hidden ${game.imageUrl ? 'aspect-[9/16] min-h-screen lg:aspect-auto' : ''}`}>
        {game.imageUrl && (
          <>
            <img src={game.imageUrl} alt={gameTitle} className="w-full h-full object-cover lg:hidden" />
            <div
              className="absolute inset-0 lg:hidden"
              style={{ background: 'linear-gradient(180deg, rgba(14,14,14,0.2) 0%, rgba(14,14,14,0.5) 40%, rgba(14,14,14,0.97) 75%, rgba(14,14,14,1) 100%)' }}
            />
          </>
        )}

        {/* Content — absolute over image on mobile, two columns on wide screens */}
        <div className={game.imageUrl ? 'absolute inset-0 flex flex-col justify-between px-6 py-10 lg:static lg:grid lg:w-full lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,1.05fr)] lg:items-center lg:gap-10 lg:px-0 lg:py-0' : 'flex flex-col gap-8 px-6 py-10 lg:grid lg:w-full lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,1.05fr)] lg:items-center lg:gap-10 lg:px-0 lg:py-0'}>

          {/* Hero copy */}
          <div className="flex flex-col gap-8 lg:max-w-xl">
            <div className="flex items-center gap-3 anim-fade-in">
              <div className="w-9 h-9 rounded-full border border-[#00FBFB]/40 flex items-center justify-center bg-[#0E0E0E]/60">
                <span className="text-[#00FBFB] text-sm font-bold font-headline">Q</span>
              </div>
              <span className="font-headline tracking-[0.25em] text-lg font-bold text-[#00FBFB]">QUESTORY</span>
            </div>

            {/* Tagline */}
            <div className="hidden lg:block space-y-3 anim-fade-up" style={{ animationDelay: '200ms' }}>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">
                חוויות אינטראקטיביות בעולם האמיתי
              </p>
              <h1 className="font-headline text-5xl lg:text-7xl font-bold leading-none tracking-tight text-white">
                הפכו למשתתפים<br />
                <span className="text-[#00FBFB]" style={{ textShadow: '0 0 30px rgba(0,251,251,0.4)' }}>
                  בתוך הסיפור.
                </span>
              </h1>
              <p className="text-[#e5e2e1]/50 text-base lg:max-w-md leading-relaxed font-light">
                פתרו חידות, גלו רמזים וחקרו את העולם האמיתי דרך המשחק.
              </p>
            </div>
          </div>

          {/* Experience selection */}
          <div className="flex flex-col gap-8 lg:gap-6 anim-fade-up" style={{ animationDelay: '260ms' }}>
            <div className="space-y-3 lg:hidden">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">
                חוויות אינטראקטיביות בעולם האמיתי
              </p>
              <h1 className="font-headline text-[2.85rem] font-bold leading-[0.95] tracking-tight text-white">
                הפכו למשתתפים<br />
                <span className="text-[#00FBFB]" style={{ textShadow: '0 0 30px rgba(0,251,251,0.4)' }}>
                  בתוך הסיפור.
                </span>
              </h1>
              <p className="text-[#e5e2e1]/55 text-base leading-relaxed font-light">
                פתרו חידות, גלו רמזים וחקרו את העולם האמיתי דרך המשחק.
              </p>
            </div>

            {game.imageUrl && (
              <div className="hidden lg:block relative w-full aspect-[16/7] rounded-2xl overflow-hidden border border-[#3a4a49]/40 shadow-[0_0_35px_rgba(0,251,251,0.08)]">
                <img src={game.imageUrl} alt={gameTitle} className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, rgba(14,14,14,0.78) 0%, rgba(14,14,14,0.18) 52%, rgba(14,14,14,0.78) 100%)' }}
                />
                <div className="absolute bottom-4 right-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#00FBFB]/70">חוויה זמינה</p>
                  <p className="font-headline font-bold text-white text-xl mt-1">{gameTitle}</p>
                </div>
              </div>
            )}

            {/* Available experiences */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#e5e2e1]/30">
                חוויה זמינה
              </p>
              {/* Experience card */}
              <button
                onClick={onEnter}
                className="w-full flex items-center gap-4 bg-[#151d1d] border border-[#00FBFB]/25 rounded-2xl p-4 lg:p-5 active:scale-[0.98] transition-all text-right hover:border-[#00FBFB]/45 hover:bg-[#172323] shadow-[0_0_22px_rgba(0,251,251,0.06)]"
              >
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a2a2a]">
                  {game.imageUrl
                    ? <img src={game.imageUrl} alt={gameTitle} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><span className="text-[#00FBFB] text-xl font-bold font-headline">Q</span></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-white text-sm lg:text-base leading-tight truncate">{gameTitle}</p>
                  <p className="text-[#e5e2e1]/55 text-xs mt-1">{meta}</p>
                  <p className="mt-2 text-[11px] font-bold tracking-[0.14em] text-[#00FBFB] uppercase underline decoration-[#00FBFB]/35 underline-offset-4 drop-shadow-[0_0_6px_rgba(0,251,251,0.22)]">
                    התחילו לשחק
                  </p>
                </div>
              </button>

              {/* Coming soon */}
              <div className="w-full flex items-center gap-4 bg-[#131313]/65 border border-[#3a4a49]/30 rounded-2xl p-4 opacity-70">
                <div className="w-14 h-14 rounded-xl bg-[#1c1b1b] border border-[#3a4a49]/25 flex-shrink-0 flex items-center justify-center">
                  <span className="w-5 h-5 rounded-md border border-[#e5e2e1]/25" />
                </div>
                <div className="flex-1">
                  <p className="font-headline font-bold text-white text-sm">חוויות נוספות בקרוב</p>
                  <p className="text-[#e5e2e1]/40 text-xs mt-1">בקרוב</p>
                </div>
              </div>
            </div>

            {/* Group mode teaser */}
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#3a4a49]/25 bg-[#0b0f0f]/55 px-4 py-3">
              <div className="h-px flex-1 bg-[#3a4a49]/30" />
              <button disabled className="text-[#e5e2e1]/42 text-[11px] uppercase tracking-widest cursor-not-allowed">
                משחק קבוצתי בקרוב
              </button>
              <div className="h-px flex-1 bg-[#3a4a49]/30" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
