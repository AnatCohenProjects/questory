import { LogicalHook, DetectedHook } from './hookDetection';
import { NormalizedPuzzleContext } from './normalization';

// ─── Template Recommendation ───────────────────────────────────────────────

export interface TemplateRecommendation {
  challengeType: 'cipher' | 'pattern' | 'oddoneout' | 'trivia';
  reasoning: string;
  suitability: number;  // 0-1: how well this template fits
}

export interface FullRecommendation {
  primary: TemplateRecommendation;
  alternatives: TemplateRecommendation[];
}

// ─── Template Matcher ───────────────────────────────────────────────────────

export function matchTemplateToHook(
  hook: DetectedHook,
  context: NormalizedPuzzleContext
): FullRecommendation {
  switch (hook.type) {
    case 'counting':
      return matchCounting(context, hook.confidence);

    case 'pattern':
      return matchPattern(context, hook.confidence);

    case 'oddness':
      return matchOddness(context, hook.confidence);

    case 'sequence':
      return matchSequence(context, hook.confidence);

    case 'letters':
      return matchLetters(context, hook.confidence);

    case 'correlation':
      return matchCorrelation(context, hook.confidence);

    case 'classification':
      return matchClassification(context, hook.confidence);

    default:
      return defaultRecommendation();
  }
}

// ─── Matching Functions ───────────────────────────────────────────────────

function matchCounting(context: NormalizedPuzzleContext, confidence: number): FullRecommendation {
  return {
    primary: {
      challengeType: 'trivia',
      reasoning:
        `המערכת התגלתה קבוצה של פריטים לספירה. ` +
        `Trivia מתאיימה: "כמה ${context.object_name}?"`,
      suitability: Math.min(confidence * 1.0, 0.95),
    },
    alternatives: [
      {
        challengeType: 'oddoneout',
        reasoning: '4-5 פריטים יכולים להיות טריוויה עם גמול ספציפי או בחירה "המוזר ביותר"',
        suitability: confidence * 0.6,
      },
    ],
  };
}

function matchPattern(context: NormalizedPuzzleContext, confidence: number): FullRecommendation {
  return {
    primary: {
      challengeType: 'pattern',
      reasoning:
        `הנתונים מציעים דפוס או סדרה. ` +
        `Pattern Challenge הוא המתאים ביותר להשלמת סדרה או ניחוש הקובץ הבא.`,
      suitability: Math.min(confidence * 1.0, 0.95),
    },
    alternatives: [
      {
        challengeType: 'trivia',
        reasoning: 'שאלה בחירה מרובה: "מה הדפוס?" עם אפשרויות מוצעות',
        suitability: confidence * 0.7,
      },
      {
        challengeType: 'cipher',
        reasoning: 'אם הדפוס הוא קוד או מיפוי סמלים',
        suitability: confidence * 0.5,
      },
    ],
  };
}

function matchOddness(context: NormalizedPuzzleContext, confidence: number): FullRecommendation {
  return {
    primary: {
      challengeType: 'oddoneout',
      reasoning:
        `הנתונים מעידים על קבוצה שבה פריט אחד חריג. ` +
        `זה המקרה המושלם ל-Odd One Out Challenge.`,
      suitability: Math.min(confidence * 1.0, 0.95),
    },
    alternatives: [
      {
        challengeType: 'trivia',
        reasoning: 'שאלה קטגוריה צרה: "איזה פריט לא שייך?"',
        suitability: confidence * 0.65,
      },
    ],
  };
}

function matchSequence(context: NormalizedPuzzleContext, confidence: number): FullRecommendation {
  return {
    primary: {
      challengeType: 'pattern',
      reasoning:
        `יש סדר כרונולוגי או הגיוני בנתונים. ` +
        `Pattern Challenge מגיע בהשלמת סדרה התאימה.`,
      suitability: Math.min(confidence * 0.9, 0.9),
    },
    alternatives: [
      {
        challengeType: 'trivia',
        reasoning:
          `שאלת ידע סדודה: "מה בא אחרי?" או "מה קרה קודם?"`,
        suitability: confidence * 0.7,
      },
    ],
  };
}

function matchLetters(context: NormalizedPuzzleContext, confidence: number): FullRecommendation {
  return {
    primary: {
      challengeType: 'cipher',
      reasoning:
        `הנתונים מציעים מיפוי של סמלים להנגדים או חוקים מקודדים. ` +
        `Cipher Challenge מתאים במיוחד.`,
      suitability: Math.min(confidence * 1.1, 0.95),
    },
    alternatives: [
      {
        challengeType: 'pattern',
        reasoning: 'אם האותיות עוקבות סדר חוקי (ABC...)',
        suitability: confidence * 0.6,
      },
      {
        challengeType: 'trivia',
        reasoning: 'סוג של חידקודה או אנגרמה',
        suitability: confidence * 0.5,
      },
    ],
  };
}

function matchCorrelation(context: NormalizedPuzzleContext, confidence: number): FullRecommendation {
  return {
    primary: {
      challengeType: 'pattern',
      reasoning:
        `יש קשר בין שני משתנים או תכונות. ` +
        `Pattern או Trivia יכולים לעגל: "אם גודל = X, אז צבע = ?"`,
      suitability: confidence * 0.8,
    },
    alternatives: [
      {
        challengeType: 'trivia',
        reasoning: 'שאלת בחירה מרובה על הקשר',
        suitability: confidence * 0.7,
      },
      {
        challengeType: 'oddoneout',
        reasoning: 'בחירה של פריט שמפר את הקשר',
        suitability: confidence * 0.6,
      },
    ],
  };
}

function matchClassification(context: NormalizedPuzzleContext, confidence: number): FullRecommendation {
  return {
    primary: {
      challengeType: 'oddoneout',
      reasoning:
        `הנתונים דורשים סיווג או בדיקת שייכות. ` +
        `Odd One Out הוא הבחירה הטבעית.`,
      suitability: Math.min(confidence * 1.0, 0.9),
    },
    alternatives: [
      {
        challengeType: 'trivia',
        reasoning: 'שאלת קטגוריה: "לאיזה קבוצה זהו שייך?"',
        suitability: confidence * 0.75,
      },
    ],
  };
}

function defaultRecommendation(): FullRecommendation {
  return {
    primary: {
      challengeType: 'trivia',
      reasoning: 'כאשר אין hook ברור, Trivia הוא בחירה בטוחה.',
      suitability: 0.5,
    },
    alternatives: [
      {
        challengeType: 'oddoneout',
        reasoning: 'בחירה שניה בטוחה',
        suitability: 0.45,
      },
    ],
  };
}

// ─── One-Shot: Hook → Template ────────────────────────────────────────────

export function hookToTemplate(
  hook: LogicalHook,
  context: NormalizedPuzzleContext
): TemplateRecommendation {
  // Map directly for speed
  const hookMap: Record<LogicalHook, 'cipher' | 'pattern' | 'oddoneout' | 'trivia'> = {
    counting: 'trivia',
    pattern: 'pattern',
    oddness: 'oddoneout',
    sequence: 'pattern',
    letters: 'cipher',
    correlation: 'pattern',
    classification: 'oddoneout',
  };

  return {
    challengeType: hookMap[hook],
    reasoning: `Hook "${hook}" ממפה בטבעיות ל-${hookMap[hook]}`,
    suitability: 0.75,
  };
}
