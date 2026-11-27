import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface SweepTextProps {
  children: string | number;
}

const MAX_VIEWPORT_OFFSET_MS = 480;
const MAX_LOCAL_SWEEP_MS = 620;
const DEFAULT_CHAR_STEP_MS = 22;

/**
 * Renders text normally at rest, and during a theme/font transition
 * (`isFontSweeping`), splits characters into inline spans that switch
 * `font-family` sequentially from left to right.
 */
export default function SweepText({ children }: SweepTextProps) {
  const { isFontSweeping, fontSweepTick } = useTheme();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [baseDelayMs, setBaseDelayMs] = useState<number>(0);

  useIsomorphicLayoutEffect(() => {
    if (!isFontSweeping || !anchorRef.current) {
      setBaseDelayMs(0);
      return;
    }
    const rect = anchorRef.current.getBoundingClientRect();
    const viewportWidth = Math.max(1, window.innerWidth);
    const ratio = Math.max(0, Math.min(1, rect.left / viewportWidth));
    setBaseDelayMs(Math.round(ratio * MAX_VIEWPORT_OFFSET_MS));
  }, [isFontSweeping, fontSweepTick]);

  if (!isFontSweeping) {
    return <>{children}</>;
  }

  const text = String(children);
  const chars = Array.from(text);
  const stepMs =
    chars.length > 0
      ? Math.min(DEFAULT_CHAR_STEP_MS, MAX_LOCAL_SWEEP_MS / chars.length)
      : DEFAULT_CHAR_STEP_MS;

  return (
    <span ref={anchorRef}>
      {chars.map((char, idx) => (
        <span
          key={`${fontSweepTick}-${idx}`}
          className="font-sweep-char"
          style={
            {
              '--sweep-delay': `${Math.round(baseDelayMs + idx * stepMs)}ms`,
            } as React.CSSProperties
          }
        >
          {char}
        </span>
      ))}
    </span>
  );
}
