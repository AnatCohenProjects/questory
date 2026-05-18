'use client';

import { useState } from 'react';
import { TriviaChallengeData } from '@/types/challenge';

interface TriviaChallengeProps {
  challenge: TriviaChallengeData;
  onCodeChange: (code: string) => void;
}

export default function TriviaChallenge({ challenge, onCodeChange }: TriviaChallengeProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (id: string) => {
    if (revealed) return;
    setSelected(id);
    const option = challenge.options.find(o => o.id === id);
    if (option?.isCorrect) {
      setRevealed(true);
      onCodeChange(challenge.solution);
    } else {
      onCodeChange('');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-white text-base font-semibold text-center leading-snug">
        {challenge.question}
      </p>

      <div className="space-y-3">
        {challenge.options.map(option => {
          const isSelected = selected === option.id;
          const isWrong = isSelected && !option.isCorrect && revealed;
          const isRight = isSelected && option.isCorrect && revealed;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={revealed}
              className={`
                w-full py-4 px-5 rounded-xl text-base font-semibold text-right transition-all active:scale-95
                ${isRight ? 'bg-green-600 text-white border-2 border-green-400' :
                  isWrong ? 'bg-red-900/60 text-red-300 border-2 border-red-600' :
                  isSelected ? 'bg-amber-400 text-gray-950 border-2 border-amber-300' :
                  'bg-gray-800 text-white border-2 border-gray-700'}
                disabled:cursor-default
              `}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {revealed && (
        <p className="text-green-400 text-sm text-center">
          נכון! המשיכו עם הקוד שקיבלתם.
        </p>
      )}
      {selected && !revealed && (
        <p className="text-red-400 text-sm text-center">לא נכון. נסו שוב</p>
      )}
    </div>
  );
}
