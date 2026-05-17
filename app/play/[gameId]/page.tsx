'use client';

import { useState, useEffect } from 'react';
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

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [phase, setPhase] = useState<GamePhase>('landing');
  const [lastAnswer, setLastAnswer] = useState('');

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

  const handleStart = () => {
    if (!game) return;
    const newSession: GameSession = {
      id: crypto.randomUUID(),
      gameId: game.id,
      groupSize: 1,
      completedStations: [],
      currentStationId: 0,
      hintsUsed: 0,
    };
    setSession(newSession);
    setPhase('map');
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

    setLastAnswer(skipped ? 'דולג' : answer);
    setSession(updatedSession);
    setPhase('success');
  };

  const handleSuccessContinue = () => {
    setPhase('story');
  };

  const handleStoryContinue = () => {
    if (!game || !session) return;
    if (session.currentStationId >= game.stations.length) {
      setPhase('final');
    } else {
      setPhase('map');
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
    return <LandingScreen game={game} onEnter={() => setPhase('intro')} />;
  }

  // 2. Game Intro
  if (phase === 'intro') {
    return <StoryIntro game={game} onStart={handleStart} />;
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
        onReady={() => setPhase('trigger')}
      />
    );
  }

  // 4. Trigger (code entry to unlock station)
  if (phase === 'trigger') {
    return (
      <TriggerInput
        triggerType={currentStation.triggerType}
        expectedCode={currentStation.triggerValue}
        onSuccess={() => setPhase('arrival')}
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
        onContinue={() => setPhase('station')}
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
        onRestart={() => { setPhase('landing'); setSession(null); }}
      />
    );
  }

  return null;
}
