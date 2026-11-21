'use client';
import { useState, useEffect, ReactNode } from 'react';
import { Theme, THEMES, THEME_STORAGE_KEY, ThemeContext } from '@/hooks/useTheme';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider
 *
 * - Reads the persisted theme from localStorage on mount (falls back to 'light').
 * - Writes `data-theme="<theme>"` onto `<html>` so CSS custom-property blocks can
 *   target `[data-theme="dark"]` etc. without any class toggling.
 * - Persists the user's selection to localStorage on every change.
 * - Exposes `{ theme, setTheme }` through ThemeContext to all descendants.
 */
export default function ThemeProvider({ children }: ThemeProviderProps) {
  // Start with 'light' on the server and during first render to avoid hydration mismatch.
  const [theme, setThemeState] = useState<Theme>('light');

  // After mount, read the stored preference and apply it.
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initial: Theme = stored && (THEMES as string[]).includes(stored) ? stored : 'light';
    applyTheme(initial);
    setThemeState(initial);
  }, []);

  function applyTheme(t: Theme) {
    document.documentElement.setAttribute('data-theme', t);
  }

  function setTheme(t: Theme) {
    applyTheme(t);
    setThemeState(t);
    localStorage.setItem(THEME_STORAGE_KEY, t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
