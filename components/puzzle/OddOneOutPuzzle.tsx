'use client';

import { useState, useEffect } from 'react';
import { OddOneOutPuzzleData } from '@/types/puzzle';

interface OddOneOutPuzzleProps {
  puzzle: OddOneOutPuzzleData;
  onCodeChange: (code: string) => void;
}

export default function OddOneOutPuzzle({ puzzle, onCodeChange }: OddOneOutPuzzleProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (selected.size === puzzle.oddCount) {
      // Build code from selected items in original order
      const code = puzzle.items
        .filter(item => selected.has(item.id) && item.digitContribution)
        .map(item => item.digitContribution!)
        .join('');
      onCodeChange(code || puzzle.solution);
    } else {
      onCodeChange('');
    }
  }, [selected, puzzle, onCodeChange]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < puzzle.oddCount) {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {puzzle.groupLabel && (
        <p className="text-amber-400 text-sm text-center">{puzzle.groupLabel}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {puzzle.items.map(item => {
          const isSelected = selected.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`
                py-4 px-3 rounded-xl text-base font-semibold transition-all active:scale-95
                ${isSelected
                  ? 'bg-amber-400 text-gray-950 border-2 border-amber-300'
                  : 'bg-gray-800 text-white border-2 border-gray-700 hover:border-gray-500'}
              `}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="text-gray-500 text-xs text-center">
        בחרו {puzzle.oddCount} פריטים שאינם שייכים לקבוצה
        {selected.size > 0 && (
          <span className="text-amber-400"> ({selected.size}/{puzzle.oddCount} נבחרו)</span>
        )}
      </p>
    </div>
  );
}
