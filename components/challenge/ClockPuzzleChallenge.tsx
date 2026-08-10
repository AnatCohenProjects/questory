'use client';

import { useEffect, useRef, useState } from 'react';
import { ClockPuzzleChallengeData } from '@/types/challenge';

interface ClockPuzzleChallengeProps {
  challenge: ClockPuzzleChallengeData;
}

const BG_SRC = '/images/clock-background.jpg';
const FACE_SRC = '/images/clock-face.png';
const HOUR_HAND_SRC = '/images/clock-hour-hand.png';
const MINUTE_HAND_SRC = '/images/clock-minute-hand.png';

const BG_ASPECT = '1203 / 587';

// Where the decorative stone ring sits within the background artwork (measured from the source).
const CLOCK_LEFT_PERCENT = 49.96;
const CLOCK_TOP_PERCENT = 48.21;
const CLOCK_WIDTH_PERCENT = 38.57; // of the background container's width

// Hand artwork proportions (pivot point, as % of each hand image's own box).
const HOUR_HAND_ASPECT = '87 / 345';
const HOUR_HAND_HEIGHT_PERCENT = 32; // of the clock face container's height
const HOUR_HAND_PIVOT_Y_PERCENT = 91.45;

const MINUTE_HAND_ASPECT = '92 / 499';
const MINUTE_HAND_HEIGHT_PERCENT = 46;
const MINUTE_HAND_PIVOT_Y_PERCENT = 94.89;

// How far each hand's tip reaches from the center, as a fraction of the clock's radius
// (height% * pivot-fraction, doubled since height% is relative to diameter not radius).
const HOUR_REACH_FRACTION = (HOUR_HAND_HEIGHT_PERCENT / 100) * (HOUR_HAND_PIVOT_Y_PERCENT / 100) * 2;
const MINUTE_REACH_FRACTION = (MINUTE_HAND_HEIGHT_PERCENT / 100) * (MINUTE_HAND_PIVOT_Y_PERCENT / 100) * 2;

// ─── Sound (local, lightweight synth — no shared audio deps) ─────────────────

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

function primeAudio() {
  getAudioCtx();
}

function playNotch() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(420, ctx.currentTime);
  gain.gain.setValueAtTime(0.045, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.045);
}

function playUnlock() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const mkTone = (freqFrom: number, freqTo: number, start: number, duration: number, peak: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqFrom, start);
    osc.frequency.exponentialRampToValueAtTime(freqTo, start + duration * 0.6);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  };
  mkTone(520, 660, now, 0.16, 0.26);
  mkTone(660, 990, now + 0.09, 0.28, 0.3);
}

// ─── Angle helpers ────────────────────────────────────────────────────────────

/** Clock-style angle (deg) from center to a point: 0 = up (12 o'clock), clockwise positive. */
function angleFromCenter(clientX: number, clientY: number, rect: DOMRect): number {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

function snappedIndex(angleDeg: number): number {
  return Math.round(angleDeg / 30) % 12;
}

/**
 * Distance from a click point to a hand's own line segment (center → its current tip),
 * in units of clock radius. Two hands sharing one pivot can't be told apart by angle alone
 * when they happen to overlap (e.g. both at 12) — clamped segment distance also accounts for
 * each hand's length, so a click beyond the short hand's reach still favors the long one.
 */
function distanceToHandSegment(clickXFrac: number, clickYFrac: number, handAngleDeg: number, reachFraction: number): number {
  const rad = (handAngleDeg * Math.PI) / 180;
  const tipX = Math.sin(rad) * reachFraction;
  const tipY = -Math.cos(rad) * reachFraction;
  const segLenSq = tipX * tipX + tipY * tipY;
  const t = segLenSq === 0 ? 0 : Math.max(0, Math.min(1, (clickXFrac * tipX + clickYFrac * tipY) / segLenSq));
  const projX = tipX * t;
  const projY = tipY * t;
  return Math.hypot(clickXFrac - projX, clickYFrac - projY);
}

// ─── Main component ────────────────────────────────────────────────────────

export default function ClockPuzzleChallenge({ challenge }: ClockPuzzleChallengeProps) {
  const snapMinutes = challenge.snapMinutes ?? 5;

  const [hourAngle, setHourAngle] = useState(0);
  const [minuteAngle, setMinuteAngle] = useState(0);
  const [solved, setSolved] = useState(false);
  const [dragging, setDragging] = useState<'hour' | 'minute' | null>(null);

  const clockRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; hand: 'hour' | 'minute' } | null>(null);
  const lastHourIndexRef = useRef(0);
  const lastMinuteIndexRef = useRef(0);

  const checkSuccess = (hourIdx: number, minuteIdx: number) => {
    const hourValue = hourIdx === 0 ? 12 : hourIdx;
    const minuteValue = (minuteIdx * snapMinutes) % 60;
    if (hourValue === challenge.targetHour && minuteValue === challenge.targetMinute) {
      setSolved(prev => {
        if (!prev) playUnlock();
        return true;
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    primeAudio();
    const rect = clockRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Both hands pivot at the same center point, so neither angle nor radius alone can tell
    // them apart. Grab whichever hand's own line segment (center → its current tip) the
    // pointer actually landed closest to.
    const radius = rect.width / 2;
    const clickXFrac = (e.clientX - (rect.left + rect.width / 2)) / radius;
    const clickYFrac = (e.clientY - (rect.top + rect.height / 2)) / radius;
    const distToHour = distanceToHandSegment(clickXFrac, clickYFrac, hourAngle, HOUR_REACH_FRACTION);
    const distToMinute = distanceToHandSegment(clickXFrac, clickYFrac, minuteAngle, MINUTE_REACH_FRACTION);
    // When the hands overlap (e.g. both still at 12), the two distances land within
    // floating-point noise of each other — resolve that explicitly rather than let rounding
    // decide, since this is exactly the pair's default starting position.
    const hand: 'hour' | 'minute' = Math.abs(distToHour - distToMinute) < 0.01
      ? 'minute'
      : distToMinute < distToHour ? 'minute' : 'hour';

    const deg = angleFromCenter(e.clientX, e.clientY, rect);

    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = { pointerId: e.pointerId, hand };
    setDragging(hand);

    if (hand === 'hour') setHourAngle(deg); else setMinuteAngle(deg);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const rect = clockRef.current?.getBoundingClientRect();
    if (!drag || drag.pointerId !== e.pointerId || !rect) return;

    const deg = angleFromCenter(e.clientX, e.clientY, rect);
    const idx = snappedIndex(deg);

    if (drag.hand === 'hour') {
      setHourAngle(deg);
      if (idx !== lastHourIndexRef.current) {
        lastHourIndexRef.current = idx;
        playNotch();
        checkSuccess(idx, lastMinuteIndexRef.current);
      }
    } else {
      setMinuteAngle(deg);
      if (idx !== lastMinuteIndexRef.current) {
        lastMinuteIndexRef.current = idx;
        playNotch();
        checkSuccess(lastHourIndexRef.current, idx);
      }
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(null);
    // Snap cleanly to the nearest notch.
    if (drag.hand === 'hour') setHourAngle(lastHourIndexRef.current * 30);
    else setMinuteAngle(lastMinuteIndexRef.current * 30);
  };

  const hourValue = lastHourIndexRef.current === 0 ? 12 : lastHourIndexRef.current;
  const minuteValue = (lastMinuteIndexRef.current * snapMinutes) % 60;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {challenge.instruction && (
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#e9c778]/80 text-center px-4">
          {challenge.instruction}
        </p>
      )}
      {challenge.clue && (
        <p className="text-[#e5e2e1]/70 text-sm text-center leading-relaxed max-w-md px-4">
          {challenge.clue}
        </p>
      )}

      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-[#8a6a2f]/25 select-none"
        style={{ aspectRatio: BG_ASPECT, boxShadow: '0 18px 40px rgba(0,0,0,0.5)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BG_SRC} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

        <div
          ref={clockRef}
          data-testid="clock-hitzone"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{
            position: 'absolute',
            left: `${CLOCK_LEFT_PERCENT}%`,
            top: `${CLOCK_TOP_PERCENT}%`,
            width: `${CLOCK_WIDTH_PERCENT}%`,
            aspectRatio: '1 / 1',
            transform: 'translate(-50%, -50%)',
            touchAction: 'none',
            cursor: 'grab',
          }}
          className={solved ? 'anim-clock-glow' : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FACE_SRC} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />

          {/* Hour hand */}
          <div
            style={{
              position: 'absolute', left: '50%', top: '50%',
              height: `${HOUR_HAND_HEIGHT_PERCENT}%`, width: 'auto', aspectRatio: HOUR_HAND_ASPECT,
              transformOrigin: `50% ${HOUR_HAND_PIVOT_Y_PERCENT}%`,
              transform: `translate(-50%, -${HOUR_HAND_PIVOT_Y_PERCENT}%) rotate(${hourAngle}deg)`,
              transition: dragging === 'hour' ? 'none' : 'transform 180ms cubic-bezier(0.34, 1.4, 0.64, 1)',
              pointerEvents: 'none',
              filter: solved
                ? 'brightness(0.32) contrast(1.35) drop-shadow(0 0 6px rgba(233,199,120,0.85))'
                : 'brightness(0.32) contrast(1.35)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HOUR_HAND_SRC} alt="" aria-hidden="true" draggable={false} className="w-full h-full" />
          </div>

          {/* Minute hand */}
          <div
            style={{
              position: 'absolute', left: '50%', top: '50%',
              height: `${MINUTE_HAND_HEIGHT_PERCENT}%`, width: 'auto', aspectRatio: MINUTE_HAND_ASPECT,
              transformOrigin: `50% ${MINUTE_HAND_PIVOT_Y_PERCENT}%`,
              transform: `translate(-50%, -${MINUTE_HAND_PIVOT_Y_PERCENT}%) rotate(${minuteAngle}deg)`,
              transition: dragging === 'minute' ? 'none' : 'transform 180ms cubic-bezier(0.34, 1.4, 0.64, 1)',
              pointerEvents: 'none',
              filter: solved
                ? 'brightness(0.32) contrast(1.35) drop-shadow(0 0 6px rgba(233,199,120,0.85))'
                : 'brightness(0.32) contrast(1.35)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MINUTE_HAND_SRC} alt="" aria-hidden="true" draggable={false} className="w-full h-full" />
          </div>

          {/* Center cap — hides the hands' pivot joins */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: '50%', top: '50%', width: '6%', height: '6%', transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle at 35% 30%, #f3d998 0%, #b8863a 55%, #6b4a1c 100%)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.5)',
            }}
          />
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] text-[#e9c778]/50 uppercase">
          {hourValue}:{String(minuteValue).padStart(2, '0')}
        </div>
      </div>

      {solved && (
        <div className="anim-fade-up text-center space-y-1 pt-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#e9c778]/70">מילת המפתח נחשפה</p>
          <p className="font-headline font-bold text-2xl text-[#e9c778]" style={{ textShadow: '0 0 20px rgba(233,199,120,0.5)' }}>
            {challenge.solution}
          </p>
        </div>
      )}
    </div>
  );
}
