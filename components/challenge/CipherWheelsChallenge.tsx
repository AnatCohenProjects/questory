'use client';

import { useEffect, useRef, useState } from 'react';
import { CipherWheelsChallengeData } from '@/types/challenge';
import { HEBREW_ALPHABET, normalizeHebrewLetter } from '@/lib/cipherWheels';

interface CipherWheelsChallengeProps {
  challenge: CipherWheelsChallengeData;
}

const STEP_PX = 30;

// The real antique-lock artwork (public/images/cipher-wheels-lock.png) has exactly
// 4 baked-in wheel windows, so it's only used when the word is 4 letters long.
// Any other length falls back to the generic CSS/SVG drum rendering below.
const LOCK_IMAGE_SRC = '/images/cipher-wheels-lock.png';
const DESK_BG_SRC = '/images/cipher-wheels-desk-bg.jpg';
const LOCK_IMAGE_ASPECT = '845 / 528';

// Wheel-window centers measured from the source artwork (% of image width/height).
// Index 0 = first letter of the word = rightmost window (Hebrew reads right-to-left);
// index 3 = last letter = leftmost window.
const LOCK_WINDOW_X_PERCENT = [74.6, 58.2, 41.7, 25.4];
const LOCK_WINDOW_Y_PERCENT = 65.9;

// ─── Tick sound (local, lightweight synth — no shared audio deps) ────────────

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

function playTick() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(340, ctx.currentTime);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.045);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

// ─── Shared rotation logic (drag / mouse-wheel / keyboard) ───────────────────

function useWheelRotation(alphabet: string[], initialLetter: string, soundEnabled: boolean) {
  const startIndex = (() => {
    const i = alphabet.indexOf(normalizeHebrewLetter(initialLetter));
    return i === -1 ? 0 : i;
  })();

  const [pos, setPos] = useState(startIndex);
  const [dragOffset, setDragOffset] = useState(0);
  const dragRef = useRef<{ pointerId: number; refY: number } | null>(null);
  const len = alphabet.length;

  const step = (delta: number) => {
    setPos(p => ((p + delta) % len + len) % len);
    if (soundEnabled) playTick();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = { pointerId: e.pointerId, refY: e.clientY };
    setDragOffset(0);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    let delta = e.clientY - drag.refY;
    while (delta >= STEP_PX) {
      step(1);
      drag.refY += STEP_PX;
      delta -= STEP_PX;
    }
    while (delta <= -STEP_PX) {
      step(-1);
      drag.refY -= STEP_PX;
      delta += STEP_PX;
    }
    setDragOffset(delta);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragOffset(0);
  };

  // Native (non-passive) wheel listener so we can actually preventDefault the page scroll.
  const drumRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = drumRef.current;
    if (!el) return;
    const onWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      step(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener('wheel', onWheelEvent, { passive: false });
    return () => el.removeEventListener('wheel', onWheelEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundEnabled]);

  // Down = forward, up = backward — matches drag (moving the finger/mouse down) and mouse-wheel (scrolling down).
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
  };

  const letterAt = (offset: number) => alphabet[((pos + offset) % len + len) % len];

  return {
    drumRef,
    pos,
    len,
    dragOffset,
    isDragging: dragRef.current !== null,
    letterAt,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown: handleKeyDown,
    },
  };
}

// ─── Generic CSS drum (fallback for word lengths other than 4) ───────────────

function CssDrumWheel({
  alphabet,
  initialLetter,
  index,
  soundEnabled,
}: {
  alphabet: string[];
  initialLetter: string;
  index: number;
  soundEnabled: boolean;
}) {
  const { drumRef, pos, len, dragOffset, isDragging, letterAt, handlers } = useWheelRotation(alphabet, initialLetter, soundEnabled);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-2 h-2 rotate-45 bg-[#e9c778]/70 shadow-[0_0_6px_rgba(233,199,120,0.5)]" />
      <div
        ref={drumRef}
        role="slider"
        aria-label={`גלגלת ${index + 1}`}
        aria-valuenow={pos}
        aria-valuemin={0}
        aria-valuemax={len - 1}
        tabIndex={0}
        {...handlers}
        style={{ touchAction: 'none' }}
        className="relative w-[52px] sm:w-16 md:w-[70px] h-[128px] sm:h-[148px] rounded-lg overflow-hidden select-none cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-[#e9c778]/60"
      >
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'linear-gradient(180deg, #4a3a1e 0%, #2a2010 50%, #4a3a1e 100%)',
            boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.55), inset 0 -3px 8px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(233,199,120,0.25)',
          }}
        />
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[38%] sm:h-[36%]"
          style={{
            background: 'linear-gradient(180deg, #f0e2bd 0%, #e6d19f 50%, #f0e2bd 100%)',
            boxShadow: '0 0 0 1px rgba(120,90,30,0.5), 0 2px 6px rgba(0,0,0,0.4)',
          }}
        />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            transform: `translateY(${dragOffset}px)`,
            transition: isDragging ? 'none' : 'transform 150ms ease-out',
          }}
        >
          <span className="text-[#e5e2e1]/35 text-sm sm:text-base leading-none mb-2 sm:mb-3">{letterAt(-1)}</span>
          <span className="text-[#231a0c] font-bold text-2xl sm:text-3xl leading-none" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.35)' }}>
            {letterAt(0)}
          </span>
          <span className="text-[#e5e2e1]/35 text-sm sm:text-base leading-none mt-2 sm:mt-3">{letterAt(1)}</span>
        </div>
      </div>
      <div className="w-2 h-2 rotate-45 bg-[#e9c778]/70 shadow-[0_0_6px_rgba(233,199,120,0.5)]" />
    </div>
  );
}

function LockShackle() {
  return (
    <svg viewBox="0 0 220 90" className="w-[62%] max-w-[260px] -mb-5 relative z-0" aria-hidden="true">
      <defs>
        <linearGradient id="cw-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3d998" />
          <stop offset="45%" stopColor="#b8863a" />
          <stop offset="100%" stopColor="#7a541f" />
        </linearGradient>
      </defs>
      <path d="M20 90 V45 A90 45 0 0 1 200 45 V90" fill="none" stroke="url(#cw-brass)" strokeWidth="16" strokeLinecap="round" />
    </svg>
  );
}

function KeyholePlaque() {
  return (
    <svg viewBox="0 0 64 34" className="w-16 sm:w-20 h-auto relative z-10" aria-hidden="true">
      <rect x="1" y="1" width="62" height="32" rx="7" fill="#1f1608" stroke="#e9c778" strokeOpacity="0.55" strokeWidth="1.5" />
      <circle cx="32" cy="14" r="5.5" fill="#0c0804" stroke="#e9c778" strokeOpacity="0.6" strokeWidth="1" />
      <path d="M29 18 L35 18 L33 26 L31 26 Z" fill="#0c0804" stroke="#e9c778" strokeOpacity="0.6" strokeWidth="1" />
    </svg>
  );
}

function GenericCssLock({ alphabet, values, soundEnabled }: { alphabet: string[]; values: string[]; soundEnabled: boolean }) {
  return (
    <div className="w-full max-w-[420px] flex flex-col items-center">
      <LockShackle />
      <div
        className="relative z-10 w-full rounded-[26px] px-4 sm:px-6 pt-7 pb-5 flex flex-col items-center gap-4"
        style={{
          background: 'linear-gradient(160deg, #5a4626 0%, #3c2f18 45%, #241b0c 100%)',
          boxShadow: '0 0 0 1px rgba(233,199,120,0.2), 0 14px 34px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <KeyholePlaque />
        <div className="flex justify-center gap-2 sm:gap-3" dir="rtl">
          {values.map((letter, i) => (
            <CssDrumWheel key={i} alphabet={alphabet} initialLetter={letter} index={i} soundEnabled={soundEnabled} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Antique-artwork lock (real cropped asset, exactly 4 wheels) ─────────────

function ImageWheelOverlay({
  alphabet,
  initialLetter,
  index,
  soundEnabled,
  leftPercent,
}: {
  alphabet: string[];
  initialLetter: string;
  index: number;
  soundEnabled: boolean;
  leftPercent: number;
}) {
  const { drumRef, pos, len, dragOffset, isDragging, letterAt, handlers } = useWheelRotation(alphabet, initialLetter, soundEnabled);

  return (
    <div
      ref={drumRef}
      role="slider"
      aria-label={`גלגלת ${index + 1}`}
      aria-valuenow={pos}
      aria-valuemin={0}
      aria-valuemax={len - 1}
      tabIndex={0}
      {...handlers}
      style={{
        touchAction: 'none',
        left: `${leftPercent}%`,
        top: `${LOCK_WINDOW_Y_PERCENT}%`,
        transform: 'translate(-50%, -50%)',
        width: '17%',
      }}
      className="absolute flex flex-col items-center justify-center cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-[#8a6a2f]/60 rounded-lg select-none"
    >
      <div
        className="flex flex-col items-center justify-center"
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 150ms ease-out',
        }}
      >
        <span className="text-[#5a4626] text-xl sm:text-2xl leading-none mb-1.5 sm:mb-2 opacity-80">{letterAt(-1)}</span>
        <span className="text-[#241a0c] font-bold text-3xl sm:text-4xl leading-none" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}>
          {letterAt(0)}
        </span>
        <span className="text-[#5a4626] text-xl sm:text-2xl leading-none mt-1.5 sm:mt-2 opacity-80">{letterAt(1)}</span>
      </div>
    </div>
  );
}

function AntiqueImageLock({ alphabet, values, soundEnabled }: { alphabet: string[]; values: string[]; soundEnabled: boolean }) {
  return (
    <div className="relative w-full max-w-[420px]" style={{ aspectRatio: LOCK_IMAGE_ASPECT }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOCK_IMAGE_SRC}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
      />
      {values.map((letter, i) => (
        <ImageWheelOverlay
          key={i}
          alphabet={alphabet}
          initialLetter={letter}
          index={i}
          soundEnabled={soundEnabled}
          leftPercent={LOCK_WINDOW_X_PERCENT[i]}
        />
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function CipherWheelsChallenge({ challenge }: CipherWheelsChallengeProps) {
  const alphabet = challenge.alphabet?.length ? challenge.alphabet : HEBREW_ALPHABET;
  const values = challenge.initialValues?.length ? challenge.initialValues : ['', '', '', ''];
  const soundEnabled = challenge.enableTickSound !== false;

  return (
    <div
      className="relative w-full rounded-[28px] overflow-hidden border border-[#8a6a2f]/25"
      style={{ boxShadow: '0 18px 40px rgba(0,0,0,0.45)' }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `url(${DESK_BG_SRC})`, backgroundSize: 'cover', backgroundPosition: 'center bottom' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(10,8,5,0.8) 0%, rgba(10,8,5,0.35) 35%, rgba(10,8,5,0.4) 70%, rgba(10,8,5,0.82) 100%)' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-3 px-4 pt-8 pb-16 sm:pt-10 sm:pb-20">
        {challenge.instruction && (
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#e9c778]/80 text-center px-4">
            {challenge.instruction}
          </p>
        )}

        {values.length === 4 ? (
          <AntiqueImageLock alphabet={alphabet} values={values} soundEnabled={soundEnabled} />
        ) : (
          <GenericCssLock alphabet={alphabet} values={values} soundEnabled={soundEnabled} />
        )}
      </div>
    </div>
  );
}
