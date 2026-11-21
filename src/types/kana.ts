import { Theme, FontId, BackgroundId } from '@/hooks/useTheme';

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
 * User interface configuration settings that persist across sessions.
 */
export interface KanaSettings {
  /** Active color theme */
  theme?: Theme;
  /** Active font style reward ('theme' for auto or specific unlocked font) */
  font?: FontId;
  /** Active background particle effect ('theme' for auto or specific unlocked effect) */
  background?: BackgroundId;
  /** Whether the JIS keyboard layout reference image is visible */
  showKeyboard?: boolean;
}

/**
 * Represents the application state for the Spaced Repetition System (SRS).
 * Employs an in-session Leitner spaced repetition interval scheduler with backwards-compatible
 * fallbacks for legacy save states.
 */
export interface KanaState {
  /**
   * Mastery stage per kana character (0 to 5) for in-session Leitner spacing.
   * - 0: Lapse / New (review in 2-3 characters)
   * - 1: Reinforcement (review in 5-7 characters)
   * - 2: Familiar (review in 12-16 characters)
   * - 3: Proficient (review in 25-35 characters)
   * - 4: Mastered (review in 50-70 characters)
   * - 5: Retained (review in 100-140 characters)
   */
  stages: Record<string, number>;

  /**
   * Session step count at which each character is scheduled for review.
   */
  dueSteps: Record<string, number>;

  /**
   * Cumulative count of errors made for each character.
   */
  mistakes: Record<string, number>;

  /**
   * Tracks whether the current active prompt had an error during the active attempt.
   * When true, completing the character resets it to Stage 0 (Lapse) rather than promoting it.
   */
  hasLapsed: boolean;

  /**
   * Spaced repetition ease multiplier per kana character (maintained for backward compatibility).
   */
  ease: Record<string, number>;

  /**
   * Master queue of all kana characters, ordered by SRS scheduling.
   */
  queue: string[];

  /**
   * Relative priority score per kana character (maintained for backward compatibility).
   */
  priority: Record<string, number>;

  /**
   * Total count of prompts answered correctly in the session.
   */
  charsAnswered: number;

  /**
   * Category switches dictating which character groups the quiz asks for.
   * Keyed by KanaCategoryId with boolean active states.
   */
  enabledCategories: Record<KanaCategoryId, boolean>;

  /**
   * Auto-saved website settings (theme, hide keyboard).
   */
  settings?: KanaSettings;
}

/**
 * Reducer actions for updating KanaState.
 */
export type KanaAction =
  /** Dispatched when the user types the matching character correctly */
  | { type: 'correct' }
  /** Dispatched when the user inputs an incorrect character */
  | { type: 'wrong'; ans?: string }
  /** Dispatched when loading state from a saved JSON backup file or localStorage */
  | { type: 'loadState'; state: Partial<KanaState> & { theme?: Theme; showKeyboard?: boolean; settings?: KanaSettings } }
  /** Dispatched when toggling a category switch on or off */
  | { type: 'toggleCategory'; category: KanaCategoryId }
  /** Dispatched when replacing all category switch settings */
  | { type: 'setCategories'; categories: Record<KanaCategoryId, boolean> }
  /** Dispatched when updating user preferences (theme, showKeyboard) */
  | { type: 'updateSettings'; settings: Partial<KanaSettings> }
  /** Dispatched when resetting all SRS training progress back to defaults */
  | { type: 'resetProgress' };
