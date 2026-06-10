'use client';

import { useState } from 'react';
import {
  GameDraft, MediaItem, MediaItemType, DataSource,
  EXPERIENCE_STYLE_LABELS, ExperienceStyle, GameType,
  AUDIENCE_OPTIONS, DURATION_OPTIONS, DIFFICULTY_OPTIONS, PROGRESSION_OPTIONS,
  getAutoConfigForStyle,
} from '@/types/builder';
import { GAME_TYPE_PRESETS } from '@/lib/gameTypePresets';
import ImageUpload from './ImageUpload';
import DataSourceSelector from './DataSourceSelector';
import AutoConfigEditor from './AutoConfigEditor';

interface GameMetaFormProps {
  draft: GameDraft;
  onUpdate: (updates: Partial<GameDraft>) => void;
}

const inp = 'w-full bg-[#0a0a0a] border border-[#3a4a49]/60 rounded-xl px-4 py-3 text-[#e5e2e1] text-sm placeholder:text-[#e5e2e1]/20 focus:border-[#00FBFB]/50 outline-none transition-colors';
const lbl = 'block text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-2';
const card = 'space-y-5 bg-[#131313] border border-[#3a4a49]/30 rounded-2xl p-6';

type InlineModal = 'style' | 'duration' | 'audience' | 'difficulty' | 'progression' | null;

export default function GameMetaForm({ draft, onUpdate }: GameMetaFormProps) {
  const [openModal, setOpenModal] = useState<InlineModal>(null);

  const toggle = (key: InlineModal) => setOpenModal(prev => prev === key ? null : key);

  return (
    <div className="max-w-2xl mx-auto px-8 py-10 space-y-6" onClick={() => setOpenModal(null)}>

      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#00FBFB]/60 mb-1">הגדרות</p>
        <h2 className="font-headline text-2xl font-bold text-white">המשחק שלך</h2>
      </div>

      {/* ── Game Type ─────────────────────────────────────────────────────── */}
      <div className="bg-[#131313] border border-[#3a4a49]/30 rounded-2xl p-6 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60 mb-0.5">סוג הפעילות</p>
          <p className="text-xs text-[#e5e2e1]/30">קובע ברירות מחדל של שפה ועיצוב</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(GAME_TYPE_PRESETS) as [GameType, typeof GAME_TYPE_PRESETS[GameType]][]).map(([val, preset]) => (
            <button
              key={val}
              onClick={e => { e.stopPropagation(); onUpdate({ gameType: val, ...preset.draftDefaults }); }}
              className={`flex flex-col gap-1.5 p-4 rounded-xl border text-right transition-all ${
                (draft.gameType ?? 'urban') === val
                  ? 'border-[#00FBFB]/50 bg-[#1a2a2a] text-[#00FBFB]'
                  : 'border-[#3a4a49]/40 text-[#e5e2e1]/50 hover:border-[#3a4a49]/80 hover:text-[#e5e2e1]/80'
              }`}
            >
              <span className="text-2xl">{preset.icon}</span>
              <span className="text-sm font-semibold leading-tight">{preset.label}</span>
              <span className="text-[10px] opacity-60 leading-tight">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Step 1: Experience Style (primary selector) ───────────────────── */}
      <div className="bg-[#131313] border border-[#3a4a49]/30 rounded-2xl p-6 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60 mb-0.5">שלב 1 — סוג המשחק</p>
          <p className="text-xs text-[#e5e2e1]/30">בחרו סגנון — הוא ישנה אוטומטית את כל הפרמטרים שלהלן</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(EXPERIENCE_STYLE_LABELS) as [ExperienceStyle, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => {
                const autoConfig = getAutoConfigForStyle(val);
                onUpdate({ experienceStyle: val, ...autoConfig });
              }}
              className={`flex flex-col gap-1.5 p-4 rounded-xl border text-right transition-all ${
                draft.experienceStyle === val
                  ? 'border-[#00FBFB]/50 bg-[#1a2a2a] text-[#00FBFB]'
                  : 'border-[#3a4a49]/40 text-[#e5e2e1]/50 hover:border-[#3a4a49]/80 hover:text-[#e5e2e1]/80'
              }`}
            >
              <span className="text-2xl">{label.split(' ')[0]}</span>
              <span className="text-sm font-semibold leading-tight">{label.substring(label.indexOf(' ') + 1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Auto-config display ──────────────────────────────────────────── */}
      <AutoConfigEditor draft={draft} onUpdate={onUpdate} />

      {/* ── Step 2: Secondary settings (labeled dropdowns) ───────────────── */}
      <div className="bg-[#131313] border border-[#3a4a49]/30 rounded-2xl p-6 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60 mb-0.5">שלב 2 — פרמטרי החוויה</p>
          <p className="text-xs text-[#e5e2e1]/30">ניתן לשנות כל פרמטר בנפרד</p>
        </div>
        <div className="grid grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>

          <LabeledDropdown
            label="משך"
            value={draft.duration}
            options={DURATION_OPTIONS.map(v => ({ value: v, label: v }))}
            isOpen={openModal === 'duration'}
            onToggle={() => toggle('duration')}
            onSelect={v => { onUpdate({ duration: v }); setOpenModal(null); }}
          />

          <LabeledDropdown
            label="קהל יעד"
            value={draft.audience}
            options={AUDIENCE_OPTIONS.map(v => ({ value: v, label: v }))}
            isOpen={openModal === 'audience'}
            onToggle={() => toggle('audience')}
            onSelect={v => { onUpdate({ audience: v }); setOpenModal(null); }}
          />

          <LabeledDropdown
            label="רמת קושי"
            value={draft.difficulty}
            options={DIFFICULTY_OPTIONS.map(v => ({ value: v, label: v }))}
            isOpen={openModal === 'difficulty'}
            onToggle={() => toggle('difficulty')}
            onSelect={v => { onUpdate({ difficulty: v }); setOpenModal(null); }}
          />

          <LabeledDropdown
            label="מבנה התקדמות"
            value={draft.progressionType}
            options={PROGRESSION_OPTIONS.map(v => ({ value: v, label: v }))}
            isOpen={openModal === 'progression'}
            onToggle={() => toggle('progression')}
            onSelect={v => { onUpdate({ progressionType: v }); setOpenModal(null); }}
          />
        </div>
      </div>

      {/* ── Name + Story ──────────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <label className={lbl}>שם המשחק</label>
          <input
            className={inp}
            placeholder="מסתורין של הכוכב האבוד"
            value={draft.title}
            onChange={e => onUpdate({ title: e.target.value })}
          />
        </div>
        <div>
          <label className={lbl}>סיפור / תיאור</label>
          <textarea
            className={inp + ' resize-none'}
            rows={4}
            placeholder="תארו את הסיפור שמניע את המשחק..."
            value={draft.story}
            onChange={e => onUpdate({ story: e.target.value })}
          />
        </div>
        <div>
          <label className={lbl}>תמונה ראשית</label>
          <ImageUpload
            currentUrl={draft.media?.[0]?.url}
            onImageChange={(url) => {
              const newMedia = draft.media || [];
              if (newMedia[0]) {
                newMedia[0] = { ...newMedia[0], url };
              } else {
                newMedia[0] = { id: 'game-hero', type: 'image', url, caption: '' };
              }
              onUpdate({ media: newMedia });
            }}
            label="תמונת כותרת"
          />
        </div>
      </div>

      {/* ── Experience-level media ────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60 mb-1">מדיה — רמת החוויה</p>
          <p className="text-xs text-[#e5e2e1]/30 mb-4">תמונה, וידאו, אודיו או טקסט שייצגו את החוויה כולה — נרטיב פתיחה, אווירה, מוזיקה</p>
        </div>
        <MediaGallery
          items={draft.media}
          onChange={media => onUpdate({ media })}
        />
      </div>

      {/* ── Map ──────────────────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60 mb-1">מפה</p>
          <p className="text-xs text-[#e5e2e1]/30 mb-4">העלו מפה של החוויה — לניווט, הקשר מרחבי, או חוויות מבוססות מפה בעתיד</p>
        </div>
        <ImageUpload
          currentUrl={draft.mapMedia?.url}
          onImageChange={(url) => {
            onUpdate({ mapMedia: { type: 'image', url, caption: '' } });
          }}
          label="העלאת מפה"
        />
      </div>

      {/* ── Data Source (Game-level) ──────────────────────────────────────── */}
      <DataSourceSelector
        current={draft.dataSource}
        onSelect={(source: DataSource) => onUpdate({ dataSource: source })}
      />

      {/* ── AI Character ─────────────────────────────────────────────────── */}
      <div className={card}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60 mb-1">דמות AI — המדריך</p>
        <div>
          <label className={lbl}>שם הדמות</label>
          <input
            className={inp}
            placeholder="פרופסור קווסטו"
            value={draft.character.name}
            onChange={e => onUpdate({ character: { ...draft.character, name: e.target.value } })}
          />
        </div>
        <div>
          <label className={lbl}>סגנון דיבור / אופי</label>
          <textarea
            className={inp + ' resize-none'}
            rows={3}
            placeholder="מסתורי, נלהב, אוהב חידות. משתמש בשפה עשירה אך ברורה. מעודד ולא מגלה יותר מדי."
            value={draft.character.tone}
            onChange={e => onUpdate({ character: { ...draft.character, tone: e.target.value } })}
          />
          <p className="text-[10px] text-[#e5e2e1]/25 mt-2">הוראות אופי לדמות AI שתענה לשחקנים</p>
        </div>
      </div>

      {/* ── Steps overview ────────────────────────────────────────────────── */}
      <div className={card}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60 mb-3">סקירת שלבים</p>
        {draft.stations.length === 0 ? (
          <p className="text-[#e5e2e1]/20 text-sm">אין שלבים עדיין — לחצו "הוסף שלב" בפאנל הצד</p>
        ) : (
          <div className="space-y-2">
            {draft.stations.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 bg-[#0a0a0a] rounded-xl px-4 py-3 border border-[#3a4a49]/30">
                <span className="w-6 h-6 rounded-md bg-[#1a2a2a] text-[#00FBFB] text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-[#e5e2e1]/60 truncate flex-1">
                  {s.task || `שלב ${i + 1}`}
                </span>
                {s.challenge && (
                  <span className="text-[10px] text-[#00FBFB]/50 bg-[#1a2a2a] px-2 py-0.5 rounded-full shrink-0">
                    {s.challenge.type}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Labeled Dropdown ─────────────────────────────────────────────────────────

function LabeledDropdown({ label, value, options, isOpen, onToggle, onSelect }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-right transition-colors ${
          isOpen
            ? 'border-[#00FBFB]/40 bg-[#1a2a2a]'
            : 'border-[#3a4a49]/50 bg-[#0a0a0a] hover:border-[#3a4a49]/80'
        }`}
      >
        <div className="text-right flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#e5e2e1]/30 mb-0.5">{label}</p>
          <p className={`text-sm font-semibold truncate ${isOpen ? 'text-[#00FBFB]' : 'text-[#e5e2e1]/80'}`}>{value}</p>
        </div>
        <span className={`text-xs mr-2 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-[#00FBFB]' : 'text-[#e5e2e1]/30'}`}>▾</span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 left-0 z-20 bg-[#1a1a1a] border border-[#3a4a49]/60 rounded-xl overflow-hidden shadow-xl">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`w-full text-right px-4 py-2.5 text-sm transition-colors ${
                opt.value === value
                  ? 'text-[#00FBFB] bg-[#1a2a2a]'
                  : 'text-[#e5e2e1]/60 hover:bg-[#252525] hover:text-[#e5e2e1]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function styleIcon(style: ExperienceStyle): string {
  return { story: '🔍', competitive: '⚡', learning: '🧭' }[style];
}

// ─── Media Gallery ────────────────────────────────────────────────────────────

function MediaGallery({ items, onChange }: { items: MediaItem[]; onChange: (items: MediaItem[]) => void }) {
  const addItem = (type: MediaItemType) => {
    const newItem: MediaItem = {
      id: Date.now().toString(),
      type,
      url: '',
      content: '',
      caption: '',
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<MediaItem>) => {
    onChange(items.map(it => it.id === id ? { ...it, ...updates } : it));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(it => it.id !== id));
  };

  return (
    <div className="space-y-3">
      {items.map(item => (
        <MediaItemRow
          key={item.id}
          item={item}
          onUpdate={updates => updateItem(item.id, updates)}
          onRemove={() => removeItem(item.id)}
        />
      ))}
      <div className="flex gap-2 flex-wrap">
        {(['image', 'video', 'audio', 'text'] as MediaItemType[]).map(type => (
          <button
            key={type}
            onClick={() => addItem(type)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-[#3a4a49]/50 text-[#e5e2e1]/40 text-xs hover:border-[#00FBFB]/30 hover:text-[#00FBFB]/60 transition-colors"
          >
            <span>{mediaIcon(type)}</span>
            <span>+ {mediaTypeLabel(type)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MediaItemRow({ item, onUpdate, onRemove }: {
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
            placeholder="טקסט תיאור / נרטיב..."
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
          placeholder="כיתוב / תיאור (אופציונלי)"
          value={item.caption ?? ''}
          onChange={e => onUpdate({ caption: e.target.value })}
        />
      </div>
      <button
        onClick={onRemove}
        className="text-[#e5e2e1]/20 hover:text-red-400 transition-colors text-lg leading-none px-1 shrink-0"
      >
        ×
      </button>
    </div>
  );
}

// ─── Map Upload ───────────────────────────────────────────────────────────────

function MapUpload({ url, onChange }: { url?: string; onChange: (url: string) => void }) {
  const inp2 = 'w-full bg-[#0a0a0a] border border-[#3a4a49]/60 rounded-xl px-4 py-3 text-[#e5e2e1] text-sm placeholder:text-[#e5e2e1]/20 focus:border-[#00FBFB]/50 outline-none transition-colors';

  return (
    <div className="space-y-3">
      {url && (
        <div className="rounded-xl overflow-hidden border border-[#3a4a49]/30 bg-[#0a0a0a] h-40 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="מפה" className="max-w-full max-h-full object-contain" />
        </div>
      )}
      <input
        className={inp2}
        placeholder="URL לתמונת מפה"
        value={url ?? ''}
        onChange={e => onChange(e.target.value)}
      />
      <p className="text-[10px] text-[#e5e2e1]/25">
        בעתיד: תמיכה בהעלאת קובץ ובמפות מבוססות קואורדינטות
      </p>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mediaIcon(type: MediaItemType): string {
  return { image: '🖼', video: '🎬', audio: '🎵', text: '📝' }[type];
}

function mediaTypeLabel(type: MediaItemType): string {
  return { image: 'תמונה', video: 'וידאו', audio: 'אודיו', text: 'טקסט' }[type];
}
