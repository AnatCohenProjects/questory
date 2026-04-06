'use client';

import { CipherChallengeData } from '@/types/challenge';

interface CipherChallengeProps {
  challenge: CipherChallengeData;
}

export default function CipherChallenge({ challenge }: CipherChallengeProps) {
  return (
    <div className="space-y-5">
      {/* Key table */}
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 text-center">מפתח הצופן</p>
        <div className="flex justify-center gap-3 flex-wrap" dir="ltr">
          {challenge.key.map(({ symbol, digit }) => (
            <div key={symbol} className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 flex items-center justify-center bg-gray-800 rounded-xl text-white text-xl border border-gray-700">
                {symbol}
              </div>
              <div className="w-11 h-7 flex items-center justify-center bg-gray-950 rounded-lg text-amber-400 font-bold text-base border border-amber-400/40">
                {digit}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-gray-400 text-sm text-center">
        מצאו את הסמלים בשטח, פענחו לפי המפתח והקישו את המספרים בתיבה למטה
      </p>
    </div>
  );
}
