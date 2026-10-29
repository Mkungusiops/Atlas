import { createContext, useContext } from 'react';

const COLOR_NAMES = ['bg', 'panel', 'ink', 'muted', 'line', 'teal', 'amber', 'rose', 'violet', 'wash'] as const;

export type ColorName = (typeof COLOR_NAMES)[number];
export type Tokens = Record<ColorName, string> & { mono: string };

/** Reads the colour and font custom properties so canvas and SVG drawings match the active theme. */
export function readTokens(): Tokens {
  const style = getComputedStyle(document.documentElement);
  const tokens = { mono: style.getPropertyValue('--f-mono').trim() } as Tokens;
  for (const name of COLOR_NAMES) tokens[name] = style.getPropertyValue('--' + name).trim();
  return tokens;
}

export const TokensContext = createContext<Tokens | null>(null);

export function useTokens(): Tokens {
  const tokens = useContext(TokensContext);
  if (!tokens) throw new Error('useTokens() needs a <ThemeProvider> above it');
  return tokens;
}

export function hexRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function alpha(hex: string, a: number) {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
