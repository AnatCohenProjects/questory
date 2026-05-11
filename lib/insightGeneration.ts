import { NormalizedPuzzleContext } from './normalization';

// ─── Insight Types ────────────────────────────────────────────────────────

export interface CountingInsight {
  type: 'counting';
  question: string;           // e.g., "כמה דלתות יש בבית?"
  thinking_type: 'analysis';
  expected_answer: string;    // e.g., "3"
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
}

export interface PatternInsight {
  type: 'pattern';
  question: string;           // e.g., "מה הדפוס בכתובות?"
  series: string[];          // e.g., ["א", "ב", "ג", "_", "ה"]
  expected_answer: string;    // e.g., "ד"
  thinking_type: 'deduction';
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
}

export interface OddnessInsight {
  type: 'oddness';
  question: string;           // e.g., "מי לא שייך?"
  items: string[];           // e.g., ["כלי", "אדריכלות", "טבע", "זכוכית"]
  expected_answer: string;    // e.g., "זכוכית"
  thinking_type: 'classification';
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
}

export interface FactInsight {
  type: 'fact';
  question: string;           // e.g., "מאיזו תקופה החפץ הזה?"
  options: string[];         // e.g., ["קדום", "מודרני", "עתיק"]
  expected_answer: string;
  thinking_type: 'knowledge';
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
}

export interface LogicInsight {
  type: 'logic';
  question: string;           // e.g., "מה הסדר של הסמלים?"
  reasoning: string;         // explanation for solver
  expected_answer: string;
  thinking_type: 'deduction';
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
}

export type PuzzleInsight = CountingInsight | PatternInsight | OddnessInsight | FactInsight | LogicInsight;

// ─── Insight Generation ────────────────────────────────────────────────────

export function generateCountingInsight(context: NormalizedPuzzleContext): CountingInsight {
  const objectName = context.object_name.toLowerCase();
  const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any;

  const questions = [
    `כמה אלמנטים מהסוג "${context.category}" יש?`,
    `כמה "${objectName}" יש בנראות?`,
    `כמה צבעים שונים יש ב"${objectName}"?`,
  ];

  return {
    type: 'counting',
    question: questions[Math.floor(Math.random() * questions.length)],
    thinking_type: 'analysis',
    expected_answer: '3',
    difficulty,
    hint: 'ענו על השאלה על פי מה שאתם רואים בשטח',
  };
}

export function generatePatternInsight(context: NormalizedPuzzleContext): PatternInsight {
  const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any;

  // Simple sequence patterns based on attributes
  const patterns = [
    { series: ['א', 'ב', 'ג', '_', 'ה'], answer: 'ד', hint: 'חשבו על הסדר האלפאביתי' },
    { series: ['1', '2', '4', '_', '16'], answer: '8', hint: 'כל מספר כפול מהקודם' },
    { series: ['קטן', 'בינוני', 'גדול', '_'], answer: 'ענק', hint: 'סדר גודל עולה' },
  ];

  const selected = patterns[Math.floor(Math.random() * patterns.length)];

  return {
    type: 'pattern',
    question: `מה המילה החסרה בסדרה הזו?`,
    series: selected.series,
    expected_answer: selected.answer,
    thinking_type: 'deduction',
    difficulty,
    hint: selected.hint,
  };
}

export function generateOddnessInsight(context: NormalizedPuzzleContext): OddnessInsight {
  const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any;

  // Generate based on category
  const categoryItems: Record<string, Array<[string[], string]>> = {
    architecture: [
      [['דלת', 'חלון', 'קיר', 'עץ'], 'עץ'],
      [['אבן', 'בטון', 'נחושת', 'צבע'], 'צבע'],
    ],
    artifact: [
      [['פסל', 'ציור', 'פרט', 'קול'], 'קול'],
      [['יצירה', 'עדות', 'אומנות', 'זמן'], 'זמן'],
    ],
    nature: [
      [['צמח', 'עץ', 'מזל', 'פרח'], 'מזל'],
      [['הרים', 'מי', 'ימה', 'דרך'], 'דרך'],
    ],
    signage: [
      [['שלט', 'כיתוב', 'לוט', 'קול'], 'קול'],
      [['הכתוב', 'כתוב', 'תווית', 'חומר'], 'חומר'],
    ],
    person: [
      [['דמות', 'אדם', 'דיוקן', 'אבנית'], 'אבנית'],
    ],
  };

  const itemList = categoryItems[context.category]?.[0] || [['אחד', 'שניים', 'שלושה', 'ארבע'], 'ארבע'];
  const [items, oddOne] = itemList;

  return {
    type: 'oddness',
    question: 'מי לא שייך לקבוצה הזו?',
    items,
    expected_answer: oddOne,
    thinking_type: 'classification',
    difficulty,
    hint: 'חשבו איזה פריט שונה מהאחרים',
  };
}

export function generateFactInsight(context: NormalizedPuzzleContext): FactInsight {
  const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any;

  const factQuestions: Record<string, { q: string; opts: string[]; ans: string; hint: string }> = {
    architecture: {
      q: 'מאיזו תקופה האדריכלות הזו?',
      opts: ['קדומה', 'מודרנית', 'עתיקה'],
      ans: 'מודרנית',
      hint: 'בדקו את החומרים והעיצוב',
    },
    artifact: {
      q: 'מה סוג היצירה הזו?',
      opts: ['אומנות', 'כלי', 'עדות'],
      ans: 'אומנות',
      hint: 'שימו לב לעיצוב וההוא',
    },
    nature: {
      q: 'מה סוג הטבע הזה?',
      opts: ['צמח', 'בעלי חיים', 'מינרל'],
      ans: 'צמח',
      hint: 'תראו אם יש גדילה',
    },
  };

  const fact = factQuestions[context.category] || {
    q: 'מה המאפיין הבולט ביותר?',
    opts: ['קטן', 'בינוני', 'גדול'],
    ans: 'בינוני',
    hint: 'השוו לאובייקטים אחרים',
  };

  return {
    type: 'fact',
    question: fact.q,
    options: fact.opts,
    expected_answer: fact.ans,
    thinking_type: 'knowledge',
    difficulty,
    hint: fact.hint,
  };
}

export function generateLogicInsight(context: NormalizedPuzzleContext): LogicInsight {
  const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any;

  return {
    type: 'logic',
    question: 'מה הלוגיקה מאחורי סדר האלמנטים?',
    reasoning: `על פי המאפיינים של "${context.object_name}" (${context.visible_attributes.slice(0, 2).join(', ')})`,
    expected_answer: 'סדר כרונולוגי / תבנית חזותית',
    thinking_type: 'deduction',
    difficulty,
    hint: 'חיפשו קשר בין האלמנטים',
  };
}

// ─── Main Generation ──────────────────────────────────────────────────────

export function generatePuzzleInsights(context: NormalizedPuzzleContext): PuzzleInsight[] {
  const insights: PuzzleInsight[] = [];

  // Always generate these
  insights.push(generateCountingInsight(context));
  insights.push(generatePatternInsight(context));
  insights.push(generateOddnessInsight(context));
  insights.push(generateFactInsight(context));
  insights.push(generateLogicInsight(context));

  return insights;
}
