'use client';

import { PuzzleData } from '@/types/puzzle';
import PatternPuzzle from './PatternPuzzle';
import CipherPuzzle from './CipherPuzzle';
import OddOneOutPuzzle from './OddOneOutPuzzle';

interface PuzzleViewProps {
  puzzle: PuzzleData;
  onCodeChange: (code: string) => void;
}

export default function PuzzleView({ puzzle, onCodeChange }: PuzzleViewProps) {
  if (puzzle.type === 'pattern') {
    return <PatternPuzzle puzzle={puzzle} onCodeChange={onCodeChange} />;
  }
  if (puzzle.type === 'cipher') {
    // Cipher is display-only — player reads and types into StationView's answer input
    return <CipherPuzzle puzzle={puzzle} />;
  }
  if (puzzle.type === 'oddoneout') {
    return <OddOneOutPuzzle puzzle={puzzle} onCodeChange={onCodeChange} />;
  }
  return null;
}
