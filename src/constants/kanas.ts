import { KanaState, KanaCategoryId, KanaCategoryConfig, InputMode } from '@/types/kana';

/**
 * Number of upcoming kana characters shown ahead of the current active prompt.
 */
export const LOOKAHEAD = 1;

/**
 * Baseline ease score assigned to each character at the start.
 * Retained for backward-compatible save state exports.
 */
export const DEFAULT_INITIAL_EASE = 2;

/**
 * Baseline Leitner stage assigned to each character at the start (Stage 0).
 */
export const DEFAULT_INITIAL_STAGE = 0;

/**
 * Keystroke interval configuration for each Leitner stage:
 * - Stage 0 (Lapse / New): review immediately within 2 to 3 characters.
 * - Stage 1 (Reinforce): review in 5 to 7 characters.
 * - Stage 2 (Familiar): review in 12 to 16 characters.
 * - Stage 3 (Proficient): review in 25 to 35 characters.
 * - Stage 4 (Mastered): review in 50 to 70 characters.
 * - Stage 5 (Retained): review in 100 to 140 characters.
 */
export const STAGE_INTERVALS: Record<number, { min: number; max: number }> = {
  0: { min: 2, max: 3 },
  1: { min: 5, max: 7 },
  2: { min: 12, max: 16 },
  3: { min: 25, max: 35 },
  4: { min: 50, max: 70 },
  5: { min: 100, max: 140 },
};

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
  'をぁぃぅぇぉっゃゅょ';

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
 * Metadata for each supported keyboard input mode.
 */
export interface InputModeConfig {
  id: InputMode;
  label: string;
  description: string;
}

export const INPUT_MODE_CONFIGS: InputModeConfig[] = [
  {
    id: 'desktop',
    label: 'JIS Kana',
    description: 'Desktop JIS direct kana keyboard (89 chars)',
  },
  {
    id: 'mobile',
    label: '12-Key Flick',
    description: 'Mobile 12-key flick keyboard (84 chars)',
  },
  {
    id: 'gojuon',
    label: '50-Sounds',
    description: '50-sounds Japanese grid keyboard (84 chars)',
  },
  {
    id: 'romaji-ime',
    label: 'Romaji IME',
    description: 'Auto-converting QWERTY Japanese IME on mobile & PC (87 chars)',
  },
  {
    id: 'romaji',
    label: 'Pure Romaji',
    description: 'Pure ASCII romaji typing without an IME (87 chars)',
  },
];

/**
 * Characters from the desktop JIS set that are NOT available on the basic
 * mobile 12-key flick screen or 50-sounds main grid (they require switching to a
 * symbol page, or in the case of standalone ゛/゜, only modify a preceding kana).
 */
export const MOBILE_UNAVAILABLE_CHARACTERS = new Set(['・', '「', '」', '゛', '゜']);

/**
 * Standalone ゛ and ゜ marks cannot be typed directly in Romaji or Romaji IME.
 */
export const ROMAJI_UNAVAILABLE_CHARACTERS = new Set(['゛', '゜']);

/**
 * Valid ASCII romaji sequences for every romaji-typeable kana & punctuation mark.
 * Includes standard Hepburn, Kunrei-shiki, Nihon-shiki, and IME variants.
 */
export const KANA_ROMAJI_MAP: Record<string, string[]> = {
  // Basic vowels
  'あ': ['a'], 'い': ['i', 'yi'], 'う': ['u', 'wu', 'whu'], 'え': ['e'], 'お': ['o'],
  // K-row
  'か': ['ka', 'ca'], 'き': ['ki'], 'く': ['ku', 'cu', 'qu'], 'け': ['ke'], 'こ': ['ko', 'co'],
  // S-row
  'さ': ['sa'], 'し': ['shi', 'si', 'ci'], 'す': ['su'], 'せ': ['se', 'ce'], 'そ': ['so'],
  // T-row
  'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'],
  // N-row
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
  // H-row
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu', 'hu'], 'へ': ['he'], 'ほ': ['ho'],
  // M-row
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
  // Y-row
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
  // R-row
  'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
  // W-row & syllabic N
  'わ': ['wa'], 'を': ['wo'], 'ん': ['nn', "n'", 'xn'],
  // Dakuten
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
  'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
  'だ': ['da'], 'ぢ': ['di'], 'づ': ['du'], 'で': ['de'], 'ど': ['do'],
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
  'ゔ': ['vu'],
  // Handakuten
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],
  // Small kana
  'ぁ': ['la', 'xa'], 'ぃ': ['li', 'xi', 'lyi', 'xyi'], 'ぅ': ['lu', 'xu'],
  'ぇ': ['le', 'xe', 'lye', 'xye'], 'ぉ': ['lo', 'xo'],
  'っ': ['ltu', 'ltsu', 'xtu', 'xtsu'],
  'ゃ': ['lya', 'xya'], 'ゅ': ['lyu', 'xyu'], 'ょ': ['lyo', 'xyo'],
  // Punctuation
  'ー': ['-'],
  '、': [','],
  '。': ['.'],
  '・': ['/'],
  '「': ['['],
  '」': [']'],
};

/**
 * Intermediate characters produced while tapping/cycling the `゛゜小` key on a
 * mobile 12-key flick keyboard before reaching the target character.
 * - Small kana (ぁぃぅぇぉっゃゅょ): base -> small (2 inputs)
 * - Dakuten (が..ぼ): base -> dakuten (2 inputs); づ & ゔ pass through small kana (3 inputs)
 * - Handakuten (ぱ..ぽ): base -> dakuten -> handakuten (3 inputs)
 */
export const MOBILE_INTERMEDIATE_MAP: Record<string, string[]> = {
  // Small kana
  'ぁ': ['あ'], 'ぃ': ['い'], 'ぅ': ['う'], 'ぇ': ['え'], 'ぉ': ['お'],
  'っ': ['つ'], 'ゃ': ['や'], 'ゅ': ['ゆ'], 'ょ': ['よ'],
  // Dakuten
  'が': ['か'], 'ぎ': ['き'], 'ぐ': ['く'], 'げ': ['け'], 'ご': ['こ'],
  'ざ': ['さ'], 'じ': ['し'], 'ず': ['す'], 'ぜ': ['せ'], 'ぞ': ['そ'],
  'だ': ['た'], 'ぢ': ['ち'], 'づ': ['つ', 'っ'], 'で': ['て'], 'ど': ['と'],
  'ば': ['は'], 'び': ['ひ'], 'ぶ': ['ふ'], 'べ': ['へ'], 'ぼ': ['ほ'],
  'ゔ': ['う', 'ぅ'],
  // Handakuten
  'ぱ': ['は', 'ば'], 'ぴ': ['ひ', 'び'], 'ぷ': ['ふ', 'ぶ'], 'ぺ': ['へ', 'べ'], 'ぽ': ['ほ', 'ぼ'],
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
 * Returns the category metadata adjusted for the active keyboard input mode.
 * - `mobile` & `gojuon`: `を` is in Basic Kana, Small Kana uses `小`, Punctuation is `ー、。`.
 * - `romaji` & `romaji-ime`: Punctuation excludes standalone `゛` and `゜` (`ー、。・「」`).
 * - `desktop`: full JIS Kana category set.
 */
export function getKanaCategoriesForMode(inputMode: InputMode): KanaCategoryConfig[] {
  if (inputMode === 'mobile' || inputMode === 'gojuon') {
    return [
      {
        id: 'basic',
        label: 'Basic Kana',
        characters: BASIC_KANA_CHARACTERS + 'を',
        sample: 'あいう...',
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
        label: 'Small Kana (小)',
        characters: SHIFT_MODIFIER_CHARACTERS.replace('を', ''),
        sample: 'ぁっゃ...',
      },
      {
        id: 'punctuation',
        label: 'Punctuation',
        characters: 'ー、。',
        sample: 'ー、。',
      },
    ];
  }

  if (inputMode === 'romaji' || inputMode === 'romaji-ime') {
    return [
      KANA_CATEGORIES[0]!,
      KANA_CATEGORIES[1]!,
      KANA_CATEGORIES[2]!,
      {
        id: 'shift',
        label: 'Small / を',
        characters: SHIFT_MODIFIER_CHARACTERS,
        sample: 'ぁっを...',
      },
      {
        id: 'punctuation',
        label: 'Punctuation',
        characters: 'ー、。・「」',
        sample: 'ー、。...',
      },
    ];
  }

  return KANA_CATEGORIES;
}

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
 * Initial Leitner stages (0 for all characters).
 */
export const initialStages: Record<string, number> = allInputCharactersArray.reduce(
  (acc, key) => ({ ...acc, [key]: DEFAULT_INITIAL_STAGE }),
  {}
);

/**
 * Initial due steps staggered across the character array so that items
 * are introduced progressively in touch-typing order.
 */
export const initialDueSteps: Record<string, number> = allInputCharactersArray.reduce(
  (acc, key, i) => ({ ...acc, [key]: i }),
  {}
);

/**
 * Initial mistake counters (0 for all characters).
 */
export const initialMistakes: Record<string, number> = allInputCharactersArray.reduce(
  (acc, key) => ({ ...acc, [key]: 0 }),
  {}
);

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
  stages: initialStages,
  dueSteps: initialDueSteps,
  mistakes: initialMistakes,
  hasLapsed: false,
  ease: allInputCharactersArray.reduce((acc, key) => ({ ...acc, [key]: DEFAULT_INITIAL_EASE }), {}),
  queue: allInputCharactersArray,
  priority: initialPriority,
  charsAnswered: 0,
  streak: 0,
  enabledCategories: DEFAULT_ENABLED_CATEGORIES,
  settings: {
    theme: 'light',
    showKeyboard: true,
    inputMode: 'desktop',
    autoSwitchTheme: false,
    disableGamificationEffects: false,
    classicMode: false,
  },
};
