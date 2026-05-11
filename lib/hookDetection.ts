import { NormalizedPuzzleContext } from './normalization';

// ─── Hook Types ───────────────────────────────────────────────────────────

export type LogicalHook =
  | 'counting'      // ספירה אלמנטים
  | 'pattern'       // סדר חוקי / דפוס
  | 'oddness'       // חריג בקבוצה
  | 'sequence'      // סדר כרונולוגי / לוגי
  | 'letters'       // אותיות ראשונות / סדר לקסיקוגרפי
  | 'correlation'   // קשר בין שני משתנים
  | 'classification'; // קטגוריזציה

export interface DetectedHook {
  type: LogicalHook;
  confidence: number;          // 0-1
  reasoning: string;           // למה בחרנו את זה
  supporting_evidence: string[];
}

// ─── Hook Detection Engine ────────────────────────────────────────────────

export function detectHooks(context: NormalizedPuzzleContext): DetectedHook[] {
  const hooks: DetectedHook[] = [];

  // Counting hook
  if (hasCountingPotential(context)) {
    hooks.push({
      type: 'counting',
      confidence: 0.8,
      reasoning: 'יש חלקים או אלמנטים שניתן לספור בסביבה',
      supporting_evidence: context.visible_attributes.slice(0, 2),
    });
  }

  // Pattern hook
  if (hasPatternPotential(context)) {
    hooks.push({
      type: 'pattern',
      confidence: 0.7,
      reasoning: 'יש סדר או דפוס לוגי בדאטא',
      supporting_evidence: [context.object_name, context.temporal_context || 'מבנה'],
    });
  }

  // Oddness hook
  if (hasOddnessPotential(context)) {
    hooks.push({
      type: 'oddness',
      confidence: 0.75,
      reasoning: 'אחד המינים / הקטגוריות שונה מהאחרים',
      supporting_evidence: [context.category, ...context.keywords.slice(0, 2)],
    });
  }

  // Sequence hook
  if (hasSequencePotential(context)) {
    hooks.push({
      type: 'sequence',
      confidence: 0.6,
      reasoning: 'יש סדר כרונולוגי או הגיוני',
      supporting_evidence: [context.temporal_context || '', context.object_name],
    });
  }

  // Letters hook
  if (hasLettersPotential(context)) {
    hooks.push({
      type: 'letters',
      confidence: 0.5,
      reasoning: 'אותיות או קוד בשם / תכונות',
      supporting_evidence: context.keywords,
    });
  }

  // Correlation hook
  if (hasCorrelationPotential(context)) {
    hooks.push({
      type: 'correlation',
      confidence: 0.65,
      reasoning: 'קשר בין תכונות: גודל ← צבע, חומר ← משקל וכו',
      supporting_evidence: context.visible_attributes,
    });
  }

  // Sort by confidence
  return hooks.sort((a, b) => b.confidence - a.confidence);
}

// ─── Helper: Counting Potential ────────────────────────────────────────────

function hasCountingPotential(context: NormalizedPuzzleContext): boolean {
  const pluralKeywords = ['דלתות', 'חלונות', 'ספרים', 'כסאות', 'עמודים', 'צבעים', 'סמלים'];
  const hasPlural = pluralKeywords.some(kw =>
    context.object_name.includes(kw) || context.keywords.some(k => k.includes(kw))
  );

  const hasCountableAttributes = context.visible_attributes.some(attr =>
    /[\d]|כמה|ספירה|מספר/.test(attr)
  );

  return hasPlural || hasCountableAttributes || context.visible_attributes.length > 2;
}

// ─── Helper: Pattern Potential ────────────────────────────────────────────

function hasPatternPotential(context: NormalizedPuzzleContext): boolean {
  const patterns = ['סדר', 'דפוס', 'סדרה', 'סדרה גיאומטרית', 'סדרה חשבונית', 'פיבונאצ'];

  const hasPatternKeyword = context.keywords.some(kw =>
    patterns.some(p => kw.includes(p))
  );

  // Objects with temporal aspects often have patterns
  const hasTemporalContext = !!context.temporal_context;

  return hasPatternKeyword || (hasTemporalContext && context.visible_attributes.length > 1);
}

// ─── Helper: Oddness Potential ────────────────────────────────────────────

function hasOddnessPotential(context: NormalizedPuzzleContext): boolean {
  // Multiple items suggest comparison/oddness
  const multipleItems = context.visible_attributes.length >= 3;

  // Keywords with "שונה", "לא", "חריג"
  const hasOddKeyword = context.keywords.some(kw =>
    /שונה|חריג|לא|שגוי|אחר/.test(kw)
  );

  // Certain categories naturally have outliers
  const category = context.category;
  const naturallyOdd = ['classification', 'artifact', 'signage'].includes(category);

  return multipleItems || hasOddKeyword || naturallyOdd;
}

// ─── Helper: Sequence Potential ────────────────────────────────────────────

function hasSequencePotential(context: NormalizedPuzzleContext): boolean {
  // Temporal context suggests timeline
  const hasTimeline = !!context.temporal_context?.toLowerCase().includes('שנ');

  // Keywords suggesting order
  const orderKeywords = ['ראשון', 'שני', 'שלישי', 'קדום', 'עתיק', 'מודרני', 'לפני', 'אחרי'];
  const hasOrderKeyword = context.keywords.some(kw =>
    orderKeywords.some(ok => kw.includes(ok))
  );

  return hasTimeline || hasOrderKeyword;
}

// ─── Helper: Letters Potential ────────────────────────────────────────────

function hasLettersPotential(context: NormalizedPuzzleContext): boolean {
  // Names with special patterns
  const nameHasLetterPattern = /^[א-ת]{1,3}|[א-ת]{2,}$/.test(context.object_name);

  // Keywords mentioning letters/codes
  const hasLetterKeyword = context.keywords.some(kw =>
    /אות|קוד|סימן|סמל/.test(kw)
  );

  return nameHasLetterPattern || hasLetterKeyword;
}

// ─── Helper: Correlation Potential ────────────────────────────────────────

function hasCorrelationPotential(context: NormalizedPuzzleContext): boolean {
  // Multiple attributes suggest relationships
  return context.visible_attributes.length >= 3;
}

// ─── Primary Hook (Best Choice) ────────────────────────────────────────────

export function selectPrimaryHook(context: NormalizedPuzzleContext): DetectedHook | null {
  const hooks = detectHooks(context);
  return hooks.length > 0 ? hooks[0] : null;
}
