'use client';

import { useState } from 'react';
import { ChallengeData, ChallengeType, CipherChallengeData, CipherWheelsChallengeData, ClockPuzzleChallengeData, PatternChallengeData, OddOneOutChallengeData, TriviaChallengeData, PuzzleChallengeData, ImagePuzzleChallengeData } from '@/types/challenge';
import { PUZZLE_TEMPLATES } from '@/types/template';
import { HEBREW_ALPHABET, encodeWord } from '@/lib/cipherWheels';
import MediaUpload from './MediaUpload';

interface ChallengeModalProps {
  initial?: ChallengeData;
  onSave: (challenge: ChallengeData) => void;
  onClose: () => void;
}

type Step = 'pick' | 'form';

export default function ChallengeModal({ initial, onSave, onClose }: ChallengeModalProps) {
  const [step, setStep] = useState<Step>(initial ? 'form' : 'pick');
  const [selectedType, setSelectedType] = useState<ChallengeType | null>(initial?.type ?? null);
  const [draft, setDraft] = useState<ChallengeData | null>(initial ?? null);

  const handlePickTemplate = (type: ChallengeType) => {
    setSelectedType(type);
    if (!draft || draft.type !== type) {
      setDraft(blankChallenge(type));
    }
    setStep('form');
  };

  const handleSave = () => {
    if (draft && isValid(draft)) onSave(draft);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl bg-[#131313] border border-[#3a4a49]/50 rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {step === 'form' && (
              <button
                onClick={() => setStep('pick')}
                className="text-[#e5e2e1]/40 text-sm hover:text-[#e5e2e1] transition-colors"
              >
                ← חזרה
              </button>
            )}
            <h3 className="font-headline font-bold text-white text-base">
              {step === 'pick' ? 'בחרו סוג אתגר' : templateName(selectedType)}
            </h3>
          </div>
          <button onClick={onClose} className="text-[#e5e2e1]/30 hover:text-[#e5e2e1] text-lg transition-colors">×</button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 'pick' ? (
            <TemplatePicker onPick={handlePickTemplate} />
          ) : selectedType && draft ? (
            <ChallengeForm
              type={selectedType}
              challenge={draft}
              onChange={setDraft}
            />
          ) : null}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="flex gap-3 px-6 py-4 border-t border-white/5">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#3a4a49]/40 text-[#e5e2e1]/50 text-sm hover:border-[#3a4a49]/80 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              disabled={!draft || !isValid(draft)}
              className="flex-1 py-3 rounded-xl bg-[#1a2a2a] border border-[#00FBFB]/30 text-[#00FBFB] text-sm font-semibold disabled:opacity-30 hover:border-[#00FBFB]/60 transition-colors"
            >
              שמור אתגר
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Template Picker ──────────────────────────────────────────────────────────

function TemplatePicker({ onPick }: { onPick: (type: ChallengeType) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PUZZLE_TEMPLATES.map(t => (
        <button
          key={t.templateId}
          onClick={() => onPick(t.challengeType)}
          className="flex flex-col gap-2 p-4 bg-[#0a0a0a] border border-[#3a4a49]/40 rounded-xl text-right hover:border-[#00FBFB]/30 hover:bg-[#0d1a1a] transition-colors"
        >
          <p className="font-semibold text-sm text-[#e5e2e1]">{t.name}</p>
          <p className="text-[11px] text-[#e5e2e1]/40 leading-relaxed">{t.description}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {t.difficultyLevels.map(d => (
              <span key={d} className="text-[9px] px-2 py-0.5 rounded-full bg-[#1a2a2a] text-[#00FBFB]/60 border border-[#00FBFB]/10">
                {d === 'easy' ? 'קל' : d === 'medium' ? 'בינוני' : 'מתקדם'}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Challenge Form Router ────────────────────────────────────────────────────

function ChallengeForm({ type, challenge, onChange }: {
  type: ChallengeType;
  challenge: ChallengeData;
  onChange: (c: ChallengeData) => void;
}) {
  if (type === 'cipher') return <CipherForm challenge={challenge as CipherChallengeData} onChange={onChange} />;
  if (type === 'cipherWheels') return <CipherWheelsForm challenge={challenge as CipherWheelsChallengeData} onChange={onChange} />;
  if (type === 'clockPuzzle') return <ClockPuzzleForm challenge={challenge as ClockPuzzleChallengeData} onChange={onChange} />;
  if (type === 'pattern') return <PatternForm challenge={challenge as PatternChallengeData} onChange={onChange} />;
  if (type === 'oddoneout') return <OddOneOutForm challenge={challenge as OddOneOutChallengeData} onChange={onChange} />;
  if (type === 'trivia') return <TriviaForm challenge={challenge as TriviaChallengeData} onChange={onChange} />;
  if (type === 'puzzle') return <PuzzleForm challenge={challenge as PuzzleChallengeData} onChange={onChange} />;
  if (type === 'imagePuzzle') return <ImagePuzzleForm challenge={challenge as ImagePuzzleChallengeData} onChange={onChange} />;
  return null;
}

// ─── Input helpers ────────────────────────────────────────────────────────────

const inp = 'w-full bg-[#0a0a0a] border border-[#3a4a49]/60 rounded-xl px-4 py-3 text-[#e5e2e1] text-sm placeholder:text-[#e5e2e1]/20 focus:border-[#00FBFB]/50 outline-none transition-colors';
const lbl = 'block text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-2';
const addBtn = 'text-[#00FBFB]/60 text-xs hover:text-[#00FBFB] transition-colors mt-2';
const removeBtn = 'text-[#e5e2e1]/20 hover:text-red-400 transition-colors text-sm leading-none px-2';

// ─── Cipher Form ──────────────────────────────────────────────────────────────

function CipherForm({ challenge, onChange }: { challenge: CipherChallengeData; onChange: (c: ChallengeData) => void }) {
  const updateKey = (i: number, field: 'symbol' | 'digit', val: string) => {
    const key = [...challenge.key];
    key[i] = { ...key[i], [field]: val };
    const solution = challenge.encodedMessage
      .map(sym => key.find(k => k.symbol === sym)?.digit ?? '')
      .join('');
    onChange({ ...challenge, key, solution });
  };

  const addKeyEntry = () => onChange({ ...challenge, key: [...challenge.key, { symbol: '', digit: '' }] });

  const removeKeyEntry = (i: number) => {
    const key = challenge.key.filter((_, idx) => idx !== i);
    onChange({ ...challenge, key });
  };

  const updateMessage = (raw: string) => {
    const encodedMessage = raw.split(',').map(s => s.trim()).filter(Boolean);
    const solution = encodedMessage
      .map(sym => challenge.key.find(k => k.symbol === sym)?.digit ?? '')
      .join('');
    onChange({ ...challenge, encodedMessage, solution });
  };

  return (
    <div className="space-y-6">
      {/* Key */}
      <div>
        <label className={lbl}>מפתח הצופן</label>
        <div className="space-y-2">
          {challenge.key.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={inp + ' text-center font-mono text-lg'}
                placeholder="★"
                maxLength={3}
                value={entry.symbol}
                onChange={e => updateKey(i, 'symbol', e.target.value)}
                style={{ width: 64, flexShrink: 0 }}
              />
              <span className="text-[#e5e2e1]/30 text-sm">→</span>
              <input
                className={inp + ' text-center font-mono'}
                placeholder="7"
                maxLength={2}
                value={entry.digit}
                onChange={e => updateKey(i, 'digit', e.target.value)}
                style={{ width: 64, flexShrink: 0 }}
              />
              <button onClick={() => removeKeyEntry(i)} className={removeBtn}>×</button>
            </div>
          ))}
        </div>
        <button onClick={addKeyEntry} className={addBtn}>+ הוסף סמל</button>
      </div>

      {/* Encoded message */}
      <div>
        <label className={lbl}>הודעה מוצפנת (סמלים מופרדים בפסיק)</label>
        <input
          className={inp + ' font-mono'}
          placeholder="★, ◆, ▲"
          value={challenge.encodedMessage.join(', ')}
          onChange={e => updateMessage(e.target.value)}
        />
        <p className="text-[10px] text-[#e5e2e1]/25 mt-2">הסמלים שהשחקנים יראו בסביבה, לפי הסדר</p>
      </div>

      {/* Solution preview */}
      <div className="bg-[#0a0a0a] rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">פתרון מחושב</span>
        <span className="font-mono font-bold text-[#00FBFB] tracking-widest">{challenge.solution || '—'}</span>
      </div>
    </div>
  );
}

// ─── Cipher Wheels Form ───────────────────────────────────────────────────────

const CIPHER_WHEELS_DEFAULT_INSTRUCTION = 'סובבו כל גלגלת כדי לחשוף את המילה המוצפנת';

function CipherWheelsForm({ challenge, onChange }: { challenge: CipherWheelsChallengeData; onChange: (c: ChallengeData) => void }) {
  const alphabet = challenge.alphabet?.length ? challenge.alphabet : HEBREW_ALPHABET;
  const shift = challenge.shift ?? 3;
  const direction = challenge.direction ?? 'forward';

  const recompute = (word: string, nextShift: number, nextDirection: 'forward' | 'backward') => {
    const cleanWord = Array.from(word).filter(ch => alphabet.includes(ch));
    const initialValues = encodeWord(cleanWord.join(''), nextShift, nextDirection, alphabet);
    onChange({
      ...challenge,
      solution: cleanWord.join(''),
      shift: nextShift,
      direction: nextDirection,
      alphabet,
      initialValues,
      wheelCount: initialValues.length,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={lbl}>הוראה לשחקנים — אופציונלי</label>
        <input
          className={inp}
          placeholder={CIPHER_WHEELS_DEFAULT_INSTRUCTION}
          value={challenge.instruction ?? ''}
          onChange={e => onChange({ ...challenge, instruction: e.target.value })}
        />
      </div>

      <div>
        <label className={lbl}>מילת המפתח המפוענחת</label>
        <input
          className={inp + ' text-center font-mono text-lg tracking-widest'}
          placeholder="אליס"
          dir="rtl"
          value={challenge.solution}
          onChange={e => recompute(e.target.value, shift, direction)}
        />
        <p className="text-[10px] text-[#e5e2e1]/25 mt-2">
          זו גם התשובה שהשחקנים יקלידו בשדה התשובה הרגיל אחרי שיפענחו את הגלגלות
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={lbl}>הזזה</label>
          <input
            type="number"
            min={1}
            max={alphabet.length - 1}
            className={inp + ' text-center font-mono'}
            value={shift}
            onChange={e => recompute(challenge.solution, Number(e.target.value) || 1, direction)}
          />
        </div>
        <div className="flex-1">
          <label className={lbl}>כיוון ההצפנה</label>
          <div className="flex gap-2">
            {(['forward', 'backward'] as const).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => recompute(challenge.solution, shift, d)}
                className={[
                  'flex-1 py-3 rounded-xl text-xs font-semibold border transition-colors',
                  direction === d
                    ? 'border-[#00FBFB]/60 bg-[#1a2a2a] text-[#00FBFB]'
                    : 'border-[#3a4a49]/40 bg-[#0a0a0a] text-[#e5e2e1]/50 hover:border-[#3a4a49]/70',
                ].join(' ')}
              >
                {d === 'forward' ? 'קדימה' : 'אחורה'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={challenge.enableTickSound !== false}
          onChange={e => onChange({ ...challenge, enableTickSound: e.target.checked })}
          className="accent-[#00FBFB]"
        />
        <span className="text-xs text-[#e5e2e1]/50">צליל טיק מכני בסיבוב</span>
      </label>

      <div className="bg-[#0a0a0a] rounded-xl px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">מצב התחלה מוצפן (מחושב אוטומטית)</span>
        </div>
        <p className="font-mono font-bold text-[#00FBFB] tracking-widest text-center text-lg" dir="rtl">
          {challenge.initialValues?.length ? challenge.initialValues.join(' ') : '—'}
        </p>
        <p className="text-[10px] text-[#e5e2e1]/25 text-center">
          זה מה שהשחקנים רואים בגלגלות בתחילת האתגר — הם יסובבו {shift} צעדים {direction === 'forward' ? 'אחורה' : 'קדימה'} כדי לפענח
        </p>
      </div>
    </div>
  );
}

// ─── Clock Puzzle Form ────────────────────────────────────────────────────────

const CLOCK_PUZZLE_DEFAULT_INSTRUCTION = 'כוונו את מחוגי השעון לפי הרמז';
const CLOCK_HOURS = Array.from({ length: 12 }, (_, i) => i + 1);

function clockPreviewAngle(hour: number, minute: number, snapMinutes: number) {
  const hourIdx = hour % 12;
  const minuteIdx = Math.round(minute / snapMinutes) % (60 / snapMinutes);
  return { hourAngle: hourIdx * 30, minuteAngle: minuteIdx * 30 };
}

function ClockPuzzlePreview({ hour, minute, snapMinutes }: { hour: number; minute: number; snapMinutes: number }) {
  const { hourAngle, minuteAngle } = clockPreviewAngle(hour, minute, snapMinutes);
  return (
    <div className="relative w-24 h-24 shrink-0" aria-hidden="true">
      <img src="/images/clock-face.png" alt="" className="absolute inset-0 w-full h-full object-contain" />
      <div
        style={{
          position: 'absolute', left: '50%', top: '50%',
          height: '32%', width: 'auto', aspectRatio: '87 / 345',
          transformOrigin: '50% 91.45%',
          transform: `translate(-50%, -91.45%) rotate(${hourAngle}deg)`,
        }}
      >
        <img src="/images/clock-hour-hand.png" alt="" className="w-full h-full" />
      </div>
      <div
        style={{
          position: 'absolute', left: '50%', top: '50%',
          height: '46%', width: 'auto', aspectRatio: '92 / 499',
          transformOrigin: '50% 94.89%',
          transform: `translate(-50%, -94.89%) rotate(${minuteAngle}deg)`,
        }}
      >
        <img src="/images/clock-minute-hand.png" alt="" className="w-full h-full" />
      </div>
    </div>
  );
}

function ClockPuzzleForm({ challenge, onChange }: { challenge: ClockPuzzleChallengeData; onChange: (c: ChallengeData) => void }) {
  const snapMinutes = challenge.snapMinutes ?? 5;
  const minuteOptions = Array.from({ length: 60 / snapMinutes }, (_, i) => i * snapMinutes);

  return (
    <div className="space-y-5">
      <div>
        <label className={lbl}>הוראה לשחקנים</label>
        <input
          className={inp}
          placeholder={CLOCK_PUZZLE_DEFAULT_INSTRUCTION}
          value={challenge.instruction ?? ''}
          onChange={e => onChange({ ...challenge, instruction: e.target.value })}
        />
      </div>

      <div>
        <label className={lbl}>רמז — כיצד לחשב את השעה הנכונה</label>
        <textarea
          className={inp + ' resize-none'}
          rows={3}
          placeholder="המחוג הקצר: ... המחוג הארוך: ..."
          value={challenge.clue ?? ''}
          onChange={e => onChange({ ...challenge, clue: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-3">
          <div>
            <label className={lbl}>שעת פתרון</label>
            <select
              className={inp}
              value={challenge.targetHour}
              onChange={e => onChange({ ...challenge, targetHour: Number(e.target.value) })}
            >
              {CLOCK_HOURS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>דקת פתרון</label>
            <select
              className={inp}
              value={challenge.targetMinute}
              onChange={e => onChange({ ...challenge, targetMinute: Number(e.target.value) })}
            >
              {minuteOptions.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
            </select>
          </div>
        </div>
        <ClockPuzzlePreview hour={challenge.targetHour} minute={challenge.targetMinute} snapMinutes={snapMinutes} />
      </div>

      <div>
        <label className={lbl}>מילת מפתח שנחשפת עם הפתרון</label>
        <input
          className={inp + ' text-center font-mono text-lg tracking-widest'}
          placeholder="הארי"
          dir="rtl"
          value={challenge.solution}
          onChange={e => onChange({ ...challenge, solution: e.target.value })}
        />
        <p className="text-[10px] text-[#e5e2e1]/25 mt-2">
          זו גם התשובה שהשחקנים יקלידו בשדה התשובה הרגיל אחרי שיכוונו את השעון נכון
        </p>
      </div>
    </div>
  );
}

// ─── Pattern Form ─────────────────────────────────────────────────────────────

function PatternForm({ challenge, onChange }: { challenge: PatternChallengeData; onChange: (c: ChallengeData) => void }) {
  const itemsStr = challenge.items.map(v => v === null ? '_' : String(v)).join(', ');

  const updateItems = (raw: string) => {
    if (!raw.trim()) { onChange({ ...challenge, items: [], blankCount: 0 }); return; }
    const parts = raw.split(',').map(s => s.trim());
    const items: (number | string | null)[] = parts.map(p => {
      if (p === '_' || p === '') return null;
      const n = Number(p);
      return isNaN(n) ? p : n;
    });
    const blankCount = items.filter(v => v === null).length;
    onChange({ ...challenge, items, blankCount });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={lbl}>סדרה (השתמשו ב _ לתאים ריקים)</label>
        <input
          className={inp + ' font-mono'}
          placeholder="2, 4, 8, _, 32, _"
          value={itemsStr}
          onChange={e => updateItems(e.target.value)}
        />
        <p className="text-[10px] text-[#e5e2e1]/25 mt-2">
          ריקים: {challenge.blankCount}
        </p>
      </div>
      <div>
        <label className={lbl}>רמז לדפוס</label>
        <input
          className={inp}
          placeholder="כל מספר כפול בשניים"
          value={challenge.patternHint ?? ''}
          onChange={e => onChange({ ...challenge, patternHint: e.target.value })}
        />
      </div>
      <div>
        <label className={lbl}>פתרון (ערכי הריקים, מופרדים ברווח)</label>
        <input
          className={inp + ' font-mono'}
          placeholder="16 64"
          value={challenge.solution}
          onChange={e => onChange({ ...challenge, solution: e.target.value })}
        />
        <p className="text-[10px] text-[#e5e2e1]/25 mt-2">מה שהשחקנים יקלידו — כל ערך מופרד ברווח</p>
      </div>
    </div>
  );
}

// ─── OddOneOut Form ───────────────────────────────────────────────────────────

function OddOneOutForm({ challenge, onChange }: { challenge: OddOneOutChallengeData; onChange: (c: ChallengeData) => void }) {
  const updateItem = (i: number, field: string, val: string | boolean) => {
    const items = challenge.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    const solution = items
      .filter(it => it.isOdd && it.digitContribution)
      .map(it => it.digitContribution!)
      .join('');
    onChange({ ...challenge, items, solution, oddCount: items.filter(i => i.isOdd).length || 1 });
  };

  const addItem = () => {
    const items = [...challenge.items, { id: String(Date.now()), label: '', isOdd: false }];
    onChange({ ...challenge, items });
  };

  const removeItem = (i: number) => {
    const items = challenge.items.filter((_, idx) => idx !== i);
    onChange({ ...challenge, items });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={lbl}>תווית הקבוצה</label>
        <input
          className={inp}
          placeholder="מי לא שייך לקבוצה?"
          value={challenge.groupLabel ?? ''}
          onChange={e => onChange({ ...challenge, groupLabel: e.target.value })}
        />
      </div>

      <div>
        <label className={lbl}>פריטים</label>
        <div className="space-y-2">
          {challenge.items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                className={inp}
                placeholder={`פריט ${i + 1}`}
                value={item.label}
                onChange={e => updateItem(i, 'label', e.target.value)}
              />
              <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isOdd}
                  onChange={e => updateItem(i, 'isOdd', e.target.checked)}
                  className="accent-[#00FBFB]"
                />
                <span className="text-xs text-[#e5e2e1]/40 whitespace-nowrap">חריג</span>
              </label>
              {item.isOdd && (
                <input
                  className="w-16 shrink-0 bg-[#0a0a0a] border border-[#00FBFB]/30 rounded-xl px-3 py-3 text-[#00FBFB] text-sm text-center font-mono outline-none focus:border-[#00FBFB]/60"
                  placeholder="3"
                  maxLength={3}
                  value={item.digitContribution ?? ''}
                  onChange={e => updateItem(i, 'digitContribution', e.target.value)}
                />
              )}
              <button onClick={() => removeItem(i)} className={removeBtn}>×</button>
            </div>
          ))}
        </div>
        <button onClick={addItem} className={addBtn}>+ הוסף פריט</button>
      </div>

      <div className="bg-[#0a0a0a] rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/30">פתרון</span>
        <span className="font-mono font-bold text-[#00FBFB] tracking-widest">{challenge.solution || '—'}</span>
      </div>
    </div>
  );
}

// ─── Trivia Form ──────────────────────────────────────────────────────────────

function TriviaForm({ challenge, onChange }: { challenge: TriviaChallengeData; onChange: (c: ChallengeData) => void }) {
  const updateOption = (i: number, field: string, val: string | boolean) => {
    const options = challenge.options.map((opt, idx) =>
      idx === i
        ? { ...opt, [field]: val, ...(field === 'isCorrect' && val ? {} : {}) }
        : field === 'isCorrect' && val ? { ...opt, isCorrect: false } : opt
    );
    onChange({ ...challenge, options });
  };

  const addOption = () => {
    const options = [...challenge.options, { id: String(Date.now()), text: '', isCorrect: false }];
    onChange({ ...challenge, options });
  };

  const removeOption = (i: number) => {
    const options = challenge.options.filter((_, idx) => idx !== i);
    onChange({ ...challenge, options });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={lbl}>שאלה</label>
        <textarea
          className={inp + ' resize-none'}
          rows={2}
          placeholder="מי מהגופים האלה אינו כוכב לכת?"
          value={challenge.question}
          onChange={e => onChange({ ...challenge, question: e.target.value })}
        />
      </div>

      <div>
        <label className={lbl}>תשובות אפשריות</label>
        <p className="text-[10px] text-[#e5e2e1]/25 mb-3">סמנו את התשובה הנכונה</p>
        <div className="space-y-2">
          {challenge.options.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                <input
                  type="radio"
                  name="correct-option"
                  checked={opt.isCorrect}
                  onChange={() => updateOption(i, 'isCorrect', true)}
                  className="accent-[#00FBFB]"
                />
                <span className="text-xs text-[#e5e2e1]/40">נכון</span>
              </label>
              <input
                className={inp}
                placeholder={`תשובה ${i + 1}`}
                value={opt.text}
                onChange={e => updateOption(i, 'text', e.target.value)}
              />
              <button onClick={() => removeOption(i)} className={removeBtn}>×</button>
            </div>
          ))}
        </div>
        <button onClick={addOption} className={addBtn}>+ הוסף תשובה</button>
      </div>

      <div>
        <label className={lbl}>פתרון — קוד שנחשף אחרי תשובה נכונה</label>
        <input
          className={inp + ' font-mono'}
          placeholder="3"
          value={challenge.solution}
          onChange={e => onChange({ ...challenge, solution: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─── Puzzle Form ──────────────────────────────────────────────────────────────

const PIECE_PRESETS = [
  { label: 'קל', grid: '2×2', pieces: 4 as const },
  { label: 'בינוני', grid: '3×3', pieces: 9 as const },
  { label: 'מתקדם', grid: '4×4', pieces: 16 as const },
];

function PuzzleForm({ challenge, onChange }: { challenge: PuzzleChallengeData; onChange: (c: ChallengeData) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className={lbl}>הוראה לשחקנים — אופציונלי</label>
        <input
          className={inp}
          placeholder="הרכיבו את התמונה כדי לגלות איזה ספר עליכם למצוא"
          value={challenge.instruction ?? ''}
          onChange={e => onChange({ ...challenge, instruction: e.target.value })}
        />
      </div>

      <div>
        <label className={lbl}>תמונת פאזל</label>
        <MediaUpload
          currentUrl={challenge.imageUrl}
          currentType="image"
          onMediaChange={(url) => onChange({ ...challenge, imageUrl: url, solution: url ? 'solved' : '' })}
          label="תמונה"
          accept={['image']}
        />
      </div>

      <div>
        <label className={lbl}>רמת קושי</label>
        <div className="flex gap-2">
          {PIECE_PRESETS.map(p => (
            <button
              key={p.pieces}
              type="button"
              onClick={() => onChange({ ...challenge, pieceCount: p.pieces })}
              className={[
                'flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors',
                challenge.pieceCount === p.pieces
                  ? 'border-[#00FBFB]/60 bg-[#1a2a2a] text-[#00FBFB]'
                  : 'border-[#3a4a49]/40 bg-[#0a0a0a] text-[#e5e2e1]/50 hover:border-[#3a4a49]/70',
              ].join(' ')}
            >
              <span className="block">{p.label}</span>
              <span className="text-[10px] opacity-60">{p.grid}</span>
            </button>
          ))}
        </div>
      </div>

      {challenge.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-[#3a4a49]/30 bg-[#0a0a0a]">
          <img src={challenge.imageUrl} alt="" className="w-full max-h-40 object-contain" />
          <p className="text-[10px] text-center text-[#e5e2e1]/30 py-2">
            תצוגה מקדימה — התמונה תפוצל ל-{challenge.pieceCount} חלקים
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Image Puzzle Form ────────────────────────────────────────────────────────

const IMAGE_PUZZLE_DEFAULT_INSTRUCTION = 'הרכיבו את חלקי התמונה כדי לגלות מה מסתתר בה';

const IMAGE_PUZZLE_PRESETS = [
  { label: 'קל', pieces: 6 as const },
  { label: 'בינוני', pieces: 9 as const },
  { label: 'קשה', pieces: 12 as const },
];

function ImagePuzzleForm({ challenge, onChange }: { challenge: ImagePuzzleChallengeData; onChange: (c: ChallengeData) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className={lbl}>הוראה לשחקנים</label>
        <input
          className={inp}
          placeholder={IMAGE_PUZZLE_DEFAULT_INSTRUCTION}
          value={challenge.instruction ?? ''}
          onChange={e => onChange({ ...challenge, instruction: e.target.value })}
        />
      </div>

      <div>
        <label className={lbl}>תמונת פאזל</label>
        <MediaUpload
          currentUrl={challenge.imageUrl}
          currentType="image"
          onMediaChange={(url) => onChange({ ...challenge, imageUrl: url, solution: url ? 'solved' : '' })}
          label="תמונה"
          accept={['image']}
        />
        <p className="text-[10px] text-[#e5e2e1]/25 mt-2">
          התמונה המלאה מוצגת כאן לצורך בדיקה בלבד. השחקנים לא יראו אותה לפני שיפתרו את הפאזל.
        </p>
      </div>

      <div>
        <label className={lbl}>רמת קושי</label>
        <div className="flex gap-2">
          {IMAGE_PUZZLE_PRESETS.map(p => (
            <button
              key={p.pieces}
              type="button"
              onClick={() => onChange({ ...challenge, pieceCount: p.pieces })}
              className={[
                'flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors',
                challenge.pieceCount === p.pieces
                  ? 'border-[#00FBFB]/60 bg-[#1a2a2a] text-[#00FBFB]'
                  : 'border-[#3a4a49]/40 bg-[#0a0a0a] text-[#e5e2e1]/50 hover:border-[#3a4a49]/70',
              ].join(' ')}
            >
              <span className="block">{p.label}</span>
              <span className="text-[10px] opacity-60">{p.pieces} חלקים</span>
            </button>
          ))}
        </div>
      </div>

      {challenge.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-[#3a4a49]/30 bg-[#0a0a0a]">
          <img src={challenge.imageUrl} alt="" className="w-full max-h-40 object-contain" />
          <p className="text-[10px] text-center text-[#e5e2e1]/30 py-2">
            תצוגה מקדימה ליוצר, התמונה תפוצל ל-{challenge.pieceCount} חלקים
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blankChallenge(type: ChallengeType): ChallengeData {
  switch (type) {
    case 'cipher':
      return { type: 'cipher', key: [{ symbol: '', digit: '' }], encodedMessage: [], solution: '' };
    case 'cipherWheels':
      return {
        type: 'cipherWheels',
        alphabet: HEBREW_ALPHABET,
        initialValues: [],
        wheelCount: 0,
        shift: 3,
        direction: 'forward',
        instruction: CIPHER_WHEELS_DEFAULT_INSTRUCTION,
        theme: 'antique',
        enableTickSound: true,
        solution: '',
      };
    case 'clockPuzzle':
      return {
        type: 'clockPuzzle',
        instruction: CLOCK_PUZZLE_DEFAULT_INSTRUCTION,
        clue: '',
        targetHour: 12,
        targetMinute: 0,
        snapMinutes: 5,
        solution: '',
      };
    case 'pattern':
      return { type: 'pattern', items: [], blankCount: 0, solution: '' };
    case 'oddoneout':
      return { type: 'oddoneout', groupLabel: '', items: [
        { id: '1', label: '', isOdd: false },
        { id: '2', label: '', isOdd: false },
        { id: '3', label: '', isOdd: false },
      ], oddCount: 1, solution: '' };
    case 'trivia':
      return { type: 'trivia', question: '', options: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
      ], solution: '' };
    case 'puzzle':
      return { type: 'puzzle', imageUrl: '', pieceCount: 9, instruction: '', solution: '' };
    case 'imagePuzzle':
      // 12 defaults to a rows×cols grid that adapts to the image's aspect ratio (3x4/4x3),
      // unlike 9 which is always a square 3x3 — better fit for non-square covers.
      return { type: 'imagePuzzle', imageUrl: '', pieceCount: 12, instruction: IMAGE_PUZZLE_DEFAULT_INSTRUCTION, solution: '' };
    default:
      return { type: 'cipher', key: [], encodedMessage: [], solution: '' };
  }
}

function templateName(type: ChallengeType | null): string {
  const map: Record<string, string> = {
    cipher: 'צופן סמלים',
    cipherWheels: 'גלגלי צופן',
    clockPuzzle: 'שעון מסתורי',
    pattern: 'זיהוי דפוס',
    oddoneout: 'מי לא שייך',
    trivia: 'שאלת ידע',
    puzzle: 'פאזל תמונה',
    imagePuzzle: 'פאזל תמונה מוסתרת',
  };
  return type ? (map[type] ?? type) : 'אתגר';
}

function isValid(c: ChallengeData): boolean {
  if (!c.solution) return false;
  if (c.type === 'cipher') return c.key.length > 0 && c.encodedMessage.length > 0;
  if (c.type === 'cipherWheels') return c.initialValues.length > 0;
  if (c.type === 'clockPuzzle') return c.solution.trim().length > 0;
  if (c.type === 'pattern') return c.items.length > 0;
  if (c.type === 'oddoneout') return c.items.some(i => i.isOdd);
  if (c.type === 'trivia') return c.question.length > 0 && c.options.some(o => o.isCorrect);
  if (c.type === 'puzzle') return c.imageUrl.length > 0;
  if (c.type === 'imagePuzzle') return c.imageUrl.length > 0;
  return true;
}
