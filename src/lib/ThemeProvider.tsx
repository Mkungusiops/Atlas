import { useEffect, useState, type ReactNode } from 'react';
import { readTokens, TokensContext } from './theme.ts';

/** Shares the theme tokens and re-reads them when the system theme or `<html data-theme>` changes. */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState(readTokens);

  useEffect(() => {
    const refresh = () => setTokens(readTokens());
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    dark.addEventListener('change', refresh);
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    // Canvas text uses the mono web font, so redraw once the fonts have arrived.
    document.fonts.addEventListener('loadingdone', refresh);
    document.fonts.ready.then(refresh);
    return () => {
      dark.removeEventListener('change', refresh);
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', refresh);
    };
  }, []);

  return <TokensContext value={tokens}>{children}</TokensContext>;
}
