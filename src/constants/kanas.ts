import { KanaState, KanaCategoryId, KanaCategoryConfig } from '@/types/kana';

/**
 * Number of upcoming kana characters shown ahead of the current active prompt.
 */
export const LOOKAHEAD = 1;

/**
 * Baseline ease score assigned to each character at the start.
 * Correct answers double this value; wrong answers divide it by 8 (minimum 1).
 */
export const DEFAULT_INITIAL_EASE = 2;

// =============================================================================
// Character Sets for Japanese Kana Keyboard (JIS Kana Layout)
// =============================================================================

/**
 * Unmodified single-key basic kana ordered by standard Japanese touch-typing keyboard rows:
 * Home row (ASDF), QWERTY row, Number row, and Bottom row (ZXCV).
 * Total: 45 characters.
 */
export const BASIC_KANA_CHARACTERS =
  'ちとしはきくまのりれけたていすかんなにらせむろぬふあうえおやゆよわほへつさそひこみもねるめ';

/**
 * Characters requiring the Shift modifier key:
 * - Particle を (Shift + 0 / わ)
 * - Small vowels: ぁ ぃ ぅ ぇ ぉ
 * - Small sokuon: っ
 * - Small ya-line: ゃ ゅ ょ
 * - Small wa, ka, ke: ゎ ゕ ゖ
 * Total: 13 characters.
 */
export const SHIFT_MODIFIER_CHARACTERS =
  'をぁぃぅぇぉっゃゅょゎゕゖ';

/**
 * Mapping connecting each small kana character (小文字 / 小書き) to its regular counterpart
 * and a visual comparison label. Used by the UI to highlight small kana so learners do not
 * confuse them with standard full-sized kana.
 */
export const SMALL_KANA_MAP: Record<string, { regular: string; label: string }> = {
  'ぁ': { regular: 'あ', label: 'small ぁ (vs あ)' },
  'ぃ': { regular: 'い', label: 'small ぃ (vs い)' },
  'ぅ': { regular: 'う', label: 'small ぅ (vs う)' },
  'ぇ': { regular: 'え', label: 'small ぇ (vs え)' },
  'ぉ': { regular: 'お', label: 'small ぉ (vs お)' },
  'っ': { regular: 'つ', label: 'small っ (sokuon, vs つ)' },
  'ゃ': { regular: 'や', label: 'small ゃ (vs や)' },
  'ゅ': { regular: 'ゆ', label: 'small ゅ (vs ゆ)' },
  'ょ': { regular: 'よ', label: 'small ょ (vs よ)' },
  'ゎ': { regular: 'わ', label: 'small ゎ (vs わ)' },
  'ゕ': { regular: 'か', label: 'small ゕ (vs か)' },
  'ゖ': { regular: 'け', label: 'small ゖ (vs け)' },
};

/**
 * Voiced kana characters (Dakuten) created by typing the base kana followed by the voiced mark ゛:
 * Covers が/ざ/だ/ば rows and voiced vowel ゔ.
 * Total: 21 characters.
 */
export const DAKUTEN_CHARACTERS =
  'がぎぐげござじずぜぞだぢづでどばびぶべぼゔ';

/**
 * Semi-voiced kana characters (Handakuten) created by typing the base kana followed by the semi-voiced mark ゜:
 * Covers the ぱ row (ぱ ぴ ぷ ぺ ぽ).
 * Total: 5 characters.
 */
export const HANDAKUTEN_CHARACTERS =
  'ぱぴぷぺぽ';

/**
 * Japanese punctuation marks and symbol keys directly accessible on a kana keyboard layout:
 * - Chouonpu (prolonged sound mark): ー
 * - Touten (Japanese comma): 、
 * - Kuten (Japanese period / full stop): 。
 * - Nakaguro (Japanese middle dot): ・
 * - Japanese quotation brackets: 「 and 」
 * - Standalone voiced mark (Dakuten): ゛
 * - Standalone semi-voiced mark (Handakuten): ゜
 * Total: 8 characters.
 */
export const PUNCTUATION_AND_SYMBOL_CHARACTERS =
  'ー、。・「」゛゜';

/**
 * Mapping of compound two-stroke kana (Dakuten and Handakuten) to their unvoiced base kana.
 * When typing a dakuten/handakuten on a Japanese Kana layout, the user first inputs the base
 * character (e.g. 'か' for 'が', or 'は' for 'ぱ') and then presses the modifier key ('゛' or '゜').
 * This mapping allows the trainer to recognize the first keystroke as an intermediate state
 * rather than prematurely penalizing the user with a 'wrong' SRS penalty.
 */
export const COMPOUND_KANA_BASE_MAP: Record<string, string> = {
  // Dakuten (Voiced kana: base + ゛)
  'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ',
  'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ',
  'だ': 'た', 'ぢ': 'ち', 'づ': 'つ', 'で': 'て', 'ど': 'と',
  'ば': 'は', 'び': 'ひ', 'ぶ': 'ふ', 'べ': 'へ', 'ぼ': 'ほ',
  'ゔ': 'う',
  // Handakuten (Semi-voiced kana: base + ゜)
  'ぱ': 'は', 'ぴ': 'ひ', 'ぷ': 'ふ', 'ぺ': 'へ', 'ぽ': 'ほ',
};

/**
 * Metadata configuration for each selectable quiz category switch.
 */
export const KANA_CATEGORIES: KanaCategoryConfig[] = [
  {
    id: 'basic',
    label: 'Basic Kana',
    characters: BASIC_KANA_CHARACTERS,
    sample: 'ちとし...',
  },
  {
    id: 'dakuten',
    label: 'Dakuten (゛)',
    characters: DAKUTEN_CHARACTERS,
    sample: 'がぎぐ...',
  },
  {
    id: 'handakuten',
    label: 'Handakuten (゜)',
    characters: HANDAKUTEN_CHARACTERS,
    sample: 'ぱぴぷ...',
  },
  {
    id: 'shift',
    label: 'Small / Shift',
    characters: SHIFT_MODIFIER_CHARACTERS,
    sample: 'ぁっを...',
  },
  {
    id: 'punctuation',
    label: 'Punctuation',
    characters: PUNCTUATION_AND_SYMBOL_CHARACTERS,
    sample: 'ー、。...',
  },
];

/**
 * Default category switch states: all categories enabled by default.
 */
export const DEFAULT_ENABLED_CATEGORIES: Record<KanaCategoryId, boolean> = {
  basic: true,
  dakuten: true,
  handakuten: true,
  shift: true,
  punctuation: true,
};

/**
 * Fast lookup map from any individual character to its respective KanaCategoryId.
 */
export const CHARACTER_CATEGORY_MAP: Record<string, KanaCategoryId> = {};
for (const category of KANA_CATEGORIES) {
  for (const char of category.characters) {
    CHARACTER_CATEGORY_MAP[char] = category.id;
  }
}

/**
 * Complete ordered string of all characters that can be input on a Kana keyboard layout.
 * Includes basic kana, shift-modified kana, voiced (dakuten), semi-voiced (handakuten), and punctuation/symbols.
 * Total: 92 unique characters.
 */
export const ALL_KANA_INPUT_CHARACTERS_IN_ORDER =
  BASIC_KANA_CHARACTERS +
  SHIFT_MODIFIER_CHARACTERS +
  DAKUTEN_CHARACTERS +
  HANDAKUTEN_CHARACTERS +
  PUNCTUATION_AND_SYMBOL_CHARACTERS;

/**
 * Backward-compatibility alias for ALL_KANA_INPUT_CHARACTERS_IN_ORDER.
 */
export const ALL_KANAS_IN_ORDER = ALL_KANA_INPUT_CHARACTERS_IN_ORDER;

/**
 * Array of all input characters derived from ALL_KANA_INPUT_CHARACTERS_IN_ORDER.
 */
export const allInputCharactersArray: string[] = ALL_KANA_INPUT_CHARACTERS_IN_ORDER.split('');

/**
 * Backward-compatibility alias for allInputCharactersArray.
 */
export const kanasArray: string[] = allInputCharactersArray;

/**
 * Initial priority map where each character's initial priority is staggered
 * based on its initial index (index * 5), creating a gentle staggered introduction.
 */
export const initialPriority: Record<string, number> = allInputCharactersArray.reduce(
  (acc, key, i) => ({ ...acc, [key]: i * 5 }),
  {}
);

/**
 * Default initial state for the SRS trainer populated with all kana keyboard input characters.
 */
export const initialState: KanaState = {
  ease: allInputCharactersArray.reduce((acc, key) => ({ ...acc, [key]: DEFAULT_INITIAL_EASE }), {}),
  queue: allInputCharactersArray,
  priority: initialPriority,
  charsAnswered: 0,
  enabledCategories: DEFAULT_ENABLED_CATEGORIES,
};
