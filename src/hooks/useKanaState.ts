import { useReducer, useMemo, Dispatch } from 'react';
// import useLocalStorageState from 'use-local-storage-state';
import { KanaState, KanaAction, KanaCategoryId } from '@/types/kana';
import { LOOKAHEAD, initialState, allInputCharactersArray } from '@/constants/kanas';
import { repositionKana, getActiveQueue } from '@/utils/srs';

// Re-export types and constants so existing consumers can import from either location
export { LOOKAHEAD };
export type { KanaState, KanaAction, KanaCategoryId };

/**
 * Custom hook managing the Kana training session and SRS algorithm.
 *
 * Provides:
 * - `state`: current master queue, ease factors, priority values, answer count, and category switch states.
 * - `dispatch`: action dispatcher for 'correct', 'wrong', 'loadState', 'toggleCategory', and 'setCategories'.
 * - `lookahead`: count of upcoming items displayed to the user.
 * - `activeQueue`: characters currently enabled for the quiz, derived from master queue and category switches.
 *
 * @returns [state, dispatch, LOOKAHEAD, activeQueue]
 */
export default function useKanaState(): [KanaState, Dispatch<KanaAction>, number, string[]] {
  // Reducer strictly typed with KanaState and KanaAction
  const reducer = (state: KanaState, action: KanaAction): KanaState => {
    // Current active prompt is the first character in the enabled category queue
    const activeQueue = getActiveQueue(state.queue, state.enabledCategories);
    const prompt = activeQueue[0];

    switch (action.type) {
      case 'correct': {
        // If active queue is empty or prompt is undefined, return unchanged state
        if (!prompt) {
          return state;
        }

        // Reposition returns both the re-sorted queue AND the updated priority map
        const { queue: newQueue, priority: newPriority } = repositionKana({
          queue: state.queue,
          ease: state.ease,
          priority: state.priority,
          enabledCategories: state.enabledCategories,
        });

        // On correct answer: ease doubles, causing the kana to reappear less frequently
        const currentEaseVal = state.ease[prompt] ?? 2;
        const newEaseVal = currentEaseVal * 2;
        const newEase = { ...state.ease, [prompt]: newEaseVal };
        const newState: KanaState = {
          ...state,
          ease: newEase,
          queue: newQueue,
          priority: newPriority, // Save the updated priorities so characters advance!
          charsAnswered: state.charsAnswered + 1,
        };
        console.log({ newState });
        return newState;
      }
      case 'wrong': {
        // If active queue is empty or prompt is undefined, return unchanged state
        if (!prompt) {
          return state;
        }

        // On wrong answer: ease is divided by 8 (min 1) so it reappears much sooner
        const currentEaseVal = state.ease[prompt] ?? 2;
        const newEase = {
          ...state.ease,
          [prompt]: Math.max(1, Math.floor(currentEaseVal / 8)), //,
          //[action.ans]: Math.max(1, Math.floor(state.ease[action.ans] / 1))
        };
        const newState: KanaState = {
          ...state,
          ease: newEase,
        };
        console.log({ newState });
        return newState;
      }
      case 'toggleCategory': {
        const current = state.enabledCategories[action.category];
        // Calculate total count of enabled categories
        const enabledCount = Object.values(state.enabledCategories).filter(Boolean).length;
        // Safety guard: prevent disabling the last remaining active category so the quiz is never empty
        if (current && enabledCount <= 1) {
          return state;
        }

        const newEnabledCategories = {
          ...state.enabledCategories,
          [action.category]: !current,
        };

        return {
          ...state,
          enabledCategories: newEnabledCategories,
        };
      }
      case 'setCategories': {
        return {
          ...state,
          enabledCategories: action.categories,
        };
      }
      case 'loadState': {
        // Backward-compatibility: support loading old save files seamlessly
        const loadedQueue = action.state.queue ?? [];
        // If loading an older save file with fewer characters, gracefully append newly supported characters
        const missingChars = allInputCharactersArray.filter((c) => !loadedQueue.includes(c));
        const mergedQueue = [...loadedQueue, ...missingChars];
        const mergedEase = { ...initialState.ease, ...action.state.ease };
        const mergedPriority = { ...initialState.priority, ...action.state.priority };
        // Fall back to initialState defaults if loaded file predates category switch feature
        const mergedCategories = {
          ...initialState.enabledCategories,
          ...action.state.enabledCategories,
        };

        return {
          ...initialState,
          ...action.state,
          queue: mergedQueue,
          ease: mergedEase,
          priority: mergedPriority,
          enabledCategories: mergedCategories,
        };
      }
      default:
        console.log('unrecognized action type:', (action as any).type);
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  // Memoize activeQueue so components can consume the filtered queue efficiently
  const activeQueue = useMemo(
    () => getActiveQueue(state.queue, state.enabledCategories),
    [state.queue, state.enabledCategories]
  );

  return [state, dispatch, LOOKAHEAD, activeQueue];
}
