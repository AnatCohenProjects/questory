/**
 * Blueprint: סדר המשחק
 *
 * כל Blueprint Station מייצג תחנה ONE בתוך המשחק.
 * סוגה, מטרתה, איזו חידה מתאימה.
 */

export type StationType =
  | 'story'        // נרטיב טהור, אפילו בלי חידה
  | 'location'     // תצפית / ספירה / מציאת קשרים בשטח
  | 'logic'        // חידת היגיון (pattern, oddness, cipher)
  | 'code'         // פענוח קוד (cipher, trivia with code)
  | 'mission'      // משימה פיזית (תמונה, חפץ)
  | 'dialogue'     // שיחה עם NPC / AI
  | 'success';     // סוף / חגיגה

export interface BlueprintStation {
  index: number;                    // 1, 2, 3...
  type: StationType;
  title: string;                    // "דלת העתיקה"
  description: string;              // "בתחנה זו..."
  suggestedChallengeType?: string;  // 'trivia' | 'pattern' | 'oddoneout' | 'cipher'
  reasoning: string;                // "בחרנו את זה כי..."
  duration_estimate_seconds: number; // ~60
}

export interface Blueprint {
  gameId: string;
  stations: BlueprintStation[];
  reasoning: string;                // כל ה-Blueprint
}

// ─── Rules for Blueprint Generation ────────────────────────────────────────

interface BlueprintRules {
  // Duration-based
  duration_minutes: number;
  stations_count: (duration: number) => number;

  // Audience-based
  audience: string;
  has_narrative_depth: boolean;
  has_physical_challenge: boolean;
  has_dialogue: boolean;

  // Experience-based
  experienceStyle: 'story' | 'competitive' | 'learning';
  progression: 'linear' | 'open' | 'race';

  // Difficulty-based
  difficulty: 'easy' | 'medium' | 'hard';
  challenge_density: number;  // 0-1, how many stations have challenges

  // Pattern
  pattern: 'classic' | 'exploration' | 'race' | 'educational';
}

// ─── Generate Blueprint ────────────────────────────────────────────────────

export function generateBlueprint(
  duration_minutes: number,
  audience: string,
  experienceStyle: 'story' | 'competitive' | 'learning',
  difficulty: 'easy' | 'medium' | 'hard',
  progression: 'linear' | 'open' | 'race',
  story: string,
): Blueprint {
  const rules = getBlueprintRules(duration_minutes, audience, experienceStyle, difficulty, progression);

  const stationCount = calculateStationCount(duration_minutes, audience);
  const pattern = selectPattern(experienceStyle, audience);

  const stations: BlueprintStation[] = [];

  for (let i = 0; i < stationCount; i++) {
    const station = generateBlueprintStation(
      i,
      stationCount,
      pattern,
      difficulty,
      experienceStyle,
      story,
    );
    stations.push(station);
  }

  return {
    gameId: 'blueprint-temp',
    stations,
    reasoning: generateBlueprintReasoning(stationCount, pattern, difficulty),
  };
}

// ─── Helper: Calculate Station Count ───────────────────────────────────────

function calculateStationCount(duration: number, audience: string): number {
  // משפחות בילדים: יותר תחנות קצרות
  // מבוגרים: פחות תחנות עmiقעות יותר
  // ילדים בודדים: תחנות מעטות ללא דיאלוג

  if (audience.includes('ילדים')) {
    return Math.min(Math.ceil(duration / 8), 5);  // 30 min = 3-4 stations
  }

  if (audience.includes('משפחות')) {
    return Math.min(Math.ceil(duration / 12), 6);  // 60 min = 4-5 stations
  }

  // מבוגרים או בני נוער
  return Math.min(Math.ceil(duration / 15), 7);  // 60 min = 3-4 stations, deeper
}

// ─── Helper: Select Pattern ───────────────────────────────────────────────

function selectPattern(experienceStyle: string, audience: string): StationType[] {
  if (experienceStyle === 'story') {
    return ['story', 'location', 'logic', 'location', 'code', 'dialogue', 'success'];
  }

  if (experienceStyle === 'competitive') {
    return ['story', 'code', 'logic', 'code', 'mission', 'success'];
  }

  // learning
  return ['story', 'location', 'dialogue', 'logic', 'location', 'code', 'success'];
}

// ─── Helper: Generate Single Blueprint Station ─────────────────────────────

function generateBlueprintStation(
  index: number,
  totalStations: number,
  pattern: StationType[],
  difficulty: string,
  experienceStyle: string,
  overallStory: string,
): BlueprintStation {
  const type = pattern[Math.min(index, pattern.length - 1)];

  let title: string;
  let description: string;
  let suggestedChallengeType: string | undefined;
  let reasoning: string;

  switch (type) {
    case 'story':
      title = index === 0 ? 'התחלה' : `פרק ${index}`;
      description = 'נרטיב וhooks לתחנה הבאה';
      reasoning = 'הלקוח מזין סיפור, למשוך שחקנים למיקום הבא';
      break;

    case 'location':
      title = `תצפית ${index}`;
      description = 'שחקנים מתצפים בסביבה ודולים קשרים';
      suggestedChallengeType = difficulty === 'easy' ? 'trivia' : 'oddoneout';
      reasoning = 'זיהוי דפוסים בעולם הפיזי';
      break;

    case 'logic':
      title = `חידה ${index}`;
      description = 'פאזל היגיון או קוד סיסמה';
      suggestedChallengeType = difficulty === 'hard' ? 'cipher' : 'pattern';
      reasoning = 'אתגר קוגניטיבי/לוגיקה';
      break;

    case 'code':
      title = `קוד ${index}`;
      description = 'פענוח קוד או הזנת תשובה';
      suggestedChallengeType = 'cipher';
      reasoning = 'מהווה קוד הימנעות גלוי';
      break;

    case 'mission':
      title = `משימה ${index}`;
      description = 'משימה פיזית (צילום, חפץ וכו)';
      reasoning = 'מחייבת אינטראקציה עם הסביבה';
      break;

    case 'dialogue':
      title = `שיחה ${index}`;
      description = 'דיאלוג עם בוט או דמות';
      reasoning = 'יצירת חוויה אישית / רמזים';
      break;

    case 'success':
      title = 'סוף!';
      description = 'חגיגה וסיכום';
      reasoning = 'סיום משחק';
      break;

    default:
      title = `תחנה ${index}`;
      description = '';
      reasoning = '';
  }

  return {
    index,
    type,
    title,
    description,
    suggestedChallengeType,
    reasoning,
    duration_estimate_seconds: 60 + (difficulty === 'hard' ? 60 : 0),
  };
}

// ─── Helper: Blueprint Reasoning ───────────────────────────────────────────

function generateBlueprintReasoning(count: number, pattern: StationType[], difficulty: string): string {
  const patternStr = pattern.slice(0, count).join(' → ');
  return `Blueprint בנוי עם ${count} תחנות בדוגמה: ${patternStr}. קושי: ${difficulty}`;
}

// ─── Helper: Get Blueprint Rules ───────────────────────────────────────────

function getBlueprintRules(
  duration: number,
  audience: string,
  experienceStyle: string,
  difficulty: string,
  progression: string,
): BlueprintRules {
  return {
    duration_minutes: duration,
    stations_count: (d) => Math.ceil(d / 15),
    audience,
    has_narrative_depth: experienceStyle === 'story',
    has_physical_challenge: !audience.includes('מבוגרים בלבד'),
    has_dialogue: experienceStyle !== 'competitive',
    experienceStyle: experienceStyle as any,
    progression: progression as any,
    difficulty: difficulty as any,
    challenge_density: difficulty === 'easy' ? 0.5 : difficulty === 'medium' ? 0.7 : 0.9,
    pattern: selectPatternName(experienceStyle, audience),
  };
}

function selectPatternName(exp: string, aud: string): 'classic' | 'exploration' | 'race' | 'educational' {
  if (exp === 'competitive') return 'race';
  if (exp === 'learning') return 'educational';
  if (aud.includes('משפחות')) return 'classic';
  return 'exploration';
}
