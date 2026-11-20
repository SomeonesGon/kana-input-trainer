// code from https://www.benmvp.com/blog/sync-localstorage-react-usereducer-hook/
import { useCallback, useReducer, Reducer, Dispatch } from 'react';
import useLocalStorageState from 'use-local-storage-state';

/**
 * Custom hook to synchronize a React reducer's state with localStorage.
 *
 * Note: Retained from previous experimentation with automatic local storage persistence
 * (referenced in the Known Issues section on the home page).
 *
 * @template S State type
 * @template A Action type
 * @param localStorageKey Unique key in localStorage
 * @param reducer React reducer function
 * @param initialState Initial default state value
 * @returns [state, dispatch]
 */
export default function usePersistReducer<S, A>(
  localStorageKey: string,
  reducer: Reducer<S, A>,
  initialState: S
): [S, Dispatch<A>] {
  // Synchronizes state to localStorage under the given key
  const [savedState, saveState] = useLocalStorageState<S>(
    localStorageKey,
    { defaultValue: initialState, storageSync: false },
  );

  // Reducer wrapper that automatically triggers saveState on every dispatched state transition
  const reducerLocalStorage = useCallback(
    (state: S, action: A): S => {
      const newState = reducer(state, action);
      saveState(newState);
      return newState;
    },
    [saveState, reducer],
  );

  const [newState, newDispatch] = useReducer(reducerLocalStorage, savedState);
  return [newState, newDispatch];
}
