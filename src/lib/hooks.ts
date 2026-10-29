import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function subscribeReducedMotion(onChange: () => void) {
  reducedMotion.addEventListener('change', onChange);
  return () => reducedMotion.removeEventListener('change', onChange);
}

/** True when the visitor has asked their OS for less motion. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, () => reducedMotion.matches);
}

/** A ref that always holds the latest value, for animation loops, timers and listeners. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** Calls `onResize` once the window has stopped resizing for `delay` ms. */
export function useWindowResize(onResize: () => void, delay = 120) {
  const latest = useLatest(onResize);
  useEffect(() => {
    let timer = 0;
    const handle = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => latest.current(), delay);
    };
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('resize', handle);
      clearTimeout(timer);
    };
  }, [latest, delay]);
}
