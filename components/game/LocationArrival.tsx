'use client';

interface LocationArrivalProps {
  stationNumber: number;
  onContinue: () => void;
}

export default function LocationArrival({ stationNumber, onContinue }: LocationArrivalProps) {
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center justify-center px-6" dir="rtl">

      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00FBFB]/6 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#0E0E0E]/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#00FBFB]/30 flex items-center justify-center bg-[#131313]">
            <span className="text-[#00FBFB] text-sm font-bold font-headline">Q</span>
          </div>
          <span className="font-headline tracking-[0.2em] text-base font-bold text-[#00FBFB]">QUESTORY</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">
          תחנה {stationNumber}
        </span>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full gap-8 anim-fade-up">

        {/* Signal label */}
        <div className="flex items-center gap-3">
          <div className="h-px w-10 bg-[#00FBFB]/40" />
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">אות זוהה</p>
          <div className="h-px w-10 bg-[#00FBFB]/40" />
        </div>

        {/* Big title */}
        <div className="space-y-1">
          <h1 className="font-headline text-6xl font-bold tracking-tight text-white leading-none">
            הגעתם
          </h1>
          <h2
            className="font-headline text-5xl font-bold text-[#00FBFB] leading-none"
            style={{ textShadow: '0 0 30px rgba(0,251,251,0.5)' }}
          >
            {`לתחנה ${stationNumber}.`}
          </h2>
        </div>

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl bg-[#131313] border border-[#00FBFB]/20 flex items-center justify-center"
          style={{ boxShadow: '0 0 30px rgba(0,251,251,0.15)' }}
        >
          <span className="text-4xl">📍</span>
        </div>

        {/* Description */}
        <div className="bg-[#131313] border border-[#3a4a49]/50 rounded-2xl px-6 py-5">
          <p className="text-[#e5e2e1]/60 text-sm leading-relaxed">
            החידה הבאה נגלית לפניכם. קראו בעיון והכינו את עצמכם — ההרפתקה ממשיכה.
          </p>
        </div>

        {/* CTA */}
        <div className="w-full space-y-3 mt-2">
          <button
            onClick={onContinue}
            className="w-full bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-lg tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            style={{ boxShadow: '0 0 20px rgba(0,251,251,0.08)' }}
          >
            <span>המשיכו</span>
            <span className="text-base">→</span>
          </button>
          <button className="text-[#e5e2e1]/25 text-xs uppercase tracking-widest py-2">
            סרוק שוב
          </button>
        </div>
      </div>
    </div>
  );
}
