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
  story: '🔭 סיפור וגילוי',
  competitive: '⚡ מהיר ותחרותי',
  learning: '🎓 למידה וחקר',
};

export const AUDIENCE_OPTIONS = ['משפחות', 'ילדים', 'מבוגרים', 'בני נוער', 'קבוצות'];
export const DURATION_OPTIONS = ['30 דקות', '45 דקות', '60 דקות', '90 דקות', '120 דקות'];
export const DIFFICULTY_OPTIONS = ['קל', 'בינוני', 'מתקדם'];
export const PROGRESSION_OPTIONS = ['ליניארי', 'פתוח', 'מרוץ'];

// ─── Data Source ──────────────────────────────────────────────────────────────

export interface ManualDataSource {
  type: 'manual';
  title: string;               // e.g., "דלת העתיקה בפינת הרחוב"
  description: string;         // detailed physical description
  narrative_context: string;   // historical/story context
  keywords: string[];          // tags for AI suggestions
}

export type DataSource = ManualDataSource;  // Placeholder for future DBSource

// ─── Draft types ──────────────────────────────────────────────────────────────

export interface StationDraft {
  id: number;
  triggerType: 'qr' | 'code' | 'gps';
  triggerValue: string;
  navigationHint: string;
  narrative: string;
  narrativeMedia?: { type: 'image' | 'video' | 'audio'; url: string; caption?: string };
  task: string;
  taskMedia?: { type: 'image' | 'video' | 'audio'; url: string; caption?: string };
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
  mapMedia?: { type: 'image' | 'video'; url: string; caption?: string };
  character: { name: string; tone: string };
  stations: StationDraft[];
  dataSource?: DataSource;     // Content generation data source (game-level)
  // Auto-config from experience style
  aiEnabled?: boolean;
  hintsLevel?: 'low' | 'medium' | 'high';
  competitionMode?: boolean;
  timerEnabled?: boolean;
  leaderboardEnabled?: boolean;
  puzzleDifficulty?: 'simple' | 'medium' | 'deep';
  knowledgeIntegrated?: boolean;
}

// ─── Factories ────────────────────────────────────────────────────────────────

export function emptyStation(id: number): StationDraft {
  return {
    id,
    triggerType: 'code',
    triggerValue: String(id + 1),
    navigationHint: '',
    narrative: '',
    narrativeMedia: undefined,
    task: '',
    taskMedia: undefined,
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
  mapMedia: undefined,
  character: { name: '', tone: '' },
  stations: [],
  dataSource: undefined,
  // Auto-config for 'story' style
  aiEnabled: true,
  hintsLevel: 'medium',
  competitionMode: false,
  timerEnabled: false,
  leaderboardEnabled: false,
  puzzleDifficulty: 'deep',
  knowledgeIntegrated: false,
};

// Auto-config based on experience style
export function getAutoConfigForStyle(style: ExperienceStyle): Partial<GameDraft> {
  switch (style) {
    case 'story':
      return {
        progressionType: 'ליניארי',
        aiEnabled: true,
        hintsLevel: 'medium',
        competitionMode: false,
        timerEnabled: false,
        leaderboardEnabled: false,
        puzzleDifficulty: 'deep',
        knowledgeIntegrated: false,
      };
    case 'competitive':
      return {
        progressionType: 'פתוח',
        aiEnabled: false,
        hintsLevel: 'low',
        competitionMode: true,
        timerEnabled: true,
        leaderboardEnabled: true,
        puzzleDifficulty: 'medium',
        knowledgeIntegrated: false,
      };
    case 'learning':
      return {
        progressionType: 'ליניארי',
        aiEnabled: true,
        hintsLevel: 'high',
        competitionMode: false,
        timerEnabled: false,
        leaderboardEnabled: false,
        puzzleDifficulty: 'simple',
        knowledgeIntegrated: true,
      };
    default:
      return {};
  }
}

// ─── Conversion ───────────────────────────────────────────────────────────────

export function draftToGame(draft: GameDraft): Game {
  const heroImageUrl = draft.media.find(item => item.type === 'image' && item.url?.trim())?.url?.trim();

  return {
    id: 'preview',
    title: draft.title || 'משחק ללא שם',
    story: draft.story,
    imageUrl: heroImageUrl || undefined,
    duration: draft.duration,
    difficulty: draft.difficulty,
    character: { name: draft.character.name || 'מדריך', tone: draft.character.tone },
    stations: draft.stations.map(s => ({
      id: s.id,
      triggerType: s.triggerType,
      triggerValue: s.triggerValue,
      navigationHint: s.navigationHint,
      narrative: s.narrative,
      narrativeMedia: s.narrativeMedia,
      task: s.task,
      taskMedia: s.taskMedia,
      hints: s.hints,
      answer: s.answer,
      challenge: s.challenge,
    })),
  };
}
