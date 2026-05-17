'use client';

interface MapNextStepProps {
  stationNumber: number;
  navigationHint: string;
  triggerType: 'code' | 'qr' | 'gps';
  mapImageUrl?: string;
  onReady: () => void;
  onBack?: () => void;
}

export default function MapNextStep({ stationNumber, navigationHint, triggerType, mapImageUrl, onReady, onBack }: MapNextStepProps) {
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col items-center" dir="rtl">

      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#00FBFB]/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="w-9 h-9 rounded-full border border-[#3a4a49]/50 text-[#e5e2e1]/60 active:scale-95 transition-transform"
            >
              ←
            </button>
          )}
          <span className="font-headline tracking-[0.2em] text-sm font-bold text-[#00FBFB]">QUESTORY</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">תחנה {stationNumber}</span>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-md px-6 pt-10 pb-10 gap-8">

        {/* Label + title */}
        <div className="space-y-2 anim-fade-up">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#00FBFB]/70">הצעד הבא</p>
          <h1 className="font-headline text-4xl font-bold text-white leading-tight">
            לאן ממשיכים?
          </h1>
        </div>

        {/* Map — only shown when image provided */}
        {mapImageUrl && (
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#3a4a49]/40 anim-fade-up" style={{ animationDelay: '100ms' }}>
            <img src={mapImageUrl} alt="מפה" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-[#00FBFB]" style={{ boxShadow: '0 0 20px rgba(0,251,251,0.8)' }} />
                <div className="w-px h-8 bg-[#00FBFB]/60" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E]/60 to-transparent" />
          </div>
        )}

        {/* Navigation hint */}
        <div className="bg-[#131313] border border-[#00FBFB]/15 rounded-2xl p-5 space-y-3 anim-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2">
            <span className="text-[#00FBFB] text-base">🧭</span>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#00FBFB]/60">הנחיית ניווט</p>
          </div>
          <p className="text-[#e5e2e1]/80 text-base leading-relaxed">{navigationHint}</p>
        </div>

        {/* GPS button — only if geolocation trigger */}
        {triggerType === 'gps' && (
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-[#131313] border border-[#3a4a49]/50 rounded-xl py-4 text-[#e5e2e1]/60 text-sm active:scale-[0.98] transition-transform"
          >
            <span className="text-lg">📍</span>
            <span>פתח ניווט במפות</span>
          </a>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <div className="space-y-3 anim-scale-in" style={{ animationDelay: '200ms' }}>
          <button
            onClick={onReady}
            className="w-full bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] font-headline font-bold text-base tracking-[0.3em] uppercase py-5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            style={{ boxShadow: '0 0 20px rgba(0,251,251,0.07)' }}
          >
            <span>הגעתי — מוכן</span>
            <span>→</span>
          </button>
        </div>

      </main>
    </div>
  );
}
