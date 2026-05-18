'use client';

import { Game } from '@/types/game';

interface LandingScreenProps {
  game: Game;
  onEnter: () => void;
}

export default function LandingScreen({ game, onEnter }: LandingScreenProps) {
  const stationCount = game.stations.length;
  const meta = [game.duration, game.difficulty, `${stationCount} תחנות`].filter(Boolean).join(' · ');
  return (
    <div className="relative min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center overflow-hidden">

      {/* Ambient glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00FBFB]/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-72 h-72 bg-[#e9c349]/4 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero — full bleed with image, compact without */}
      <div className={`relative w-full max-w-md overflow-hidden ${game.imageUrl ? 'aspect-[9/16] min-h-screen' : ''}`}>
        {game.imageUrl && (
          <>
            <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(14,14,14,0.2) 0%, rgba(14,14,14,0.5) 40%, rgba(14,14,14,0.97) 75%, rgba(14,14,14,1) 100%)' }}
            />
          </>
        )}

        {/* Content — absolute over image when present, static otherwise */}
        <div className={game.imageUrl ? 'absolute inset-0 flex flex-col justify-between px-6 py-12' : 'flex flex-col gap-8 px-6 py-12'}>

          {/* Top — logo */}
          <div className="flex items-center gap-3 anim-fade-in">
            <div className="w-9 h-9 rounded-full border border-[#00FBFB]/40 flex items-center justify-center bg-[#0E0E0E]/60">
              <span className="text-[#00FBFB] text-sm font-bold font-headline">Q</span>
            </div>
            <span className="font-headline tracking-[0.25em] text-lg font-bold text-[#00FBFB]">QUESTORY</span>
          </div>

          {/* Bottom — tagline + CTA */}
          <div className="flex flex-col gap-8 anim-fade-up" style={{ animationDelay: '200ms' }}>

            {/* Tagline */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">
                חוויות אינטראקטיביות בעולם האמיתי
              </p>
              <h1 className="font-headline text-5xl font-bold leading-none tracking-tight text-white">
                גלו סיפורים<br />
                <span className="text-[#00FBFB]" style={{ textShadow: '0 0 30px rgba(0,251,251,0.4)' }}>
                  שמחכים לכם.
                </span>
              </h1>
              <p className="text-[#e5e2e1]/50 text-base leading-relaxed font-light">
                משחקי הרפתקה המשלבים חידות, סיפור וחקירה בשטח.
              </p>
            </div>

            {/* Available experiences */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#e5e2e1]/30">
                חוויה זמינה
              </p>
              {/* Experience card */}
              <button
                onClick={onEnter}
                className="w-full flex items-center gap-4 bg-[#131313] border border-[#3a4a49]/50 rounded-2xl p-4 active:scale-[0.98] transition-all text-right"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a2a2a]">
                  {game.imageUrl
                    ? <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><span className="text-[#00FBFB] text-xl font-bold font-headline">Q</span></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-white text-sm leading-tight truncate">{game.title}</p>
                  <p className="text-[#e5e2e1]/40 text-xs mt-1">{meta}</p>
                </div>
                <span className="text-[#00FBFB]/60 text-lg flex-shrink-0">←</span>
              </button>

              {/* Coming soon */}
              <div className="w-full flex items-center gap-4 bg-[#131313]/50 border border-[#3a4a49]/20 rounded-2xl p-4 opacity-40">
                <div className="w-14 h-14 rounded-xl bg-[#1c1b1b] flex-shrink-0 flex items-center justify-center">
                  <span className="text-[#e5e2e1]/20 text-xl">🔒</span>
                </div>
                <div className="flex-1">
                  <p className="font-headline font-bold text-white text-sm">חוויות נוספות בקרוב</p>
                  <p className="text-[#e5e2e1]/40 text-xs mt-1">בקרוב</p>
                </div>
              </div>
            </div>

            {/* Group mode teaser */}
            <div className="flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-[#3a4a49]/30" />
              <button disabled className="text-[#e5e2e1]/25 text-[11px] uppercase tracking-widest cursor-not-allowed">
                + שחקו יחד (בקרוב)
              </button>
              <div className="h-px flex-1 bg-[#3a4a49]/30" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
