import {
  LOOKAHEAD,
  CHARACTER_CATEGORY_MAP,
  COMPOUND_KANA_BASE_MAP,
  MOBILE_INTERMEDIATE_MAP,
  MOBILE_UNAVAILABLE_CHARACTERS,
  ROMAJI_UNAVAILABLE_CHARACTERS,
  ROMAJI_IME_UNAVAILABLE_CHARACTERS,
  GOJUON_UNAVAILABLE_CHARACTERS,
  KANA_UNAVAILABLE_CHARACTERS,
  KANA_ROMAJI_MAP,
  STAGE_INTERVALS,
  allInputCharactersArray,
  initialStages,
  initialDueSteps,
  initialMistakes,
  DEFAULT_ENABLED_CATEGORIES,
} from '@/constants/kanas';
import { InputMode, INPUT_MODES, KanaCategoryId, KanaState, KanaSettings } from '@/types/kana';
import { Theme } from '@/hooks/useTheme';

/**
 * Result of evaluating user input against the expected prompt.
 * - 'correct': Matches the target kana completely.
 * - 'intermediate': Matches the base kana of a two-stroke compound character (e.g. typed 'か' for 'が').
 * - 'wrong': Does not match target or expected base character.
 * - 'none': Input is empty or no active prompt.
 */
export type InputEvaluationResult = 'correct' | 'intermediate' | 'wrong' | 'none';

/**
 * Evaluates user input against the expected target kana.
 * Handles two-stroke compound characters (dakuten/handakuten) by recognizing
 * the valid intermediate base kana keystroke so it is not prematurely penalized.
 * Also handles both IME auto-composition (e.g. 'が') and sequential characters ('か゛').
 *
 * @param inputValue Current full string in the input box
 * @param targetKana The active prompt character being asked
 * @returns 'correct' if matching, 'intermediate' if awaiting modifier key, 'wrong' if incorrect, 'none' if empty
 */
export function evaluateKanaInput(
  inputValue: string,
  targetKana: string | undefined,
  inputMode: InputMode = 'kana'
): InputEvaluationResult {
  if (!inputValue || !targetKana) {
    return 'none';
  }

  // 1. Pure Romaji (ASCII input, no IME)
  if (inputMode === 'romaji') {
    const normalized = inputValue.toLowerCase();
    const validRomaji = KANA_ROMAJI_MAP[targetKana];
    if (validRomaji) {
      if (validRomaji.includes(normalized)) {
        return 'correct';
      }
      if (validRomaji.some((r) => r.startsWith(normalized))) {
        return 'intermediate';
      }
    }
    return 'wrong';
  }

  // Check last two characters in case the IME/browser entered uncombined base + mark (e.g. 'か゛')
  const lastTwo = inputValue.slice(-2);
  const normalizedTwo = lastTwo
    .replace('゛', '\u3099')
    .replace('゜', '\u309A')
    .normalize('NFC');
  const lastChar = inputValue[inputValue.length - 1] ?? '';

  // 2. Matches complete target kana (either precomposed or combined two-character sequence)
  if (normalizedTwo === targetKana || lastChar === targetKana) {
    return 'correct';
  }

  // 3. QWERTY Japanese IME (mobile & PC): auto-converts romaji sequences to kana.
  // While mid-sequence (e.g. 'k', 'sh', 'ts', 'n'), the trailing ASCII buffer is a valid prefix.
  if (inputMode === 'romaji-ime') {
    const asciiMatch = inputValue.match(/[a-z',.\-\/\[\]]+$/i);
    const romajiBuf = asciiMatch ? asciiMatch[0].toLowerCase() : '';
    const validRomaji = KANA_ROMAJI_MAP[targetKana];
    if (romajiBuf && validRomaji) {
      if (validRomaji.includes(romajiBuf)) {
        return 'correct';
      }
      if (validRomaji.some((r) => r.startsWith(romajiBuf))) {
        return 'intermediate';
      }
    }
    return 'wrong';
  }

  // 4. Check intermediate states for kana-based keyboards
  if (inputMode === '12-key' || inputMode === 'gojuon') {
    // 12-key flick & 50-sounds grid: base kana and cycling/modifier intermediates
    // (e.g. 'つ' -> 'っ' -> 'づ', 'は' -> 'ば' -> 'ぱ', 'あ' -> 'ぁ')
    const mobileIntermediates = MOBILE_INTERMEDIATE_MAP[targetKana];
    if (
      mobileIntermediates &&
      (mobileIntermediates.includes(lastChar) || mobileIntermediates.includes(normalizedTwo))
    ) {
      return 'intermediate';
    }
  } else {
    // Desktop JIS: two-stroke dakuten/handakuten base character before ゛/゜
    const expectedBase = COMPOUND_KANA_BASE_MAP[targetKana];
    if (expectedBase && lastChar === expectedBase) {
      return 'intermediate';
    }
  }

  // 5. User typed an incorrect character
  return 'wrong';
}

/**
 * Parameters required to recalculate kana queue positioning.
 */
export interface RepositionKanaParams {
  queue: string[];
  stages: Record<string, number>;
  dueSteps: Record<string, number>;
  mistakes: Record<string, number>;
  hasLapsed: boolean;
  charsAnswered: number;
  enabledCategories: Record<KanaCategoryId, boolean>;
  inputMode?: InputMode;
  ease?: Record<string, number>;
  priority?: Record<string, number>;
}

/**
 * Result returned by repositionKana, containing the updated queue and SRS records.
 */
export interface RepositionKanaResult {
  queue: string[];
  stages: Record<string, number>;
  dueSteps: Record<string, number>;
  mistakes: Record<string, number>;
  hasLapsed: boolean;
  ease: Record<string, number>;
  priority: Record<string, number>;
}

/**
 * Checks whether a specific character's category switch is currently enabled
 * and available in the active keyboard input mode.
 */
export function isCharacterEnabled(
  char: string,
  enabledCategories: Record<KanaCategoryId, boolean>,
  inputMode: InputMode = 'kana'
): boolean {
  switch (inputMode) {
    case '12-key':
      if (MOBILE_UNAVAILABLE_CHARACTERS.has(char)) {
        return false;
      }
    case 'gojuon':
      if (GOJUON_UNAVAILABLE_CHARACTERS.has(char)) {
        return false;
      }
    case 'romaji':
      if (ROMAJI_UNAVAILABLE_CHARACTERS.has(char)) {
        return false;
      }
    case 'romaji-ime':
      if (ROMAJI_IME_UNAVAILABLE_CHARACTERS.has(char)) {
        return false;
      }
    case 'kana':
      if (KANA_UNAVAILABLE_CHARACTERS.has(char)) {
        return false;
      }
      break;
  }
  const categoryId = CHARACTER_CATEGORY_MAP[char];
  return categoryId ? (enabledCategories[categoryId] ?? true) : true;
}

/**
 * Filters a queue of characters, returning only those whose category is currently enabled
 * and available in the active input mode.
 *
 * @param queue Master queue of characters
 * @param enabledCategories Active category toggle states
 * @param inputMode Active keyboard input mode ('desktop' or 'mobile')
 * @returns Filtered array of currently active characters
 */
export function getActiveQueue(
  queue: string[],
  enabledCategories: Record<KanaCategoryId, boolean>,
  inputMode: InputMode = 'kana'
): string[] {
  return queue.filter((c) => isCharacterEnabled(c, enabledCategories, inputMode));
}

/**
 * Spaced Repetition (SRS) queue rescheduling algorithm:
 *
 * In-Session Leitner Spaced-Interval Scheduler:
 * 1. Takes the currently answered character from the front of the active (enabled) queue.
 * 2. Evaluates mastery progress:
 *    - If `hasLapsed` is true (user made an error during this attempt):
 *      drops character to Stage 0 (Lapse) with an immediate re-test interval (2-3 characters)
 *      to consolidate physical muscle memory.
 *    - If `hasLapsed` is false:
 *      promotes character up one stage (up to Stage 5), assigning an exponentially larger interval.
 * 3. Assigns `newDueStep = charsAnswered + 1 + interval + jitter`.
 * 4. Preserves the active lookahead character (`activeQueue[1]`) so the upcoming prompt preview
 *    remains completely stable without jarring jumps.
 * 5. Selects the next lookahead character by prioritizing characters that are due, while enforcing
 *    anti-repeat rules to prevent direct echoic repeats.
 * 6. Sorts the backlog by scheduled due steps so failed characters reappear promptly and mastered
 *    characters are spaced out.
 * 7. Maintains backward-compatible `ease` and `priority` fields for compatibility with older save states.
 *
 * @param params Full SRS state parameters
 * @returns Updated queue and SRS scheduling maps
 */
export function repositionKana({
  queue,
  stages,
  dueSteps,
  mistakes,
  hasLapsed,
  charsAnswered,
  enabledCategories,
  inputMode = 'kana',
  ease = {},
  priority = {},
}: RepositionKanaParams): RepositionKanaResult {
  const activeQueue = getActiveQueue(queue, enabledCategories, inputMode);
  const currentKana = activeQueue[0];

  if (!currentKana) {
    return {
      queue,
      stages,
      dueSteps,
      mistakes,
      hasLapsed,
      ease,
      priority,
    };
  }

  // 1. Calculate stage advancement or lapse reset
  const currentStage = stages[currentKana] ?? 0;
  let newStage: number;

  if (hasLapsed) {
    // Lapse penalty: reset to Stage 0 for immediate interleaving re-test
    newStage = 0;
  } else {
    // Successful recall on first attempt: advance up to Stage 5
    newStage = Math.min(5, currentStage + 1);
  }

  // 2. Calculate interval and new due step
  const intervalConfig = STAGE_INTERVALS[newStage] ?? { min: 2, max: 3 };
  const jitterRange = intervalConfig.max - intervalConfig.min;
  const interval = intervalConfig.min + Math.floor(Math.random() * (jitterRange + 1));
  const newDueStep = charsAnswered + 1 + interval;

  // Clone records for immutability
  const newStages = { ...stages, [currentKana]: newStage };
  const newDueSteps = { ...dueSteps, [currentKana]: newDueStep };
  const newMistakes = { ...mistakes };

  // Calculate backward-compatible ease and priority
  const newEase = {
    ...ease,
    [currentKana]: Math.pow(2, newStage + 1),
  };
  const newPriority = {
    ...priority,
    [currentKana]: newDueStep,
  };

  // 3. Preserve the immediate lookahead character from the active queue
  // activeQueue[1] is guaranteed to be the next active prompt
  const nextLookahead = activeQueue.slice(1, 1 + LOOKAHEAD);
  const nextPrompt = nextLookahead[0];

  // If there are no other active characters enabled, keep the single character
  if (!nextPrompt) {
    return {
      queue,
      stages: newStages,
      dueSteps: newDueSteps,
      mistakes: newMistakes,
      hasLapsed: false,
      ease: newEase,
      priority: newPriority,
    };
  }

  // 4. Organize backlog of all other characters (excluding the new prompt)
  const otherChars = queue.filter((c) => c !== nextPrompt);
  const enabledCandidates = otherChars.filter((c) => isCharacterEnabled(c, enabledCategories, inputMode));
  const disabledCandidates = otherChars.filter((c) => !isCharacterEnabled(c, enabledCategories, inputMode));

  // 5. Select the NEW lookahead character (to follow nextPrompt)
  // Ensure the answered character does not immediately repeat as lookahead if its interval > 1
  const eligibleForLookahead = enabledCandidates.filter(
    (c) => c !== currentKana || interval <= 1
  );

  let chosenNewLookahead: string | undefined;
  if (eligibleForLookahead.length > 0) {
    // Sort eligible candidates: lowest dueStep first (most overdue)
    const sortedEligible = [...eligibleForLookahead].sort((a, b) => {
      const dueA = newDueSteps[a] ?? 0;
      const dueB = newDueSteps[b] ?? 0;
      return dueA - dueB;
    });
    chosenNewLookahead = sortedEligible[0];
  } else if (enabledCandidates.length > 0) {
    chosenNewLookahead = enabledCandidates[0];
  }

  // 6. Sort the remaining backlog in ascending order of dueSteps
  const remainingEnabled = enabledCandidates.filter((c) => c !== chosenNewLookahead);
  remainingEnabled.sort((a, b) => {
    const dueA = newDueSteps[a] ?? 0;
    const dueB = newDueSteps[b] ?? 0;
    return dueA - dueB;
  });

  disabledCandidates.sort((a, b) => {
    const dueA = newDueSteps[a] ?? 0;
    const dueB = newDueSteps[b] ?? 0;
    return dueA - dueB;
  });

  // 7. Construct new master queue:
  // [nextPrompt, chosenNewLookahead, ...remainingEnabled, ...disabledCandidates]
  const newActivePortion = [
    nextPrompt,
    ...(chosenNewLookahead ? [chosenNewLookahead] : []),
    ...remainingEnabled,
  ];
  const newQueue = [...newActivePortion, ...disabledCandidates];

  return {
    queue: newQueue,
    stages: newStages,
    dueSteps: newDueSteps,
    mistakes: newMistakes,
    hasLapsed: false,
    ease: newEase,
    priority: newPriority,
  };
}

/**
 * Migrates any version of saved state (legacy v1 or v2 with settings) into a complete,
 * strongly-typed KanaState without losing user progress.
 */
export function migrateLoadedState(
  loaded: Partial<KanaState> & { theme?: Theme; showKeyboard?: boolean; inputMode?: InputMode; settings?: KanaSettings }
): KanaState {
  const charsAnswered = typeof loaded.charsAnswered === 'number' ? loaded.charsAnswered : 0;

  // 1. Queue: keep loaded order, append any missing supported characters
  const loadedQueue = Array.isArray(loaded.queue) ? loaded.queue : [];
  const missingChars = allInputCharactersArray.filter((c) => !loadedQueue.includes(c));
  const queue = [...loadedQueue, ...missingChars];

  // 2. Categories: merge with defaults
  const enabledCategories = {
    ...DEFAULT_ENABLED_CATEGORIES,
    ...(loaded.enabledCategories ?? {}),
  };

  // 3. Stages: if stages exists use it; otherwise map legacy ease to Leitner stage
  const stages: Record<string, number> = {};
  const loadedStages = loaded.stages;
  const loadedEase = loaded.ease ?? {};

  for (const char of allInputCharactersArray) {
    if (loadedStages && typeof loadedStages[char] === 'number') {
      stages[char] = Math.max(0, Math.min(5, Math.floor(loadedStages[char])));
    } else if (loadedEase[char] !== undefined) {
      const e = loadedEase[char];
      if (e >= 32) stages[char] = 4;
      else if (e >= 16) stages[char] = 3;
      else if (e >= 8) stages[char] = 2;
      else if (e >= 4) stages[char] = 1;
      else stages[char] = 0;
    } else {
      stages[char] = initialStages[char] ?? 0;
    }
  }

  // 4. DueSteps: if dueSteps exists use it; otherwise map legacy priority or stagger
  const dueSteps: Record<string, number> = {};
  const loadedDueSteps = loaded.dueSteps;
  const loadedPriority = loaded.priority ?? {};

  for (let i = 0; i < allInputCharactersArray.length; i++) {
    const char = allInputCharactersArray[i];
    if (!char) continue;
    const charDue = loadedDueSteps?.[char];
    const charPrio = loadedPriority[char];
    if (typeof charDue === 'number') {
      dueSteps[char] = charDue;
    } else if (typeof charPrio === 'number') {
      dueSteps[char] = charsAnswered + Math.max(0, Math.floor(charPrio / 5));
    } else {
      dueSteps[char] = charsAnswered + i;
    }
  }

  // 5. Mistakes
  const mistakes: Record<string, number> = {
    ...initialMistakes,
    ...(loaded.mistakes ?? {}),
  };

  // 6. Ease & Priority for backward compatibility
  const ease: Record<string, number> = {};
  const priority: Record<string, number> = {};
  for (const char of allInputCharactersArray) {
    ease[char] = Math.pow(2, (stages[char] ?? 0) + 1);
    priority[char] = dueSteps[char] ?? 0;
  }

  // 7. Settings (theme, showKeyboard, inputMode, autoSwitchTheme, disableGamificationEffects)
  const rawInputMode = loaded.settings?.inputMode ?? loaded.inputMode;
  const rawAutoSwitch = loaded.settings?.autoSwitchTheme;
  const rawDisableGamification = loaded.settings?.disableGamificationEffects;
  const rawClassicMode = loaded.settings?.classicMode;
  const settings: KanaSettings = {
    theme: loaded.settings?.theme ?? loaded.theme ?? 'light',
    showKeyboard:
      loaded.settings?.showKeyboard ??
      (typeof loaded.showKeyboard === 'boolean' ? loaded.showKeyboard : true),
    inputMode:
      rawInputMode && INPUT_MODES.includes(rawInputMode) ? rawInputMode : undefined,
    autoSwitchTheme: typeof rawAutoSwitch === 'boolean' ? rawAutoSwitch : false,
    disableGamificationEffects:
      typeof rawDisableGamification === 'boolean' ? rawDisableGamification : false,
    classicMode: typeof rawClassicMode === 'boolean' ? rawClassicMode : false,
  };

  const streak =
    typeof loaded.streak === 'number' && Number.isFinite(loaded.streak) && loaded.streak >= 0
      ? Math.floor(loaded.streak)
      : 0;

  return {
    stages,
    dueSteps,
    mistakes,
    hasLapsed: false,
    ease,
    priority,
    queue,
    charsAnswered,
    streak,
    enabledCategories,
    settings,
  };
}
