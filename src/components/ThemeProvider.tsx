'use client';
import { useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import {
  Theme,
  THEMES,
  THEME_STORAGE_KEY,
  FontId,
  FONT_STORAGE_KEY,
  BackgroundId,
  BG_STORAGE_KEY,
  ThemeContext,
  resolveEffectiveFont,
  resolveEffectiveBackground,
  FONT_CONFIGS,
  BACKGROUND_CONFIGS,
} from '@/hooks/useTheme';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider
 *
 * - Manages active theme, font style, and background particle effect.
 * - Sets `data-theme="<theme>"` and custom `--active-font` property on `<html>`.
 * - Persists theme, font, and background preferences to localStorage.
 * - Resolves auto-synced 'theme' options for font and background.
 * - Controls `isLevelingUp` temporary celebratory animation state.
 */
export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [font, setFontState] = useState<FontId>('theme');
  const [background, setBackgroundState] = useState<BackgroundId>('theme');
  const [isLevelingUp, setIsLevelingUp] = useState<boolean>(false);

  // Compute resolved font and background
  const { fontId: effectiveFont, fontFamily: effectiveFontFamily } = useMemo(
    () => resolveEffectiveFont(theme, font),
    [theme, font]
  );

  const effectiveBackground = useMemo(
    () => resolveEffectiveBackground(theme, background),
    [theme, background]
  );

  // Apply theme attributes to documentElement
  const applyVisuals = useCallback(
    (t: Theme, resolvedFamily: string, effFont: FontId, effBg: BackgroundId) => {
      if (typeof document === 'undefined') return;
      const root = document.documentElement;
      root.setAttribute('data-theme', t);
      root.setAttribute('data-font', effFont);
      root.setAttribute('data-bg', effBg);
      if (resolvedFamily) {
        root.style.setProperty('--active-font', resolvedFamily);
      } else {
        root.style.removeProperty('--active-font');
      }
    },
    []
  );

  useEffect(() => {
    // Read stored preferences from localStorage
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initialTheme: Theme =
      storedTheme && (THEMES as string[]).includes(storedTheme) ? storedTheme : 'light';

    const validFontIds = FONT_CONFIGS.map((f) => f.id as string);
    const storedFont = localStorage.getItem(FONT_STORAGE_KEY) as FontId | null;
    const initialFont: FontId =
      storedFont && validFontIds.includes(storedFont) ? storedFont : 'theme';

    const validBgIds = BACKGROUND_CONFIGS.map((b) => b.id as string);
    const storedBg = localStorage.getItem(BG_STORAGE_KEY) as BackgroundId | null;
    const initialBg: BackgroundId =
      storedBg && validBgIds.includes(storedBg) ? storedBg : 'theme';

    const { fontId: resolvedFontId, fontFamily: resolvedFamily } = resolveEffectiveFont(
      initialTheme,
      initialFont
    );
    const resolvedBg = resolveEffectiveBackground(initialTheme, initialBg);

    applyVisuals(initialTheme, resolvedFamily, resolvedFontId, resolvedBg);
    setThemeState(initialTheme);
    setFontState(initialFont);
    setBackgroundState(initialBg);
  }, [applyVisuals]);

  // Sync DOM whenever theme, effectiveFont, or effectiveBackground change
  useEffect(() => {
    applyVisuals(theme, effectiveFontFamily, effectiveFont, effectiveBackground);
  }, [theme, effectiveFontFamily, effectiveFont, effectiveBackground, applyVisuals]);

  function setTheme(t: Theme) {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      // ignore storage errors
    }
  }

  function setFont(f: FontId) {
    setFontState(f);
    try {
      localStorage.setItem(FONT_STORAGE_KEY, f);
    } catch {
      // ignore storage errors
    }
  }

  function setBackground(b: BackgroundId) {
    setBackgroundState(b);
    try {
      localStorage.setItem(BG_STORAGE_KEY, b);
    } catch {
      // ignore storage errors
    }
  }

  const triggerLevelUpAnimation = useCallback(() => {
    setIsLevelingUp(true);
    const timer = setTimeout(() => {
      setIsLevelingUp(false);
    }, 4200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        font,
        setFont,
        background,
        setBackground,
        effectiveFont,
        effectiveBackground,
        isLevelingUp,
        triggerLevelUpAnimation,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
