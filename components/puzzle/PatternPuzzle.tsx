'use client';

import { useState, useRef, useEffect } from 'react';
import { PatternPuzzleData } from '@/types/puzzle';

interface PatternPuzzleProps {
  puzzle: PatternPuzzleData;
  onCodeChange: (code: string) => void;
}

export default function PatternPuzzle({ puzzle, onCodeChange }: PatternPuzzleProps) {
  const blankPositions = puzzle.items
    .map((item, i) => (item === null ? i : -1))
    .filter(i => i !== -1);

  const [inputs, setInputs] = useState<string[]>(Array(puzzle.blankCount).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const code = inputs.join('');
    if (code.length === puzzle.blankCount) {
      onCodeChange(code);
    } else {
      onCodeChange('');
    }
  }, [inputs, puzzle.blankCount, onCodeChange]);

  const handleChange = (blankIndex: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    if (!char) {
      const next = [...inputs];
      next[blankIndex] = '';
      setInputs(next);
      return;
    }
    const next = [...inputs];
    next[blankIndex] = char;
    setInputs(next);
    // Auto-advance to next blank
    if (blankIndex < puzzle.blankCount - 1) {
      inputRefs.current[blankIndex + 1]?.focus();
    }
  };

  const handleKeyDown = (blankIndex: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !inputs[blankIndex] && blankIndex > 0) {
      inputRefs.current[blankIndex - 1]?.focus();
    }
  };

  let blankUsed = 0;

  return (
    <div className="space-y-5">
      {puzzle.patternHint && (
        <p className="text-amber-400 text-sm text-center">{puzzle.patternHint}</p>
      )}

      {/* Sequence row */}
      <div className="flex flex-wrap items-center justify-center gap-2" dir="ltr">
        {puzzle.items.map((item, i) => {
          if (item !== null) {
            return (
              <div
                key={i}
                className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-xl text-white font-bold text-lg border border-gray-700"
              >
                {item}
              </div>
            );
          }

          const bi = blankUsed++;
          return (
            <input
              key={i}
              ref={el => { inputRefs.current[bi] = el; }}
              type="text"
              inputMode="numeric"
              value={inputs[bi]}
              onChange={e => handleChange(bi, e.target.value)}
              onKeyDown={e => handleKeyDown(bi, e)}
              maxLength={2}
              placeholder="?"
              className="w-12 h-12 text-center bg-gray-950 text-amber-400 font-bold text-lg border-2 border-amber-400 rounded-xl outline-none placeholder:text-gray-600 focus:border-amber-300"
            />
          );
        })}
      </div>

      {/* Blanks summary */}
      {puzzle.blankCount > 1 && (
        <p className="text-gray-500 text-xs text-center">
          מלאו {puzzle.blankCount} ערכים חסרים — כל ערך יצרף ספרה לקוד הסופי
        </p>
      )}
    </div>
  );
}
