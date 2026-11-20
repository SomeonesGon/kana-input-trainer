import { LOOKAHEAD, CHARACTER_CATEGORY_MAP, COMPOUND_KANA_BASE_MAP } from '@/constants/kanas';
import { KanaCategoryId } from '@/types/kana';

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
  targetKana: string | undefined
): InputEvaluationResult {
  if (!inputValue || !targetKana) {
    return 'none';
  }

  // Check last two characters in case the IME/browser entered uncombined base + mark (e.g. 'か゛')
  const lastTwo = inputValue.slice(-2);
  const normalizedTwo = lastTwo
    .replace('゛', '\u3099')
    .replace('゜', '\u309A')
    .normalize('NFC');
  const lastChar = inputValue[inputValue.length - 1];

  // 1. Matches complete target kana (either precomposed or combined two-character sequence)
  if (normalizedTwo === targetKana || lastChar === targetKana) {
    return 'correct';
  }

  // 2. Check if the target kana is a compound character and the user just typed its valid base character
  const expectedBase = COMPOUND_KANA_BASE_MAP[targetKana];
  if (expectedBase && lastChar === expectedBase) {
    return 'intermediate';
  }

  // 3. User typed an incorrect character
  return 'wrong';
}

/**
 * Parameters required to recalculate kana queue positioning.
 */
export interface RepositionKanaParams {
  queue: string[];
  ease: Record<string, number>;
  priority: Record<string, number>;
  enabledCategories: Record<KanaCategoryId, boolean>;
}

/**
 * Result returned by repositionKana, containing the updated queue and updated priority map.
 */
export interface RepositionKanaResult {
  queue: string[];
  priority: Record<string, number>;
}

/**
 * Checks whether a specific character's category switch is currently enabled.
 * If the character has no category mapping (unexpected), defaults to true.
 */
export function isCharacterEnabled(
  char: string,
  enabledCategories: Record<KanaCategoryId, boolean>
): boolean {
  const categoryId = CHARACTER_CATEGORY_MAP[char];
  return categoryId ? (enabledCategories[categoryId] ?? true) : true;
}

/**
 * Filters a queue of characters, returning only those whose category is currently enabled.
 *
 * @param queue Master queue of characters
 * @param enabledCategories Active category toggle states
 * @returns Filtered array of currently active characters
 */
export function getActiveQueue(
  queue: string[],
  enabledCategories: Record<KanaCategoryId, boolean>
): string[] {
  return queue.filter((c) => isCharacterEnabled(c, enabledCategories));
}

/**
 * // reposition the first kana in the queue depending on its ease
 *
 * Spaced Repetition (SRS) queue rescheduling algorithm:
 * 1. Takes the currently answered character from the front of the active (enabled) queue.
 * 2. Increments its priority by its ease score plus a random variance (jitter)
 *    to prevent deterministic clumped repetition:
 *    priority += ease + floor(random * (ease / 2))
 * 3. Preserves immediate lookahead characters from the active queue so the next
 *    previewed question doesn't unexpectedly jump away.
 * 4. Re-inserts the answered character into the remaining backlog and sorts all backlog
 *    characters (enabled and disabled) in ascending priority order.
 * 5. Returns both the new master queue and the updated priority map.
 *
 * @param params Object containing current master queue, ease map, priority map, and enabled categories.
 * @returns { queue, priority } updated master queue and priority map.
 */
export function repositionKana({
  queue,
  ease,
  priority,
  enabledCategories,
}: RepositionKanaParams): RepositionKanaResult {
  // Determine which characters are currently enabled for the quiz
  const activeQueue = getActiveQueue(queue, enabledCategories);
  const kana = activeQueue[0];
  if (!kana) {
    return { queue, priority };
  }

  // Clone priority map to maintain reducer immutability
  const newPriority = { ...priority };

  // Fallbacks handle cases where ease or priority might not be initialized
  const currentEase = ease[kana] ?? 2;
  const currentPriority = newPriority[kana] ?? 0;

  // Calculate new priority with jitter
  newPriority[kana] = currentPriority + currentEase + Math.floor((Math.random() * currentEase) / 2);

  // Preserve the immediate lookahead character from the active queue so user preview stays stable
  const nextLookahead = activeQueue.slice(1, 1 + LOOKAHEAD);
  const protectedSet = new Set(nextLookahead);

  // Collect all other characters from the master queue (excluding answered kana and protected lookahead)
  const remaining = queue.filter((c) => c !== kana && !protectedSet.has(c));

  // Re-insert the answered kana into the backlog
  remaining.push(kana);

  // Sort backlog in ascending order of priority (lower priority score = tested sooner)
  remaining.sort((a, b) => (newPriority[a] ?? 0) - (newPriority[b] ?? 0));

  // Construct new master queue: protected lookahead first, followed by priority-sorted backlog
  const newQueue = [...nextLookahead, ...remaining];

  return { queue: newQueue, priority: newPriority };
}
