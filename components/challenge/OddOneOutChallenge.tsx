'use client';

import { useState, useEffect } from 'react';
import { OddOneOutChallengeData } from '@/types/challenge';

interface OddOneOutChallengeProps {
  challenge: OddOneOutChallengeData;
  onCodeChange: (code: string) => void;
}

export default function OddOneOutChallenge({ challenge, onCodeChange }: OddOneOutChallengeProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (selected.size === challenge.oddCount) {
      const code = challenge.items
        .filter(item => selected.has(item.id) && item.digitContribution)
        .map(item => item.digitContribution!)
        .join('');
      onCodeChange(code || challenge.solution);
    } else {
      onCodeChange('');
    }
  }, [selected, challenge, onCodeChange]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < challenge.oddCount) {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {challenge.groupLabel && (
        <p className="text-amber-400 text-sm text-center">{challenge.groupLabel}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {challenge.items.map(item => {
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
        בחרו {challenge.oddCount} פריטים שאינם שייכים לקבוצה
        {selected.size > 0 && (
          <span className="text-amber-400"> ({selected.size}/{challenge.oddCount} נבחרו)</span>
        )}
      </p>
    </div>
  );
}
