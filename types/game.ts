import { ChallengeData } from '@/types/challenge';

export type GameType = 'urban' | 'library';

export type GameTheme = {
  stationLabel: string;
  stationsLabel: string;
  locationLabel: string;
  challengeLabel: string;
  nextLabel: string;
  routeLabel: string;
};

export type Game = {
  id: string;
  title: string;
  story: string;
  imageUrl?: string;
  mapMedia?: StationMedia;
  duration?: string;
  difficulty?: string;
  stations: Station[];
  character: AICharacter;
  gameType?: GameType;
  theme?: Partial<GameTheme>;
};

export type StationMedia = {
  type: 'image' | 'video' | 'audio';
  url: string;
  caption?: string;
};

export type Station = {
  id: number;
  triggerType: 'qr' | 'code' | 'gps';
  triggerValue: string;
  navigationHint?: string;
  navigationAnswer?: string;
  book?: { title: string; author?: string; location?: string };
  narrative: string;
  narrativeMedia?: StationMedia;  // מדיה בחלק הסיפורי
  task: string;
  taskMedia?: StationMedia;       // מדיה כחלק מהמשימה
  hints: [string, string, string];
  answer: string;
  challenge?: ChallengeData;
  transitionRiddle?: {
    enabled: boolean;
    prompt: string;
    answer?: string;
    media?: { type: 'image' | 'video' | 'audio'; url: string; caption?: string };
    targetBook?: { title: string; author?: string; location?: string };
  };
};

export type AICharacter = {
  name: string;
  tone: string;
  avatarUrl?: string;
};

export type GameSession = {
  id: string;
  gameId: string;
  groupSize: number;
  completedStations: CompletedStation[];
  currentStationId: number;
  hintsUsed: number;
};

export type CompletedStation = {
  stationId: number;
  name: string;
  discovery: string;
  timeSpent: number;
  hintsUsed: number;
};
