import { GameType, GameTheme, GameDraft } from '@/types/builder';

interface GameTypePreset extends GameTheme {
  label: string;
  description: string;
  icon: string;
  draftDefaults: Partial<GameDraft>;
}

export const GAME_TYPE_PRESETS: Record<GameType, GameTypePreset> = {
  urban: {
    label: 'משחק ניווט עירוני',
    description: 'סיור עם חידות ברחוב, בגן, בעיר',
    icon: '🗺️',
    stationLabel: 'תחנה',
    stationsLabel: 'תחנות',
    locationLabel: 'מיקום',
    challengeLabel: 'אתגר',
    nextLabel: 'התחנה הבאה',
    routeLabel: 'מסלול',
    draftDefaults: {
      story: '',
      character: { name: '', tone: '' },
      duration: '60 דקות',
      difficulty: 'בינוני',
      audience: 'משפחות',
      progressionType: 'ליניארי',
      experienceStyle: 'story',
    },
  },
  library: {
    label: 'משחק ספרייה',
    description: 'חיפוש ספרים וחידות בין המדפים',
    icon: '📚',
    stationLabel: 'ספר',
    stationsLabel: 'ספרים',
    locationLabel: 'מדף',
    challengeLabel: 'חידת ספר',
    nextLabel: 'הספר הבא',
    routeLabel: 'מסע',
    draftDefaults: {
      story: 'ה-AI המוחק פרץ לספרייה וגנב רסיסי זיכרון מהסיפורים האהובים ביותר. המשימה שלך: מצא את הספרים, פתח אותם, ושחרר את הזיכרון לפני שייעלם לנצח.',
      character: {
        name: 'ניבי',
        tone: 'בלשי, דחוף, מעודד. מפקד משימה שמאמין בשחקנים.',
      },
      duration: '45 דקות',
      difficulty: 'קל',
      audience: 'ילדים',
      progressionType: 'ליניארי',
      experienceStyle: 'story',
    },
  },
};

export function getTheme(gameType?: GameType, customTheme?: Partial<GameTheme>): GameTheme {
  const preset = GAME_TYPE_PRESETS[gameType ?? 'urban'];
  return { ...preset, ...customTheme };
}
