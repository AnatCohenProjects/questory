'use client';

import { useRef, useState } from 'react';
import { Station, Game, GameSession, StationMedia } from '@/types/game';
import AIHintChat from './AIHintChat';
import GameProgress from './GameProgress';
import ChallengeView from '@/components/challenge/ChallengeView';

interface StationViewProps {
  station: Station;
  game: Game;
  session: GameSession;
  onComplete: (answer: string, skipped?: boolean) => void;
  onBack?: () => void;
  stationNumber: number;
}

const EMPTY_ANSWER_MESSAGE = 'הקלידו פתרון כדי להמשיך.';
const WRONG_ANSWER_MESSAGE = 'זו לא התשובה הנכונה. נסו שוב או שאלו את המדריך.';

function MediaBlock({ media }: { media: StationMedia }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (media.type === 'image') {
    const imageUrl = media.url.trim();

    if (!imageUrl || imageFailed) {
      return null;
    }

    return (
      <div className="rounded-xl overflow-hidden bg-[#0E0E0E]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={media.caption ?? ''}
          className="w-full h-auto object-contain max-h-72 rounded-xl"
          onError={() => setImageFailed(true)}
        />
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

export default function StationView({ station, game, session, onComplete, onBack, stationNumber }: StationViewProps) {
  const [showChat, setShowChat] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const isEmptyAnswerError = error === EMPTY_ANSWER_MESSAGE;

  const handleSubmitAnswer = async () => {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setError(EMPTY_ANSWER_MESSAGE);
      answerInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setError('');
    await new Promise(r => setTimeout(r, 300));
    const accepted = station.answer.split('|').map(a => a.trim().toUpperCase());
    if (accepted.includes(trimmedAnswer.toUpperCase())) {
      onComplete(trimmedAnswer);
    } else {
      setError(WRONG_ANSWER_MESSAGE);
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
    <>
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col" dir="rtl">

      {/* Ambient glow */}
      <div className="fixed top-1/3 -right-24 w-72 h-72 bg-[#00FBFB]/4 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0E0E0E]/80 backdrop-blur-xl border-b border-white/5 px-6 lg:px-8 py-3 max-w-md lg:max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className="w-8 h-8 rounded-full border border-[#3a4a49]/50 text-[#e5e2e1]/60 active:scale-95 transition-transform flex items-center justify-center"
              >
                →
              </button>
            )}
            <span className="font-headline tracking-[0.2em] text-sm font-bold text-[#00FBFB]">QUESTORY</span>
          </div>
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
      <div className="flex-1 grid grid-cols-1 px-6 lg:px-8 pt-8 lg:pt-10 pb-8 lg:pb-12 gap-6 lg:gap-x-8 lg:gap-y-4 overflow-y-auto max-w-md lg:max-w-6xl mx-auto w-full lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.78fr)] lg:items-start">

        {/* Stage label + Title */}
        <div className="space-y-2 lg:col-start-1 lg:row-start-1 lg:max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">
            תחנה {stationNumber.toString().padStart(2, '0')} | {game.title}
          </p>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-white leading-snug">
            {station.task}
          </h1>
        </div>

        {/* Narrative */}
        <div className="space-y-4 lg:col-start-1 lg:row-start-2 lg:max-w-xl">
          <p className="text-[#e5e2e1]/60 text-lg leading-relaxed font-light">
            {station.narrative}
          </p>
          {station.narrativeMedia && <MediaBlock media={station.narrativeMedia} />}
        </div>

        {/* Task media — always shown when present */}
        {station.taskMedia && (
          <div className="space-y-3 lg:col-start-1 lg:row-start-3 lg:max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">הוראה</p>
            <MediaBlock media={station.taskMedia} />
          </div>
        )}

        {/* Challenge area — large and central */}
        {station.challenge && (
          <div className="space-y-5 lg:col-start-2 lg:row-start-1">
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

        <div className="space-y-4 lg:col-start-2 lg:row-start-2">
          {/* Answer action */}
          <div className="bg-[#101616] border border-[#00FBFB]/15 rounded-2xl p-5 space-y-4">
          <div className="space-y-2">
            <p className="font-headline text-base font-bold text-white">הפתרון שלכם</p>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">כתבו את הפתרון שמצאתם</p>
            <p className="text-[#e5e2e1]/40 text-sm leading-relaxed">
              הקלידו את התשובה.
            </p>
          </div>

          {(!station.challenge || station.challenge.type === 'cipher') && (
            <input
              ref={answerInputRef}
              type="text"
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
              placeholder="הקלידו כאן את התשובה"
              aria-invalid={isEmptyAnswerError || undefined}
              className={`w-full bg-[#131313] text-[#e5e2e1] text-lg font-medium text-right py-5 px-5 rounded-xl border outline-none placeholder:text-[#e5e2e1]/25 tracking-normal transition-all ${
                isEmptyAnswerError
                  ? 'border-red-400/70 shadow-[0_0_18px_rgba(248,113,113,0.18)] focus:border-red-300'
                  : 'border-[#3a4a49] focus:border-[#00FBFB]'
              }`}
            />
          )}

          {error && <p className="text-red-400 text-sm leading-relaxed">{error}</p>}

          <button
            onClick={handleSubmitAnswer}
            disabled={submitting}
            className="anim-pulse-cta w-full relative overflow-hidden bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-base tracking-[0.4em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all disabled:opacity-25 flex items-center justify-center"
            style={answer.trim() ? { boxShadow: '0 0 20px rgba(0,251,251,0.08)' } : undefined}
          >
            {answer.trim() && !submitting && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#00FBFB]/0 via-[#00FBFB]/8 to-[#00FBFB]/0"
                style={{ animation: 'shimmer 2.5s ease-in-out infinite' }}
              />
            )}
            <span className="relative z-10">
              {submitting ? 'בודק...' : 'בדיקת תשובה'}
            </span>
          </button>
        </div>

          <div className="bg-[#0E0E0E]/85 backdrop-blur-xl border border-[#00FBFB]/10 rounded-2xl p-5 space-y-3">
          <button
            onClick={() => setShowChat(true)}
            disabled={hintsUsed >= 3}
            className="w-full flex items-center justify-center gap-2 bg-[#131313] border border-[#00FBFB]/25 rounded-xl py-4 active:scale-[0.98] transition-all disabled:opacity-30"
            style={hintsUsed < 3 ? { boxShadow: '0 0 15px rgba(0,251,251,0.06)' } : undefined}
          >
            <span className="text-lg">💬</span>
            <span className="text-[#00FBFB] text-sm font-semibold">
              {hintsUsed < 3 ? `שאלו את ${game.character.name}` : 'רמזים אזלו'}
            </span>
            {hintsUsed > 0 && (
              <span className="bg-[#e9c349]/20 text-[#e9c349] text-xs font-bold px-2 py-0.5 rounded-full">
                {hintsUsed}/3
              </span>
            )}
          </button>
          {hintsUsed < 3 && (
            <p className="text-center text-[#e5e2e1]/35 text-xs leading-relaxed">
              אפשר לבקש רמז או לשאול שאלה על המשימה.
            </p>
          )}
          <button
            onClick={() => onComplete('', true)}
            className="w-full text-center text-[#e5e2e1]/20 text-[11px] uppercase tracking-widest hover:text-[#e5e2e1]/40 transition-colors py-1"
          >
            דלג על תחנה
          </button>
          </div>
        </div>

        {/* Escape options */}
        {hintsUsed >= 3 && (
          <div className="border border-[#3a4a49]/40 rounded-xl p-4 space-y-3 lg:col-start-2">
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

    </div>
    </>
  );
}
