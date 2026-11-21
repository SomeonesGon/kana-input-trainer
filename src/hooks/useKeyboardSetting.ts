import { useState, useEffect, useCallback } from 'react';

/**
 * Storage key used to persist keyboard layout reference image visibility.
 */
export const KEYBOARD_STORAGE_KEY = 'kana_show_keyboard';

/**
 * Custom hook to manage and auto-save the keyboard reference image visibility setting.
 *
 * Persists to localStorage under 'kana_show_keyboard'.
 * Safe for SSR: defaults to true during server render, updates on client mount.
 */
export function useKeyboardSetting(): [boolean, (val: boolean | ((prev: boolean) => boolean)) => void] {
  const [showKeyboard, setShowKeyboardState] = useState<boolean>(true);

  // Read saved preference from localStorage after client-side mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(KEYBOARD_STORAGE_KEY);
      if (stored !== null) {
        setShowKeyboardState(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('[useKeyboardSetting] Could not parse stored keyboard setting:', err);
    }
  }, []);

  // Update state and write directly to localStorage
  const setShowKeyboard = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    setShowKeyboardState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(KEYBOARD_STORAGE_KEY, JSON.stringify(next));
        } catch (err) {
          console.warn('[useKeyboardSetting] Could not persist keyboard setting:', err);
        }
      }
      return next;
    });
  }, []);

  return [showKeyboard, setShowKeyboard];
}
