import {
  CountingInsight,
  PatternInsight,
  OddnessInsight,
  FactInsight,
  LogicInsight,
  PuzzleInsight,
} from './insightGeneration';
import {
  ChallengeData,
  TriviaChallengeData,
  PatternChallengeData,
  OddOneOutChallengeData,
  CipherChallengeData,
} from '@/types/challenge';

// ─── Converters ───────────────────────────────────────────────────────────

/**
 * ספירה → Trivia
 * "כמה דלתות יש?" → בחירה מרובה עם 4 אפשרויות
 */
export function convertCountingToPuzzle(insight: CountingInsight): TriviaChallengeData {
  const correctCount = parseInt(insight.expected_answer);
  const variations = [
    correctCount,
    correctCount + 1,
    correctCount - 1,
    correctCount + 2,
  ].filter(n => n > 0);

  // Shuffle options
  const options = variations
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .map((num, idx) => ({
      id: `count-${idx}`,
      text: String(num),
      isCorrect: num === correctCount,
    }));

  return {
    type: 'trivia',
    question: insight.question,
    options,
    solution: String(correctCount),
  };
}

/**
 * דפוס → Pattern
 * "1,1,2,3,5,_,13" → PatternChallengeData
 */
export function convertPatternToPuzzle(insight: PatternInsight): PatternChallengeData {
  // Convert series: replace "_" with null for blanks
  const items = insight.series.map(item => (item === '_' ? null : item));
  const blankCount = insight.series.filter(item => item === '_').length;

  return {
    type: 'pattern',
    items,
    blankCount,
    patternHint: insight.hint,
    solution: insight.expected_answer,
  };
}

/**
 * חריג → OddOneOut
 * ["דלת", "חלון", "קיר", "עץ"] + "עץ" → OddOneOutChallengeData
 */
export function convertOddnessToPuzzle(insight: OddnessInsight): OddOneOutChallengeData {
  const correctItem = insight.expected_answer;
  const items = insight.items.map((item, idx) => ({
    id: `odd-${idx}`,
    label: item,
    isOdd: item === correctItem,
    digitContribution: item === correctItem ? '1' : undefined,
  }));

  const oddCount = items.filter(i => i.isOdd).length;

  return {
    type: 'oddoneout',
    items,
    oddCount,
    groupLabel: 'בחרו את הפריט שלא שייך',
    solution: correctItem,
  };
}

/**
 * ידע → Trivia
 * ["קדום", "מודרני", "עתיק"] + "מודרני" → TriviaChallengeData
 */
export function convertFactToPuzzle(insight: FactInsight): TriviaChallengeData {
  const correctOption = insight.expected_answer;
  const options = insight.options.map((opt, idx) => ({
    id: `fact-${idx}`,
    text: opt,
    isCorrect: opt === correctOption,
  }));

  return {
    type: 'trivia',
    question: insight.question,
    options,
    solution: correctOption,
  };
}

/**
 * לוגיקה → Cipher או Pattern
 * ממיר logic ל-simple cipher עם סמלים קלים
 */
export function convertLogicToPuzzle(insight: LogicInsight): CipherChallengeData {
  // דוגמה: לוגיקה של סדר → צופן עם 3 סמלים
  const symbols = ['★', '●', '▲'];
  const digits = ['1', '2', '3'];

  const key = symbols.map((sym, idx) => ({
    symbol: sym,
    digit: digits[idx],
  }));

  const encodedMessage = ['★', '●', '▲'];

  return {
    type: 'cipher',
    key,
    encodedMessage,
    solution: digits.join(''),
  };
}

// ─── Main Converter ───────────────────────────────────────────────────────

/**
 * קחו Insight ותחזרו ChallengeData
 */
export function insightToPuzzle(insight: PuzzleInsight): ChallengeData {
  switch (insight.type) {
    case 'counting':
      return convertCountingToPuzzle(insight);
    case 'pattern':
      return convertPatternToPuzzle(insight);
    case 'oddness':
      return convertOddnessToPuzzle(insight);
    case 'fact':
      return convertFactToPuzzle(insight);
    case 'logic':
      return convertLogicToPuzzle(insight);
    default:
      throw new Error(`Unknown insight type: ${(insight as any).type}`);
  }
}

/**
 * HashMap: Insight → ChallengeData
 * דוגמה: התמרת עד 5 insights לעד 5 challenges
 */
export function insightsToChallengeCandidates(
  insights: PuzzleInsight[]
): Array<{ insight: PuzzleInsight; challenge: ChallengeData }> {
  return insights.map(insight => ({
    insight,
    challenge: insightToPuzzle(insight),
  }));
}
