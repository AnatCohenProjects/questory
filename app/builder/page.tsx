'use client';

import { useState, useCallback, useEffect } from 'react';
import { GameDraft, StationDraft, emptyStation, defaultDraft, draftToGame } from '@/types/builder';
import { zichronYaakovDraft } from '@/lib/zichronYaakovDraft';
import { Blueprint, BlueprintStation, generateBlueprint } from '@/lib/blueprintEngine';
import SidePanel from '@/components/builder/SidePanel';
import GameMetaForm from '@/components/builder/GameMetaForm';
import StationEditor from '@/components/builder/StationEditor';
import BlueprintViewer from '@/components/builder/BlueprintViewer';

export type ActiveView =
  | { type: 'meta' }
  | { type: 'station'; id: number }
  | { type: 'blueprint' };

export default function BuilderPage() {
  const [draft, setDraft] = useState<GameDraft>(() => {
    if (typeof window === 'undefined') return { ...defaultDraft, stations: [emptyStation(0)] };
    const saved = localStorage.getItem('questory_builder_draft');
    if (saved) try { return JSON.parse(saved) as GameDraft; } catch {}
    return { ...defaultDraft, stations: [emptyStation(0)] };
  });
  const [active, setActive] = useState<ActiveView>({ type: 'meta' });
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

  const updateDraft = useCallback((updates: Partial<GameDraft>) => {
    setDraft(prev => {
      const updated = { ...prev, ...updates };
      // Auto-generate blueprint when game settings change
      if (updated.duration && updated.audience && updated.experienceStyle && updated.difficulty) {
        const durationMin = parseInt(updated.duration.match(/\d+/)?.[0] || '60');
        const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
          'קל': 'easy',
          'בינוני': 'medium',
          'מתקדם': 'hard',
        };
        const progressionMap: Record<string, 'linear' | 'open' | 'race'> = {
          'ליניארי': 'linear',
          'פתוח': 'open',
          'מרוץ': 'race',
        };
        const newBlueprint = generateBlueprint(
          durationMin,
          updated.audience,
          updated.experienceStyle,
          difficultyMap[updated.difficulty] || 'medium',
          progressionMap[updated.progressionType] || 'linear',
          updated.story,
        );
        setBlueprint(newBlueprint);
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('questory_builder_draft', JSON.stringify(draft));
  }, [draft]);

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

  const handleLoadDemoGame = async () => {
    try {
      const res = await fetch('/api/load-jekron');
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('questory_preview_game', JSON.stringify(data.game));
        window.open('/play/preview', '_blank');
      }
    } catch (error) {
      alert('שגיאה בטעינת המשחק');
    }
  };

  const handleLoadZichronDraft = () => {
    setDraft(zichronYaakovDraft);
    setActive({ type: 'station', id: 0 });
  };

  const handleNewDraft = () => {
    localStorage.removeItem('questory_builder_draft');
    setDraft({ ...defaultDraft, stations: [emptyStation(0)] });
    setActive({ type: 'meta' });
  };

  const handleLoadCustomGame = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const game = JSON.parse(text);

      // Convert Game to GameDraft
      const draft: GameDraft = {
        title: game.title || '',
        story: game.story || '',
        experienceStyle: 'story',
        duration: game.duration || '45 דקות',
        difficulty: game.difficulty || 'בינוני',
        audience: 'משפחות',
        progressionType: 'ליניארי',
        media: [],
        character: game.character || { name: '', tone: '' },
        stations: (game.stations || []).map((s: any) => ({
          id: s.id || 0,
          triggerType: s.triggerType || 'code',
          triggerValue: s.triggerValue || '',
          navigationHint: s.navigationHint || '',
          narrative: s.narrative || '',
          narrativeMedia: s.narrativeMedia,
          task: s.task || '',
          taskMedia: s.taskMedia,
          hints: s.hints as [string, string, string] || ['', '', ''],
          answer: s.answer || '',
          challenge: s.challenge,
          media: s.media || [],
        })),
      };

      setDraft(draft);
      setActive({ type: 'meta' });
      alert('משחק נטען בהצלחה! עכשיו אתה יכול לערוך אותו בבנאי');
    } catch (error) {
      alert('שגיאה: וודאו שיש JSON תקין ב-clipboard');
    }
  };

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(draftToGame(draft), null, 2));
    alert('JSON הועתק ללוח');
  };

  const handleExportDraft = () => {
    navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
    alert('טיוטה מלאה הועתקה ללוח — שלחי לקלוד לעדכון הקובץ');
  };

  const handleSaveAsZichron = async () => {
    try {
      const res = await fetch('/api/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ נשמר! "טען זכרון יעקב" יטען עכשיו את הגרסה הזו.');
      } else {
        alert('שגיאה: ' + data.error);
      }
    } catch (error) {
      alert('שגיאה בשמירה');
    }
  };

  const handleBlueprintModified = (stations: BlueprintStation[]) => {
    if (blueprint) {
      setBlueprint({ ...blueprint, stations });
    }
  };

  const handleBlueprintConfirm = () => {
    if (blueprint) {
      // Blueprint confirmed — user can now build stations
      setActive({ type: 'station', id: 0 });
    }
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
            onClick={handleLoadZichronDraft}
            className="text-[#e9c349] text-sm px-4 py-2 rounded-lg border border-[#e9c349]/30 hover:border-[#e9c349]/60 transition-colors font-semibold"
          >
            🏛️ טען זכרון יעקב לעריכה
          </button>
          <button
            onClick={handleNewDraft}
            className="text-[#e5e2e1]/30 text-sm px-3 py-2 rounded-lg border border-white/5 hover:border-white/15 hover:text-[#e5e2e1]/60 transition-colors"
          >
            + חדש
          </button>
          <button
            onClick={handleLoadDemoGame}
            className="text-[#e9c349]/50 text-sm px-4 py-2 rounded-lg border border-[#e9c349]/20 hover:border-[#e9c349]/40 transition-colors"
          >
            📂 תצוגת דמו
          </button>
          <button
            onClick={handleLoadCustomGame}
            className="text-[#00FBFB]/60 text-sm px-4 py-2 rounded-lg border border-[#00FBFB]/30 hover:border-[#00FBFB]/60 hover:text-[#00FBFB] transition-colors"
          >
            📋 הדבק משחק
          </button>
          {blueprint && (
            <button
              onClick={() => setActive({ type: 'blueprint' })}
              className="text-[#9745FF] text-sm px-4 py-2 rounded-lg border border-[#9745FF]/30 hover:border-[#9745FF]/60 transition-colors font-semibold"
            >
              🏗️ Blueprint
            </button>
          )}
          <button
            onClick={handlePreview}
            disabled={draft.stations.length === 0}
            className="text-[#e5e2e1]/60 text-sm px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 hover:text-[#e5e2e1] transition-colors disabled:opacity-30"
          >
            תצוגה מקדימה ↗
          </button>
          <button
            onClick={handleSaveAsZichron}
            className="text-[#9745FF] text-sm px-4 py-2 rounded-lg border border-[#9745FF]/30 hover:border-[#9745FF]/60 transition-colors font-semibold"
          >
            💾 שמור כזכרון יעקב
          </button>
          <button
            onClick={handleExportDraft}
            className="text-[#e9c349]/70 text-sm px-4 py-2 rounded-lg border border-[#e9c349]/20 hover:border-[#e9c349]/50 transition-colors"
          >
            יצא טיוטה
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
          ) : active.type === 'blueprint' && blueprint ? (
            <BlueprintViewer
              blueprint={blueprint}
              onModify={handleBlueprintModified}
              onConfirm={handleBlueprintConfirm}
              onCancel={() => setActive({ type: 'meta' })}
            />
          ) : activeStation ? (
            <StationEditor
              station={activeStation}
              stationNumber={active.type === 'station' ? active.id + 1 : 0}
              totalStations={draft.stations.length}
              gameDataSource={draft.dataSource}
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
