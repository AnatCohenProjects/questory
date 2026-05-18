'use client';

import { AICharacter } from '@/types/game';

interface StoryProgressionProps {
  character: AICharacter;
  stationNumber: number;
  totalStations: number;
  onContinue: () => void;
  onBack?: () => void;
}

// הודעות דמות לפי התקדמות
const characterMessages = [
  'מרשים! פתרתם את החידה הראשונה. אבל המסע רק מתחיל — הסוד הגדול עדיין מחכה לכם.',
  'כל הכבוד! אתם מתקדמים יפה. אתם קרובים יותר לפתרון ממה שאתם חושבים.',
  'הפלתם אותי! פתרתם את כל החידות. עכשיו האמת כולה — שלכם.',
];

export default function StoryProgression({ character, stationNumber, totalStations, onContinue, onBack }: StoryProgressionProps) {
  const messageIndex = Math.min(stationNumber - 1, characterMessages.length - 1);
  const message = characterMessages[messageIndex];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center justify-center px-6" dir="rtl">

      {/* Ambient */}
      <div className="fixed bottom-1/3 -left-20 w-72 h-72 bg-[#00FBFB]/4 rounded-full blur-[120px] pointer-events-none" />
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="fixed top-4 right-6 z-20 w-9 h-9 rounded-full border border-[#3a4a49]/50 text-[#e5e2e1]/60 active:scale-95 transition-transform"
        >
          →
        </button>
      )}

      <div className="relative z-10 flex flex-col w-full max-w-sm gap-10 anim-fade-up">

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalStations }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i < stationNumber ? 'w-8 bg-[#00FBFB]' : 'w-4 bg-[#3a4a49]/50'
              }`}
            />
          ))}
        </div>

        {/* Character avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl bg-[#131313] border border-[#00FBFB]/20 flex items-center justify-center"
              style={{ boxShadow: '0 0 30px rgba(0,251,251,0.12)' }}
            >
              {character.avatarUrl ? (
                <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="font-headline font-bold text-3xl text-[#00FBFB]">
                  {character.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#00FBFB] rounded-full animate-pulse" />
          </div>
          <div className="text-center">
            <p className="font-headline font-bold text-white text-sm">{character.name}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30 mt-0.5">מדריך</p>
          </div>
        </div>

        {/* Speech bubble */}
        <div className="relative bg-[#131313] border border-[#00FBFB]/20 rounded-2xl rounded-tr-none p-5 border-r-2 border-r-[#00FBFB]">
          <p className="text-[#e5e2e1]/80 text-base leading-relaxed">
            &quot;{message}&quot;
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          className="w-full bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-base tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all"
        >
          {stationNumber >= totalStations ? 'לסיכום הסופי ←' : 'המשיכו להרפתקה ←'}
        </button>

      </div>
    </div>
  );
}
