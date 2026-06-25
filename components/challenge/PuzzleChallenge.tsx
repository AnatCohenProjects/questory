'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { PuzzleChallengeData } from '@/types/challenge';

interface Props {
  challenge: PuzzleChallengeData;
  onCodeChange: (code: string) => void;
}

type Edge = 'tab' | 'blank' | 'flat';

function edgeSvg(
  x1: number, y1: number, x2: number, y2: number,
  nx: number, ny: number,
  type: Edge,
): string {
  if (type === 'flat') return `L ${x2} ${y2}`;
  const dx = x2 - x1, dy = y2 - y1;
  const s = type === 'tab' ? 1 : -1;
  const T = (a: number, p: number) =>
    `${+(x1 + (a / 100) * dx + nx * p * s).toFixed(1)} ${+(y1 + (a / 100) * dy + ny * p * s).toFixed(1)}`;
  // Amplitude 13 (was 28) — proportional tabs that don't dominate piece size
  return `L ${T(35,0)} C ${T(35,0)},${T(25,13)},${T(50,13)} C ${T(75,13)},${T(65,0)},${T(65,0)} L ${x2} ${y2}`;
}

function buildPaths(cols: number): string[] {
  const hTab = (r: number, c: number) => (r * 3 + c * 7 + r * c * 2) % 2 === 0;
  const vTab = (r: number, c: number) => (r * 5 + c * 11 + r + c * 3) % 2 === 1;
  return Array.from({ length: cols * cols }, (_, id) => {
    const r = Math.floor(id / cols), c = id % cols;
    const top:   Edge = r === 0        ? 'flat' : vTab(r-1, c) ? 'blank' : 'tab';
    const right: Edge = c === cols - 1 ? 'flat' : hTab(r, c)   ? 'tab'   : 'blank';
    const bot:   Edge = r === cols - 1 ? 'flat' : vTab(r, c)   ? 'tab'   : 'blank';
    const left:  Edge = c === 0        ? 'flat' : hTab(r, c-1) ? 'blank' : 'tab';
    return [
      'M 0 0',
      edgeSvg(0,   0,   100, 0,    0, -1, top),
      edgeSvg(100, 0,   100, 100,  1,  0, right),
      edgeSvg(100, 100, 0,   100,  0,  1, bot),
      edgeSvg(0,   100, 0,   0,   -1,  0, left),
      'Z',
    ].join(' ');
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeShuffled(n: number): number[] {
  const base = Array.from({ length: n }, (_, i) => i);
  let r: number[];
  do { r = shuffle(base); } while (r.every((v, i) => v === i));
  return r;
}

export default function PuzzleChallenge({ challenge, onCodeChange }: Props) {
  const cols     = Math.round(Math.sqrt(challenge.pieceCount ?? 9));
  const count    = cols * cols;
  const uid      = useId().replace(/:/g, '_');
  const paths    = useMemo(() => buildPaths(cols), [cols]);
  const imageUrl = challenge.imageUrl ?? '';

  // board[slotIdx] = pieceId placed there, or null
  const [board, setBoard] = useState<(number | null)[]>(() => Array(count).fill(null));
  // tray: shuffled pieceIds not yet placed
  const [tray, setTray] = useState<number[]>(() => makeShuffled(count));

  const [selectedTrayIdx, setSelectedTrayIdx] = useState<number | null>(null);
  const [dragSrc, setDragSrc] = useState<
    { from: 'tray'; idx: number } | { from: 'board'; slot: number } | null
  >(null);
  const [solved,  setSolved]  = useState(false);
  const [glowing, setGlowing] = useState(false);

  const solvedRef         = useRef(false);
  const onCodeChangeRef   = useRef(onCodeChange);
  onCodeChangeRef.current = onCodeChange;

  const triggerSolve = () => {
    if (solvedRef.current) return;
    solvedRef.current = true;
    setSolved(true);
    setGlowing(true);
    setTimeout(() => setGlowing(false), 700);
    onCodeChangeRef.current('solved');
  };

  const checkSolve = (nb: (number | null)[]) => {
    if (nb.every((id, idx) => id === idx)) triggerSolve();
  };

  // Place piece from tray onto board slot (displaced board piece goes back to tray)
  const place = (trayIdx: number, slot: number) => {
    const pid = tray[trayIdx];
    const displaced = board[slot];
    const nb = [...board];
    nb[slot] = pid;
    const nt = tray.filter((_, i) => i !== trayIdx);
    if (displaced !== null) nt.push(displaced);
    setBoard(nb);
    setTray(nt);
    setSelectedTrayIdx(null);
    checkSolve(nb);
  };

  const swapBoard = (a: number, b: number) => {
    if (a === b) return;
    const nb = [...board];
    [nb[a], nb[b]] = [nb[b], nb[a]];
    setBoard(nb);
    checkSolve(nb);
  };

  const returnToTray = (slot: number) => {
    const pid = board[slot];
    if (pid === null) return;
    const nb = [...board];
    nb[slot] = null;
    setBoard(nb);
    setTray(prev => [...prev, pid]);
  };

  const handleBoardClick = (slot: number) => {
    if (solved) return;
    if (selectedTrayIdx !== null) {
      place(selectedTrayIdx, slot);
    } else if (board[slot] !== null) {
      returnToTray(slot);
    }
  };

  const handleBoardDrop = (slot: number) => {
    if (!dragSrc) return;
    if (dragSrc.from === 'tray') place(dragSrc.idx, slot);
    else swapBoard(dragSrc.slot, slot);
    setDragSrc(null);
  };

  const glowCls = glowing
    ? 'shadow-[0_0_60px_rgba(0,251,251,0.85)]'
    : solved
    ? 'shadow-[0_0_30px_rgba(0,251,251,0.4)] animate-pulse'
    : '';

  const trayCols = Math.min(tray.length, cols + 2);

  return (
    <div className="space-y-3" dir="rtl">
      {challenge.instruction && (
        <p className="text-sm text-[#e5e2e1]/70 leading-relaxed">{challenge.instruction}</p>
      )}

      {!solved && imageUrl && (
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 rounded-lg overflow-hidden border border-[#3a4a49]/60"
            style={{ width: 52, height: 52 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#e5e2e1]/30">תמונת יעד</p>
        </div>
      )}

      {/* Board */}
      <div
        className={`transition-all duration-500 rounded-xl ${glowCls}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          direction: 'ltr',
          borderRadius: 12,
          background: '#0d0d0d',
          border: '1px solid rgba(58,74,73,0.35)',
        }}
      >
        {board.map((pid, slot) => (
          <div
            key={slot}
            draggable={pid !== null && !solved}
            onDragStart={() => { setDragSrc({ from: 'board', slot }); setSelectedTrayIdx(null); }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleBoardDrop(slot)}
            onDragEnd={() => setDragSrc(null)}
            onClick={() => handleBoardClick(slot)}
            style={{
              aspectRatio: '1/1',
              position: 'relative',
              cursor: solved ? 'default' : pid !== null ? 'pointer' : selectedTrayIdx !== null ? 'crosshair' : 'default',
              zIndex: dragSrc?.from === 'board' && dragSrc.slot === slot ? 10 : 1,
            }}
          >
            <svg
              viewBox="0 0 100 100"
              style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
            >
              {pid === null ? (
                <path
                  d={paths[slot]}
                  fill={selectedTrayIdx !== null ? 'rgba(0,251,251,0.05)' : 'rgba(255,255,255,0.02)'}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              ) : (
                <>
                  <defs>
                    <clipPath id={`${uid}b${slot}`}>
                      <path d={paths[pid]} />
                    </clipPath>
                  </defs>
                  <path d={paths[pid]} fill="#111" />
                  <image
                    href={imageUrl}
                    x={-(pid % cols) * 100}
                    y={-Math.floor(pid / cols) * 100}
                    width={cols * 100}
                    height={cols * 100}
                    clipPath={`url(#${uid}b${slot})`}
                  />
                  {solved && (
                    <path d={paths[pid]} fill="none" stroke="rgba(0,251,251,0.2)" strokeWidth="0.8" />
                  )}
                </>
              )}
            </svg>
          </div>
        ))}
      </div>

      {/* Tray */}
      {!solved && (
        <div
          className="rounded-xl border border-[#3a4a49]/25 bg-[#090909] p-2"
          onDragOver={e => e.preventDefault()}
          onDrop={() => {
            if (dragSrc?.from === 'board') returnToTray(dragSrc.slot);
            setDragSrc(null);
          }}
        >
          {tray.length === 0 ? (
            <p className="text-center text-[#e5e2e1]/20 text-xs py-2">כל החלקים הונחו</p>
          ) : (
            <>
              <p className="text-[10px] text-center uppercase tracking-[0.3em] text-[#e5e2e1]/20 mb-2">
                גרור חלקים אל הלוח
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${trayCols}, 1fr)`,
                  gap: 4,
                  direction: 'ltr',
                }}
              >
                {tray.map((pieceId, trayIdx) => {
                  const pr  = Math.floor(pieceId / cols);
                  const pc  = pieceId % cols;
                  const sel = selectedTrayIdx === trayIdx;
                  return (
                    <div
                      key={pieceId}
                      draggable
                      onDragStart={() => { setDragSrc({ from: 'tray', idx: trayIdx }); setSelectedTrayIdx(null); }}
                      onDragEnd={() => setDragSrc(null)}
                      onClick={() => setSelectedTrayIdx(sel ? null : trayIdx)}
                      style={{
                        aspectRatio: '1/1',
                        cursor: 'pointer',
                        opacity: dragSrc?.from === 'tray' && dragSrc.idx === trayIdx ? 0.25 : 1,
                        transform: sel ? 'scale(1.1)' : 'none',
                        transition: 'transform 0.12s, opacity 0.15s',
                        position: 'relative',
                        zIndex: sel ? 10 : 1,
                      }}
                    >
                      <svg
                        viewBox="0 0 100 100"
                        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
                      >
                        <defs>
                          <clipPath id={`${uid}t${pieceId}`}>
                            <path d={paths[pieceId]} />
                          </clipPath>
                        </defs>
                        <path d={paths[pieceId]} fill="#1a1a1a" />
                        <image
                          href={imageUrl}
                          x={-pc * 100}
                          y={-pr * 100}
                          width={cols * 100}
                          height={cols * 100}
                          clipPath={`url(#${uid}t${pieceId})`}
                        />
                        <path
                          d={paths[pieceId]}
                          fill={sel ? 'rgba(0,251,251,0.2)' : 'none'}
                          stroke={sel ? '#00FBFB' : 'rgba(255,255,255,0.18)'}
                          strokeWidth={sel ? 3 : 0.8}
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {selectedTrayIdx !== null && !solved && (
        <p className="text-[11px] text-center text-[#00FBFB]/55 animate-pulse">
          לחצו על מיקום בלוח
        </p>
      )}

      {solved && (
        <div className="flex flex-col items-center gap-1 py-3">
          <p
            className="text-[#00FBFB] text-base font-bold tracking-wide"
            style={{ textShadow: '0 0 16px rgba(0,251,251,0.6)' }}
          >
            ✓ הרכבתם את התמונה!
          </p>
          <p className="text-[#e5e2e1]/40 text-xs animate-pulse">ממשיכים...</p>
        </div>
      )}
    </div>
  );
}
