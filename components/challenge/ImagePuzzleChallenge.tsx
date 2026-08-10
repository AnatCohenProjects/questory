'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ImagePuzzleChallengeData } from '@/types/challenge';

interface Props {
  challenge: ImagePuzzleChallengeData;
  onCodeChange: (code: string) => void;
}

type Edge = 'tab' | 'blank' | 'flat';

/** hash יציב (ללא Math.random) לזהות מחרוזת, לשימוש בפרמטרי צורה דטרמיניסטיים */
function hashInt(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** מיקום ועומק הלשונית עבור צלע נתונה, זהים לשני החלקים שחולקים אותה */
function edgeParams(seed: string): { center: number; depth: number } {
  const h = hashInt(seed);
  return { center: 38 + (h % 25), depth: 10 + ((h >> 5) % 7) };
}

function edgeSvg(
  x1: number, y1: number, x2: number, y2: number,
  nx: number, ny: number,
  type: Edge,
  center = 50,
  depth = 13,
): string {
  if (type === 'flat') return `L ${x2} ${y2}`;
  const dx = x2 - x1, dy = y2 - y1;
  const s = type === 'tab' ? 1 : -1;
  const off = center - 50;
  const scale = depth / 13;
  const T = (a: number, p: number) =>
    `${+(x1 + ((a + off) / 100) * dx + nx * p * scale * s).toFixed(1)} ${+(y1 + ((a + off) / 100) * dy + ny * p * scale * s).toFixed(1)}`;
  return `L ${T(35, 0)} C ${T(35, 0)},${T(25, 13)},${T(50, 13)} C ${T(75, 13)},${T(65, 0)},${T(65, 0)} L ${x2} ${y2}`;
}

/**
 * בונה מסלולי SVG לפאזל עבור גריד rows×cols. כל צלע פנימית מקבלת מיקום/עומק לשונית
 * דטרמיניסטיים משלה (זהים משני צידי הצלע), כדי שחלקים לא ייראו כמו סילואטה גנרית חוזרת
 * גם כשתוכן התמונה כמעט אחיד.
 */
function buildPaths(rows: number, cols: number): string[] {
  const hTab = (r: number, c: number) => (r * 3 + c * 7 + r * c * 2) % 2 === 0;
  const vTab = (r: number, c: number) => (r * 5 + c * 11 + r + c * 3) % 2 === 1;
  return Array.from({ length: rows * cols }, (_, id) => {
    const r = Math.floor(id / cols), c = id % cols;
    const top:    Edge = r === 0        ? 'flat' : vTab(r - 1, c) ? 'blank' : 'tab';
    const right:  Edge = c === cols - 1 ? 'flat' : hTab(r, c)     ? 'tab'   : 'blank';
    const bottom: Edge = r === rows - 1 ? 'flat' : vTab(r, c)     ? 'tab'   : 'blank';
    const left:   Edge = c === 0        ? 'flat' : hTab(r, c - 1) ? 'blank' : 'tab';
    const topP    = top    === 'flat' ? undefined : edgeParams(`v_${r - 1}_${c}`);
    const rightP  = right  === 'flat' ? undefined : edgeParams(`h_${r}_${c}`);
    const bottomP = bottom === 'flat' ? undefined : edgeParams(`v_${r}_${c}`);
    const leftP   = left   === 'flat' ? undefined : edgeParams(`h_${r}_${c - 1}`);
    // top/right are traced in the "forward" physical direction (left→right, top→bottom),
    // bottom/left are traced in reverse (right→left, bottom→top) to close the path. Since
    // both sides of a shared edge must read the SAME physical tab position, the reversed
    // sides need their center mirrored (100 - center) — otherwise a tab and its matching
    // notch land at opposite ends of the edge whenever center isn't exactly 50.
    return [
      'M 0 0',
      edgeSvg(0, 0, 100, 0, 0, -1, top, topP?.center, topP?.depth),
      edgeSvg(100, 0, 100, 100, 1, 0, right, rightP?.center, rightP?.depth),
      edgeSvg(100, 100, 0, 100, 0, 1, bottom, bottomP ? 100 - bottomP.center : undefined, bottomP?.depth),
      edgeSvg(0, 100, 0, 0, -1, 0, left, leftP ? 100 - leftP.center : undefined, leftP?.depth),
      'Z',
    ].join(' ');
  });
}

/** צמדי rows×cols אפשריים לכל רמת קושי, ממוינים לפי איזה מתאים לפרופורציית התמונה */
const LAYOUT_OPTIONS: Record<number, Array<[number, number]>> = {
  6: [[2, 3], [3, 2]],
  9: [[3, 3]],
  12: [[3, 4], [4, 3]],
};

function pickLayout(pieceCount: number, imageAspect: number): { rows: number; cols: number } {
  const options = LAYOUT_OPTIONS[pieceCount] ?? [[3, 3]];
  let best = options[0];
  let bestDiff = Infinity;
  for (const [rows, cols] of options) {
    const diff = Math.abs(cols / rows - imageAspect);
    if (diff < bestDiff) { bestDiff = diff; best = [rows, cols]; }
  }
  return { rows: best[0], cols: best[1] };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * כל חלק מצויר באותו viewBox קבוע (0 0 100 100) בלי קשר לצורה הספציפית שלו, כך שכל
 * החלקים נשארים באותו גודל חזותי. הלשוניות הבולטות חורגות מעבר לתא ה-100×100 עצמו
 * (overflow: visible) ולא דרך שוליים שמורים בתוך ה-viewBox — כך שעל הלוח, שבו התאים
 * צמודים זה לזה, הלשוניות באמת חופפות לתא השכן במקום להשאיר רווח ריק בין החלקים.
 */
const PIECE_VIEWBOX = '0 0 100 100';

// ─── Sound (minimal Web Audio synth, no assets/dependencies) ─────────────────

let sharedAudioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!sharedAudioCtx) sharedAudioCtx = new AC();
    if (sharedAudioCtx.state === 'suspended') void sharedAudioCtx.resume();
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

function playTone(freqFrom: number, freqTo: number, startAt: number, duration: number, peakGain: number, ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freqFrom, startAt);
  osc.frequency.exponentialRampToValueAtTime(freqTo, startAt + duration * 0.6);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

/** מפעילים מוקדם ככל האפשר, מתוך אירוע מגע/עכבר אמיתי ראשון, כדי לתת לדפדפן הקשר מחווה מלא */
function primeAudio() {
  getAudioCtx();
}

function playSnapSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  playTone(660, 900, ctx.currentTime, 0.18, 0.28, ctx);
}

function playCompletionSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(660, 880, now, 0.16, 0.3, ctx);
  playTone(880, 1320, now + 0.1, 0.24, 0.32, ctx);
}

// ─── Drag / scroll disambiguation types ───────────────────────────────────────

interface DragPos { x: number; y: number; w: number; h: number }
interface DragId { pieceId: number; pointerId: number }
interface PendingGesture {
  pieceId: number;
  pointerId: number;
  startX: number;
  startY: number;
  originRect: DOMRect;
  startScrollLeft: number;
  mode: 'pending' | 'scroll';
}

const MOVE_THRESHOLD = 8;

export default function ImagePuzzleChallenge({ challenge, onCodeChange }: Props) {
  const count = challenge.pieceCount;
  const imageUrl = challenge.imageUrl ?? '';
  const uid = useId().replace(/:/g, '_');

  const [aspect, setAspect] = useState(1);
  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled && img.naturalWidth && img.naturalHeight) {
        setAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = imageUrl;
    return () => { cancelled = true; };
  }, [imageUrl]);

  const { rows, cols } = useMemo(() => pickLayout(count, aspect), [count, aspect]);
  const paths = useMemo(() => buildPaths(rows, cols), [rows, cols]);

  const [locked, setLocked] = useState<Set<number>>(() => new Set());
  const [trayOrder, setTrayOrder] = useState<number[]>(() => shuffle(Array.from({ length: count }, (_, i) => i)));
  const [justLockedId, setJustLockedId] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<DragPos | null>(null);

  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const draggingIdRef = useRef<DragId | null>(null);
  const solvedRef = useRef(false);
  const onCodeChangeRef = useRef(onCodeChange);
  onCodeChangeRef.current = onCodeChange;

  const trayScrollRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef<PendingGesture | null>(null);
  const [pendingActive, setPendingActive] = useState(false);

  useEffect(() => {
    if (!solvedRef.current && locked.size === count && count > 0) {
      solvedRef.current = true;
      setSolved(true);
      playCompletionSound();
      onCodeChangeRef.current('solved');
    }
  }, [locked, count]);

  const lockPiece = (pieceId: number) => {
    setLocked(prev => {
      if (prev.has(pieceId)) return prev;
      const next = new Set(prev);
      next.add(pieceId);
      return next;
    });
    setTrayOrder(prev => prev.filter(id => id !== pieceId));
    setJustLockedId(pieceId);
    playSnapSound();
    window.setTimeout(() => setJustLockedId(cur => (cur === pieceId ? null : cur)), 500);
  };

  const finishDrag = (pieceId: number, clientX: number, clientY: number) => {
    const slotEl = slotRefs.current[pieceId];
    if (slotEl) {
      const r = slotEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(clientX - cx, clientY - cy);
      const tolerance = Math.max(r.width, r.height) * 0.6;
      if (dist <= tolerance) lockPiece(pieceId);
    }
    draggingIdRef.current = null;
    setIsDragging(false);
    setDragPos(null);
  };

  // Active piece drag (mouse or committed touch-drag) — unchanged mechanics from before.
  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: PointerEvent) => {
      const info = draggingIdRef.current;
      if (!info || e.pointerId !== info.pointerId) return;
      setDragPos(prev => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev));
    };
    const handleEnd = (e: PointerEvent) => {
      const info = draggingIdRef.current;
      if (!info || e.pointerId !== info.pointerId) return;
      finishDrag(info.pieceId, e.clientX, e.clientY);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // Pending phase: a touch/click on a conveyor piece hasn't committed to "drag" or
  // "scroll the tray" yet. Vertical movement commits to the existing drag machinery
  // above; horizontal movement commits to a manually-driven tray scroll, so the two
  // gestures never fight over the same pointer.
  useEffect(() => {
    if (!pendingActive) return;
    const handleMove = (e: PointerEvent) => {
      const p = pendingRef.current;
      if (!p || e.pointerId !== p.pointerId) return;
      const dx = e.clientX - p.startX;
      const dy = e.clientY - p.startY;

      if (p.mode === 'pending') {
        if (Math.abs(dy) > MOVE_THRESHOLD && Math.abs(dy) >= Math.abs(dx)) {
          draggingIdRef.current = { pieceId: p.pieceId, pointerId: p.pointerId };
          setDragPos({ x: e.clientX, y: e.clientY, w: p.originRect.width, h: p.originRect.height });
          setIsDragging(true);
          pendingRef.current = null;
          setPendingActive(false);
          return;
        }
        if (Math.abs(dx) > MOVE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          p.mode = 'scroll';
        } else {
          return;
        }
      }

      if (p.mode === 'scroll' && trayScrollRef.current) {
        trayScrollRef.current.scrollLeft = p.startScrollLeft - dx;
      }
    };
    const handleEnd = (e: PointerEvent) => {
      const p = pendingRef.current;
      if (!p || e.pointerId !== p.pointerId) return;
      pendingRef.current = null;
      setPendingActive(false);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };
  }, [pendingActive]);

  const handleConveyorPointerDown = (pieceId: number) => (e: React.PointerEvent) => {
    if (solved) return;
    e.preventDefault();
    primeAudio();
    const rect = e.currentTarget.getBoundingClientRect();
    pendingRef.current = {
      pieceId,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originRect: rect,
      startScrollLeft: trayScrollRef.current?.scrollLeft ?? 0,
      mode: 'pending',
    };
    setPendingActive(true);
  };

  const draggedPieceId = isDragging ? draggingIdRef.current?.pieceId ?? null : null;

  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!solved) return;
    const t = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(t);
  }, [solved]);

  return (
    <div className="space-y-3 md:space-y-4" dir="rtl">
      {challenge.instruction && (
        <p className="text-base md:text-lg font-semibold text-[#e5e2e1]/85 leading-snug">
          {challenge.instruction}
        </p>
      )}

      {solved ? (
        <div
          className="mx-auto w-full max-w-[384px] md:max-w-[448px] lg:max-w-[512px] xl:max-w-[597px] rounded-2xl overflow-hidden transition-all duration-700 ease-out"
          style={{
            // The natural image aspect ratio, NOT the puzzle grid's — a 3x3 (9-piece) grid is
            // always square, but the source image (e.g. a book cover) usually isn't, so revealing
            // it inside a square box would crop it. The grid stays square during play (required
            // by the piece mechanic); only this final reveal shows the true, uncropped image.
            aspectRatio: `${aspect}`,
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'scale(1)' : 'scale(0.97)',
            border: '1px solid rgba(0,251,251,0.35)',
            boxShadow: revealed
              ? '0 0 50px rgba(0,251,251,0.18), inset 0 0 0 1px rgba(0,251,251,0.06)'
              : '0 0 0 rgba(0,251,251,0)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="w-full h-full object-contain" />
        </div>
      ) : (
        <>
          {/* Board — the one primary puzzle surface, large and dominant */}
          <div
            className="mx-auto rounded-2xl overflow-hidden w-full max-w-[384px] md:max-w-[448px] lg:max-w-[512px] xl:max-w-[597px]"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              aspectRatio: `${cols} / ${rows}`,
              direction: 'ltr',
              background: 'radial-gradient(120% 140% at 50% 0%, #151515 0%, #0a0a0a 70%)',
              border: '1px solid rgba(58,74,73,0.5)',
              boxShadow: 'inset 0 2px 28px rgba(0,0,0,0.7), inset 0 0 70px rgba(0,251,251,0.04)',
            }}
          >
            {Array.from({ length: count }, (_, i) => {
              const r = Math.floor(i / cols), c = i % cols;
              const isLocked = locked.has(i);
              const isFresh = justLockedId === i;
              return (
                <div
                  key={i}
                  ref={el => { slotRefs.current[i] = el; }}
                  style={{
                    position: 'relative',
                    transition: 'transform 320ms cubic-bezier(0.34,1.56,0.64,1)',
                    transform: isFresh ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <svg viewBox={PIECE_VIEWBOX} style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
                    {isLocked ? (
                      <>
                        <defs>
                          <clipPath id={`${uid}s${i}`}><path d={paths[i]} /></clipPath>
                        </defs>
                        <path d={paths[i]} fill="#111" />
                        <image
                          href={imageUrl}
                          x={-c * 100}
                          y={-r * 100}
                          width={cols * 100}
                          height={rows * 100}
                          preserveAspectRatio="xMidYMid slice"
                          clipPath={`url(#${uid}s${i})`}
                        />
                        <path
                          d={paths[i]}
                          fill="none"
                          stroke={isFresh ? '#00FBFB' : 'rgba(0,251,251,0.14)'}
                          strokeWidth={isFresh ? 2.5 : 0.6}
                          style={{ transition: 'stroke 400ms ease, stroke-width 400ms ease' }}
                        />
                      </>
                    ) : (
                      <path
                        d={paths[i]}
                        fill="rgba(255,255,255,0.015)"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                        strokeDasharray="2.5 4"
                      />
                    )}
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Horizontal piece conveyor — fixed height, swipe left/right to find a piece */}
          {trayOrder.length > 0 && (
            <div className="mx-auto w-full max-w-[384px] md:max-w-[448px] lg:max-w-[512px] xl:max-w-[597px]">
              <p className="text-[10px] text-center uppercase tracking-[0.3em] text-[#e5e2e1]/25 mb-2">
                גררו חלק אל הלוח
              </p>
              <div
                ref={trayScrollRef}
                className="overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
                style={{
                  direction: 'ltr',
                  scrollbarWidth: 'none',
                  scrollSnapType: 'x proximity',
                  overscrollBehaviorX: 'contain',
                }}
              >
                <div className="flex items-center gap-4 sm:gap-5 lg:gap-6 xl:gap-7 w-max px-1 py-2" style={{ flexWrap: 'nowrap' }}>
                  {trayOrder.map(pieceId => {
                    if (draggedPieceId === pieceId) return null;
                    const r = Math.floor(pieceId / cols), c = pieceId % cols;
                    return (
                      <div
                        key={pieceId}
                        onPointerDown={handleConveyorPointerDown(pieceId)}
                        className="group shrink-0 w-28 sm:w-32 lg:w-36 xl:w-40 transition-transform duration-150 ease-out active:scale-95"
                        style={{
                          aspectRatio: '1 / 1',
                          cursor: 'grab',
                          touchAction: 'none',
                          scrollSnapAlign: 'center',
                          background: 'transparent',
                          filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.65))',
                        }}
                      >
                        <svg viewBox={PIECE_VIEWBOX} style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', background: 'transparent' }}>
                          <defs>
                            <clipPath id={`${uid}t${pieceId}`}><path d={paths[pieceId]} /></clipPath>
                          </defs>
                          <path d={paths[pieceId]} fill="#1a1a1a" />
                          <image
                            href={imageUrl}
                            x={-c * 100}
                            y={-r * 100}
                            width={cols * 100}
                            height={rows * 100}
                            preserveAspectRatio="xMidYMid slice"
                            clipPath={`url(#${uid}t${pieceId})`}
                          />
                          <path
                            d={paths[pieceId]}
                            fill="none"
                            stroke="rgba(255,255,255,0.6)"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                            className="transition-all duration-150 group-hover:stroke-[#00FBFB]/70"
                          />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {isDragging && dragPos && draggingIdRef.current && (() => {
        const pieceId = draggingIdRef.current.pieceId;
        const r = Math.floor(pieceId / cols), c = pieceId % cols;
        return (
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: dragPos.w,
              height: dragPos.h,
              transform: `translate(${dragPos.x - dragPos.w / 2}px, ${dragPos.y - dragPos.h / 2}px) scale(1.16)`,
              pointerEvents: 'none',
              zIndex: 999,
              background: 'transparent',
              filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.7)) drop-shadow(0 0 14px rgba(0,251,251,0.35))',
            }}
          >
            <svg viewBox={PIECE_VIEWBOX} style={{ width: '100%', height: '100%', overflow: 'visible', background: 'transparent' }}>
              <defs>
                <clipPath id={`${uid}g${pieceId}`}><path d={paths[pieceId]} /></clipPath>
              </defs>
              <path d={paths[pieceId]} fill="#1a1a1a" />
              <image
                href={imageUrl}
                x={-c * 100}
                y={-r * 100}
                width={cols * 100}
                height={rows * 100}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${uid}g${pieceId})`}
              />
              <path d={paths[pieceId]} fill="none" stroke="#00FBFB" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          </div>
        );
      })()}

      {solved && (
        <div
          className="flex flex-col items-center gap-1 py-3 transition-opacity duration-500"
          style={{ opacity: revealed ? 1 : 0 }}
        >
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
