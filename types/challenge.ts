/**
 * Challenge types for Questory stations.
 *
 * Each type is a self-contained template:
 *  - the Builder fills in the content fields via the admin UI
 *  - the Player renders the matching component (ChallengeView routes by type)
 *
 * Adding a new challenge type:
 *  1. Add interface here extending ChallengeBase
 *  2. Add it to the ChallengeData union
 *  3. Create components/challenge/<Type>Challenge.tsx
 *  4. Add a case in ChallengeView.tsx
 */

export type ChallengeType =
  | 'cipher'      // פענוח צופן — סמלים → ספרות  (escape room)
  | 'pattern'     // השלמת סדרה — מספרים/אותיות עם חסרים  (escape room)
  | 'oddoneout'   // מי לא שייך — בחירה מגריד  (escape room)
  | 'trivia'      // שאלת ידע — בחירה מרובה  (universal)
  | 'puzzle'      // פאזל תמונה — הרכבת חלקים  (universal)
  | 'imagePuzzle' // פאזל תמונה גנרי — הרכבת פאזי ללא תצוגה מקדימה  (universal)
  | 'sorting'     // סדרו בסדר נכון  (universal — future)
  | 'observation' // מציאת אובייקט בשטח — ללא widget, רק task+hints  (outdoor — future)
  | 'photo';      // צלמו תמונה  (future — requires camera)

interface ChallengeBase {
  type: ChallengeType;
  solution: string;
}

// ─── Escape Room ─────────────────────────────────────────────────────────────

export interface CipherChallengeData extends ChallengeBase {
  type: 'cipher';
  /** מפתח הצופן: כל סמל ממופה לספרה */
  key: Array<{ symbol: string; digit: string }>;
  /** רצף הסמלים לפענוח */
  encodedMessage: string[];
  solution: string;
}

export interface PatternChallengeData extends ChallengeBase {
  type: 'pattern';
  /** הפריטים בסדרה; null = תא ריק למילוי */
  items: (number | string | null)[];
  blankCount: number;
  patternHint?: string;
  solution: string;
}

export interface OddOneOutChallengeData extends ChallengeBase {
  type: 'oddoneout';
  items: Array<{
    id: string;
    label: string;
    isOdd: boolean;
    /** הספרה שהפריט תורם לקוד הסופי (רלוונטי רק ל-isOdd) */
    digitContribution?: string;
  }>;
  oddCount: number;
  groupLabel?: string;
  solution: string;
}

// ─── Universal ───────────────────────────────────────────────────────────────

export interface TriviaChallengeData extends ChallengeBase {
  type: 'trivia';
  question: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  /** ספרה/מילה שנחשפת לאחר תשובה נכונה ומהווה את הפתרון */
  solution: string;
}





// ─── Puzzle ──────────────────────────────────────────────────────────────────

export interface PuzzleChallengeData extends ChallengeBase {
  type: 'puzzle';
  /** URL של התמונה לפירוק לחלקים */
  imageUrl: string;
  /** מספר החלקים: 4 (2×2) | 9 (3×3) | 16 (4×4) */
  pieceCount: 4 | 9 | 16;
  /** הוראה אופציונלית לשחקנים */
  instruction?: string;
  /** תמיד 'solved' — הפאזל מאמת את עצמו */
  solution: string;
}

// ─── Image Puzzle ───────────────────────────────────────────────────────────

export interface ImagePuzzleChallengeData extends ChallengeBase {
  type: 'imagePuzzle';
  /** URL של התמונה לפירוק לחלקים — יכול להגיע מהעלאה ידנית או ממקור עתידי (קטלוג) */
  imageUrl: string;
  /** מספר החלקים: 6 (קל) | 9 (בינוני) | 12 (קשה) */
  pieceCount: 6 | 9 | 12;
  /** הוראה לשחקנים */
  instruction?: string;
  /** תמיד 'solved' — הפאזל מאמת את עצמו */
  solution: string;
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type ChallengeData =
  | CipherChallengeData
  | PatternChallengeData
  | OddOneOutChallengeData
  | TriviaChallengeData
  | PuzzleChallengeData
  | ImagePuzzleChallengeData;

// ─── Future Templates (stubs — יתווספו עם ממשק Builder) ──────────────────────

/**
 * Spatial / Navigation — שחקנים עוקבים אחר הוראות מרחביות (כיוונים, מפה)
 * thinking_type: spatial
 */
// export interface SpatialChallengeData extends ChallengeBase { type: 'spatial'; ... }

/**
 * Transformation — שחקנים מיישמים שיקוף/סיבוב ויזואלי
 * thinking_type: transformation
 */
// export interface TransformationChallengeData extends ChallengeBase { type: 'transformation'; ... }

/**
 * Filtering — שחקנים מסננים קבוצת פריטים לפי כלל ומסדרים אותם
 * thinking_type: filtering
 */
// export interface FilteringChallengeData extends ChallengeBase { type: 'filtering'; ... }

/**
 * Photo — שחקנים מצלמים אובייקט ספציפי (דורש camera API)
 * thinking_type: visual_observation
 */
// export interface PhotoChallengeData extends ChallengeBase { type: 'photo'; ... }
