'use client';

import { useState } from 'react';
import { Station, Game, GameSession, StationMedia } from '@/types/game';
import AIHintChat from './AIHintChat';
import GameProgress from './GameProgress';
import ChallengeView from '@/components/challenge/ChallengeView';

interface StationViewProps {
  station: Station;
  game: Game;
  session: GameSession;
  onComplete: (answer: string, skipped?: boolean) => void;
  stationNumber: number;
}

function MediaBlock({ media }: { media: StationMedia }) {
  if (media.type === 'image') {
    return (
      <div className="rounded-xl overflow-hidden bg-[#0E0E0E]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.url} alt={media.caption ?? ''} className="w-full h-auto object-contain max-h-72 rounded-xl" />
        {media.caption && <p className="text-[#e5e2e1]/40 text-xs text-center px-4 py-2">{media.caption}</p>}
      </div>
    );
  }
  if (media.type === 'video') {
    return (
      <div className="rounded-xl overflow-hidden border border-[#3a4a49]/40">
        <video src={media.url} controls className="w-full max-h-64" playsInline />
        {media.caption && <p className="text-[#e5e2e1]/40 text-xs text-center px-4 py-2">{media.caption}</p>}
      </div>
    );
  }
  if (media.type === 'audio') {
    return (
      <div className="bg-[#131313] border border-[#00FBFB]/15 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1a2a2a] border border-[#00FBFB]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[#00FBFB] text-lg">🔊</span>
          </div>
          {media.caption && <p className="text-[#e5e2e1]/60 text-sm">{media.caption}</p>}
        </div>
        <audio src={media.url} controls className="w-full" />
      </div>
    );
  }
  return null;
}

export default function StationView({ station, game, session, onComplete, stationNumber }: StationViewProps) {
  const [showChat, setShowChat] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showReveal, setShowReveal] = useState(false);

  const handleSubmitAnswer = async () => {
    setSubmitting(true);
    setError('');
    await new Promise(r => setTimeout(r, 300));
    if (answer.trim().toUpperCase() === station.answer.toUpperCase()) {
      onComplete(answer.trim());
    } else {
      setError('לא נכון — נסו שוב');
      setSubmitting(false);
    }
  };

  if (showChat) {
    return (
      <AIHintChat
        game={game}
        session={session}
        onBack={() => setShowChat(false)}
        onHintUsed={() => setHintsUsed(prev => Math.min(prev + 1, 3))}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col" dir="rtl">

      {/* Ambient glow */}
      <div className="fixed top-1/3 -right-24 w-72 h-72 bg-[#00FBFB]/4 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0E0E0E]/80 backdrop-blur-xl border-b border-white/5 px-6 py-3 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="font-headline tracking-[0.2em] text-sm font-bold text-[#00FBFB]">QUESTORY</span>
          <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">
            {stationNumber} / {game.stations.length}
          </span>
        </div>
        <GameProgress
          totalStations={game.stations.length}
          currentStationId={session.currentStationId}
          completedCount={session.completedStations.length}
        />
      </header>

      {/* Scrollable content */}
      <div className="flex-1 flex flex-col px-6 pt-8 pb-64 gap-8 overflow-y-auto max-w-md mx-auto w-full">

        {/* Stage label + Title */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">
            תחנה {stationNumber.toString().padStart(2, '0')} — {game.title}
          </p>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-white leading-snug">
            {station.task}
          </h1>
        </div>

        {/* Narrative */}
        <div className="space-y-4">
          <p className="text-[#e5e2e1]/60 text-lg leading-relaxed font-light">
            {station.narrative}
          </p>
          {station.narrativeMedia && <MediaBlock media={station.narrativeMedia} />}
        </div>

        {/* Challenge area — large and central */}
        {station.challenge && (
          <div className="space-y-5">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">האתגר</p>
            <div className="bg-[#131313] border border-[#3a4a49]/50 rounded-2xl overflow-hidden">
              <div className="p-5">
                <ChallengeView
                  challenge={station.challenge}
                  onCodeChange={(code: string) => { setAnswer(code); setError(''); }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Task media (if no challenge — standalone visual) */}
        {!station.challenge && station.taskMedia && (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">הוראה</p>
            <MediaBlock media={station.taskMedia} />
          </div>
        )}

        {/* Answer input — cipher or plain */}
        {(!station.challenge || station.challenge.type === 'cipher') && (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">הכניסו את הקוד</p>
            <input
              type="text"
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
              placeholder="_ _ _ _"
              className="w-full bg-[#131313] text-[#e5e2e1] text-2xl font-mono text-center py-5 rounded-xl border border-[#3a4a49] focus:border-[#00FBFB] outline-none placeholder:text-[#e5e2e1]/20 tracking-[0.5em]"
            />
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* Escape options */}
        {hintsUsed >= 3 && (
          <div className="border border-[#3a4a49]/40 rounded-xl p-4 space-y-3">
            <p className="text-[#e5e2e1]/30 text-xs text-center uppercase tracking-widest">
              השתמשתם בכל הרמזים
            </p>
            {!showReveal ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReveal(true)}
                  className="flex-1 text-[#e5e2e1]/50 text-sm py-3 rounded-xl border border-[#3a4a49]/40 active:scale-95 transition-transform"
                >
                  גלה תשובה
                </button>
                <button
                  onClick={() => onComplete('', true)}
                  className="flex-1 text-[#e5e2e1]/50 text-sm py-3 rounded-xl border border-[#3a4a49]/40 active:scale-95 transition-transform"
                >
                  דלג על תחנה
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <p className="text-[#00FBFB] font-headline font-bold text-2xl tracking-widest"
                  style={{ textShadow: '0 0 20px rgba(0,251,251,0.4)' }}>
                  {station.answer}
                </p>
                <button
                  onClick={() => onComplete(station.answer, false)}
                  className="w-full text-[#e5e2e1]/50 text-sm py-3 rounded-xl border border-[#3a4a49]/40"
                >
                  המשך עם התשובה
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0E0E0E]/95 backdrop-blur-xl border-t border-white/5 p-5 space-y-3 max-w-md mx-auto">
        <button
          onClick={handleSubmitAnswer}
          disabled={!answer.trim() || submitting}
          className="w-full bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-base tracking-[0.4em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all disabled:opacity-25 flex items-center justify-center gap-3"
          style={answer.trim() ? { boxShadow: '0 0 20px rgba(0,251,251,0.08)' } : undefined}
        >
          {submitting ? 'בודק...' : <><span>פתח</span><span>→</span></>}
        </button>

        {/* Hint button */}
        <button
          onClick={() => setShowChat(true)}
          disabled={hintsUsed >= 3}
          className="w-full flex items-center justify-center gap-2 bg-[#131313] border border-[#00FBFB]/25 rounded-xl py-4 active:scale-[0.98] transition-all disabled:opacity-30"
          style={hintsUsed < 3 ? { boxShadow: '0 0 15px rgba(0,251,251,0.06)' } : undefined}
        >
          <span className="text-lg">💬</span>
          <span className="text-[#00FBFB] text-sm font-semibold">
            {hintsUsed < 3 ? `שאל את ${game.character.name}` : 'רמזים אזלו'}
          </span>
          {hintsUsed > 0 && (
            <span className="bg-[#e9c349]/20 text-[#e9c349] text-xs font-bold px-2 py-0.5 rounded-full">
              {hintsUsed}/3
            </span>
          )}
        </button>

        {/* Skip */}
        <button
          onClick={() => onComplete('', true)}
          className="text-center text-[#e5e2e1]/20 text-[11px] uppercase tracking-widest hover:text-[#e5e2e1]/40 transition-colors py-1"
        >
          דלג על תחנה
        </button>
      </div>

    </div>
  );
}
