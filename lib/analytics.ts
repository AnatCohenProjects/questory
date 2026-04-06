import { supabase } from './supabase';

type EventType =
  | 'game_started'
  | 'station_entered'
  | 'hint_requested'
  | 'station_completed'
  | 'game_abandoned'
  | 'game_completed';

export const trackEvent = async (
  type: EventType,
  sessionId: string,
  payload?: {
    stationId?: number;
    hintLevel?: number;
    timeSpent?: number;
  }
) => {
  try {
    await supabase.from('events').insert({
      session_id: sessionId,
      type,
      station_id: payload?.stationId,
      hint_level: payload?.hintLevel,
      created_at: new Date().toISOString()
    });
  } catch {
    // Silent fail — analytics should never break the game
  }
};
