import { createContext, useContext } from 'react';

/** Available visual themes including unlockables. */
export type Theme =
  | 'light'
  | 'dark'
  | 'pink'
  | 'cyberpunk'
  | 'matrix'
  | 'synthwave'
  | 'gold'
  | 'sakura'
  | 'arcade'
  | 'nebula'
  | 'emerald'
  | 'bloodmoon';

/** Available font styles including unlockables and 'theme' (auto-sync). */
export type FontId =
  | 'theme'
  | 'default'
  | 'rounded'
  | 'terminal'
  | 'matrix'
  | 'synthwave'
  | 'gold'
  | 'sakura'
  | 'arcade'
  | 'nebula'
  | 'emerald'
  | 'bloodmoon';

/** Available background particle effects including unlockables and 'theme' (auto-sync). */
export type BackgroundId =
  | 'theme'
  | 'clouds'
  | 'stars'
  | 'hearts'
  | 'embers'
  | 'matrix'
  | 'synthwave'
  | 'gold'
  | 'sakura'
  | 'arcade'
  | 'nebula'
  | 'emerald'
  | 'bloodmoon';

export const THEMES: Theme[] = [
  'light',
  'dark',
  'pink',
  'cyberpunk',
  'matrix',
  'synthwave',
  'gold',
  'sakura',
  'arcade',
  'nebula',
  'emerald',
  'bloodmoon',
];

/** Metadata and level requirements for each theme. */
export interface ThemeConfig {
  id: Theme;
  label: string;
  minLevel: number;
  description: string;
  defaultFont: FontId;
  defaultBackground: BackgroundId;
}

export const THEME_CONFIGS: ThemeConfig[] = [
  {
    id: 'light',
    label: 'Light',
    minLevel: 1,
    description: 'Clean white with gentle floating clouds',
    defaultFont: 'default',
    defaultBackground: 'clouds',
  },
  {
    id: 'dark',
    label: 'Midnight Dark',
    minLevel: 1,
    description: 'Midnight navy with twinkling celestial stars',
    defaultFont: 'default',
    defaultBackground: 'stars',
  },
  {
    id: 'pink',
    label: 'Sakura Blossom',
    minLevel: 1,
    description: 'Pastel blossom with floating hearts',
    defaultFont: 'rounded',
    defaultBackground: 'hearts',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk Terminal',
    minLevel: 2,
    description: 'Crimson cyber terminal with glowing digital embers',
    defaultFont: 'terminal',
    defaultBackground: 'embers',
  },
  {
    id: 'matrix',
    label: 'The Matrix',
    minLevel: 3,
    description: 'Green and black with falling Japanese digital rain',
    defaultFont: 'matrix',
    defaultBackground: 'matrix',
  },
  {
    id: 'synthwave',
    label: 'Synthwave Neon',
    minLevel: 4,
    description: '80s retro neon with glowing geometric diamonds',
    defaultFont: 'synthwave',
    defaultBackground: 'synthwave',
  },
  {
    id: 'gold',
    label: 'Imperial Gold',
    minLevel: 5,
    description: 'Obsidian gold with radiant celestial sparkles',
    defaultFont: 'gold',
    defaultBackground: 'gold',
  },
  {
    id: 'sakura',
    label: 'Sakura Zen',
    minLevel: 6,
    description: 'Tranquil slate and cherry blossom with drifting petals',
    defaultFont: 'sakura',
    defaultBackground: 'sakura',
  },
  {
    id: 'arcade',
    label: '8-Bit Retro Arcade',
    minLevel: 7,
    description: 'Dark arcade cabinet with floating 8-bit geometric pixels',
    defaultFont: 'arcade',
    defaultBackground: 'arcade',
  },
  {
    id: 'nebula',
    label: 'Mystic Cosmic Nebula',
    minLevel: 8,
    description: 'Deep cosmic violet with pulsing celestial nebula stardust',
    defaultFont: 'nebula',
    defaultBackground: 'nebula',
  },
  {
    id: 'emerald',
    label: 'Emerald Shrine',
    minLevel: 9,
    description: 'Lush bamboo shrine green with floating leaves and fireflies',
    defaultFont: 'emerald',
    defaultBackground: 'emerald',
  },
  {
    id: 'bloodmoon',
    label: 'Bloodmoon Samurai',
    minLevel: 10,
    description: 'Deep eclipse obsidian and crimson with drifting maple leaves',
    defaultFont: 'bloodmoon',
    defaultBackground: 'bloodmoon',
  },
];

/** Metadata and level requirements for each font reward. */
export interface FontConfig {
  id: FontId;
  label: string;
  minLevel: number;
  fontFamily: string;
  description: string;
}

export const FONT_CONFIGS: FontConfig[] = [
  {
    id: 'theme',
    label: 'Theme Default (Auto)',
    minLevel: 1,
    fontFamily: '',
    description: 'Automatically switches to the active theme’s signature font',
  },
  {
    id: 'default',
    label: 'Modern Clean Sans',
    minLevel: 1,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    description: 'Ultra-clean modern sans-serif for crystal clear legibility',
  },
  {
    id: 'rounded',
    label: 'Cute Rounded',
    minLevel: 1,
    fontFamily: "'Zen Maru Gothic', 'M PLUS Rounded 1c', 'Quicksand', sans-serif",
    description: 'Friendly, rounded Japanese & Latin typography',
  },
  {
    id: 'terminal',
    label: 'Cyber Terminal CRT',
    minLevel: 2,
    fontFamily: "'VT323', 'SF Mono', Consolas, 'Liberation Mono', monospace",
    description: 'Retro phosphor monochrome command terminal display',
  },
  {
    id: 'matrix',
    label: 'Matrix Digital Code',
    minLevel: 3,
    fontFamily: "'Share Tech Mono', 'Courier New', Courier, monospace",
    description: 'Sharp tech monospace inspired by cybernetic data flows',
  },
  {
    id: 'synthwave',
    label: '80s Synthwave Neon',
    minLevel: 4,
    fontFamily: "'Orbitron', 'Century Gothic', sans-serif",
    description: 'Geometric futuristic font from an alternate 1984',
  },
  {
    id: 'gold',
    label: 'Imperial Classical Serif',
    minLevel: 5,
    fontFamily: "'Cinzel', 'Times New Roman', serif",
    description: 'Regal Roman inscriptional serif fit for royalty',
  },
  {
    id: 'sakura',
    label: 'Japanese Brush Mincho',
    minLevel: 6,
    fontFamily: "'Shippori Mincho', 'Noto Serif JP', 'Yu Mincho', serif",
    description: 'Traditional Japanese calligraphic brush & Mincho serif',
  },
  {
    id: 'arcade',
    label: '8-Bit Pixel Game',
    minLevel: 7,
    fontFamily: "'Press Start 2P', 'DotGothic16', monospace",
    description: 'Nostalgic 8-bit arcade pixel font for retro typing',
  },
  {
    id: 'nebula',
    label: 'Cosmic Mystical Serif',
    minLevel: 8,
    fontFamily: "'Cinzel Decorative', 'Georgia', serif",
    description: 'Ethereal flourished serif imbued with stellar energy',
  },
  {
    id: 'emerald',
    label: 'Zen Bamboo Gothic',
    minLevel: 9,
    fontFamily: "'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', sans-serif",
    description: 'Harmonious, serene Japanese modern gothic',
  },
  {
    id: 'bloodmoon',
    label: 'Samurai Kanji Calligraphy',
    minLevel: 10,
    fontFamily: "'Yuji Boku', 'Shippori Mincho', serif",
    description: 'Fierce ink-brush strokes of an ancient master swordsman',
  },
];

/** Metadata and level requirements for each background reward. */
export interface BackgroundConfig {
  id: BackgroundId;
  label: string;
  minLevel: number;
  description: string;
}

export const BACKGROUND_CONFIGS: BackgroundConfig[] = [
  {
    id: 'theme',
    label: 'Theme Default (Auto)',
    minLevel: 1,
    description: 'Automatically switches to the active theme’s signature effect',
  },
  {
    id: 'clouds',
    label: 'Gentle Clouds & Sparkles',
    minLevel: 1,
    description: 'Soft floating clouds with delicate celestial glimmers',
  },
  {
    id: 'stars',
    label: 'Twinkling Celestial Stars',
    minLevel: 1,
    description: 'Deep midnight starfield twinkling across the cosmos',
  },
  {
    id: 'hearts',
    label: 'Floating Blossom Hearts',
    minLevel: 1,
    description: 'Romantic pastel hearts floating gently upwards',
  },
  {
    id: 'embers',
    label: 'Rising Cyberpunk Embers',
    minLevel: 2,
    description: 'High-energy crimson sparks and digital embers',
  },
  {
    id: 'matrix',
    label: 'Japanese Digital Rain',
    minLevel: 3,
    description: 'Iconic falling streams of luminous green Japanese glyphs',
  },
  {
    id: 'synthwave',
    label: 'Synthwave Neon Diamonds',
    minLevel: 4,
    description: 'Retro-futuristic floating cyan and magenta neon diamonds',
  },
  {
    id: 'gold',
    label: 'Radiant Gold Starbursts',
    minLevel: 5,
    description: 'Brilliant gold celestial sparkles and diamond flares',
  },
  {
    id: 'sakura',
    label: 'Drifting Sakura Petals',
    minLevel: 6,
    description: 'Delicate pink cherry blossom petals tumbling in the wind',
  },
  {
    id: 'arcade',
    label: '8-Bit Arcade Pixels',
    minLevel: 7,
    description: 'Floating 8-bit geometric particles and retro pixels',
  },
  {
    id: 'nebula',
    label: 'Pulsing Cosmic Stardust',
    minLevel: 8,
    description: 'Shimmering planetary orbs and ethereal nebula dust',
  },
  {
    id: 'emerald',
    label: 'Bamboo Leaves & Fireflies',
    minLevel: 9,
    description: 'Gentle green bamboo leaves accompanied by glowing fireflies',
  },
  {
    id: 'bloodmoon',
    label: 'Bloodmoon Maple Leaves',
    minLevel: 10,
    description: 'Deep crimson Japanese autumn maple leaves and dark embers',
  },
];

/** Helper to resolve the effective font family based on user font choice and theme */
export function resolveEffectiveFont(theme: Theme, font: FontId): { fontId: FontId; fontFamily: string } {
  if (font === 'theme') {
    const themeCfg = THEME_CONFIGS.find((t) => t.id === theme);
    const targetFontId = themeCfg?.defaultFont ?? 'default';
    const fontCfg = FONT_CONFIGS.find((f) => f.id === targetFontId) ?? FONT_CONFIGS[1]!;
    return { fontId: targetFontId, fontFamily: fontCfg.fontFamily };
  }
  const fontCfg = FONT_CONFIGS.find((f) => f.id === font) ?? FONT_CONFIGS[1]!;
  return { fontId: font, fontFamily: fontCfg.fontFamily };
}

/** Helper to resolve the effective background effect based on user background choice and theme */
export function resolveEffectiveBackground(theme: Theme, background: BackgroundId): BackgroundId {
  if (background === 'theme') {
    const themeCfg = THEME_CONFIGS.find((t) => t.id === theme);
    return themeCfg?.defaultBackground ?? 'clouds';
  }
  return background;
}

/** localStorage keys */
export const THEME_STORAGE_KEY = 'kana_theme';
export const FONT_STORAGE_KEY = 'kana_font';
export const BG_STORAGE_KEY = 'kana_background';

/** Shape of the value exposed by ThemeContext. */
export interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  font: FontId;
  setFont: (f: FontId) => void;
  background: BackgroundId;
  setBackground: (b: BackgroundId) => void;
  effectiveFont: FontId;
  effectiveBackground: BackgroundId;
  isLevelingUp: boolean;
  /** Monotonically incremented each time a level-up celebration is triggered */
  levelUpTick?: number;
  triggerLevelUpAnimation: () => void;
  /** Normalized streak intensity (0 when streak < 20 or effects disabled, up to 1 at 100+) */
  streakIntensity: number;
  setStreakIntensity: (intensity: number) => void;
  /** Monotonically incremented when a 20+ streak is broken */
  streakBreakTick: number;
  triggerStreakBreak: () => void;
}

/**
 * Context providing the active theme, font, background, and level-up celebration state.
 */
export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => undefined,
  font: 'theme',
  setFont: () => undefined,
  background: 'theme',
  setBackground: () => undefined,
  effectiveFont: 'default',
  effectiveBackground: 'clouds',
  isLevelingUp: false,
  levelUpTick: 0,
  triggerLevelUpAnimation: () => undefined,
  streakIntensity: 0,
  setStreakIntensity: () => undefined,
  streakBreakTick: 0,
  triggerStreakBreak: () => undefined,
});

/**
 * Convenience hook to consume ThemeContext.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
