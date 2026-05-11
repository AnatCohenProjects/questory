import { ChallengeData } from '@/types/challenge';
import { NormalizedPuzzleContext } from './normalization';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Category =
  | 'architecture'
  | 'artifact'
  | 'nature'
  | 'signage'
  | 'person'
  | 'ritual'
  | 'other';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type TemplateType = 'trivia' | 'pattern' | 'oddoneout' | 'cipher';

// ─── Base Template ────────────────────────────────────────────────────────────

export interface ChallengeTemplate {
  id: string;
  category: Category;
  challengeType: TemplateType;
  difficulty: Difficulty;
  tags?: string[];  // מילות מפתח שמגבירות את הסיכוי לבחירת התבנית הזו
  build: (ctx: NormalizedPuzzleContext) => ChallengeData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function triviaOptions(correct: string, distractors: string[]) {
  const all = shuffle([correct, ...distractors.slice(0, 3)]);
  return all.map((text, i) => ({ id: `opt-${i}`, text, isCorrect: text === correct }));
}

// ─── Templates: architecture ──────────────────────────────────────────────────

const architectureTemplates: ChallengeTemplate[] = [

  // ── Trivia / Easy ──────────────────────────────────────────────────────────

  {
    id: 'arch-trivia-easy-01',
    category: 'architecture',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['חלון', 'דלת', 'עמוד'],
    build: (ctx) => {
      const element = pick(['חלונות', 'דלתות', 'עמודים', 'קשתות']);
      const correct = pick(['2', '3', '4']);
      return {
        type: 'trivia',
        question: `כמה ${element} יש ב${ctx.object_name}?`,
        options: triviaOptions(correct, ['1', '5', '6', '7'].filter(n => n !== correct)),
        solution: correct,
      };
    },
  },

  {
    id: 'arch-trivia-easy-02',
    category: 'architecture',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['חומר', 'בנייה'],
    build: (ctx) => {
      const correct = pick(['אבן', 'בטון', 'עץ', 'לבנים']);
      return {
        type: 'trivia',
        question: `מאיזה חומר עשוי ${ctx.object_name}?`,
        options: triviaOptions(correct, ['פלדה', 'זכוכית', 'חימר', 'שיש'].filter(m => m !== correct)),
        solution: correct,
      };
    },
  },

  {
    id: 'arch-trivia-easy-03',
    category: 'architecture',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['צבע', 'גוון'],
    build: (ctx) => {
      const correct = ctx.visible_attributes.find(a => /צבע|שחור|לבן|אדום|כחול|ירוק|חום|אפור/.test(a)) || 'אפור';
      return {
        type: 'trivia',
        question: `מה הצבע הדומיננטי של ${ctx.object_name}?`,
        options: triviaOptions(correct, ['שחור', 'לבן', 'אדום', 'כחול', 'חום'].filter(c => c !== correct)),
        solution: correct,
      };
    },
  },

  // ── Trivia / Medium ────────────────────────────────────────────────────────

  {
    id: 'arch-trivia-med-01',
    category: 'architecture',
    challengeType: 'trivia',
    difficulty: 'medium',
    tags: ['תקופה', 'סגנון', 'היסטוריה'],
    build: (ctx) => {
      const era = ctx.temporal_context || 'המאה ה-20';
      return {
        type: 'trivia',
        question: `לאיזו תקופה אדריכלית שייך ${ctx.object_name}?`,
        options: triviaOptions(era, ['המאה ה-19', 'תקופת המנדט', 'שנות ה-70', 'העת העתיקה'].filter(e => e !== era)),
        solution: era,
      };
    },
  },

  {
    id: 'arch-trivia-med-02',
    category: 'architecture',
    challengeType: 'trivia',
    difficulty: 'medium',
    tags: ['שימוש', 'פונקציה', 'מטרה'],
    build: (ctx) => {
      const use = pick(['מגורים', 'מסחר', 'תרבות', 'דת', 'ממשל']);
      return {
        type: 'trivia',
        question: `מה היה השימוש המקורי של ${ctx.object_name}?`,
        options: triviaOptions(use, ['מגורים', 'מסחר', 'תרבות', 'דת', 'ממשל'].filter(u => u !== use)),
        solution: use,
      };
    },
  },

  // ── Trivia / Hard ──────────────────────────────────────────────────────────

  {
    id: 'arch-trivia-hard-01',
    category: 'architecture',
    challengeType: 'trivia',
    difficulty: 'hard',
    tags: ['אדריכל', 'מתכנן', 'בנאי'],
    build: (ctx) => {
      const keyword = ctx.keywords[0] || ctx.object_name;
      return {
        type: 'trivia',
        question: `מה המאפיין האדריכלי הייחודי ב${ctx.object_name} שמבדיל אותו מבניינים אחרים בסביבה?`,
        options: triviaOptions(
          keyword,
          ['הגובה החריג', 'החצר הפנימית', 'הקמרונות', 'הדקורציה הייחודית'].filter(k => k !== keyword)
        ),
        solution: keyword,
      };
    },
  },

  // ── OddOneOut / Easy ───────────────────────────────────────────────────────

  {
    id: 'arch-odd-easy-01',
    category: 'architecture',
    challengeType: 'oddoneout',
    difficulty: 'easy',
    tags: ['חומרים', 'בנייה'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['אבן', 'בטון', 'לבנים', 'זכוכית'], 'זכוכית'],
        [['דלת', 'חלון', 'קיר', 'ענן'], 'ענן'],
        [['גג', 'מדרגות', 'מעקה', 'ציפור'], 'ציפור'],
        [['עמוד', 'קשת', 'כיפה', 'אוטובוס'], 'אוטובוס'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'מי לא שייך לבניין?',
        solution: odd,
      };
    },
  },

  {
    id: 'arch-odd-easy-02',
    category: 'architecture',
    challengeType: 'oddoneout',
    difficulty: 'easy',
    tags: ['חלקים', 'מרכיבים'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['רצפה', 'תקרה', 'קיר', 'שמיים'], 'שמיים'],
        [['חלון', 'מסגרת', 'זגוגית', 'נהר'], 'נהר'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'מה לא שייך?',
        solution: odd,
      };
    },
  },

  // ── OddOneOut / Medium ─────────────────────────────────────────────────────

  {
    id: 'arch-odd-med-01',
    category: 'architecture',
    challengeType: 'oddoneout',
    difficulty: 'medium',
    tags: ['סגנון', 'תקופה'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['באוהאוס', 'אקלקטי', 'עות\'מאני', 'ניאון'], 'ניאון'],
        [['גותי', 'רומנסקי', 'ברוק', 'פייסבוק'], 'פייסבוק'],
        [['מודרניזם', 'קלאסיציזם', 'אר-נובו', 'ג\'ינס'], 'ג\'ינס'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'איזה סגנון אדריכלי לא קיים?',
        solution: odd,
      };
    },
  },

  // ── OddOneOut / Hard ───────────────────────────────────────────────────────

  {
    id: 'arch-odd-hard-01',
    category: 'architecture',
    challengeType: 'oddoneout',
    difficulty: 'hard',
    tags: ['פרטים', 'דקורציה'],
    build: (ctx) => {
      const odd = pick(['מרפסת', 'לוגייה', 'ארקדה', 'פיר']);
      const others = ['פילסטר', 'קורניז', 'פרונטון', 'פריז'].filter(i => i !== odd);
      const items = shuffle([odd, ...others.slice(0, 3)]);
      return {
        type: 'oddoneout',
        items: items.map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: `איזה אלמנט לא שייך לסגנון ${ctx.object_name}?`,
        solution: odd,
      };
    },
  },

  // ── Pattern / Easy ─────────────────────────────────────────────────────────

  {
    id: 'arch-pattern-easy-01',
    category: 'architecture',
    challengeType: 'pattern',
    difficulty: 'easy',
    tags: ['חזרה', 'דפוס', 'קצב'],
    build: () => {
      const series = pick([
        { items: ['1', '2', '3', null, '5'], solution: '4', hint: 'ספרו בסדר עולה' },
        { items: ['2', '4', '6', null, '10'], solution: '8', hint: 'כל מספר גדל ב-2' },
        { items: ['א', 'ב', 'ג', null, 'ה'], solution: 'ד', hint: 'האלפבית העברי' },
      ]);
      return {
        type: 'pattern',
        items: series.items,
        blankCount: 1,
        patternHint: series.hint,
        solution: series.solution,
      };
    },
  },

  {
    id: 'arch-pattern-easy-02',
    category: 'architecture',
    challengeType: 'pattern',
    difficulty: 'easy',
    tags: ['גודל', 'מידה'],
    build: () => ({
      type: 'pattern',
      items: ['קטן', 'בינוני', null, 'ענק'],
      blankCount: 1,
      patternHint: 'הגדלים מסודרים מהקטן לגדול',
      solution: 'גדול',
    }),
  },

  // ── Pattern / Medium ───────────────────────────────────────────────────────

  {
    id: 'arch-pattern-med-01',
    category: 'architecture',
    challengeType: 'pattern',
    difficulty: 'medium',
    tags: ['כפל', 'חזקות'],
    build: () => {
      const series = pick([
        { items: ['1', '2', '4', null, '16'], solution: '8', hint: 'כל מספר כפול מהקודם' },
        { items: ['3', '6', '12', null, '48'], solution: '24', hint: 'כפילות' },
        { items: ['1', '1', '2', '3', null, '8'], solution: '5', hint: 'סכום שני הקודמים (פיבונאצ\'י)' },
      ]);
      return {
        type: 'pattern',
        items: series.items,
        blankCount: 1,
        patternHint: series.hint,
        solution: series.solution,
      };
    },
  },

  {
    id: 'arch-pattern-med-02',
    category: 'architecture',
    challengeType: 'pattern',
    difficulty: 'medium',
    tags: ['מספרים', 'קצב'],
    build: (ctx) => {
      const keyword = ctx.keywords[0]?.length.toString() || '4';
      return {
        type: 'pattern',
        items: ['2', '4', null, '8', '10'],
        blankCount: 1,
        patternHint: `חשבו על מספר האותיות ב${ctx.object_name}`,
        solution: keyword,
      };
    },
  },

  // ── Pattern / Hard ─────────────────────────────────────────────────────────

  {
    id: 'arch-pattern-hard-01',
    category: 'architecture',
    challengeType: 'pattern',
    difficulty: 'hard',
    tags: ['ריבוע', 'חזקות'],
    build: () => {
      const series = pick([
        { items: ['1', '4', '9', null, '25'], solution: '16', hint: 'ריבועים של מספרים טבעיים' },
        { items: ['1', '3', '6', '10', null], solution: '15', hint: 'מספרים משולשים' },
      ]);
      return {
        type: 'pattern',
        items: series.items,
        blankCount: 1,
        patternHint: series.hint,
        solution: series.solution,
      };
    },
  },

  // ── Cipher / Easy ──────────────────────────────────────────────────────────

  {
    id: 'arch-cipher-easy-01',
    category: 'architecture',
    challengeType: 'cipher',
    difficulty: 'easy',
    tags: ['סמלים', 'צופן'],
    build: () => {
      const keys = pick([
        { key: [{ symbol: '★', digit: '1' }, { symbol: '●', digit: '2' }, { symbol: '▲', digit: '3' }], msg: ['★', '●', '▲'], sol: '123' },
        { key: [{ symbol: '♦', digit: '4' }, { symbol: '■', digit: '5' }, { symbol: '☆', digit: '6' }], msg: ['♦', '■', '☆'], sol: '456' },
      ]);
      return { type: 'cipher', key: keys.key, encodedMessage: keys.msg, solution: keys.sol };
    },
  },

  // ── Cipher / Medium ────────────────────────────────────────────────────────

  {
    id: 'arch-cipher-med-01',
    category: 'architecture',
    challengeType: 'cipher',
    difficulty: 'medium',
    tags: ['סמלים', 'צופן', 'ארכיטקטורה'],
    build: () => {
      const keys = pick([
        {
          key: [{ symbol: '⬟', digit: '7' }, { symbol: '⬡', digit: '2' }, { symbol: '⬢', digit: '9' }, { symbol: '⬣', digit: '4' }],
          msg: ['⬟', '⬡', '⬢', '⬣'],
          sol: '7294',
        },
        {
          key: [{ symbol: '△', digit: '3' }, { symbol: '○', digit: '1' }, { symbol: '□', digit: '5' }, { symbol: '◇', digit: '8' }],
          msg: ['○', '△', '□', '◇'],
          sol: '1358',
        },
      ]);
      return { type: 'cipher', key: keys.key, encodedMessage: keys.msg, solution: keys.sol };
    },
  },

  // ── Cipher / Hard ──────────────────────────────────────────────────────────

  {
    id: 'arch-cipher-hard-01',
    category: 'architecture',
    challengeType: 'cipher',
    difficulty: 'hard',
    tags: ['צופן', 'סמלים מורכבים'],
    build: () => ({
      type: 'cipher',
      key: [
        { symbol: '⌘', digit: '2' },
        { symbol: '⌥', digit: '5' },
        { symbol: '⇧', digit: '8' },
        { symbol: '⌃', digit: '1' },
        { symbol: '⎋', digit: '3' },
      ],
      encodedMessage: ['⌥', '⌘', '⎋', '⌃', '⇧'],
      solution: '52318',
    }),
  },
];

// ─── Templates: artifact ──────────────────────────────────────────────────────

const artifactTemplates: ChallengeTemplate[] = [

  // ── Trivia / Easy ──────────────────────────────────────────────────────────

  {
    id: 'art-trivia-easy-01',
    category: 'artifact',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['חומר', 'עשוי'],
    build: (ctx) => {
      const correct = pick(['עץ', 'מתכת', 'חרס', 'אבן', 'זכוכית']);
      return {
        type: 'trivia',
        question: `מאיזה חומר עשוי ${ctx.object_name}?`,
        options: triviaOptions(correct, ['עץ', 'מתכת', 'חרס', 'אבן', 'זכוכית', 'בד'].filter(m => m !== correct)),
        solution: correct,
      };
    },
  },

  {
    id: 'art-trivia-easy-02',
    category: 'artifact',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['שימוש', 'מטרה', 'פונקציה'],
    build: (ctx) => {
      const use = pick(['כלי בית', 'כלי עבודה', 'פריט דתי', 'תכשיט', 'נשק', 'כלי נגינה']);
      return {
        type: 'trivia',
        question: `לאיזו קטגוריה שייך ${ctx.object_name}?`,
        options: triviaOptions(use, ['כלי בית', 'כלי עבודה', 'פריט דתי', 'תכשיט', 'נשק', 'כלי נגינה'].filter(u => u !== use)),
        solution: use,
      };
    },
  },

  {
    id: 'art-trivia-easy-03',
    category: 'artifact',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['צבע', 'מראה'],
    build: (ctx) => {
      const color = ctx.visible_attributes.find(a => /שחור|לבן|חום|זהב|כסף|אדום/.test(a)) || 'חום';
      return {
        type: 'trivia',
        question: `מה הצבע של ${ctx.object_name}?`,
        options: triviaOptions(color, ['שחור', 'לבן', 'חום', 'זהב', 'כסף', 'אדום'].filter(c => c !== color)),
        solution: color,
      };
    },
  },

  // ── Trivia / Medium ────────────────────────────────────────────────────────

  {
    id: 'art-trivia-med-01',
    category: 'artifact',
    challengeType: 'trivia',
    difficulty: 'medium',
    tags: ['תקופה', 'עת', 'היסטוריה'],
    build: (ctx) => {
      const era = ctx.temporal_context || 'העת העתיקה';
      return {
        type: 'trivia',
        question: `מאיזו תקופה היסטורית מגיע ${ctx.object_name}?`,
        options: triviaOptions(era, ['העת העתיקה', 'ימי הביניים', 'התקופה העות\'מאנית', 'המאה ה-20'].filter(e => e !== era)),
        solution: era,
      };
    },
  },

  {
    id: 'art-trivia-med-02',
    category: 'artifact',
    challengeType: 'trivia',
    difficulty: 'medium',
    tags: ['מקור', 'תרבות', 'מוצא'],
    build: (ctx) => {
      const origin = pick(['מקומי', 'מיובא', 'מתנה דיפלומטית', 'ממצא ארכיאולוגי']);
      return {
        type: 'trivia',
        question: `כיצד הגיע ${ctx.object_name} למקום זה?`,
        options: triviaOptions(origin, ['מקומי', 'מיובא', 'מתנה דיפלומטית', 'ממצא ארכיאולוגי'].filter(o => o !== origin)),
        solution: origin,
      };
    },
  },

  // ── Trivia / Hard ──────────────────────────────────────────────────────────

  {
    id: 'art-trivia-hard-01',
    category: 'artifact',
    challengeType: 'trivia',
    difficulty: 'hard',
    tags: ['טכניקה', 'מלאכה', 'ייצור'],
    build: (ctx) => {
      const technique = pick(['יציקה', 'גילוף', 'אריגה', 'חריטה', 'ריתוך', 'עיצוב בחום']);
      return {
        type: 'trivia',
        question: `באיזו טכניקת ייצור עשוי ${ctx.object_name}?`,
        options: triviaOptions(technique, ['יציקה', 'גילוף', 'אריגה', 'חריטה', 'ריתוך', 'עיצוב בחום'].filter(t => t !== technique)),
        solution: technique,
      };
    },
  },

  // ── OddOneOut ──────────────────────────────────────────────────────────────

  {
    id: 'art-odd-easy-01',
    category: 'artifact',
    challengeType: 'oddoneout',
    difficulty: 'easy',
    tags: ['חומרים'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['עץ', 'חרס', 'מתכת', 'רוח'], 'רוח'],
        [['פסל', 'ציור', 'תכשיט', 'מחשבה'], 'מחשבה'],
        [['כלי', 'פריט', 'חפץ', 'רגש'], 'רגש'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'מה לא שייך?',
        solution: odd,
      };
    },
  },

  {
    id: 'art-odd-med-01',
    category: 'artifact',
    challengeType: 'oddoneout',
    difficulty: 'medium',
    tags: ['סגנון', 'אומנות'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['אימפרסיוניזם', 'קוביזם', 'ריאליזם', 'כדורגל'], 'כדורגל'],
        [['רנסנס', 'בארוק', 'רומנטיציזם', 'מטבח'], 'מטבח'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'איזה סגנון אמנות לא קיים?',
        solution: odd,
      };
    },
  },

  {
    id: 'art-odd-hard-01',
    category: 'artifact',
    challengeType: 'oddoneout',
    difficulty: 'hard',
    tags: ['טכניקה', 'מלאכה'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['פרסקו', 'טמפרה', 'שמן', 'WiFi'], 'WiFi'],
        [['גובלן', 'איקאט', 'בטיק', 'מלט'], 'מלט'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'איזו טכניקת אמנות לא קיימת?',
        solution: odd,
      };
    },
  },

  // ── Pattern ────────────────────────────────────────────────────────────────

  {
    id: 'art-pattern-easy-01',
    category: 'artifact',
    challengeType: 'pattern',
    difficulty: 'easy',
    tags: ['ספירה', 'מספר'],
    build: () => ({
      type: 'pattern',
      items: ['1', '2', null, '4', '5'],
      blankCount: 1,
      patternHint: 'ספרו לפי הסדר',
      solution: '3',
    }),
  },

  {
    id: 'art-pattern-med-01',
    category: 'artifact',
    challengeType: 'pattern',
    difficulty: 'medium',
    tags: ['צבעים', 'חזרה'],
    build: () => {
      const series = pick([
        { items: ['זהב', 'כסף', 'זהב', null, 'זהב'], solution: 'כסף', hint: 'הצבעים מתחלפים' },
        { items: ['1', '3', '5', null, '9'], solution: '7', hint: 'מספרים אי-זוגיים' },
      ]);
      return {
        type: 'pattern',
        items: series.items,
        blankCount: 1,
        patternHint: series.hint,
        solution: series.solution,
      };
    },
  },

  // ── Cipher ─────────────────────────────────────────────────────────────────

  {
    id: 'art-cipher-easy-01',
    category: 'artifact',
    challengeType: 'cipher',
    difficulty: 'easy',
    tags: ['סמלים', 'צופן'],
    build: () => ({
      type: 'cipher',
      key: [{ symbol: '⚱', digit: '3' }, { symbol: '🏺', digit: '7' }, { symbol: '🗿', digit: '1' }],
      encodedMessage: ['🗿', '⚱', '🏺'],
      solution: '137',
    }),
  },

  {
    id: 'art-cipher-hard-01',
    category: 'artifact',
    challengeType: 'cipher',
    difficulty: 'hard',
    tags: ['כתב עתיק', 'סמלים'],
    build: () => ({
      type: 'cipher',
      key: [
        { symbol: '𓀀', digit: '4' },
        { symbol: '𓂀', digit: '9' },
        { symbol: '𓃭', digit: '2' },
        { symbol: '𓆣', digit: '6' },
      ],
      encodedMessage: ['𓂀', '𓃭', '𓀀', '𓆣'],
      solution: '9246',
    }),
  },
];

// ─── Templates: nature ────────────────────────────────────────────────────────

const natureTemplates: ChallengeTemplate[] = [

  // ── Trivia / Easy ──────────────────────────────────────────────────────────

  {
    id: 'nat-trivia-easy-01',
    category: 'nature',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['עונה', 'זמן'],
    build: (ctx) => {
      const season = pick(['אביב', 'קיץ', 'סתיו', 'חורף']);
      return {
        type: 'trivia',
        question: `באיזו עונה ${ctx.object_name} נמצא בשיאו?`,
        options: triviaOptions(season, ['אביב', 'קיץ', 'סתיו', 'חורף'].filter(s => s !== season)),
        solution: season,
      };
    },
  },

  {
    id: 'nat-trivia-easy-02',
    category: 'nature',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['צמח', 'עץ', 'פרח'],
    build: (ctx) => {
      const type = pick(['עץ מחטני', 'עץ נשיר', 'שיח', 'פרח בר', 'עשב']);
      return {
        type: 'trivia',
        question: `לאיזו קטגוריה שייך ${ctx.object_name}?`,
        options: triviaOptions(type, ['עץ מחטני', 'עץ נשיר', 'שיח', 'פרח בר', 'עשב'].filter(t => t !== type)),
        solution: type,
      };
    },
  },

  {
    id: 'nat-trivia-easy-03',
    category: 'nature',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['צבע', 'עלים', 'פרחים'],
    build: (ctx) => {
      const color = ctx.visible_attributes.find(a => /ירוק|צהוב|אדום|לבן|סגול/.test(a)) || 'ירוק';
      return {
        type: 'trivia',
        question: `מה הצבע הדומיננטי של ${ctx.object_name}?`,
        options: triviaOptions(color, ['ירוק', 'צהוב', 'אדום', 'לבן', 'סגול', 'כתום'].filter(c => c !== color)),
        solution: color,
      };
    },
  },

  // ── Trivia / Medium ────────────────────────────────────────────────────────

  {
    id: 'nat-trivia-med-01',
    category: 'nature',
    challengeType: 'trivia',
    difficulty: 'medium',
    tags: ['אקלים', 'סביבה', 'בית גידול'],
    build: (ctx) => {
      const habitat = pick(['ים תיכוני', 'מדברי', 'הרי', 'ביצתי', 'עירוני']);
      return {
        type: 'trivia',
        question: `באיזה בית גידול מקורי גדל ${ctx.object_name}?`,
        options: triviaOptions(habitat, ['ים תיכוני', 'מדברי', 'הרי', 'ביצתי', 'עירוני'].filter(h => h !== habitat)),
        solution: habitat,
      };
    },
  },

  {
    id: 'nat-trivia-med-02',
    category: 'nature',
    challengeType: 'trivia',
    difficulty: 'medium',
    tags: ['גיל', 'גידול', 'גובה'],
    build: (ctx) => {
      const age = pick(['פחות מ-10 שנים', '10-50 שנים', '50-100 שנים', 'מעל 100 שנים']);
      return {
        type: 'trivia',
        question: `מה גילו המשוער של ${ctx.object_name}?`,
        options: triviaOptions(age, ['פחות מ-10 שנים', '10-50 שנים', '50-100 שנים', 'מעל 100 שנים'].filter(a => a !== age)),
        solution: age,
      };
    },
  },

  // ── Trivia / Hard ──────────────────────────────────────────────────────────

  {
    id: 'nat-trivia-hard-01',
    category: 'nature',
    challengeType: 'trivia',
    difficulty: 'hard',
    tags: ['שם מדעי', 'מין', 'ביולוגיה'],
    build: (ctx) => {
      const fact = pick(['מין מוגן', 'מין פולש', 'מין אנדמי', 'מין מסכן בהכחדה']);
      return {
        type: 'trivia',
        question: `מה הסטטוס האקולוגי של ${ctx.object_name}?`,
        options: triviaOptions(fact, ['מין מוגן', 'מין פולש', 'מין אנדמי', 'מין מסכן בהכחדה'].filter(f => f !== fact)),
        solution: fact,
      };
    },
  },

  // ── OddOneOut ──────────────────────────────────────────────────────────────

  {
    id: 'nat-odd-easy-01',
    category: 'nature',
    challengeType: 'oddoneout',
    difficulty: 'easy',
    tags: ['צמחים', 'סיווג'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['ורד', 'צבעוני', 'חמניה', 'ברזל'], 'ברזל'],
        [['אלון', 'ברוש', 'זית', 'מכונית'], 'מכונית'],
        [['חיטה', 'שעורה', 'כוסמת', 'בטון'], 'בטון'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'מה לא שייך לטבע?',
        solution: odd,
      };
    },
  },

  {
    id: 'nat-odd-med-01',
    category: 'nature',
    challengeType: 'oddoneout',
    difficulty: 'medium',
    tags: ['חיות', 'בעלי חיים'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['ינשוף', 'עטלף', 'חתול', 'שמש'], 'שמש'],
        [['צב', 'תנין', 'לטאה', 'פסנתר'], 'פסנתר'],
        [['דולפין', 'כרישה', 'לוויתן', 'ג\'ירפה'], 'ג\'ירפה'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'מה לא שייך לקבוצה?',
        solution: odd,
      };
    },
  },

  // ── Pattern ────────────────────────────────────────────────────────────────

  {
    id: 'nat-pattern-easy-01',
    category: 'nature',
    challengeType: 'pattern',
    difficulty: 'easy',
    tags: ['עונות', 'מחזור'],
    build: () => ({
      type: 'pattern',
      items: ['אביב', 'קיץ', null, 'חורף'],
      blankCount: 1,
      patternHint: 'מחזור העונות',
      solution: 'סתיו',
    }),
  },

  {
    id: 'nat-pattern-med-01',
    category: 'nature',
    challengeType: 'pattern',
    difficulty: 'medium',
    tags: ['גדילה', 'מחזור חיים'],
    build: () => {
      const series = pick([
        { items: ['זרע', 'נבט', null, 'עץ בוגר'], solution: 'שתיל', hint: 'מחזור חיי הצמח' },
        { items: ['ביצה', 'זחל', 'גולם', null], solution: 'פרפר', hint: 'מחזור חיי הפרפר' },
      ]);
      return {
        type: 'pattern',
        items: series.items,
        blankCount: 1,
        patternHint: series.hint,
        solution: series.solution,
      };
    },
  },

  // ── Cipher ─────────────────────────────────────────────────────────────────

  {
    id: 'nat-cipher-easy-01',
    category: 'nature',
    challengeType: 'cipher',
    difficulty: 'easy',
    tags: ['סמלים', 'טבע'],
    build: () => ({
      type: 'cipher',
      key: [{ symbol: '🌳', digit: '3' }, { symbol: '🌸', digit: '8' }, { symbol: '🍂', digit: '5' }],
      encodedMessage: ['🌸', '🌳', '🍂'],
      solution: '835',
    }),
  },

  {
    id: 'nat-cipher-med-01',
    category: 'nature',
    challengeType: 'cipher',
    difficulty: 'medium',
    tags: ['סמלים', 'חיות'],
    build: () => ({
      type: 'cipher',
      key: [
        { symbol: '🦁', digit: '1' },
        { symbol: '🐘', digit: '6' },
        { symbol: '🦅', digit: '4' },
        { symbol: '🐢', digit: '9' },
      ],
      encodedMessage: ['🦅', '🐢', '🦁', '🐘'],
      solution: '4916',
    }),
  },
];

// ─── Templates: signage ───────────────────────────────────────────────────────

const signageTemplates: ChallengeTemplate[] = [

  // ── Trivia / Easy ──────────────────────────────────────────────────────────

  {
    id: 'sig-trivia-easy-01',
    category: 'signage',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['שפה', 'כתב', 'אותיות'],
    build: (ctx) => {
      const lang = pick(['עברית', 'ערבית', 'אנגלית', 'לטינית', 'יידיש']);
      return {
        type: 'trivia',
        question: `באיזו שפה כתוב ${ctx.object_name}?`,
        options: triviaOptions(lang, ['עברית', 'ערבית', 'אנגלית', 'לטינית', 'יידיש'].filter(l => l !== lang)),
        solution: lang,
      };
    },
  },

  {
    id: 'sig-trivia-easy-02',
    category: 'signage',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['מטרה', 'שימוש', 'סוג'],
    build: (ctx) => {
      const purpose = pick(['כיוון', 'זיכרון', 'מידע', 'פרסום', 'אזהרה']);
      return {
        type: 'trivia',
        question: `מה מטרת ${ctx.object_name}?`,
        options: triviaOptions(purpose, ['כיוון', 'זיכרון', 'מידע', 'פרסום', 'אזהרה'].filter(p => p !== purpose)),
        solution: purpose,
      };
    },
  },

  // ── Trivia / Medium ────────────────────────────────────────────────────────

  {
    id: 'sig-trivia-med-01',
    category: 'signage',
    challengeType: 'trivia',
    difficulty: 'medium',
    tags: ['תאריך', 'שנה', 'חניכה'],
    build: (ctx) => {
      const era = ctx.temporal_context || 'המנדט הבריטי';
      return {
        type: 'trivia',
        question: `מאיזו תקופה ${ctx.object_name}?`,
        options: triviaOptions(era, ['המנדט הבריטי', 'התקופה העות\'מאנית', 'ישראל המודרנית', 'תקופת הצלבנים'].filter(e => e !== era)),
        solution: era,
      };
    },
  },

  {
    id: 'sig-trivia-med-02',
    category: 'signage',
    challengeType: 'trivia',
    difficulty: 'medium',
    tags: ['אותיות', 'ספירה', 'מילים'],
    build: (ctx) => {
      const wordCount = pick(['2', '3', '4', '5']);
      return {
        type: 'trivia',
        question: `כמה מילים יש ב${ctx.object_name}?`,
        options: triviaOptions(wordCount, ['1', '2', '3', '4', '5', '6'].filter(n => n !== wordCount)),
        solution: wordCount,
      };
    },
  },

  // ── Trivia / Hard ──────────────────────────────────────────────────────────

  {
    id: 'sig-trivia-hard-01',
    category: 'signage',
    challengeType: 'trivia',
    difficulty: 'hard',
    tags: ['חריטה', 'כתב', 'ייחוד'],
    build: (ctx) => {
      const style = pick(['כתב בלוק', 'כתב זרם', 'כתב מרובע', 'כתב יד', 'טיפוגרפיה מודרנית']);
      return {
        type: 'trivia',
        question: `באיזה סגנון כתיבה עשוי ${ctx.object_name}?`,
        options: triviaOptions(style, ['כתב בלוק', 'כתב זרם', 'כתב מרובע', 'כתב יד', 'טיפוגרפיה מודרנית'].filter(s => s !== style)),
        solution: style,
      };
    },
  },

  // ── OddOneOut ──────────────────────────────────────────────────────────────

  {
    id: 'sig-odd-easy-01',
    category: 'signage',
    challengeType: 'oddoneout',
    difficulty: 'easy',
    tags: ['אותיות', 'שפות'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['א', 'ב', 'ג', '7'], '7'],
        [['A', 'B', 'C', 'ד'], 'ד'],
        [['1', '2', '3', 'ש'], 'ש'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'מה לא שייך לאותה קבוצה?',
        solution: odd,
      };
    },
  },

  {
    id: 'sig-odd-med-01',
    category: 'signage',
    challengeType: 'oddoneout',
    difficulty: 'medium',
    tags: ['שפות', 'מערכות כתב'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['עברית', 'ערבית', 'פרסית', 'יוונית'], 'יוונית'],
        [['לטינית', 'ספרדית', 'איטלקית', 'סינית'], 'סינית'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'איזו שפה לא שייכת למשפחה?',
        solution: odd,
      };
    },
  },

  // ── Pattern ────────────────────────────────────────────────────────────────

  {
    id: 'sig-pattern-easy-01',
    category: 'signage',
    challengeType: 'pattern',
    difficulty: 'easy',
    tags: ['אותיות', 'א-ב'],
    build: () => ({
      type: 'pattern',
      items: ['א', 'ג', 'ה', null, 'ט'],
      blankCount: 1,
      patternHint: 'כל אות קופצת אות אחת',
      solution: 'ז',
    }),
  },

  {
    id: 'sig-pattern-med-01',
    category: 'signage',
    challengeType: 'pattern',
    difficulty: 'medium',
    tags: ['מספרים', 'ספרות'],
    build: () => ({
      type: 'pattern',
      items: ['10', '20', '30', null, '50'],
      blankCount: 1,
      patternHint: 'עשרות בסדר עולה',
      solution: '40',
    }),
  },

  // ── Cipher ─────────────────────────────────────────────────────────────────

  {
    id: 'sig-cipher-easy-01',
    category: 'signage',
    challengeType: 'cipher',
    difficulty: 'easy',
    tags: ['אותיות', 'קוד'],
    build: () => ({
      type: 'cipher',
      key: [{ symbol: 'A', digit: '1' }, { symbol: 'B', digit: '2' }, { symbol: 'C', digit: '3' }],
      encodedMessage: ['B', 'A', 'C'],
      solution: '213',
    }),
  },

  {
    id: 'sig-cipher-hard-01',
    category: 'signage',
    challengeType: 'cipher',
    difficulty: 'hard',
    tags: ['מורס', 'קוד סודי'],
    build: () => ({
      type: 'cipher',
      key: [
        { symbol: '•−', digit: '1' },
        { symbol: '−•••', digit: '4' },
        { symbol: '•••', digit: '7' },
        { symbol: '−−•', digit: '3' },
      ],
      encodedMessage: ['−•••', '•−', '−−•', '•••'],
      solution: '4137',
    }),
  },
];

// ─── Templates: person ────────────────────────────────────────────────────────

const personTemplates: ChallengeTemplate[] = [

  // ── Trivia / Easy ──────────────────────────────────────────────────────────

  {
    id: 'per-trivia-easy-01',
    category: 'person',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['תפקיד', 'מקצוע'],
    build: (ctx) => {
      const role = pick(['אמן', 'מנהיג', 'מדען', 'סופר', 'מוזיקאי', 'ספורטאי']);
      return {
        type: 'trivia',
        question: `במה היה מפורסם ${ctx.object_name}?`,
        options: triviaOptions(role, ['אמן', 'מנהיג', 'מדען', 'סופר', 'מוזיקאי', 'ספורטאי'].filter(r => r !== role)),
        solution: role,
      };
    },
  },

  {
    id: 'per-trivia-easy-02',
    category: 'person',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['תקופה', 'מאה'],
    build: (ctx) => {
      const era = ctx.temporal_context || 'המאה ה-20';
      return {
        type: 'trivia',
        question: `באיזו תקופה חי ${ctx.object_name}?`,
        options: triviaOptions(era, ['המאה ה-19', 'המאה ה-20', 'המאה ה-21', 'ימי הביניים'].filter(e => e !== era)),
        solution: era,
      };
    },
  },

  // ── Trivia / Medium ────────────────────────────────────────────────────────

  {
    id: 'per-trivia-med-01',
    category: 'person',
    challengeType: 'trivia',
    difficulty: 'medium',
    tags: ['מוצא', 'ארץ', 'לאום'],
    build: (ctx) => {
      const origin = pick(['ישראל', 'גרמניה', 'פולין', 'מרוקו', 'רוסיה', 'ספרד']);
      return {
        type: 'trivia',
        question: `מאיזו ארץ מגיע ${ctx.object_name}?`,
        options: triviaOptions(origin, ['ישראל', 'גרמניה', 'פולין', 'מרוקו', 'רוסיה', 'ספרד'].filter(o => o !== origin)),
        solution: origin,
      };
    },
  },

  {
    id: 'per-trivia-med-02',
    category: 'person',
    challengeType: 'trivia',
    difficulty: 'medium',
    tags: ['הישג', 'פרס', 'הצלחה'],
    build: (ctx) => {
      const achievement = pick(['פרס נובל', 'פרס ישראל', 'גביע עולמי', 'אוסקר', 'פוליצר']);
      return {
        type: 'trivia',
        question: `איזה פרס זכה ${ctx.object_name}?`,
        options: triviaOptions(achievement, ['פרס נובל', 'פרס ישראל', 'גביע עולמי', 'אוסקר', 'פוליצר'].filter(a => a !== achievement)),
        solution: achievement,
      };
    },
  },

  // ── Trivia / Hard ──────────────────────────────────────────────────────────

  {
    id: 'per-trivia-hard-01',
    category: 'person',
    challengeType: 'trivia',
    difficulty: 'hard',
    tags: ['קשר', 'השפעה', 'מורשת'],
    build: (ctx) => {
      const legacy = pick(['שינה חברתי', 'מהפכה מדעית', 'יצירה ספרותית', 'פיתוח טכנולוגי', 'מנהיגות פוליטית']);
      return {
        type: 'trivia',
        question: `מה המורשת הגדולה ביותר של ${ctx.object_name}?`,
        options: triviaOptions(legacy, ['שינה חברתי', 'מהפכה מדעית', 'יצירה ספרותית', 'פיתוח טכנולוגי', 'מנהיגות פוליטית'].filter(l => l !== legacy)),
        solution: legacy,
      };
    },
  },

  // ── OddOneOut ──────────────────────────────────────────────────────────────

  {
    id: 'per-odd-easy-01',
    category: 'person',
    challengeType: 'oddoneout',
    difficulty: 'easy',
    tags: ['מקצועות'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['צייר', 'פסל', 'מוזיקאי', 'רופשת'], 'רופשת'],
        [['פילוסוף', 'היסטוריון', 'משורר', 'אסטרואיד'], 'אסטרואיד'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'מה לא מקצוע?',
        solution: odd,
      };
    },
  },

  // ── Pattern ────────────────────────────────────────────────────────────────

  {
    id: 'per-pattern-easy-01',
    category: 'person',
    challengeType: 'pattern',
    difficulty: 'easy',
    tags: ['גיל', 'שנים'],
    build: () => ({
      type: 'pattern',
      items: ['ילד', 'נוער', null, 'מבוגר'],
      blankCount: 1,
      patternHint: 'שלבי החיים לפי הסדר',
      solution: 'צעיר',
    }),
  },

  {
    id: 'per-pattern-med-01',
    category: 'person',
    challengeType: 'pattern',
    difficulty: 'medium',
    tags: ['שנים', 'עשור'],
    build: () => ({
      type: 'pattern',
      items: ['1900', '1920', '1940', null, '1980'],
      blankCount: 1,
      patternHint: 'כל תאריך קופץ 20 שנה',
      solution: '1960',
    }),
  },

  // ── Cipher ─────────────────────────────────────────────────────────────────

  {
    id: 'per-cipher-easy-01',
    category: 'person',
    challengeType: 'cipher',
    difficulty: 'easy',
    tags: ['ראשי תיבות', 'קוד'],
    build: (ctx) => ({
      type: 'cipher',
      key: [{ symbol: '★', digit: '5' }, { symbol: '◆', digit: '2' }, { symbol: '●', digit: '7' }],
      encodedMessage: ['◆', '★', '●'],
      solution: '257',
    }),
  },
];

// ─── Templates: ritual ────────────────────────────────────────────────────────

const ritualTemplates: ChallengeTemplate[] = [

  // ── Trivia / Easy ──────────────────────────────────────────────────────────

  {
    id: 'rit-trivia-easy-01',
    category: 'ritual',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['דת', 'אמונה'],
    build: (ctx) => {
      const religion = pick(['יהדות', 'אסלאם', 'נצרות', 'דרוזים', 'בהאי']);
      return {
        type: 'trivia',
        question: `לאיזו דת שייך ${ctx.object_name}?`,
        options: triviaOptions(religion, ['יהדות', 'אסלאם', 'נצרות', 'דרוזים', 'בהאי'].filter(r => r !== religion)),
        solution: religion,
      };
    },
  },

  {
    id: 'rit-trivia-easy-02',
    category: 'ritual',
    challengeType: 'trivia',
    difficulty: 'easy',
    tags: ['מועד', 'חג', 'עיתוי'],
    build: (ctx) => {
      const occasion = pick(['חג', 'חתונה', 'אבל', 'בר מצווה', 'יומי']);
      return {
        type: 'trivia',
        question: `באיזה אירוע משתמשים ב${ctx.object_name}?`,
        options: triviaOptions(occasion, ['חג', 'חתונה', 'אבל', 'בר מצווה', 'יומי'].filter(o => o !== occasion)),
        solution: occasion,
      };
    },
  },

  // ── Trivia / Medium ────────────────────────────────────────────────────────

  {
    id: 'rit-trivia-med-01',
    category: 'ritual',
    challengeType: 'trivia',
    difficulty: 'medium',
    tags: ['סמל', 'משמעות'],
    build: (ctx) => {
      const meaning = pick(['טוהר', 'פוריות', 'זיכרון', 'הגנה', 'ברכה']);
      return {
        type: 'trivia',
        question: `מה הסמל העיקרי של ${ctx.object_name}?`,
        options: triviaOptions(meaning, ['טוהר', 'פוריות', 'זיכרון', 'הגנה', 'ברכה'].filter(m => m !== meaning)),
        solution: meaning,
      };
    },
  },

  // ── OddOneOut ──────────────────────────────────────────────────────────────

  {
    id: 'rit-odd-easy-01',
    category: 'ritual',
    challengeType: 'oddoneout',
    difficulty: 'easy',
    tags: ['כלים', 'פריטים דתיים'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['שופר', 'מנורה', 'מזוזה', 'מחשב'], 'מחשב'],
        [['מסבחה', 'חיג\'אב', 'מינרט', 'אוטו'], 'אוטו'],
        [['צלב', 'פעמון', 'נר', 'טלפון'], 'טלפון'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'מה לא שייך לטקס דתי?',
        solution: odd,
      };
    },
  },

  {
    id: 'rit-odd-med-01',
    category: 'ritual',
    challengeType: 'oddoneout',
    difficulty: 'medium',
    tags: ['חגים', 'מועדים'],
    build: () => {
      const sets: Array<[string[], string]> = [
        [['פסח', 'סוכות', 'פורים', 'כדורגל'], 'כדורגל'],
        [['רמדאן', 'עיד אל-פיטר', 'עיד אל-אדחא', 'פיצה'], 'פיצה'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'מה לא חג דתי?',
        solution: odd,
      };
    },
  },

  // ── Pattern ────────────────────────────────────────────────────────────────

  {
    id: 'rit-pattern-easy-01',
    category: 'ritual',
    challengeType: 'pattern',
    difficulty: 'easy',
    tags: ['ימים', 'שבוע'],
    build: () => ({
      type: 'pattern',
      items: ['ראשון', 'שני', 'שלישי', null, 'חמישי'],
      blankCount: 1,
      patternHint: 'ימי השבוע בסדר',
      solution: 'רביעי',
    }),
  },

  {
    id: 'rit-pattern-med-01',
    category: 'ritual',
    challengeType: 'pattern',
    difficulty: 'medium',
    tags: ['חגים', 'לוח שנה'],
    build: () => ({
      type: 'pattern',
      items: ['ניסן', 'אייר', null, 'תמוז'],
      blankCount: 1,
      patternHint: 'חודשי לוח השנה העברי',
      solution: 'סיוון',
    }),
  },

  // ── Cipher ─────────────────────────────────────────────────────────────────

  {
    id: 'rit-cipher-easy-01',
    category: 'ritual',
    challengeType: 'cipher',
    difficulty: 'easy',
    tags: ['סמלים', 'דת'],
    build: () => ({
      type: 'cipher',
      key: [{ symbol: '✡', digit: '6' }, { symbol: '☪', digit: '3' }, { symbol: '✝', digit: '9' }],
      encodedMessage: ['☪', '✡', '✝'],
      solution: '369',
    }),
  },
];

// ─── Templates: other ─────────────────────────────────────────────────────────

const otherTemplates: ChallengeTemplate[] = [

  {
    id: 'oth-trivia-easy-01',
    category: 'other',
    challengeType: 'trivia',
    difficulty: 'easy',
    build: (ctx) => ({
      type: 'trivia',
      question: `מה מייחד את ${ctx.object_name} מהסביבה שלו?`,
      options: triviaOptions('גודלו', ['צבעו', 'גילו', 'גודלו', 'מיקומו']),
      solution: 'גודלו',
    }),
  },

  {
    id: 'oth-trivia-med-01',
    category: 'other',
    challengeType: 'trivia',
    difficulty: 'medium',
    build: (ctx) => ({
      type: 'trivia',
      question: `מה הקשר בין ${ctx.object_name} לסביבתו?`,
      options: triviaOptions('חלק מהנוף', ['זר למקום', 'חלק מהנוף', 'שייך לתקופה אחרת', 'שייך לתרבות אחרת']),
      solution: 'חלק מהנוף',
    }),
  },

  {
    id: 'oth-odd-easy-01',
    category: 'other',
    challengeType: 'oddoneout',
    difficulty: 'easy',
    build: () => {
      const sets: Array<[string[], string]> = [
        [['עגול', 'מרובע', 'משולש', 'כחול'], 'כחול'],
        [['גדול', 'קטן', 'בינוני', 'מהיר'], 'מהיר'],
      ];
      const [items, odd] = pick(sets);
      return {
        type: 'oddoneout',
        items: shuffle(items).map((label, i) => ({
          id: `item-${i}`, label, isOdd: label === odd,
          digitContribution: label === odd ? '1' : undefined,
        })),
        oddCount: 1,
        groupLabel: 'מה שייך לקטגוריה שונה?',
        solution: odd,
      };
    },
  },

  {
    id: 'oth-pattern-easy-01',
    category: 'other',
    challengeType: 'pattern',
    difficulty: 'easy',
    build: () => ({
      type: 'pattern',
      items: ['1', '2', '3', null, '5'],
      blankCount: 1,
      patternHint: 'סדרה פשוטה',
      solution: '4',
    }),
  },

  {
    id: 'oth-cipher-easy-01',
    category: 'other',
    challengeType: 'cipher',
    difficulty: 'easy',
    build: () => ({
      type: 'cipher',
      key: [{ symbol: '?', digit: '0' }, { symbol: '!', digit: '1' }, { symbol: '#', digit: '2' }],
      encodedMessage: ['!', '#', '?'],
      solution: '120',
    }),
  },
];

// ─── Template Registry ────────────────────────────────────────────────────────

export const ALL_TEMPLATES: ChallengeTemplate[] = [
  ...architectureTemplates,
  ...artifactTemplates,
  ...natureTemplates,
  ...signageTemplates,
  ...personTemplates,
  ...ritualTemplates,
  ...otherTemplates,
];

// ─── Selection Logic ──────────────────────────────────────────────────────────

interface SelectOptions {
  category?: Category;
  challengeType?: TemplateType;
  difficulty?: Difficulty;
  tags?: string[];
}

export function selectTemplate(options: SelectOptions): ChallengeTemplate | null {
  let candidates = ALL_TEMPLATES;

  if (options.category) {
    candidates = candidates.filter(t => t.category === options.category);
  }
  if (options.challengeType) {
    candidates = candidates.filter(t => t.challengeType === options.challengeType);
  }
  if (options.difficulty) {
    candidates = candidates.filter(t => t.difficulty === options.difficulty);
  }

  // טיפול בתגיות — מועדיפים תבניות עם תגית תואמת אבל לא מסננים
  if (options.tags?.length) {
    const scored = candidates.map(t => ({
      template: t,
      score: (t.tags || []).filter(tag => options.tags!.includes(tag)).length,
    }));
    scored.sort((a, b) => b.score - a.score);
    candidates = scored.map(s => s.template);
  }

  if (candidates.length === 0) return null;
  return pick(candidates);
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export function buildChallengeFromTemplate(
  ctx: NormalizedPuzzleContext,
  options: Omit<SelectOptions, 'category'> = {}
): ChallengeData | null {
  const template = selectTemplate({
    category: ctx.category as Category,
    tags: ctx.keywords,
    ...options,
  });

  if (!template) return null;
  return template.build(ctx);
}
