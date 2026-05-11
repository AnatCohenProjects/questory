'use client';

import { useState } from 'react';
import { Blueprint, BlueprintStation } from '@/lib/blueprintEngine';
import { GameDraft } from '@/types/builder';

interface BlueprintViewerProps {
  blueprint: Blueprint;
  onModify: (stations: BlueprintStation[]) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const STATION_TYPE_LABELS: Record<string, { emoji: string; name: string }> = {
  story: { emoji: '📖', name: 'סיפור' },
  location: { emoji: '📍', name: 'תצפית' },
  logic: { emoji: '🧩', name: 'חידה' },
  code: { emoji: '🔐', name: 'קוד' },
  mission: { emoji: '🎯', name: 'משימה' },
  dialogue: { emoji: '💬', name: 'שיחה' },
  success: { emoji: '🎉', name: 'סוף' },
};

export default function BlueprintViewer({ blueprint, onModify, onConfirm, onCancel }: BlueprintViewerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [stations, setStations] = useState(blueprint.stations);

  const handleStationUpdate = (index: number, updates: Partial<BlueprintStation>) => {
    const updated = stations.map((s, i) => (i === index ? { ...s, ...updates } : s));
    setStations(updated);
    onModify(updated);
  };

  const handleDeleteStation = (index: number) => {
    const updated = stations.filter((_, i) => i !== index);
    setStations(updated);
    onModify(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...stations];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    setStations(updated);
    onModify(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === stations.length - 1) return;
    const updated = [...stations];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setStations(updated);
    onModify(updated);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60 mb-2">תכנון משחק</p>
        <h2 className="text-2xl font-bold text-[#e5e2e1] mb-1">Blueprint</h2>
        <p className="text-sm text-[#e5e2e1]/60">{blueprint.reasoning}</p>
      </div>

      {/* Stations List */}
      <div className="space-y-2">
        {stations.map((station, idx) => (
          <div key={idx} className="bg-[#131313] border border-[#3a4a49]/30 rounded-xl overflow-hidden">
            {/* Header Row */}
            <button
              onClick={() => setEditingIndex(editingIndex === idx ? null : idx)}
              className="w-full text-right p-4 hover:bg-[#1a1a1a] transition-colors flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
                  <span>{STATION_TYPE_LABELS[station.type]?.emoji}</span>
                  <span>{station.title}</span>
                </p>
                <p className="text-[10px] text-[#e5e2e1]/50 mt-1">{station.description}</p>
              </div>
              <span className="text-[#e5e2e1]/30 ml-4">
                {editingIndex === idx ? '▼' : '▶'}
              </span>
            </button>

            {/* Expanded Details */}
            {editingIndex === idx && (
              <div className="bg-[#0a0a0a] border-t border-[#3a4a49]/30 p-4 space-y-4">
                {/* Type */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-2 block">
                    סוג תחנה
                  </label>
                  <select
                    value={station.type}
                    onChange={e => handleStationUpdate(idx, { type: e.target.value as any })}
                    className="w-full bg-[#1a1a1a] border border-[#3a4a49]/60 rounded-lg px-3 py-2 text-[#e5e2e1] text-sm focus:border-[#00FBFB]/50 outline-none"
                  >
                    {Object.entries(STATION_TYPE_LABELS).map(([type, { emoji, name }]) => (
                      <option key={type} value={type}>{emoji} {name}</option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-2 block">כותרת</label>
                  <input
                    value={station.title}
                    onChange={e => handleStationUpdate(idx, { title: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#3a4a49]/60 rounded-lg px-3 py-2 text-[#e5e2e1] text-sm focus:border-[#00FBFB]/50 outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-2 block">תיאור</label>
                  <textarea
                    value={station.description}
                    onChange={e => handleStationUpdate(idx, { description: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#3a4a49]/60 rounded-lg px-3 py-2 text-[#e5e2e1] text-sm resize-none focus:border-[#00FBFB]/50 outline-none"
                    rows={2}
                  />
                </div>

                {/* Suggested Challenge Type */}
                {station.suggestedChallengeType && (
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-2 block">
                      סוג חידה מומלץ
                    </label>
                    <select
                      value={station.suggestedChallengeType}
                      onChange={e => handleStationUpdate(idx, { suggestedChallengeType: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#3a4a49]/60 rounded-lg px-3 py-2 text-[#e5e2e1] text-sm focus:border-[#00FBFB]/50 outline-none"
                    >
                      <option value="">ללא חידה</option>
                      <option value="trivia">🎯 טריוויה</option>
                      <option value="pattern">🔗 דפוס</option>
                      <option value="oddoneout">❓ זיהוי חריג</option>
                      <option value="cipher">🔐 צופן</option>
                    </select>
                  </div>
                )}

                {/* Reasoning */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-2 block">טעם</label>
                  <textarea
                    value={station.reasoning}
                    onChange={e => handleStationUpdate(idx, { reasoning: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#3a4a49]/60 rounded-lg px-3 py-2 text-[#e5e2e1] text-sm resize-none focus:border-[#00FBFB]/50 outline-none"
                    rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {idx > 0 && (
                    <button
                      onClick={() => handleMoveUp(idx)}
                      className="flex-1 py-2 px-3 bg-[#1a2a2a] border border-[#3a4a49]/40 rounded-lg text-[#e5e2e1]/60 text-xs hover:border-[#3a4a49]/80 transition-colors"
                    >
                      ↑ עלה
                    </button>
                  )}
                  {idx < stations.length - 1 && (
                    <button
                      onClick={() => handleMoveDown(idx)}
                      className="flex-1 py-2 px-3 bg-[#1a2a2a] border border-[#3a4a49]/40 rounded-lg text-[#e5e2e1]/60 text-xs hover:border-[#3a4a49]/80 transition-colors"
                    >
                      ↓ רד
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteStation(idx)}
                    className="flex-1 py-2 px-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-xs hover:border-red-500/60 transition-colors"
                  >
                    🗑 מחק
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-2 pt-4 border-t border-[#3a4a49]/30">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-[#3a4a49]/40 text-[#e5e2e1]/60 text-sm hover:border-[#3a4a49]/80 transition-colors"
        >
          ביטול
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-[#00FBFB]/10 border border-[#00FBFB]/30 text-[#00FBFB] text-sm font-semibold hover:border-[#00FBFB]/60 transition-colors"
        >
          אישור ✓
        </button>
      </div>
    </div>
  );
}
