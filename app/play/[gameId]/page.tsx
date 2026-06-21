'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { use } from 'react';
import { Game, GameSession, CompletedStation } from '@/types/game';
import { sampleGame } from '@/lib/sampleGame';
import { loadPreviewGame } from '@/lib/previewStorage';
import StoryIntro from '@/components/game/StoryIntro';
import MapNextStep from '@/components/game/MapNextStep';
import TriggerInput from '@/components/game/TriggerInput';
import LocationArrival from '@/components/game/LocationArrival';
import StationView from '@/components/game/StationView';
import SuccessFeedback from '@/components/game/SuccessFeedback';
import StoryProgression from '@/components/game/StoryProgression';
import TransitionRiddleView from '@/components/game/TransitionRiddleView';
import BookRevealView from '@/components/game/BookRevealView';
import FinalResult from '@/components/game/FinalResult';

type GamePhase =
  | 'landing'
  | 'intro'
  | 'map'
  | 'trigger'
  | 'arrival'
  | 'station'
  | 'success'
  | 'transition_riddle'
  | 'book_reveal'
  | 'story'
  | 'final';

type GameSnapshot = {
  phase: GamePhase;
  session: GameSession | null;
  lastAnswer: string;
};

const PLAYER_HISTORY_KEY = 'questoryPlayerHistory';
const DEFAULT_PLAYER_CHARACTER_NAME = 'המדריך';

function createSessionId() {
  const browserCrypto = globalThis.crypto;

  if (typeof browserCrypto?.randomUUID === 'function') {
    return browserCrypto.randomUUID();
  }

  if (typeof browserCrypto?.getRandomValues === 'function') {
    const values = new Uint32Array(4);
    browserCrypto.getRandomValues(values);
    return Array.from(values, value => value.toString(16).padStart(8, '0')).join('-');
  }

  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function withPlayerCharacterDefaults(game: Game): Game {
  const characterName = game.character?.name?.trim();

  if (characterName && characterName !== 'מדריך') {
    return game;
  }

  return {
    ...game,
    character: {
      ...game.character,
      name: DEFAULT_PLAYER_CHARACTER_NAME,
    },
  };
}

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [lastAnswer, setLastAnswer] = useState('');
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyStackRef = useRef<GameSnapshot[]>([]);
  const historyIndexRef = useRef(0);
  const historyReadyRef = useRef(false);

  const applySnapshot = useCallback((snapshot: GameSnapshot) => {
    setPhase(snapshot.phase);
    setSession(snapshot.session);
    setLastAnswer(snapshot.lastAnswer);
  }, []);

  const initializeHistory = useCallback((snapshot: GameSnapshot) => {
    historyStackRef.current = [snapshot];
    window.history.replaceState(
      { key: PLAYER_HISTORY_KEY, index: 0 },
      '',
      window.location.href
    );
    historyIndexRef.current = 0;
    setHistoryIndex(0);
    historyReadyRef.current = true;
  }, []);

  const navigateTo = useCallback((snapshot: GameSnapshot) => {
    if (!historyReadyRef.current) {
      initializeHistory({ phase, session, lastAnswer });
    }

    const nextIndex = historyStackRef.current.length
      ? historyIndexRef.current + 1
      : 0;

    historyStackRef.current = [
      ...historyStackRef.current.slice(0, nextIndex),
      snapshot,
    ];
    window.history.pushState(
      { key: PLAYER_HISTORY_KEY, index: nextIndex },
      '',
      window.location.href
    );
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    applySnapshot(snapshot);
  }, [applySnapshot, initializeHistory, lastAnswer, phase, session]);

  const goBack = useCallback(() => {
    if (historyIndexRef.current > 0) {
      window.history.back();
    }
  }, []);

  useEffect(() => {
    if (gameId === 'preview') {
      loadPreviewGame()
        .then(stored => {
          if (stored) {
            setGame(withPlayerCharacterDefaults(stored as Game));
          } else {
            setGame(withPlayerCharacterDefaults(sampleGame));
          }
        })
        .catch(() => setGame(withPlayerCharacterDefaults(sampleGame)));
    } else {
      setGame(withPlayerCharacterDefaults(sampleGame));
    }
  }, [gameId]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as { key?: string; index?: number } | null;
      if (state?.key !== PLAYER_HISTORY_KEY || typeof state.index !== 'number') {
        return;
      }

      const snapshot = historyStackRef.current[state.index];
      if (!snapshot) return;

      historyIndexRef.current = state.index;
      setHistoryIndex(state.index);
      applySnapshot(snapshot);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [applySnapshot]);

  useEffect(() => {
    if (!game || historyReadyRef.current) return;

    initializeHistory({
      phase: 'intro',
      session: null,
      lastAnswer: '',
    });
  }, [game, initializeHistory]);

  const handleStart = () => {
    if (!game) return;
    const newSession: GameSession = {
      id: createSessionId(),
      gameId: game.id,
      groupSize: 1,
      completedStations: [],
      currentStationId: 0,
      hintsUsed: 0,
    };
    navigateTo({ phase: 'map', session: newSession, lastAnswer: '' });
  };

  const handleStationComplete = (answer: string, skipped?: boolean) => {
    if (!game || !session) return;

    const currentStation = game.stations[session.currentStationId];
    const stationLabel = game.gameType === 'library' ? 'ספר' : 'תחנה';
    const completed: CompletedStation = {
      stationId: currentStation.id,
      name: `${stationLabel} ${session.currentStationId + 1}`,
      discovery: skipped ? 'דולג' : answer,
      timeSpent: 0,
      hintsUsed: session.hintsUsed,
    };

    const updatedSession: GameSession = {
      ...session,
      completedStations: [...session.completedStations, completed],
      currentStationId: session.currentStationId + 1,
      hintsUsed: 0,
    };
    navigateTo({
      phase: 'success',
      session: updatedSession,
      lastAnswer: completed.discovery,
    });
  };

  const handleSuccessContinue = () => {
    if (!game || !session) return;

    const justCompleted = game.stations[session.currentStationId - 1];
    if (justCompleted?.transitionRiddle?.enabled && session.currentStationId < game.stations.length) {
      navigateTo({ phase: 'transition_riddle', session, lastAnswer });
      return;
    }

    if (game.gameType === 'library') {
      if (session.currentStationId >= game.stations.length) {
        navigateTo({ phase: 'final', session, lastAnswer });
      } else {
        navigateTo({ phase: 'map', session, lastAnswer });
      }
    } else {
      navigateTo({ phase: 'story', session, lastAnswer });
    }
  };

  const handleStoryContinue = () => {
    if (!game || !session) return;
    if (session.currentStationId >= game.stations.length) {
      navigateTo({ phase: 'final', session, lastAnswer });
    } else {
      navigateTo({ phase: 'map', session, lastAnswer });
    }
  };

  // Loading
  if (!game) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00FBFB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Game Intro
  if (phase === 'intro') {
    return (
      <StoryIntro
        game={game}
        onStart={handleStart}
        onBack={historyIndex > 0 ? goBack : undefined}
      />
    );
  }

  if (!session) return null;

  const currentStation = game.stations[session.currentStationId];

  // 3. Map / Next Step
  if (phase === 'map') {
    const prevStation = session.currentStationId > 0
      ? game.stations[session.currentStationId - 1]
      : undefined;
    const mapTransitionRiddle = prevStation?.transitionRiddle?.enabled
      ? prevStation.transitionRiddle
      : undefined;
    return (
      <MapNextStep
        stationNumber={session.currentStationId + 1}
        totalStations={game.stations.length}
        navigationHint={currentStation?.navigationHint}
        navigationAnswer={currentStation?.navigationAnswer}
        currentBook={currentStation?.book}
        triggerType={currentStation?.triggerType ?? 'code'}
        gameType={game.gameType}
        transitionRiddle={mapTransitionRiddle}
        onReady={() => navigateTo({ phase: game.gameType === 'library' ? 'arrival' : 'trigger', session, lastAnswer })}
        onBack={historyIndex > 0 ? goBack : undefined}
      />
    );
  }

  // 4. Trigger (code entry to unlock station)
  if (phase === 'trigger') {
    return (
      <TriggerInput
        triggerType={currentStation.triggerType}
        expectedCode={currentStation.triggerValue}
        onSuccess={() => navigateTo({ phase: 'arrival', session, lastAnswer })}
        onBack={historyIndex > 0 ? goBack : undefined}
        stationNumber={session.currentStationId + 1}
        navigationHint={currentStation.navigationHint}
        gameType={game.gameType}
      />
    );
  }

  // 5. Location Arrival
  if (phase === 'arrival') {
    const prevStation = game.stations[session.currentStationId - 1];
    const bookTitle = prevStation?.transitionRiddle?.targetBook?.title;
    const bookAuthor = prevStation?.transitionRiddle?.targetBook?.author;
    return (
      <LocationArrival
        stationNumber={session.currentStationId + 1}
        gameType={game.gameType}
        bookTitle={bookTitle}
        bookAuthor={bookAuthor}
        onContinue={() => navigateTo({ phase: 'station', session, lastAnswer })}
        onBack={historyIndex > 0 ? goBack : undefined}
      />
    );
  }

  // 6. Station (puzzle)
  if (phase === 'station') {
    return (
      <StationView
        station={currentStation}
        game={game}
        session={session}
        onComplete={handleStationComplete}
        onBack={historyIndex > 0 ? goBack : undefined}
        stationNumber={session.currentStationId + 1}
      />
    );
  }

  // 7. Success Feedback
  if (phase === 'success') {
    return (
      <SuccessFeedback
        stationNumber={session.currentStationId}
        totalStations={game.stations.length}
        answer={lastAnswer}
        gameType={game.gameType}
        onContinue={handleSuccessContinue}
        onBack={historyIndex > 0 ? goBack : undefined}
      />
    );
  }

  // Transition Riddle (library mode — after station success, instead of story progression)
  if (phase === 'transition_riddle') {
    const justCompleted = game.stations[session.currentStationId - 1];
    const tr = justCompleted?.transitionRiddle;
    if (!tr) return null;
    return (
      <TransitionRiddleView
        prompt={tr.prompt}
        answer={tr.answer}
        media={tr.media}
        gameType={game.gameType}
        onComplete={() => {
          if (tr.targetBook) {
            navigateTo({ phase: 'book_reveal', session, lastAnswer });
          } else {
            navigateTo({ phase: 'map', session, lastAnswer });
          }
        }}
        onBack={historyIndex > 0 ? goBack : undefined}
      />
    );
  }

  // Book Reveal (library mode — after transition riddle)
  if (phase === 'book_reveal') {
    const justCompleted = game.stations[session.currentStationId - 1];
    const targetBook = justCompleted?.transitionRiddle?.targetBook;
    if (!targetBook) return null;
    return (
      <BookRevealView
        targetBook={targetBook}
        gameType={game.gameType}
        onContinue={() => navigateTo({ phase: 'map', session, lastAnswer })}
        onBack={historyIndex > 0 ? goBack : undefined}
      />
    );
  }

  // 8. Story Progression
  if (phase === 'story') {
    return (
      <StoryProgression
        character={game.character}
        stationNumber={session.currentStationId}
        totalStations={game.stations.length}
        onContinue={handleStoryContinue}
        onBack={historyIndex > 0 ? goBack : undefined}
      />
    );
  }

  // 9. Final Result
  if (phase === 'final') {
    return (
      <FinalResult
        session={session}
        gameTitle={game.title}
        totalStations={game.stations.length}
        gameType={game.gameType}
        onRestart={() => navigateTo({ phase: 'landing', session: null, lastAnswer: '' })}
        onBack={historyIndex > 0 ? goBack : undefined}
      />
    );
  }

  return null;
}
