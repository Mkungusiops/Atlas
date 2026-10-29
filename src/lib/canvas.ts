import { useCallback, useLayoutEffect, useRef } from 'react';
import { useLatest, useWindowResize } from './hooks.ts';

/** Sizes a canvas to its container at device-pixel resolution; returns a context that draws in CSS pixels. */
export function fit(cv: HTMLCanvasElement, ratio: number, maxH: number, minH = 0) {
  const w = cv.parentElement!.clientWidth;
  const h = Math.min(maxH, Math.max(minH, w * ratio));
  const d = window.devicePixelRatio || 1;
  cv.width = w * d;
  cv.height = h * d;
  cv.style.height = h + 'px';
  const ctx = cv.getContext('2d')!;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return { ctx, w, h };
}

/**
 * Owns an imperatively drawn canvas. `draw` runs before the browser paints after every render
 * of the owning component (which re-renders exactly when what it draws changes) and again after
 * window resizes; the returned `paint` redraws on demand (animation loops, timers) with the most
 * recent `draw`.
 */
export function useCanvas(draw: (cv: HTMLCanvasElement) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  const latest = useLatest(draw);
  const paint = useCallback(() => {
    if (ref.current) latest.current(ref.current);
  }, [latest]);
  useLayoutEffect(paint);
  useWindowResize(paint);
  return [ref, paint] as const;
}
