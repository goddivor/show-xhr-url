import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Theme preference and its resolution to an actual appearance.
 *
 * The system preference is read through `useSyncExternalStore` rather than mirrored into
 * state inside an effect: the media query is an external store, and subscribing to it
 * directly is what keeps the resolved theme correct without a render-then-correct pass.
 */

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

function subscribeToSystemTheme(onChange: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getSystemPrefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const systemPrefersDark = useSyncExternalStore(subscribeToSystemTheme, getSystemPrefersDark);

  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);

  // The class on <html> is an external system, which is exactly what an effect is for.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    // Toggling from `system` pins the opposite of whatever is showing right now.
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  return {
    theme,
    resolvedTheme: isDark ? ('dark' as const) : ('light' as const),
    isDark,
    setTheme,
    toggleTheme,
  };
}
