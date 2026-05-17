'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { use } from 'react';
import { Game, GameSession, CompletedStation } from '@/types/game';
import { sampleGame } from '@/lib/sampleGame';
import LandingScreen from '@/components/game/LandingScreen';
import StoryIntro from '@/components/game/StoryIntro';
import MapNextStep from '@/components/game/MapNextStep';
import TriggerInput from '@/components/game/TriggerInput';
import LocationArrival from '@/components/game/LocationArrival';
import StationView from '@/components/game/StationView';
import SuccessFeedback from '@/components/game/SuccessFeedback';
import StoryProgression from '@/components/game/StoryProgression';
import FinalResult from '@/components/game/FinalResult';

type GamePhase =
  | 'landing'      // 1. מסך נחיתה
  | 'intro'        // 2. הקדמה למשחק
  | 'map'          // 3. מפה / הצעד הבא
  | 'trigger'      // 4. הזנת קוד כניסה לתחנה
  | 'arrival'      // 5. הגעה ליעד
  | 'station'      // 6. חידה
  | 'success'      // 7. משוב הצלחה
  | 'story'        // 8. התקדמות בסיפור
  | 'final';       // 9. מסך סיכום סופי

type GameSnapshot = {
  phase: GamePhase;
  session: GameSession | null;
  lastAnswer: string;
};

const PLAYER_HISTORY_KEY = 'questoryPlayerHistory';

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

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [phase, setPhase] = useState<GamePhase>('landing');
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
      const stored = localStorage.getItem('questory_preview_game');
      if (stored) {
        try { setGame(JSON.parse(stored)); } catch { setGame(sampleGame); }
      } else {
        setGame(sampleGame);
      }
    } else {
      setGame(sampleGame);
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
      phase: 'landing',
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
    const completed: CompletedStation = {
      stationId: currentStation.id,
      name: `תחנה ${session.currentStationId + 1}`,
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
    navigateTo({ phase: 'story', session, lastAnswer });
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

  // 1. Landing
  if (phase === 'landing') {
    return (
      <LandingScreen
        game={game}
        onEnter={() => navigateTo({ phase: 'intro', session: null, lastAnswer: '' })}
      />
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
    return (
      <MapNextStep
        stationNumber={session.currentStationId + 1}
        navigationHint={currentStation?.navigationHint ?? 'גשו ליעד הבא'}
        triggerType={currentStation?.triggerType ?? 'code'}
        onReady={() => navigateTo({ phase: 'trigger', session, lastAnswer })}
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
      />
    );
  }

  // 5. Location Arrival
  if (phase === 'arrival') {
    return (
      <LocationArrival
        stationNumber={session.currentStationId + 1}
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
        onContinue={handleSuccessContinue}
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
        onRestart={() => navigateTo({ phase: 'landing', session: null, lastAnswer: '' })}
        onBack={historyIndex > 0 ? goBack : undefined}
      />
    );
  }

  return null;
}
