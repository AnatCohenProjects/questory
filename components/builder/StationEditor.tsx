'use client';

import { useState } from 'react';
import { StationDraft, MediaItem, MediaItemType } from '@/types/builder';
import { ChallengeData } from '@/types/challenge';
import ChallengeModal from './ChallengeModal';
import ImageUpload from './ImageUpload';

interface StationEditorProps {
  station: StationDraft;
  stationNumber: number;
  totalStations: number;
  onUpdate: (updates: Partial<StationDraft>) => void;
  onRemove: () => void;
}

const inp = 'w-full bg-[#0a0a0a] border border-[#3a4a49]/60 rounded-xl px-4 py-3 text-[#e5e2e1] text-sm placeholder:text-[#e5e2e1]/20 focus:border-[#00FBFB]/50 outline-none transition-colors';
const lbl = 'block text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-2';
const card = 'space-y-5 bg-[#131313] border border-[#3a4a49]/30 rounded-2xl p-6';

const challengeTypeLabel: Record<string, string> = {
  cipher: 'צופן סמלים',
  pattern: 'זיהוי דפוס',
  oddoneout: 'מי לא שייך',
  trivia: 'שאלת ידע',
};

export default function StationEditor({ station, stationNumber, totalStations, onUpdate, onRemove }: StationEditorProps) {
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  const updateHint = (i: number, val: string) => {
    const hints: [string, string, string] = [...station.hints] as [string, string, string];
    hints[i] = val;
    onUpdate({ hints });
  };

  const handleChallengeSave = (challenge: ChallengeData) => {
    onUpdate({ challenge, answer: challenge.solution });
    setShowChallengeModal(false);
  };

  // Media helpers
  const addMedia = (type: MediaItemType) => {
    const item: MediaItem = { id: Date.now().toString(), type, url: '', content: '', caption: '' };
    onUpdate({ media: [...station.media, item] });
  };

  const updateMedia = (id: string, updates: Partial<MediaItem>) => {
    onUpdate({ media: station.media.map(m => m.id === id ? { ...m, ...updates } : m) });
  };

  const removeMedia = (id: string) => {
    onUpdate({ media: station.media.filter(m => m.id !== id) });
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-10 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#00FBFB]/60 mb-1">
            שלב {String(stationNumber).padStart(2, '0')} מתוך {totalStations}
          </p>
          <h2 className="font-headline text-2xl font-bold text-white">
            {station.task || `שלב ${stationNumber}`}
          </h2>
        </div>
        {totalStations > 1 && (
          <button
            onClick={onRemove}
            className="text-[#e5e2e1]/25 text-xs hover:text-red-400 transition-colors mt-1"
          >
            מחק שלב
          </button>
        )}
      </div>

      {/* Trigger */}
      <div className={card}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60">כניסה לשלב <span className="text-red-400">*</span></p>
        <div>
          <label className={lbl}>סוג טריגר</label>
          <div className="flex gap-2">
            {(['code', 'qr', 'gps'] as const).map(t => (
              <button
                key={t}
                onClick={() => onUpdate({ triggerType: t })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  station.triggerType === t
                    ? 'bg-[#1a2a2a] border-[#00FBFB]/40 text-[#00FBFB]'
                    : 'border-[#3a4a49]/40 text-[#e5e2e1]/40 hover:border-[#3a4a49]/80'
                }`}
              >
                {t === 'code' ? 'קוד' : t === 'qr' ? 'QR' : 'GPS'}
              </button>
            ))}
          </div>
        </div>
        {station.triggerType === 'code' && (
          <div>
            <label className={lbl}>קוד כניסה</label>
            <input
              className={inp}
              placeholder="1234"
              value={station.triggerValue}
              onChange={e => onUpdate({ triggerValue: e.target.value })}
            />
          </div>
        )}
        <div>
          <label className={lbl}>הנחיית ניווט לשחקנים</label>
          <input
            className={inp}
            placeholder="פנו לספרייה. הקוד נמצא מודבק על דלת הכניסה."
            value={station.navigationHint}
            onChange={e => onUpdate({ navigationHint: e.target.value })}
          />
          <p className="text-[10px] text-[#e5e2e1]/25 mt-2">מוצג לשחקנים כשהם מחפשים את השלב</p>
        </div>
      </div>

      {/* Narrative + Task */}
      <div className={card}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60">תוכן</p>
        <div>
          <label className={lbl}>נרטיב — הסיפור <span className="text-red-400">*</span></label>
          <textarea
            className={inp + ' resize-none'}
            rows={3}
            placeholder="תארו את הסיפור של השלב הזה..."
            value={station.narrative}
            onChange={e => onUpdate({ narrative: e.target.value })}
          />
        </div>
        <div>
          <label className={lbl}>משימה — מה השחקנים צריכים לעשות <span className="text-red-400">*</span></label>
          <textarea
            className={inp + ' resize-none'}
            rows={3}
            placeholder="פתחו את הספר שלפניכם בעמוד הראשון — שם מודפסים שלושה סמלים..."
            value={station.task}
            onChange={e => onUpdate({ task: e.target.value })}
          />
        </div>
      </div>

      {/* Step media */}
      <div className={card}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60 mb-4">מדיה לשלב</p>
        </div>

        {/* Narrative Media */}
        <div className="mb-6">
          <label className={lbl}>תמונה — לנרטיב</label>
          <ImageUpload
            currentUrl={station.narrativeMedia?.url}
            onImageChange={(url) => {
              onUpdate({
                narrativeMedia: {
                  type: 'image',
                  url,
                  caption: station.narrativeMedia?.caption || '',
                }
              });
            }}
            label="תמונת סיפור"
          />
        </div>

        {/* Task Media */}
        <div>
          <label className={lbl}>תמונה — למשימה</label>
          <ImageUpload
            currentUrl={station.taskMedia?.url}
            onImageChange={(url) => {
              onUpdate({
                taskMedia: {
                  type: 'image',
                  url,
                  caption: station.taskMedia?.caption || '',
                }
              });
            }}
            label="תמונת משימה"
          />
        </div>
      </div>

      {/* Hints */}
      <div className={card}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60">רמזים — 3 שלבים <span className="text-red-400">*</span></p>
        {(['רמז ראשון — כיווני', 'רמז שני — מפרט יותר', 'רמז שלישי — כמעט גלוי'] as const).map((placeholder, i) => (
          <div key={i}>
            <label className={lbl}>רמז {i + 1}</label>
            <input
              className={inp}
              placeholder={placeholder}
              value={station.hints[i]}
              onChange={e => updateHint(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Challenge */}
      <div className={card}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60">אתגר אינטראקטיבי</p>
        {station.challenge ? (
          <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#3a4a49]/40 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm text-[#e5e2e1]/80 font-semibold">
                {challengeTypeLabel[station.challenge.type] ?? station.challenge.type}
              </p>
              <p className="text-[10px] text-[#e5e2e1]/30 mt-0.5">פתרון: {station.challenge.solution}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowChallengeModal(true)}
                className="text-[#00FBFB] text-xs px-3 py-1.5 rounded-lg border border-[#00FBFB]/20 hover:border-[#00FBFB]/50 transition-colors"
              >
                ערוך
              </button>
              <button
                onClick={() => onUpdate({ challenge: undefined })}
                className="text-[#e5e2e1]/30 text-xs px-3 py-1.5 rounded-lg border border-[#3a4a49]/30 hover:border-red-500/40 hover:text-red-400 transition-colors"
              >
                הסר
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[#e5e2e1]/30 text-sm mb-4">אתגר אינטראקטיבי הוא אופציונלי — אפשר להשתמש בו במקום או בנוסף לשאלת הטקסט.</p>
            <button
              onClick={() => setShowChallengeModal(true)}
              className="w-full py-3 rounded-xl border border-dashed border-[#3a4a49]/60 text-[#e5e2e1]/40 text-sm hover:border-[#00FBFB]/30 hover:text-[#00FBFB]/60 transition-colors"
            >
              + הוסף אתגר
            </button>
          </div>
        )}
      </div>

      {/* Answer */}
      <div className={card}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60">תשובה <span className="text-red-400">*</span></p>
        <div>
          <label className={lbl}>קוד תשובה נכון</label>
          <input
            className={inp + ' text-lg font-mono tracking-wider'}
            placeholder="742"
            value={station.answer}
            onChange={e => onUpdate({ answer: e.target.value })}
          />
          <p className="text-[10px] text-[#e5e2e1]/25 mt-2">
            {station.challenge ? 'מועתק אוטומטית מהאתגר — ניתן לשנות ידנית' : 'מה השחקנים צריכים להקליד כדי לפתוח את השלב'}
          </p>
        </div>
      </div>

      {showChallengeModal && (
        <ChallengeModal
          initial={station.challenge}
          onSave={handleChallengeSave}
          onClose={() => setShowChallengeModal(false)}
        />
      )}
    </div>
  );
}

// ─── Step media row ───────────────────────────────────────────────────────────

function StepMediaRow({ item, onUpdate, onRemove }: {
  item: MediaItem;
  onUpdate: (u: Partial<MediaItem>) => void;
  onRemove: () => void;
}) {
  const inp2 = 'flex-1 bg-[#0a0a0a] border border-[#3a4a49]/60 rounded-lg px-3 py-2 text-[#e5e2e1] text-sm placeholder:text-[#e5e2e1]/20 focus:border-[#00FBFB]/50 outline-none transition-colors';

  return (
    <div className="flex items-start gap-2 bg-[#0a0a0a] border border-[#3a4a49]/40 rounded-xl p-3">
      <span className="text-base mt-0.5 shrink-0">{mediaIcon(item.type)}</span>
      <div className="flex-1 space-y-2">
        {item.type === 'text' ? (
          <textarea
            className={inp2 + ' resize-none w-full'}
            rows={3}
            placeholder="טקסט..."
            value={item.content ?? ''}
            onChange={e => onUpdate({ content: e.target.value })}
          />
        ) : (
          <input
            className={inp2 + ' w-full'}
            placeholder={item.type === 'image' ? 'URL לתמונה' : item.type === 'video' ? 'URL לוידאו' : 'URL לאודיו'}
            value={item.url ?? ''}
            onChange={e => onUpdate({ url: e.target.value })}
          />
        )}
        <input
          className={inp2 + ' w-full text-xs'}
          placeholder="כיתוב (אופציונלי)"
          value={item.caption ?? ''}
          onChange={e => onUpdate({ caption: e.target.value })}
        />
      </div>
      <button onClick={onRemove} className="text-[#e5e2e1]/20 hover:text-red-400 transition-colors text-lg leading-none px-1 shrink-0">×</button>
    </div>
  );
}

function mediaIcon(type: MediaItemType): string {
  return { image: '🖼', video: '🎬', audio: '🎵', text: '📝' }[type];
}

function mediaLabel(type: MediaItemType): string {
  return { image: 'תמונה', video: 'וידאו', audio: 'אודיו', text: 'טקסט' }[type];
}
