import { useState, useEffect, useRef } from 'react';

/**
 * Storage key used to persist user SRS training progress in localStorage.
 */
export const AUTOSAVE_STORAGE_KEY = 'kana_input_trainer_save_v1';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions<T> {
  /** Current state to persist */
  state: T;
  /** Callback invoked on initial client mount when saved data is retrieved from localStorage */
  onLoad: (loadedState: T) => void;
  /** Optional custom storage key */
  storageKey?: string;
}

/**
 * Custom hook to automatically persist user progress to the browser's localStorage.
 *
 * How it works on Vercel / Next.js:
 * 1. Client-Side Safe (No Hydration Mismatch):
 *    During Next.js server-side rendering or static generation on Vercel, localStorage does not exist.
 *    This hook waits until the component mounts in the user's browser (client-side) before attempting
 *    to read or write storage.
 *
 * 2. Safe Initial Hydration:
 *    An `isHydratedRef` flag ensures that the initial default state never overwrites an existing
 *    saved game before the save file can be read and restored.
 *
 * 3. Reactive State Synchronization:
 *    Every time the user answers a question or changes a category switch, `state` changes.
 *    The hook automatically serializes the new state to localStorage and updates `autosaveStatus`
 *    to give immediate visual confirmation ('saved').
 */
export function useAutosave<T>({
  state,
  onLoad,
  storageKey = AUTOSAVE_STORAGE_KEY,
}: UseAutosaveOptions<T>) {
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(null);

  // Guards against saving before initial load from localStorage completes
  const isHydratedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Mount: Load saved progress from browser localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedRaw = localStorage.getItem(storageKey);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw) as T;
        console.log('[Autosave] Loaded previous progress from localStorage');
        onLoad(parsed);
      }
    } catch (err) {
      console.warn('[Autosave] Could not load saved progress from localStorage:', err);
    } finally {
      // Mark initial load complete so subsequent state changes can be safely saved
      isHydratedRef.current = true;
      setAutosaveStatus('saved');
      setLastSavedTimestamp(Date.now());
    }
  }, [storageKey]);

  // 2. State Change: Automatically serialize and persist to localStorage
  useEffect(() => {
    // Skip saving until the initial restore from localStorage has occurred
    if (!isHydratedRef.current || typeof window === 'undefined') return;

    try {
      setAutosaveStatus('saving');
      localStorage.setItem(storageKey, JSON.stringify(state));

      // Clear any pending timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setAutosaveStatus('saved');
      setLastSavedTimestamp(Date.now());

      // Return to 'idle' after 3 seconds of inactivity
      timerRef.current = setTimeout(() => {
        setAutosaveStatus('idle');
      }, 3000);
    } catch (err) {
      console.error('[Autosave] Failed to persist state to localStorage:', err);
      setAutosaveStatus('error');
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state, storageKey]);

  return {
    autosaveStatus,
    lastSavedTimestamp,
  };
}
