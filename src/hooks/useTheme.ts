import { createContext, useContext } from 'react';

/** The three available visual themes. */
export type Theme = 'light' | 'dark' | 'pink';

/** Ordered list used by the slider — index maps 1-to-1 with the range value. */
export const THEMES: Theme[] = ['light', 'dark', 'pink'];

/** localStorage key for persisting the chosen theme. */
export const THEME_STORAGE_KEY = 'kana_theme';

/** Shape of the value exposed by ThemeContext. */
export interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

/**
 * Context providing the active theme and its setter to any descendant.
 * Default value is a no-op so the hook is safe to call without a Provider
 * during SSR (the real value is always supplied by ThemeProvider in _app.tsx).
 */
export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => undefined,
});

/**
 * Convenience hook to consume the ThemeContext.
 *
 * @example
 * const { theme, setTheme } = useTheme();
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
