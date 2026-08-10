/**
 * Puzzle Template System
 *
 * Templates are the Builder-side concept — meta-definitions that describe
 * HOW a puzzle works and WHAT thinking type it requires.
 *
 * A Template is selected in the Builder → filled with content → produces ChallengeData.
 * The Player only ever sees ChallengeData; templates are invisible at runtime.
 *
 * Flow:
 *   Builder selects Template
 *     → fills in content fields
 *     → system produces ChallengeData
 *     → Player renders ChallengeView
 */

import { ChallengeType } from '@/types/challenge';

export type ThinkingType =
  | 'sequence_logic'      // זיהוי דפוס / המשך סדרה
  | 'filtering'           // סינון לפי כלל + מיון
  | 'encoding'            // פענוח / הצפנה
  | 'spatial'             // ניווט / מיפוי מרחבי
  | 'anomaly_detection'   // מי לא שייך / חריגה
  | 'transformation';     // שיקוף / סיבוב / שינוי ויזואלי

export type InputType =
  | 'visual_observation'  // תצפית על סביבה — ספירה, זיהוי, כיוון
  | 'in_app_visual'       // ויזואל דיגיטלי בתוך האפליקציה
  | 'text_reading';       // קריאת טקסט / שלט / כיתוב

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface PuzzleTemplate {
  templateId: string;
  /** שם תצוגה ב-Builder */
  name: string;
  /** תיאור קצר ללקוח */
  description: string;
  /** סוג החשיבה הנדרשת */
  thinkingType: ThinkingType;
  /** מאיפה מגיע ה-input — תצפית / ויזואל / טקסט */
  inputType: InputType;
  /** הטיפוס ב-ChallengeData שה-Template הזה מייצר */
  challengeType: ChallengeType;
  /** שאלות הנחיה ל-Builder בעת מילוי התוכן */
  questionPrompts: string[];
  /** רמות קושי נתמכות */
  difficultyLevels: DifficultyLevel[];
  /**
   * סוגי אובייקטים מהעולם האמיתי שה-Template עובד איתם טוב.
   * ישמש עתידית ל-auto-suggestion בBuilder.
   */
  suitableObjects?: string[];
}

// ─── Template Registry ────────────────────────────────────────────────────────

export const PUZZLE_TEMPLATES: PuzzleTemplate[] = [
  {
    templateId: 'pattern',
    name: 'זיהוי דפוס',
    description: 'שחקנים מזהים חוק בסדרת מספרים או סמלים וממלאים את החסרים',
    thinkingType: 'sequence_logic',
    inputType: 'in_app_visual',
    challengeType: 'pattern',
    questionPrompts: [
      'מה הדפוס בסדרה?',
      'מה המספר הבא?',
      'מה חוזר על עצמו?',
    ],
    difficultyLevels: ['easy', 'medium', 'hard'],
    suitableObjects: ['שלט', 'מדרגות', 'חלונות', 'עמודים'],
  },
  {
    templateId: 'cipher',
    name: 'צופן סמלים',
    description: 'שחקנים מפענחים סמלים שנצפו בסביבה לפי מפתח הצפנה',
    thinkingType: 'encoding',
    inputType: 'visual_observation',
    challengeType: 'cipher',
    questionPrompts: [
      'אילו סמלים ניתן לראות כאן?',
      'מה הסדר שלהם?',
      'כל סמל מייצג ספרה — מה הקוד?',
    ],
    difficultyLevels: ['easy', 'medium', 'hard'],
    suitableObjects: ['חזית בניין', 'שלט', 'פסל', 'ריצוף', 'קיר'],
  },
  {
    templateId: 'cipherWheels',
    name: 'גלגלי צופן',
    description: 'שחקנים מסובבים גלגלות אותיות מכניות כדי לפענח מילת מפתח מוצפנת',
    thinkingType: 'encoding',
    inputType: 'in_app_visual',
    challengeType: 'cipherWheels',
    questionPrompts: [
      'מהי מילת המפתח המפוענחת?',
      'כמה צעדים ההזזה?',
      'לאיזה כיוון הוצפנה המילה?',
    ],
    difficultyLevels: ['easy', 'medium'],
    suitableObjects: ['ספר', 'תיבת אוצר', 'שער עיר עתיקה', 'ארכיון'],
  },
  {
    templateId: 'oddoneout',
    name: 'מי לא שייך',
    description: 'שחקנים מזהים חריגה בקבוצת פריטים',
    thinkingType: 'anomaly_detection',
    inputType: 'in_app_visual',
    challengeType: 'oddoneout',
    questionPrompts: [
      'מה הכלל המשותף לרוב הפריטים?',
      'מי חורג מהכלל?',
      'מה הספרה של החריג?',
    ],
    difficultyLevels: ['easy', 'medium'],
    suitableObjects: ['רחוב', 'חנויות', 'עצים', 'מבנים'],
  },
  {
    templateId: 'trivia',
    name: 'שאלת ידע',
    description: 'שאלת בחירה מרובה — ידע כללי או ספציפי למקום',
    thinkingType: 'filtering',
    inputType: 'text_reading',
    challengeType: 'trivia',
    questionPrompts: [
      'מה השאלה?',
      'מה התשובות האפשריות?',
      'מה התשובה הנכונה?',
    ],
    difficultyLevels: ['easy', 'medium', 'hard'],
    suitableObjects: ['מוזיאון', 'אנדרטה', 'לוח מידע', 'שלט היסטורי'],
  },
  {
    templateId: 'puzzle',
    name: 'פאזל תמונה',
    description: 'שחקנים מרכיבים תמונה מפוצלת לחלקים — מגלים ספר או מיקום',
    thinkingType: 'transformation',
    inputType: 'in_app_visual',
    challengeType: 'puzzle',
    questionPrompts: [
      'איזו תמונה תפוצל לחלקים?',
      'כמה חלקים — קל (4), בינוני (9) או מתקדם (16)?',
      'מה יתגלה לאחר ההרכבה?',
    ],
    difficultyLevels: ['easy', 'medium', 'hard'],
    suitableObjects: ['עטיפת ספר', 'תמונה היסטורית', 'מפה', 'פורטרט'],
  },
  {
    templateId: 'imagePuzzle',
    name: 'פאזל תמונה מוסתרת',
    description: 'שחקנים מרכיבים תמונה חתוכה לחלקים בלי לראות אותה מראש, ומגלים מה מוסתר בה רק אחרי ההרכבה',
    thinkingType: 'transformation',
    inputType: 'in_app_visual',
    challengeType: 'imagePuzzle',
    questionPrompts: [
      'איזו תמונה תפוצל לחלקים?',
      'כמה חלקים, קל (6), בינוני (9) או קשה (12)?',
      'מה מתגלה לאחר ההרכבה?',
    ],
    difficultyLevels: ['easy', 'medium', 'hard'],
    suitableObjects: ['עטיפת ספר', 'בניין', 'פסל', 'ציור קיר', 'תמונה היסטורית'],
  },
];

/** קבלת Template לפי challengeType */
export function getTemplateForChallenge(challengeType: ChallengeType): PuzzleTemplate | undefined {
  return PUZZLE_TEMPLATES.find(t => t.challengeType === challengeType);
}
