import { ChallengeData } from '@/types/challenge';

export type Game = {
  id: string;
  title: string;
  story: string;
  imageUrl?: string;
  duration?: string;    // e.g. '60 דקות'
  difficulty?: string;  // e.g. 'מתקדם'
  stations: Station[];
  character: AICharacter;
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
  /** רמז ניווט — מה מוצג על מסך הטריגר כדי לכוון את השחקנים לאן ללכת/לחפש */
  navigationHint?: string;
  narrative: string;
  narrativeMedia?: StationMedia;  // מדיה בחלק הסיפורי
  task: string;
  taskMedia?: StationMedia;       // מדיה כחלק מהמשימה
  hints: [string, string, string];
  answer: string;
  challenge?: ChallengeData;      // אתגר אינטראקטיבי — נקבע ע"י הbuilder לפי פרמטרי המשחק
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
