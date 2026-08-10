'use client';

import { useState } from 'react';
import { StationDraft, MediaItem, MediaItemType, DataSource } from '@/types/builder';
import { ChallengeData } from '@/types/challenge';
import { normalizeDataSource } from '@/lib/normalization';
import { selectPrimaryHook, LogicalHook } from '@/lib/hookDetection';
import { buildChallengeFromTemplate, TemplateType } from '@/lib/challengeTemplates';
import ChallengeModal from './ChallengeModal';
import MediaUpload from './MediaUpload';

interface StationEditorProps {
  station: StationDraft;
  stationNumber: number;
  totalStations: number;
  gameDataSource?: DataSource;
  onUpdate: (updates: Partial<StationDraft>) => void;
  onRemove: () => void;
}

const inp = 'w-full bg-[#0a0a0a] border border-[#3a4a49]/60 rounded-xl px-4 py-3 text-[#e5e2e1] text-sm placeholder:text-[#e5e2e1]/20 focus:border-[#00FBFB]/50 outline-none transition-colors';
const lbl = 'block text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-2';
const card = 'space-y-5 bg-[#131313] border border-[#3a4a49]/30 rounded-2xl p-6';

const challengeTypeLabel: Record<string, string> = {
  cipher: 'צופן סמלים',
  cipherWheels: 'גלגלי צופן',
  clockPuzzle: 'שעון מסתורי',
  pattern: 'זיהוי דפוס',
  oddoneout: 'מי לא שייך',
  trivia: 'שאלת ידע',
  puzzle: 'פאזל תמונה',
  imagePuzzle: 'פאזל תמונה מוסתרת',
};

export default function StationEditor({ station, stationNumber, totalStations, gameDataSource, onUpdate, onRemove }: StationEditorProps) {
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showContentChallengeModal, setShowContentChallengeModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const updateHint = (i: number, val: string) => {
    const hints: [string, string, string] = [...station.hints] as [string, string, string];
    hints[i] = val;
    onUpdate({ hints });
  };

  const handleChallengeSave = (challenge: ChallengeData) => {
    onUpdate({ challenge, answer: challenge.solution });
    setShowChallengeModal(false);
  };

  // Content riddle helpers (second riddle — about the book's content, once physically found)
  const updateContentRiddle = (patch: Partial<NonNullable<StationDraft['contentRiddle']>>) => {
    onUpdate({
      contentRiddle: {
        task: '',
        answer: '',
        ...station.contentRiddle,
        ...patch,
      },
    });
  };

  const handleContentChallengeSave = (challenge: ChallengeData) => {
    updateContentRiddle({ challenge, answer: challenge.solution });
    setShowContentChallengeModal(false);
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

  const hookToTemplateType = (hook: LogicalHook): TemplateType => {
    const map: Record<LogicalHook, TemplateType> = {
      counting: 'trivia',
      pattern: 'pattern',
      oddness: 'oddoneout',
      sequence: 'pattern',
      letters: 'cipher',
      correlation: 'trivia',
      classification: 'oddoneout',
    };
    return map[hook] ?? 'trivia';
  };

  const handleGenerateFromTemplate = () => {
    if (!gameDataSource || gameDataSource.type !== 'manual') {
      alert('נא הגדר מקור נתונים ראשון במסך הגדרות המשחק');
      return;
    }
    const norm = normalizeDataSource(gameDataSource);
    const primaryHook = selectPrimaryHook(norm);
    const challengeType = primaryHook ? hookToTemplateType(primaryHook.type) : undefined;
    const challenge = buildChallengeFromTemplate(norm, { challengeType });
    if (!challenge) {
      alert('לא נמצאה תבנית מתאימה — נסו להוסיף חידה ידנית.');
      return;
    }
    onUpdate({ challenge, answer: challenge.solution });
  };

  const handleGenerateWithAI = async () => {
    if (!gameDataSource || gameDataSource.type !== 'manual') {
      alert('נא הגדר מקור נתונים ראשון במסך הגדרות המשחק');
      return;
    }
    if (!station.narrative.trim() || !station.task.trim()) {
      alert('נא למלא נרטיב ומשימה תחילה');
      return;
    }
    try {
      setIsGeneratingAI(true);
      const norm = normalizeDataSource(gameDataSource);
      const primaryHook = selectPrimaryHook(norm);
      const challengeType = primaryHook ? hookToTemplateType(primaryHook.type) : 'trivia';
      const res = await fetch('/api/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: norm, hook: primaryHook, template: { challengeType } }),
      });
      const data = await res.json();
      if (data.success && data.challenge) {
        const challenge = challengeFromAI(challengeType, data.challenge);
        onUpdate({ challenge, answer: challenge.solution });
      } else {
        alert('שגיאה ב-AI: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('שגיאה בתקשורת: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGeneratingAI(false);
    }
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

      {/* Book / destination details — shown to players on the book-reveal and arrival screens */}
      <div className={card}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60">פרטי הספר</p>
        <p className="text-[10px] text-[#e5e2e1]/25">
          מוצג לשחקנים במסכי &quot;הספר נחשף&quot; ו&quot;הגעתם לספר&quot;
        </p>
        <div>
          <label className={lbl}>שם הספר</label>
          <input
            className={inp}
            placeholder="הנסיך הקטן"
            value={station.book?.title ?? ''}
            onChange={e => onUpdate({ book: { ...station.book, title: e.target.value } })}
          />
        </div>
        <div>
          <label className={lbl}>מחבר — אופציונלי</label>
          <input
            className={inp}
            placeholder="אנטואן דה סנט-אכזופרי"
            value={station.book?.author ?? ''}
            onChange={e => onUpdate({ book: { title: station.book?.title ?? '', ...station.book, author: e.target.value } })}
          />
        </div>
        <div>
          <label className={lbl}>מיקום / מדף — אופציונלי</label>
          <input
            className={inp}
            placeholder="ספרות ילדים קלאסית, לפי שם מחבר: סנט-אכזופרי"
            value={station.book?.location ?? ''}
            onChange={e => onUpdate({ book: { title: station.book?.title ?? '', ...station.book, location: e.target.value } })}
          />
        </div>
      </div>

      {/* Step media */}
      <div className={card}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60 mb-4">מדיה לשלב</p>
        </div>

        <label className={lbl}>מדיה למשימה</label>
        <MediaUpload
          currentUrl={station.taskMedia?.url}
          currentType={station.taskMedia?.type}
          onMediaChange={(url, type) => {
            onUpdate({
              taskMedia: {
                type,
                url,
                caption: station.taskMedia?.caption || '',
              }
            });
          }}
          label="תמונה / וידאו / אודיו"
        />
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
          <div className="space-y-3">
            <p className="text-[#e5e2e1]/30 text-sm">אתגר אינטראקטיבי הוא אופציונלי — אפשר להשתמש בו במקום או בנוסף לשאלת הטקסט.</p>
            {gameDataSource?.type === 'manual' && (
              <>
                <button
                  onClick={handleGenerateFromTemplate}
                  className="w-full py-3 rounded-xl bg-[#00FBFB]/10 border border-[#00FBFB]/30 text-[#00FBFB] text-sm font-semibold hover:border-[#00FBFB]/60 hover:bg-[#00FBFB]/20 transition-colors"
                >
                  ⚡ צור מתבנית (מיידי)
                </button>
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="w-full py-3 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#c084fc] text-sm font-semibold hover:border-[#7c3aed]/60 hover:bg-[#7c3aed]/20 transition-colors disabled:opacity-50"
                >
                  {isGeneratingAI ? '⏳ מייצר עם AI...' : '🤖 צור עם AI (מותאם אישית)'}
                </button>
              </>
            )}
            <button
              onClick={() => setShowChallengeModal(true)}
              className="w-full py-3 rounded-xl border border-dashed border-[#3a4a49]/60 text-[#e5e2e1]/40 text-sm hover:border-[#00FBFB]/30 hover:text-[#00FBFB]/60 transition-colors"
            >
              + הוסף אתגר ידני
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

      {/* Content Riddle — second riddle, about the book's content, shown once the player physically finds it */}
      <div className={card}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60">חידה ב&apos; — תוכן הספר</p>
        <p className="text-[10px] text-[#e5e2e1]/25">
          מוצגת לשחקנים אחרי שהם מוצאים את הספר פיזית (אחרי חידה א&apos; ומסך ההגעה)
        </p>

        <div>
          <label className={lbl}>הוראה לשחקנים</label>
          <textarea
            className={inp + ' resize-none'}
            rows={3}
            placeholder="כשהספר בידיכם — ספרו את מספר המילים בשם הספר וכתבו את המספר..."
            value={station.contentRiddle?.task ?? ''}
            onChange={e => updateContentRiddle({ task: e.target.value })}
          />
        </div>

        <div>
          <label className={lbl}>מדיה — אופציונלי</label>
          <MediaUpload
            currentUrl={station.contentRiddle?.taskMedia?.url}
            currentType={station.contentRiddle?.taskMedia?.type}
            onMediaChange={(url, type) => updateContentRiddle({
              taskMedia: url ? { type, url, caption: station.contentRiddle?.taskMedia?.caption || '' } : undefined,
            })}
            label="תמונה / וידאו / אודיו"
          />
        </div>

        <div>
          <label className={lbl}>אתגר אינטראקטיבי — אופציונלי</label>
          {station.contentRiddle?.challenge ? (
            <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#3a4a49]/40 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm text-[#e5e2e1]/80 font-semibold">
                  {challengeTypeLabel[station.contentRiddle.challenge.type] ?? station.contentRiddle.challenge.type}
                </p>
                <p className="text-[10px] text-[#e5e2e1]/30 mt-0.5">פתרון: {station.contentRiddle.challenge.solution}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowContentChallengeModal(true)}
                  className="text-[#00FBFB] text-xs px-3 py-1.5 rounded-lg border border-[#00FBFB]/20 hover:border-[#00FBFB]/50 transition-colors"
                >
                  ערוך
                </button>
                <button
                  onClick={() => updateContentRiddle({ challenge: undefined })}
                  className="text-[#e5e2e1]/30 text-xs px-3 py-1.5 rounded-lg border border-[#3a4a49]/30 hover:border-red-500/40 hover:text-red-400 transition-colors"
                >
                  הסר
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowContentChallengeModal(true)}
              className="w-full py-3 rounded-xl border border-dashed border-[#3a4a49]/60 text-[#e5e2e1]/40 text-sm hover:border-[#00FBFB]/30 hover:text-[#00FBFB]/60 transition-colors"
            >
              + הוסף אתגר ידני
            </button>
          )}
        </div>

        <div>
          <label className={lbl}>תשובה נכונה</label>
          <input
            className={inp + ' text-lg font-mono tracking-wider'}
            placeholder="2"
            value={station.contentRiddle?.answer ?? ''}
            onChange={e => updateContentRiddle({ answer: e.target.value })}
          />
          <p className="text-[10px] text-[#e5e2e1]/25 mt-2">
            {station.contentRiddle?.challenge ? 'מועתק אוטומטית מהאתגר — ניתן לשנות ידנית' : 'מה השחקנים צריכים להקליד'}
          </p>
        </div>
      </div>

      {showContentChallengeModal && (
        <ChallengeModal
          initial={station.contentRiddle?.challenge}
          onSave={handleContentChallengeSave}
          onClose={() => setShowContentChallengeModal(false)}
        />
      )}

      {/* Transition Riddle */}
      <div className={card}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60">רמז מעבר לשלב הבא</p>
          <button
            onClick={() => onUpdate({
              transitionRiddle: {
                enabled: !station.transitionRiddle?.enabled,
                prompt: station.transitionRiddle?.prompt ?? '',
                answer: station.transitionRiddle?.answer,
              },
            })}
            className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
              station.transitionRiddle?.enabled
                ? 'border-[#00FBFB]/40 text-[#00FBFB] bg-[#1a2a2a]'
                : 'border-white/10 text-[#e5e2e1]/30'
            }`}
          >
            {station.transitionRiddle?.enabled ? 'מופעל' : 'כבוי'}
          </button>
        </div>
        <p className="text-[10px] text-[#e5e2e1]/25">רמז שמוצג לשחקנים אחרי שהשלב הזה הושלם — לפני שעוברים לשלב הבא</p>

        {station.transitionRiddle?.enabled && (
          <div className="space-y-4 pt-2">
            <div>
              <label className={lbl}>טקסט הרמז</label>
              <textarea
                className={inp + ' resize-none min-h-[80px]'}
                placeholder="הרמז הבא מוסתר ליד..."
                value={station.transitionRiddle?.prompt ?? ''}
                onChange={e => onUpdate({ transitionRiddle: { ...station.transitionRiddle!, prompt: e.target.value } })}
              />
            </div>
            <div>
              <label className={lbl}>תשובה נכונה (אופציונלי)</label>
              <input
                className={inp}
                placeholder="שם הספר / מיקום הבא..."
                value={station.transitionRiddle?.answer ?? ''}
                onChange={e => onUpdate({ transitionRiddle: { ...station.transitionRiddle!, answer: e.target.value || undefined } })}
              />
              <p className="text-[10px] text-[#e5e2e1]/25 mt-1">אפשר להפריד מספר תשובות עם | (כגון: ארנב|rabbit)</p>
            </div>
            <div>
              <label className={lbl}>מדיה לחידת המעבר — אופציונלי</label>
              <MediaUpload
                currentUrl={station.transitionRiddle?.media?.url}
                currentType={station.transitionRiddle?.media?.type}
                onMediaChange={(url, type) => onUpdate({
                  transitionRiddle: {
                    ...station.transitionRiddle!,
                    media: url ? { type, url, caption: '' } : undefined,
                  },
                })}
                label="תמונה / וידאו / אודיו"
              />
            </div>
          </div>
        )}
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

// ─── AI Challenge Converter ──────────────────────────────────────────────

function challengeFromAI(challengeType: string, aiChallenge: any): ChallengeData {
  if (challengeType === 'trivia') {
    return {
      type: 'trivia',
      question: aiChallenge.question,
      options: (aiChallenge.options || []).map((opt: any, i: number) => ({
        id: `opt-${i}`,
        text: typeof opt === 'string' ? opt : opt.text,
        isCorrect: opt.isCorrect || false,
      })),
      solution: aiChallenge.solution,
    };
  }

  if (challengeType === 'pattern') {
    const series = aiChallenge.series || ['_', '_', '_'];
    return {
      type: 'pattern',
      items: series.map((s: string) => s === '_' ? null : s),
      blankCount: series.filter((s: string) => s === '_').length,
      patternHint: aiChallenge.hints?.[0],
      solution: aiChallenge.solution,
    };
  }

  if (challengeType === 'oddoneout') {
    const items = aiChallenge.items || ['Item 1', 'Item 2', 'Item 3', aiChallenge.solution];
    return {
      type: 'oddoneout',
      items: items.map((item: string, i: number) => ({
        id: `item-${i}`,
        label: item,
        isOdd: item === aiChallenge.solution,
        digitContribution: item === aiChallenge.solution ? '1' : undefined,
      })),
      oddCount: 1,
      groupLabel: aiChallenge.question,
      solution: aiChallenge.solution,
    };
  }

  if (challengeType === 'cipher') {
    // Simplified cipher from AI response
    return {
      type: 'cipher',
      key: (aiChallenge.key || []).map((entry: any) => ({
        symbol: typeof entry === 'string' ? entry : entry.symbol,
        digit: typeof entry === 'string' ? entry : entry.digit,
      })),
      encodedMessage: (aiChallenge.encodedMessage || []).map((c: string) => c),
      solution: aiChallenge.solution,
    };
  }

  // Default fallback
  return {
    type: 'trivia',
    question: aiChallenge.question || 'What is the answer?',
    options: [{ id: '1', text: aiChallenge.solution, isCorrect: true }],
    solution: aiChallenge.solution || '',
  };
}
