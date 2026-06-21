'use client';

import { useEffect, useMemo, useState } from 'react';

interface ScoreCounterProps {
  targetValue: number;
  finalDisplay?: string;
  durationMs?: number;
  delayMs?: number;
  className?: string;
  finishClassName?: string;
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

export default function ScoreCounter({
  targetValue,
  finalDisplay,
  durationMs = 950,
  delayMs = 0,
  className = '',
  finishClassName = '',
}: ScoreCounterProps) {
  const [value, setValue] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let frameId = 0;
    let timeoutId: number | null = null;

    setValue(0);
    setFinished(false);

    const startAnimation = () => {
      const start = performance.now();

      const tick = (now: number) => {
        const rawProgress = Math.min((now - start) / durationMs, 1);
        const eased = easeOutCubic(rawProgress);
        const nextValue = Math.round(targetValue * eased);

        setValue(nextValue);

        if (rawProgress < 1) {
          frameId = window.requestAnimationFrame(tick);
          return;
        }

        setValue(targetValue);
        setFinished(true);
      };

      frameId = window.requestAnimationFrame(tick);
    };

    if (delayMs > 0) {
      timeoutId = window.setTimeout(startAnimation, delayMs);
    } else {
      startAnimation();
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.cancelAnimationFrame(frameId);
    };
  }, [delayMs, durationMs, targetValue]);

  const displayText = useMemo(() => {
    if (finished && finalDisplay) {
      return finalDisplay;
    }

    return value.toString();
  }, [finalDisplay, finished, value]);

  return (
    <span className={`${className} ${finished ? finishClassName : ''}`.trim()}>
      {displayText}
    </span>
  );
}
