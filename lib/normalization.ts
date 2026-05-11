import { DataSource } from '@/types/builder';

// ─── Normalized Types ─────────────────────────────────────────────────────

export interface NormalizedPuzzleContext {
  source_type: 'manual' | 'db';
  object_name: string;
  category: 'architecture' | 'artifact' | 'nature' | 'signage' | 'person' | 'ritual' | 'other';
  visible_attributes: string[];
  temporal_context?: string;
  cultural_significance?: string;
  keywords: string[];
  location_hint?: string;
}

// ─── Category Detection ────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  architecture: ['בנייה', 'בית', 'קיר', 'דלת', 'חלון', 'גג', 'מעקה', 'עמוד', 'תקרה', 'מדרגות', 'אדריכלות', 'מבנה'],
  artifact: ['כלי', 'פסל', 'ציור', 'פריט', 'חפץ', 'פרט', 'עדות', 'יצירה', 'אומנות'],
  nature: ['צמח', 'עץ', 'פרח', 'דרך', 'מזל', 'הרים', 'מי', 'ימה', 'אטמוספירה'],
  signage: ['שלט', 'הכתוב', 'כיתוב', 'לוט', 'כתוב', 'הודעה', 'תווית'],
  person: ['דמות', 'אדם', 'איש', 'אישה', 'דיוקן', 'פנים'],
  ritual: ['טקס', 'חגיגות', 'מרהץ', 'תפילה', 'מנהג', 'טבעי'],
};

function detectCategory(title: string, keywords: string[]): string {
  const textToAnalyze = (title + ' ' + keywords.join(' ')).toLowerCase();

  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const word of words) {
      if (textToAnalyze.includes(word)) {
        return category;
      }
    }
  }

  return 'other';
}

// ─── Extract Visible Attributes ───────────────────────────────────────────

function extractAttributes(description: string): string[] {
  const attributes: string[] = [];

  // Look for physical descriptions
  const patterns = [
    /צבע[^.]*([אדום|שחור|לבן|ירוק|כחול|צהוב|חום]+)/gi,
    /גודל[^.]*([קטן|בינוני|גדול|עצום]+)/gi,
    /עשוי[^.]*([עץ|בטון|נחושת|אבן|נייר|בד]+)/gi,
    /מצב[^.]*([ישן|חדש|שבור|שלם|קרוע]+)/gi,
    /מרקם[^.]*([חלק|מחוספס|קטום|מקופל]+)/gi,
  ];

  patterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      attributes.push(...matches);
    }
  });

  // If no patterns matched, extract key adjectives
  if (attributes.length === 0) {
    const adjectives = description.match(/\b(?:שחור|לבן|אדום|קרום|ישן|חדש|גדול|קטן|חלק)\b/gi);
    if (adjectives) {
      attributes.push(...adjectives);
    }
  }

  return [...new Set(attributes)]; // Remove duplicates
}

// ─── Extract Temporal Context ──────────────────────────────────────────────

function extractTemporalContext(narrative: string): string | undefined {
  const temporalPatterns = [
    /משנות? ה?-?(\d{1,4})s?/gi,
    /בעבר|בימים ישנים|בתור קדום/gi,
    /בתקופת ([^\n.]+)/gi,
    /(קדום|מודרני|עתיק|שלט|עדכני)/gi,
  ];

  for (const pattern of temporalPatterns) {
    const match = narrative.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return undefined;
}

// ─── Main Normalization ────────────────────────────────────────────────────

export function normalizeDataSource(source: DataSource): NormalizedPuzzleContext {
  if (source.type !== 'manual') {
    throw new Error('Unsupported data source type');
  }

  const category = detectCategory(source.title, source.keywords);
  const visible_attributes = extractAttributes(source.description);
  const temporal_context = extractTemporalContext(source.narrative_context);

  // Extract location if mentioned
  let location_hint: string | undefined;
  const locationMatch = source.description.match(/(?:נמצא|במקום|בפינה|על|ליד)[^.]+/i);
  if (locationMatch) {
    location_hint = locationMatch[0].trim();
  }

  return {
    source_type: 'manual',
    object_name: source.title,
    category: category as any,
    visible_attributes,
    temporal_context,
    cultural_significance: source.narrative_context.slice(0, 200),
    keywords: source.keywords,
    location_hint,
  };
}
