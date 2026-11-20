/**
 * Type definitions for Kana Input Trainer state and actions.
 */

/**
 * Valid category identifiers for grouping characters on a Kana keyboard.
 */
export type KanaCategoryId = 'basic' | 'shift' | 'dakuten' | 'handakuten' | 'punctuation';

/**
 * Configuration schema for a kana character category switch.
 */
export interface KanaCategoryConfig {
  /** Unique category identifier */
  id: KanaCategoryId;
  /** Human-readable label displayed next to the toggle switch */
  label: string;
  /** String containing all characters in this category */
  characters: string;
  /** Short example string for tooltip or reference (e.g. 'ち, と...') */
  sample: string;
}

/**
 * Represents the core application state for the Spaced Repetition System (SRS).
 */
export interface KanaState {
  /**
   * Spaced repetition ease multiplier per kana character.
   * Higher values mean the user knows the character well, causing it to appear less frequently.
   */
  ease: Record<string, number>;

  /**
   * Master queue of all kana characters, ordered by SRS scheduling priority.
   */
  queue: string[];

  /**
   * Relative priority score per kana character.
   * Characters with lower priority scores are scheduled to appear sooner in the queue.
   */
  priority: Record<string, number>;

  /**
   * Total count of prompts answered correctly in the current session.
   */
  charsAnswered: number;

  /**
   * Category switches dictating which character groups the quiz asks for.
   * Keyed by KanaCategoryId with boolean active states.
   */
  enabledCategories: Record<KanaCategoryId, boolean>;
}

/**
 * Reducer actions for updating KanaState.
 */
export type KanaAction =
  /** Dispatched when the user types the matching character correctly */
  | { type: 'correct' }
  /** Dispatched when the user inputs an incorrect character */
  | { type: 'wrong'; ans?: string }
  /** Dispatched when loading state from a saved JSON backup file */
  | { type: 'loadState'; state: Partial<KanaState> }
  /** Dispatched when toggling a category switch on or off */
  | { type: 'toggleCategory'; category: KanaCategoryId }
  /** Dispatched when replacing all category switch settings */
  | { type: 'setCategories'; categories: Record<KanaCategoryId, boolean> };
