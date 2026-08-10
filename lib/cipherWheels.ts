/**
 * Shared helpers for the cipherWheels challenge type — used by both the Builder
 * (to auto-compute the encrypted starting state from a target word) and the
 * player component (to know the alphabet each wheel cycles through).
 */

export const HEBREW_ALPHABET = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל',
  'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת',
];

/** Final-form Hebrew letters (ך ם ן ף ץ) normalize to their standard wheel letter. */
const FINAL_FORM_MAP: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' };

export function normalizeHebrewLetter(ch: string): string {
  return FINAL_FORM_MAP[ch] ?? ch;
}

/** Shifts a single letter by `shift` steps through `alphabet` (wraps around). Unknown letters pass through unchanged. */
export function shiftLetter(letter: string, shift: number, alphabet: string[]): string {
  const idx = alphabet.indexOf(normalizeHebrewLetter(letter));
  if (idx === -1) return letter;
  const len = alphabet.length;
  const next = ((idx + shift) % len + len) % len;
  return alphabet[next];
}

/**
 * Encrypts `word` into the wheels' starting letters: each letter is shifted `shift`
 * steps through `alphabet`, in `direction`. The player then rotates each wheel the
 * opposite way to recover `word`.
 */
export function encodeWord(
  word: string,
  shift: number,
  direction: 'forward' | 'backward',
  alphabet: string[] = HEBREW_ALPHABET
): string[] {
  const signedShift = direction === 'backward' ? -shift : shift;
  return Array.from(word).map(ch => shiftLetter(ch, signedShift, alphabet));
}
