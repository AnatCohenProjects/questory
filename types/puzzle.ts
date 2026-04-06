export type PuzzleType = 'pattern' | 'cipher' | 'oddoneout';

interface PuzzleBase {
  type: PuzzleType;
  solution: string;
}

export interface PatternPuzzleData extends PuzzleBase {
  type: 'pattern';
  items: (number | string | null)[];  // null = blank to fill
  blankCount: number;
  patternHint?: string;
  solution: string;
}

export interface CipherPuzzleData extends PuzzleBase {
  type: 'cipher';
  key: Array<{ symbol: string; digit: string }>;
  encodedMessage: string[];  // array of symbols to decode
  solution: string;
}

export interface OddOneOutPuzzleData extends PuzzleBase {
  type: 'oddoneout';
  items: Array<{
    id: string;
    label: string;
    isOdd: boolean;
    digitContribution?: string;
  }>;
  oddCount: number;
  groupLabel?: string;
  solution: string;
}

export type PuzzleData = PatternPuzzleData | CipherPuzzleData | OddOneOutPuzzleData;
