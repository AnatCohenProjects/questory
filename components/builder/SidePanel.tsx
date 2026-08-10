'use client';

import { useState, useRef } from 'react';
import { GameDraft, StationDraft } from '@/types/builder';

type ActiveView =
  | { type: 'meta' }
  | { type: 'station'; id: number }
  | { type: 'blueprint' };

interface SidePanelProps {
  draft: GameDraft;
  active: ActiveView;
  onSelectMeta: () => void;
  onSelectStation: (id: number) => void;
  onAddStation: () => void;
  onDuplicateStation: (id: number) => void;
  onRemoveStation: (id: number) => void;
  onReorderStations: (fromIndex: number, toIndex: number) => void;
}

export default function SidePanel({
  draft, active,
  onSelectMeta, onSelectStation, onAddStation,
  onDuplicateStation, onRemoveStation, onReorderStations,
}: SidePanelProps) {
  const isMetaActive = active.type === 'meta';

  return (
    <div className="flex flex-col h-full">

      {/* Game settings button */}
      <button
        onClick={onSelectMeta}
        className={`flex items-center gap-3 px-5 py-4 text-right border-b border-white/5 transition-colors ${
          isMetaActive ? 'bg-[#131313] border-r-2 border-[#00FBFB]' : 'hover:bg-[#131313]/50'
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-[#1a2a2a] border border-[#00FBFB]/20 flex items-center justify-center shrink-0">
          <span className="text-[#00FBFB] text-sm">⚙</span>
        </div>
        <div className="text-right min-w-0">
          <p className={`text-sm font-semibold truncate ${isMetaActive ? 'text-[#e5e2e1]' : 'text-[#e5e2e1]/70'}`}>
            {draft.title || 'משחק ללא שם'}
          </p>
          <p className="text-[10px] text-[#e5e2e1]/30 uppercase tracking-widest mt-0.5">הגדרות</p>
        </div>
      </button>

      {/* Stations header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-white/5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#e5e2e1]/30">שלבים</span>
        <span className="text-[10px] text-[#e5e2e1]/30 font-mono">{draft.stations.length}</span>
      </div>

      {/* Stations list — draggable */}
      <div className="flex-1 overflow-y-auto">
        {draft.stations.length === 0 && (
          <p className="text-center text-[#e5e2e1]/20 text-xs py-8 px-4">
            לחצו על "הוסף שלב" כדי להתחיל
          </p>
        )}
        {draft.stations.map((station, i) => (
          <DraggableStationRow
            key={station.id}
            station={station}
            index={i}
            totalCount={draft.stations.length}
            isActive={active.type === 'station' && active.id === station.id}
            onClick={() => onSelectStation(station.id)}
            onDuplicate={() => onDuplicateStation(station.id)}
            onRemove={() => onRemoveStation(station.id)}
            onReorder={onReorderStations}
          />
        ))}
      </div>

      {/* Add station */}
      <div className="p-4 border-t border-white/5 shrink-0">
        <button
          onClick={onAddStation}
          className="w-full py-3 rounded-xl border border-dashed border-[#3a4a49]/60 text-[#e5e2e1]/40 text-sm hover:border-[#00FBFB]/30 hover:text-[#00FBFB]/60 transition-colors"
        >
          + הוסף שלב
        </button>
      </div>
    </div>
  );
}

// ─── Draggable row ────────────────────────────────────────────────────────────

function DraggableStationRow({ station, index, totalCount, isActive, onClick, onDuplicate, onRemove, onReorder }: {
  station: StationDraft;
  index: number;
  totalCount: number;
  isActive: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onReorder: (from: number, to: number) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const dragOver = useRef(false);

  const hasContent = !!(station.task && station.answer);

  // Native HTML5 drag-and-drop
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOver.current = true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(fromIndex) && fromIndex !== index) {
      onReorder(fromIndex, index);
    }
    dragOver.current = false;
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group relative flex items-center gap-3 px-4 py-3 text-right transition-colors cursor-pointer ${
        isActive ? 'bg-[#131313] border-r-2 border-[#00FBFB]' : 'hover:bg-[#131313]/50'
      }`}
      onClick={onClick}
    >
      {/* Drag handle */}
      <span
        className="text-[#e5e2e1]/15 group-hover:text-[#e5e2e1]/35 transition-colors text-xs cursor-grab active:cursor-grabbing select-none shrink-0"
        onClick={e => e.stopPropagation()}
      >
        ⠿
      </span>

      {/* Number badge */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
        hasContent
          ? 'bg-[#1a2a2a] text-[#00FBFB] border border-[#00FBFB]/20'
          : 'bg-[#1a1a1a] text-[#e5e2e1]/30 border border-[#3a4a49]/30'
      }`}>
        {index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-right">
        <p className={`text-sm truncate ${isActive ? 'text-[#e5e2e1]' : 'text-[#e5e2e1]/60'}`}>
          {station.task || `שלב ${index + 1}`}
        </p>
        <p className="text-[10px] text-[#e5e2e1]/25 mt-0.5 truncate">
          {station.challenge ? `${challengeLabel(station.challenge.type)}` : 'ללא אתגר'}
          {station.answer ? ` · ${station.answer}` : ''}
        </p>
      </div>

      {/* Context menu button */}
      <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setShowMenu(v => !v)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#e5e2e1]/40 hover:text-[#e5e2e1] text-base w-6 h-6 flex items-center justify-center rounded"
        >
          ···
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute left-0 top-7 z-20 bg-[#1a1a1a] border border-[#3a4a49]/60 rounded-xl overflow-hidden shadow-xl min-w-[120px]">
              <button
                onClick={() => { onDuplicate(); setShowMenu(false); }}
                className="w-full text-right px-4 py-2.5 text-sm text-[#e5e2e1]/70 hover:bg-[#252525] hover:text-[#e5e2e1] transition-colors"
              >
                שכפל
              </button>
              {totalCount > 1 && (
                <button
                  onClick={() => { onRemove(); setShowMenu(false); }}
                  className="w-full text-right px-4 py-2.5 text-sm text-red-400/70 hover:bg-[#252525] hover:text-red-400 transition-colors border-t border-[#3a4a49]/30"
                >
                  מחק
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function challengeLabel(type: string) {
  const map: Record<string, string> = { cipher: 'צופן', pattern: 'דפוס', oddoneout: 'מי לא שייך', trivia: 'שאלת ידע', puzzle: 'פאזל תמונה', imagePuzzle: 'פאזל תמונה מוסתרת' };
  return map[type] ?? type;
}
