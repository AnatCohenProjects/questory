'use client';

import { useState, useRef, useEffect } from 'react';
import { PatternChallengeData } from '@/types/challenge';

interface PatternChallengeProps {
  challenge: PatternChallengeData;
  onCodeChange: (code: string) => void;
}

export default function PatternChallenge({ challenge, onCodeChange }: PatternChallengeProps) {
  const [inputs, setInputs] = useState<string[]>(Array(challenge.blankCount).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const allFilled = inputs.every(v => v.length > 0);
    onCodeChange(allFilled ? inputs.join(' ') : '');
  }, [inputs, onCodeChange]);

  const handleChange = (blankIndex: number, value: string) => {
    // Allow only digits/letters, no length restriction per blank
    const cleaned = value.replace(/[^0-9a-zA-Zא-ת]/g, '');
    const next = [...inputs];
    next[blankIndex] = cleaned;
    setInputs(next);
  };

  const handleKeyDown = (blankIndex: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !inputs[blankIndex] && blankIndex > 0) {
      inputRefs.current[blankIndex - 1]?.focus();
    }
  };

  let blankUsed = 0;

  return (
    <div className="space-y-5">
      {challenge.patternHint && (
        <p className="text-amber-400 text-sm text-center">{challenge.patternHint}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2" dir="ltr">
        {challenge.items.map((item, i) => {
          if (item !== null) {
            return (
              <div key={i} className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-xl text-white font-bold text-lg border border-gray-700">
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
              placeholder="?"
              className="w-16 h-12 text-center bg-gray-950 text-amber-400 font-bold text-lg border-2 border-amber-400 rounded-xl outline-none placeholder:text-gray-600 focus:border-amber-300"
            />
          );
        })}
      </div>
      {challenge.blankCount > 1 && (
        <p className="text-gray-500 text-xs text-center">
          מלאו {challenge.blankCount} ערכים חסרים
        </p>
      )}
    </div>
  );
}
