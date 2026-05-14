'use client';

import { useEffect, useState } from 'react';
import { Game } from '@/types/game';

interface StoryIntroProps {
  game: Game;
  onStart: () => void;
}

export default function StoryIntro({ game, onStart }: StoryIntroProps) {
  const [started, setStarted] = useState(false);
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  useEffect(() => {
    setHeroImageFailed(false);
  }, [game.imageUrl]);

  const handleStart = () => {
    setStarted(true);
    onStart();
  };

  const hasHeroImage = Boolean(game.imageUrl && !heroImageFailed);

  return (
    <div className="relative min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center overflow-x-hidden" dir="rtl">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#0E0E0E]/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#00FBFB]/30 flex items-center justify-center bg-[#131313]">
            <span className="text-[#00FBFB] text-sm font-bold font-headline">Q</span>
          </div>
          <span className="font-headline tracking-[0.2em] text-base font-bold text-[#00FBFB]">QUESTORY</span>
        </div>
        {game.character?.name && (
          <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">
            {game.character.name}
          </span>
        )}
      </header>

      {/* Main content */}
      <main className="w-full max-w-md px-6 pt-20 pb-32 flex flex-col">

        {/* Hero image */}
        <div className="relative w-full aspect-[3/4] mb-10 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] anim-fade-in">
          {hasHeroImage ? (
            <img
              src={game.imageUrl}
              alt={game.title}
              className="w-full h-full object-cover"
              onError={() => setHeroImageFailed(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-[#1a2a2a] to-[#0E0E0E]">
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(1px 1px at 20% 30%, #00FBFB, transparent),' +
                    'radial-gradient(1px 1px at 60% 15%, white, transparent),' +
                    'radial-gradient(1.5px 1.5px at 80% 55%, #00FBFB, transparent),' +
                    'radial-gradient(1px 1px at 40% 70%, white, transparent),' +
                    'radial-gradient(1px 1px at 10% 85%, white, transparent),' +
                    'radial-gradient(1.5px 1.5px at 70% 80%, #00FBFB, transparent)',
                }}
              />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(14,14,14,0) 0%, rgba(14,14,14,0.7) 60%, rgba(14,14,14,1) 100%)' }}
          />

          {/* Metadata chips */}
          <div className="absolute bottom-5 right-5 flex flex-wrap gap-2 justify-end">
            {game.duration && (
              <div className="glass-panel flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-[#00FBFB] text-xs">⏱</span>
                <span className="text-[11px] uppercase tracking-wider text-[#e5e2e1]">{game.duration}</span>
              </div>
            )}
            {game.difficulty && (
              <div className="glass-panel flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-[#e9c349] text-xs">◆</span>
                <span className="text-[11px] uppercase tracking-wider text-[#e5e2e1]">{game.difficulty}</span>
              </div>
            )}
          </div>
        </div>

        {/* Title + Story */}
        <div className="flex flex-col gap-5 anim-fade-up" style={{ animationDelay: '100ms' }}>
          <h1 className="font-headline text-4xl font-light leading-tight tracking-tight">
            <span className="block text-[#e5e2e1]/60 text-2xl font-normal mb-1">ברוכים הבאים אל</span>
            <span className="font-bold text-[#00FBFB] text-glow-cyan">{game.title}</span>
          </h1>
          <p className="text-[#e5e2e1]/70 text-lg leading-relaxed font-light">
            {game.story}
          </p>
        </div>

        {/* AI character bubble */}
        {game.character && (
          <div className="mt-8 flex items-start gap-4 anim-fade-up" style={{ animationDelay: '300ms' }}>
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#201f1f] border border-[#00FBFB]/20 flex items-center justify-center">
                <span className="text-[#00FBFB] text-xl font-headline font-bold">
                  {game.character.name.charAt(0)}
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FBFB] rounded-full animate-pulse" />
            </div>
            <div className="relative bg-[#201f1f] px-4 py-3 rounded-xl rounded-tr-none border-r-2 border-[#00FBFB] flex-1">
              <p className="text-sm text-[#00FBFB]/90 leading-snug">
                "{game.character.tone}"
              </p>
              <span className="block mt-1.5 text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">
                — {game.character.name}
              </span>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-12 space-y-3 anim-scale-in" style={{ animationDelay: '500ms' }}>
          <button
            onClick={handleStart}
            disabled={started}
            className="anim-pulse-cta w-full relative overflow-hidden bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-xl tracking-[0.25em] uppercase py-5 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00FBFB]/0 via-[#00FBFB]/8 to-[#00FBFB]/0"
              style={{ animation: started ? 'none' : 'shimmer 2.5s ease-in-out infinite' }}
            />
            <span className="relative z-10">
              {started ? 'מתחילים...' : 'התחל הרפתקה'}
            </span>
          </button>

          <button
            disabled
            className="w-full text-[#e5e2e1]/30 text-sm py-3 rounded-xl border border-white/10 cursor-not-allowed"
          >
            + שחקו יחד (בקרוב)
          </button>
        </div>

      </main>
    </div>
  );
}
