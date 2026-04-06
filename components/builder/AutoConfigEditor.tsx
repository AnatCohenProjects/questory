'use client';

import { GameDraft } from '@/types/builder';

interface AutoConfigEditorProps {
  draft: GameDraft;
  onUpdate: (updates: Partial<GameDraft>) => void;
}

export default function AutoConfigEditor({ draft, onUpdate }: AutoConfigEditorProps) {
  const createToggle = (label: string, value: boolean | undefined, key: keyof GameDraft) => (
    <div className="flex items-center justify-between bg-[#131313] rounded-lg px-4 py-3 border border-[#3a4a49]/20">
      <span className="text-sm text-[#e5e2e1]/60">{label}</span>
      <button
        onClick={() => onUpdate({ [key]: !value })}
        className={`w-10 h-6 rounded-full transition-colors ${
          value ? 'bg-[#00FBFB]/30' : 'bg-[#3a4a49]/30'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-[#00FBFB] transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );

  const createDropdown = (label: string, value: string | undefined, options: string[], key: keyof GameDraft) => (
    <div className="bg-[#131313] rounded-lg border border-[#3a4a49]/20 overflow-hidden">
      <div className="hidden sm:flex items-center justify-between px-4 py-3">
        <span className="text-sm text-[#e5e2e1]/60">{label}</span>
        <select
          value={value || ''}
          onChange={(e) => onUpdate({ [key]: e.target.value })}
          className="bg-[#0a0a0a] border border-[#3a4a49]/40 rounded-lg px-3 py-1 text-[#e5e2e1] text-sm outline-none focus:border-[#00FBFB]/50"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'low' ? 'נמוכה' : opt === 'medium' ? 'בינונית' : opt === 'high' ? 'גבוהה' : opt === 'simple' ? 'פשוט' : opt === 'deep' ? 'עמוק' : opt}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:hidden flex items-center justify-between px-4 py-3">
        <span className="text-sm text-[#e5e2e1]/60">{label}</span>
        <span className="text-[#00FBFB] font-semibold text-sm">
          {value === 'low' ? 'נמוכה' : value === 'medium' ? 'בינונית' : value === 'high' ? 'גבוהה' : value === 'simple' ? 'פשוט' : value === 'deep' ? 'עמוק' : value}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/30 mb-2">
        כל פרמטר אופציונלי לשינוי — לחצו לשנות
      </p>

      {/* Toggles */}
      <div className="space-y-2">
        {createToggle('🤖 AI פעיל', draft.aiEnabled, 'aiEnabled')}
        {createToggle('🎮 תחרות', draft.competitionMode, 'competitionMode')}
        {createToggle('⏱️ טיימר', draft.timerEnabled, 'timerEnabled')}
        {createToggle('🏆 לוח תוצאות', draft.leaderboardEnabled, 'leaderboardEnabled')}
        {createToggle('📚 ידע משולב', draft.knowledgeIntegrated, 'knowledgeIntegrated')}
      </div>

      {/* Dropdowns */}
      <div className="space-y-2">
        {createDropdown('💬 רמת רמזים', draft.hintsLevel, ['low', 'medium', 'high'], 'hintsLevel')}
        {createDropdown('🧩 קושי חידות', draft.puzzleDifficulty, ['simple', 'medium', 'deep'], 'puzzleDifficulty')}
      </div>
    </div>
  );
}
