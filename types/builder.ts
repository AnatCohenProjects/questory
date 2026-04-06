import { ChallengeData } from './challenge';
import { Game } from './game';

// ─── Media ───────────────────────────────────────────────────────────────────

export type MediaItemType = 'image' | 'video' | 'audio' | 'text';

export interface MediaItem {
  id: string;
  type: MediaItemType;
  url?: string;      // image / video / audio
  content?: string;  // text
  caption?: string;
}

// ─── Experience ───────────────────────────────────────────────────────────────

export type ExperienceStyle = 'story' | 'competitive' | 'learning';

export const EXPERIENCE_STYLE_LABELS: Record<ExperienceStyle, string> = {
  story: 'Story & Discovery',
  competitive: 'Fast & Competitive',
  learning: 'Learning & Exploration',
};

export const AUDIENCE_OPTIONS = ['משפחות', 'ילדים', 'מבוגרים', 'בני נוער', 'קבוצות'];
export const DURATION_OPTIONS = ['30 דקות', '45 דקות', '60 דקות', '90 דקות', '120 דקות'];
export const DIFFICULTY_OPTIONS = ['קל', 'בינוני', 'מתקדם'];
export const PROGRESSION_OPTIONS = ['ליניארי', 'פתוח', 'מרוץ'];

// ─── Draft types ──────────────────────────────────────────────────────────────

export interface StationDraft {
  id: number;
  triggerType: 'qr' | 'code' | 'gps';
  triggerValue: string;
  navigationHint: string;
  narrative: string;
  task: string;
  hints: [string, string, string];
  answer: string;
  challenge?: ChallengeData;
  media: MediaItem[];
}

export interface GameDraft {
  title: string;
  story: string;
  experienceStyle: ExperienceStyle;
  duration: string;
  difficulty: string;
  audience: string;
  progressionType: string;
  media: MediaItem[];
  mapUrl?: string;
  character: { name: string; tone: string };
  stations: StationDraft[];
}

// ─── Factories ────────────────────────────────────────────────────────────────

export function emptyStation(id: number): StationDraft {
  return {
    id,
    triggerType: 'code',
    triggerValue: String(id + 1),
    navigationHint: '',
    narrative: '',
    task: '',
    hints: ['', '', ''],
    answer: '',
    media: [],
  };
}

export const defaultDraft: GameDraft = {
  title: '',
  story: '',
  experienceStyle: 'story',
  duration: '60 דקות',
  difficulty: 'בינוני',
  audience: 'משפחות',
  progressionType: 'ליניארי',
  media: [],
  mapUrl: '',
  character: { name: '', tone: '' },
  stations: [],
};

// ─── Conversion ───────────────────────────────────────────────────────────────

export function draftToGame(draft: GameDraft): Game {
  return {
    id: 'preview',
    title: draft.title || 'משחק ללא שם',
    story: draft.story,
    duration: draft.duration,
    difficulty: draft.difficulty,
    character: { name: draft.character.name || 'מדריך', tone: draft.character.tone },
    stations: draft.stations.map(s => ({
      id: s.id,
      triggerType: s.triggerType,
      triggerValue: s.triggerValue,
      navigationHint: s.navigationHint,
      narrative: s.narrative,
      task: s.task,
      hints: s.hints,
      answer: s.answer,
      challenge: s.challenge,
    })),
  };
}
