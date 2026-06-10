'use client';

import { useState } from 'react';
import { GameType } from '@/types/game';

interface TriggerInputProps {
  triggerType: 'code' | 'qr' | 'gps';
  expectedCode: string;
  onSuccess: () => void;
  onBack?: () => void;
  stationNumber: number;
  navigationHint?: string;
  gameType?: GameType;
}

export default function TriggerInput({
  triggerType,
  expectedCode,
  onSuccess,
  onBack,
  stationNumber,
  navigationHint,
  gameType,
}: TriggerInputProps) {
  const stationLabel = gameType === 'library' ? 'ספר' : 'תחנה';
  const digitCount = expectedCode.length;
  const [digits, setDigits] = useState<string[]>(Array(digitCount).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const filledCount = digits.filter(d => d !== '').length;
  const activeIndex = filledCount < digitCount ? filledCount : digitCount - 1;
  const isComplete = filledCount === digitCount;

  const handleDigit = (num: string) => {
    if (isComplete || loading) return;
    const next = [...digits];
    next[filledCount] = num;
    setDigits(next);
    setError('');
    if (filledCount + 1 === digitCount) {
      handleSubmit(next.join(''));
    }
  };

  const handleBackspace = () => {
    const lastFilled = digits.map((d, i) => (d !== '' ? i : -1)).filter(i => i !== -1).pop();
    if (lastFilled === undefined) return;
    const next = [...digits];
    next[lastFilled] = '';
    setDigits(next);
    setError('');
  };

  const handleSubmit = async (code: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 350));
    if (code.toUpperCase() === expectedCode.toUpperCase()) {
      onSuccess();
    } else {
      setError('קוד שגוי. נסו שוב');
      setDigits(Array(digitCount).fill(''));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center" dir="rtl">

      {/* Ambient glow blobs */}
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-[#00FBFB]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-[#e9c349]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#0E0E0E]/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="w-8 h-8 rounded-full border border-[#3a4a49]/50 text-[#e5e2e1]/60 active:scale-95 transition-transform flex items-center justify-center"
            >
              →
            </button>
          )}
          <div className="w-8 h-8 rounded-full border border-[#00FBFB]/30 flex items-center justify-center bg-[#131313]">
            <span className="text-[#00FBFB] text-sm font-bold font-headline">Q</span>
          </div>
          <span className="font-headline tracking-[0.2em] text-base font-bold text-[#00FBFB]">QUESTORY</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">
          {stationLabel} {stationNumber}
        </span>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-32 px-6 w-full max-w-md">

        {/* Navigation hint */}
        {navigationHint && (
          <div className="w-full bg-[#131313] border border-[#00FBFB]/20 rounded-xl p-4 mb-10 flex gap-3 items-start anim-fade-up">
            <span className="text-[#00FBFB] mt-0.5 flex-shrink-0">🧭</span>
            <p className="text-[#e5e2e1]/70 text-sm leading-relaxed">{navigationHint}</p>
          </div>
        )}

        {/* GPS trigger */}
        {triggerType === 'gps' && (
          <div className="w-full flex flex-col gap-5 anim-scale-in">
            <div className="bg-[#131313] border border-[#3a4a49] rounded-xl p-8 text-center">
              <p className="text-5xl mb-4">📍</p>
              <p className="text-[#e5e2e1]/60 text-sm leading-relaxed">
                כשתגיעו למיקום המדויק, האפליקציה תזהה אתכם אוטומטית
              </p>
            </div>
            <button
              onClick={() => onSuccess()}
              className="w-full bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-lg tracking-widest uppercase py-5 rounded-xl active:scale-[0.98] transition-transform"
            >
              הגעתי למיקום
            </button>
          </div>
        )}

        {/* QR trigger */}
        {triggerType === 'qr' && (
          <div className="w-full flex flex-col items-center gap-6 anim-scale-in">
            <div className="w-64 h-64 bg-[#131313] rounded-2xl flex items-center justify-center border-2 border-dashed border-[#3a4a49]">
              <div className="text-center text-[#e5e2e1]/40">
                <p className="text-5xl mb-3">📷</p>
                <p className="text-sm">סריקת QR בקרוב</p>
              </div>
            </div>
          </div>
        )}

        {/* Code trigger — numpad */}
        {triggerType === 'code' && (
          <>
            {/* Title */}
            <div className="text-center mb-10 anim-fade-up">
              <h2 className="font-headline text-4xl font-bold tracking-tight text-white mb-2">
                הזינו את הקוד
              </h2>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#e5e2e1]/40">
                נדרש אימות
              </p>
            </div>

            {/* Digit boxes */}
            <div className="flex gap-3 mb-12 anim-fade-up" style={{ animationDelay: '100ms' }} dir="ltr">
              {digits.map((digit, i) => {
                const isActive = i === activeIndex && !isComplete && !loading;
                const isFilled = digit !== '';
                return (
                  <div
                    key={i}
                    className={`w-16 h-20 rounded-xl flex items-center justify-center border-b-2 transition-all ${
                      isActive
                        ? 'bg-[#201f1f] border-[#00FBFB]'
                        : isFilled
                        ? 'bg-[#201f1f] border-[#00FBFB]/30'
                        : 'bg-[#131313] border-[#3a4a49]/40'
                    }`}
                    style={isActive ? { boxShadow: '0 0 15px rgba(0,251,251,0.25)' } : undefined}
                  >
                    {isFilled ? (
                      <span className="font-headline text-4xl font-light text-[#00FBFB]">{digit}</span>
                    ) : isActive ? (
                      <span className="w-0.5 h-8 bg-[#00FBFB] animate-pulse" />
                    ) : (
                      <span className="font-headline text-4xl font-light text-[#e5e2e1]/15">•</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm text-center mb-6 anim-fade-up">{error}</p>
            )}

            {/* Numpad */}
            <div className="w-full max-w-xs grid grid-cols-3 gap-3 mb-8 anim-scale-in" style={{ animationDelay: '200ms' }}>
              {['1','2','3','4','5','6','7','8','9'].map(n => (
                <button
                  key={n}
                  onClick={() => handleDigit(n)}
                  disabled={loading}
                  className="aspect-square flex items-center justify-center rounded-xl bg-[#1c1b1b] hover:bg-[#2a2a2a] active:scale-95 transition-all group border border-white/5"
                >
                  <span className="font-headline text-3xl font-light group-hover:text-[#00FBFB] transition-colors text-[#e5e2e1]">
                    {n}
                  </span>
                </button>
              ))}
              {/* Row 4 */}
              <button
                onClick={handleBackspace}
                disabled={loading}
                className="aspect-square flex items-center justify-center rounded-xl text-[#e5e2e1]/30 hover:text-red-400 active:scale-95 transition-all"
              >
                <span className="text-2xl">⌫</span>
              </button>
              <button
                onClick={() => handleDigit('0')}
                disabled={loading}
                className="aspect-square flex items-center justify-center rounded-xl bg-[#1c1b1b] hover:bg-[#2a2a2a] active:scale-95 transition-all group border border-white/5"
              >
                <span className="font-headline text-3xl font-light group-hover:text-[#00FBFB] transition-colors text-[#e5e2e1]">
                  0
                </span>
              </button>
              <div className="aspect-square" /> {/* spacer */}
            </div>

            {/* Unlock button */}
            <div className="w-full max-w-xs">
              <button
                onClick={() => handleSubmit(digits.join(''))}
                disabled={!isComplete || loading}
                className="w-full py-5 rounded-xl bg-[#1c1b1b] flex items-center justify-center gap-3 active:scale-[0.98] transition-all border border-[#3a4a49]/40 group disabled:opacity-30"
                style={isComplete ? { boxShadow: '0 0 30px rgba(0,251,251,0.08)' } : undefined}
              >
                <span className="font-headline font-bold text-[#00FBFB] tracking-[0.4em] text-base">
                  {loading ? 'בודק...' : 'פתח'}
                </span>
                <span className="text-[#00FBFB] text-lg group-hover:translate-x-[-2px] transition-transform">🔓</span>
              </button>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
