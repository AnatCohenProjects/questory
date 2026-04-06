'use client';

import { useState, useCallback } from 'react';
import { GameDraft, StationDraft, emptyStation, defaultDraft, draftToGame } from '@/types/builder';
import SidePanel from '@/components/builder/SidePanel';
import GameMetaForm from '@/components/builder/GameMetaForm';
import StationEditor from '@/components/builder/StationEditor';

export type ActiveView = { type: 'meta' } | { type: 'station'; id: number };

export default function BuilderPage() {
  // Default: open on Game Settings, not on a station
  const [draft, setDraft] = useState<GameDraft>({ ...defaultDraft, stations: [emptyStation(0)] });
  const [active, setActive] = useState<ActiveView>({ type: 'meta' });

  const updateDraft = useCallback((updates: Partial<GameDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  }, []);

  const updateStation = useCallback((id: number, updates: Partial<StationDraft>) => {
    setDraft(prev => ({
      ...prev,
      stations: prev.stations.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const addStation = useCallback(() => {
    setDraft(prev => {
      const newId = prev.stations.length;
      // setActive called outside functional update to avoid stale closure
      setTimeout(() => setActive({ type: 'station', id: newId }), 0);
      return { ...prev, stations: [...prev.stations, emptyStation(newId)] };
    });
  }, []);

  const removeStation = useCallback((id: number) => {
    setDraft(prev => {
      const filtered = prev.stations
        .filter(s => s.id !== id)
        .map((s, i) => ({ ...s, id: i }));
      const newActiveId = Math.min(id, filtered.length - 1);
      setActive(filtered.length > 0 ? { type: 'station', id: newActiveId } : { type: 'meta' });
      return { ...prev, stations: filtered };
    });
  }, []);

  const duplicateStation = useCallback((id: number) => {
    setDraft(prev => {
      const source = prev.stations.find(s => s.id === id);
      if (!source) return prev;
      const newId = prev.stations.length;
      const clone: StationDraft = {
        ...source,
        id: newId,
        triggerValue: String(newId + 1),
        media: [...source.media],
        hints: [...source.hints] as [string, string, string],
      };
      setActive({ type: 'station', id: newId });
      return { ...prev, stations: [...prev.stations, clone] };
    });
  }, []);

  const reorderStations = useCallback((fromIndex: number, toIndex: number) => {
    setDraft(prev => {
      const stations = [...prev.stations];
      const [moved] = stations.splice(fromIndex, 1);
      stations.splice(toIndex, 0, moved);
      const reindexed = stations.map((s, i) => ({ ...s, id: i }));
      setActive(a => a.type === 'station' ? { type: 'station', id: toIndex } : a);
      return { ...prev, stations: reindexed };
    });
  }, []);

  const handlePreview = () => {
    const game = draftToGame(draft);
    localStorage.setItem('questory_preview_game', JSON.stringify(game));
    window.open('/play/preview', '_blank');
  };

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(draftToGame(draft), null, 2));
    alert('JSON הועתק ללוח');
  };

  const activeStation =
    active.type === 'station'
      ? draft.stations.find(s => s.id === active.id) ?? null
      : null;

  return (
    <div className="h-screen bg-[#0E0E0E] text-[#e5e2e1] flex flex-col overflow-hidden" dir="rtl">

      {/* Top bar */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#0E0E0E]">
        <div className="flex items-center gap-3">
          <span className="font-headline font-bold text-[#00FBFB] tracking-[0.2em] text-sm">QUESTORY</span>
          <span className="text-[#e5e2e1]/20 text-xs">|</span>
          <span className="text-[#e5e2e1]/40 text-xs uppercase tracking-widest">Builder</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreview}
            disabled={draft.stations.length === 0}
            className="text-[#e5e2e1]/60 text-sm px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 hover:text-[#e5e2e1] transition-colors disabled:opacity-30"
          >
            תצוגה מקדימה ↗
          </button>
          <button
            onClick={handleExport}
            className="text-[#00FBFB] text-sm px-4 py-2 rounded-lg border border-[#00FBFB]/30 hover:border-[#00FBFB]/60 transition-colors font-semibold"
          >
            יצא JSON
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar (right in RTL) */}
        <aside className="w-72 border-l border-white/5 flex flex-col overflow-hidden shrink-0">
          <SidePanel
            draft={draft}
            active={active}
            onSelectMeta={() => setActive({ type: 'meta' })}
            onSelectStation={(id) => setActive({ type: 'station', id })}
            onAddStation={addStation}
            onDuplicateStation={duplicateStation}
            onRemoveStation={removeStation}
            onReorderStations={reorderStations}
          />
        </aside>

        {/* Main editor */}
        <main className="flex-1 overflow-y-auto">
          {active.type === 'meta' ? (
            <GameMetaForm draft={draft} onUpdate={updateDraft} />
          ) : activeStation ? (
            <StationEditor
              station={activeStation}
              stationNumber={active.id + 1}
              totalStations={draft.stations.length}
              onUpdate={(updates) => updateStation(activeStation.id, updates)}
              onRemove={() => removeStation(activeStation.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#e5e2e1]/20 text-sm">בחרו תחנה מהרשימה</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
