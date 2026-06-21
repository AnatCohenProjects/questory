'use client';

import { useState } from 'react';
import { GameType } from '@/types/game';

interface TransitionRiddleViewProps {
  prompt: string;
  answer?: string;
  media?: { type: 'image' | 'video' | 'audio'; url: string; caption?: string };
  gameType?: GameType;
  onComplete: () => void;
  onBack?: () => void;
}

function checkAnswer(input: string, correct: string): boolean {
  const accepted = correct.split('|').map(a => a.trim().toUpperCase());
  return accepted.includes(input.trim().toUpperCase());
}

export default function TransitionRiddleView({ prompt, answer, media, gameType, onComplete, onBack }: TransitionRiddleViewProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const isLibrary = gameType === 'library';
  const label = isLibrary ? 'רמז לספר הבא' : 'חידת מעבר';
  const helper = isLibrary ? 'פתרו את החידה כדי לגלות לאיזה ספר ממשיכים' : 'פתרו את החידה כדי לגלות את התחנה הבאה';

  function handleSubmit() {
    if (!answer) { onComplete(); return; }
    if (!input.trim()) return;
    if (checkAnswer(input, answer)) {
      setError('');
      onComplete();
    } else {
      setError('לא בדיוק. נסו שוב.');
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center justify-center px-6" dir="rtl">

      <div className={`fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[140px] pointer-events-none ${isLibrary ? 'bg-[#D4AF37]/6' : 'bg-[#9745FF]/5'}`} />

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

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#9745FF]/80 mb-1">{label}</p>
          <p className="text-[#e5e2e1]/40 text-xs">{helper}</p>
        </div>

        {media?.url && (
          <div className="rounded-2xl overflow-hidden border border-[#9745FF]/15">
            {media.type === 'image' && (
              <img src={media.url} alt={media.caption || ''} className="w-full object-cover max-h-56" />
            )}
            {media.type === 'video' && (
              <video src={media.url} controls playsInline className="w-full max-h-56" />
            )}
            {media.type === 'audio' && (
              <div className="bg-[#131313] p-4">
                <audio src={media.url} controls className="w-full" />
              </div>
            )}
            {media.caption && (
              <p className="text-[10px] text-[#e5e2e1]/40 text-center px-4 py-2 bg-[#131313]">{media.caption}</p>
            )}
          </div>
        )}

        <div
          className={`border rounded-2xl p-6 ${isLibrary ? 'library-panel' : 'bg-[#131313] border-[#9745FF]/25'}`}
          style={isLibrary ? undefined : { boxShadow: '0 0 30px rgba(151,69,255,0.06)' }}
        >
          <p className="text-[#e5e2e1]/85 text-base leading-relaxed">{prompt}</p>
        </div>

        {answer ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={input}
              placeholder="הקלידו את התשובה"
              onChange={e => { setInput(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className={`w-full border rounded-xl px-4 py-4 text-[#e5e2e1] text-base outline-none transition-all ${isLibrary ? 'library-input' : 'bg-[#131313] border-white/10 focus:border-[#9745FF]/50'}`}
            />
            {error && <p className="text-red-400/80 text-sm text-center">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className={`w-full border font-headline font-bold tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all disabled:opacity-30 ${isLibrary ? 'library-cta' : 'bg-[#1a1428] border-[#9745FF]/30 text-[#9745FF]'}`}
            >
              {isLibrary ? 'גלו את הספר הבא' : 'גלו את התחנה הבאה'}
            </button>
          </div>
        ) : (
          <button
            onClick={onComplete}
            className={`w-full border font-headline font-bold tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all ${isLibrary ? 'library-cta' : 'bg-[#1a1428] border-[#9745FF]/30 text-[#9745FF]'}`}
          >
            המשיכו
          </button>
        )}
      </div>
    </div>
  );
}
