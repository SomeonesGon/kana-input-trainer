import { useReducer, useMemo, Dispatch } from 'react';
import { KanaState, KanaAction, KanaCategoryId } from '@/types/kana';
import { LOOKAHEAD, initialState } from '@/constants/kanas';
import { repositionKana, getActiveQueue, migrateLoadedState } from '@/utils/srs';

// Re-export types and constants so existing consumers can import from either location
export { LOOKAHEAD };
export type { KanaState, KanaAction, KanaCategoryId };

/**
 * Custom hook managing the Kana training session and SRS algorithm.
 *
 * Provides:
 * - `state`: current queue, Leitner stages, due steps, mistakes, answer count, categories, and settings.
 * - `dispatch`: action dispatcher for 'correct', 'wrong', 'loadState', 'toggleCategory', 'setCategories', 'updateSettings'.
 * - `lookahead`: count of upcoming items displayed to the user.
 * - `activeQueue`: characters currently enabled for the quiz, derived from master queue and category switches.
 *
 * @returns [state, dispatch, LOOKAHEAD, activeQueue]
 */
export default function useKanaState(): [KanaState, Dispatch<KanaAction>, number, string[]] {
  const reducer = (state: KanaState, action: KanaAction): KanaState => {
    const inputMode = state.settings?.inputMode ?? 'kana';
    // Current active prompt is the first character in the enabled category queue
    const activeQueue = getActiveQueue(state.queue, state.enabledCategories, inputMode);
    const prompt = activeQueue[0];

    switch (action.type) {
      case 'correct': {
        if (!prompt) {
          return state;
        }

        // Reschedule the answered character using the Leitner-interval spaced repetition algorithm
        const {
          queue: newQueue,
          stages: newStages,
          dueSteps: newDueSteps,
          mistakes: newMistakes,
          hasLapsed: newHasLapsed,
          ease: newEase,
          priority: newPriority,
        } = repositionKana({
          queue: state.queue,
          stages: state.stages,
          dueSteps: state.dueSteps,
          mistakes: state.mistakes,
          hasLapsed: state.hasLapsed,
          charsAnswered: state.charsAnswered,
          enabledCategories: state.enabledCategories,
          inputMode,
          ease: state.ease,
          priority: state.priority,
        });

        const newState: KanaState = {
          ...state,
          queue: newQueue,
          stages: newStages,
          dueSteps: newDueSteps,
          mistakes: newMistakes,
          hasLapsed: newHasLapsed,
          ease: newEase,
          priority: newPriority,
          charsAnswered: state.charsAnswered + 1,
          streak: (state.streak ?? 0) + 1,
        };
        return newState;
      }

      case 'wrong': {
        if (!prompt) {
          return state;
        }

        // On mistake: flag active attempt as lapsed, record mistake count, and reset streak
        const newMistakes = {
          ...state.mistakes,
          [prompt]: (state.mistakes[prompt] ?? 0) + 1,
        };

        const newState: KanaState = {
          ...state,
          mistakes: newMistakes,
          hasLapsed: true,
          streak: 0,
        };
        return newState;
      }

      case 'toggleCategory': {
        const current = state.enabledCategories[action.category];
        const enabledCount = Object.values(state.enabledCategories).filter(Boolean).length;

        // Prevent disabling the last remaining active category
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

      case 'updateSettings': {
        return {
          ...state,
          settings: {
            ...state.settings,
            ...action.settings,
          },
        };
      }

      case 'resetProgress': {
        return {
          ...initialState,
          enabledCategories: state.enabledCategories,
          settings: {
            ...initialState.settings,
            ...state.settings,
          },
        };
      }

      case 'setStreak': {
        const nextStreak = Number.isFinite(action.streak) ? Math.max(0, Math.floor(action.streak)) : 0;
        return {
          ...state,
          streak: nextStreak,
        };
      }

      case 'loadState': {
        // Robust backward-compatible migration of legacy or current save states
        const migrated = migrateLoadedState(action.state);
        return {
          ...migrated,
          settings: {
            ...state.settings,
            ...(migrated.settings ?? {}),
            inputMode: migrated.settings?.inputMode ?? state.settings?.inputMode,
          },
        };
      }

      default:
        console.warn('Unrecognized action type:', (action as any).type);
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const inputMode = state.settings?.inputMode ?? 'kana';

  // Memoize activeQueue so components can consume the filtered queue efficiently
  const activeQueue = useMemo(
    () => getActiveQueue(state.queue, state.enabledCategories, inputMode),
    [state.queue, state.enabledCategories, inputMode]
  );

  return [state, dispatch, LOOKAHEAD, activeQueue];
}
