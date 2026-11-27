import { allInputCharactersArray } from '@/constants/kanas';
import {
  THEME_CONFIGS,
  FONT_CONFIGS,
  BACKGROUND_CONFIGS,
  ThemeConfig,
  FontConfig,
  BackgroundConfig,
} from '@/hooks/useTheme';

export interface GamificationStats {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progressPercent: number;
  coveragePercent: number;
  coverageCount: number;
  totalCharacters: number;
  accuracyPercent: number;
  totalCorrect: number;
  totalMistakes: number;
  speedCPM: number;
  speedWPM: number;
}

/**
 * Rewards unlocked at a specific level.
 */
export interface LevelRewards {
  themes: ThemeConfig[];
  fonts: FontConfig[];
  backgrounds: BackgroundConfig[];
}

/**
 * XP thresholds required to reach each level.
 * Level 1: 0 - 500 (Light, Dark, Pink themes; Sans, Rounded fonts; Clouds, Stars, Hearts bgs)
 * Level 2: 500 - 1500 (Unlocks Cyberpunk Terminal theme, Terminal CRT font, Cyber Embers bg)
 * Level 3: 1500 - 3000 (Unlocks The Matrix theme, Matrix Digital Code font, Matrix Rain bg)
 * Level 4: 3000 - 5500 (Unlocks Synthwave Neon theme, 80s Synthwave font, Synthwave Diamonds bg)
 * Level 5: 5500 - 9000 (Unlocks Imperial Gold theme, Classical Serif font, Gold Starbursts bg)
 * Level 6: 9000 - 13500 (Unlocks Sakura Zen theme, Brush Mincho font, Sakura Petals bg)
 * Level 7: 13500 - 19000 (Unlocks 8-Bit Retro Arcade theme, Pixel Game font, Arcade Pixels bg)
 * Level 8: 19000 - 26000 (Unlocks Mystic Cosmic Nebula theme, Cosmic Serif font, Nebula Stardust bg)
 * Level 9: 26000 - 35000 (Unlocks Emerald Shrine theme, Zen Bamboo font, Bamboo Leaves bg)
 * Level 10: 35000 - 46000 (Unlocks Bloodmoon Samurai theme, Samurai Kanji font, Bloodmoon Maple bg)
 * Level 11+: Master Ranks (xp steps of 12000 per level)
 */
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  500,    // Level 2
  1500,   // Level 3
  3000,   // Level 4
  5500,   // Level 5
  9000,   // Level 6
  13500,  // Level 7
  19000,  // Level 8
  26000,  // Level 9
  35000,  // Level 10
  46000,  // Level 11
];

/**
 * Helper to fetch all themes, fonts, and background elements unlocked at a given level.
 */
export function getUnlockedRewardsForLevel(level: number): LevelRewards {
  const themes = THEME_CONFIGS.filter((t) => t.minLevel === level);
  const fonts = FONT_CONFIGS.filter((f) => f.minLevel === level && f.id !== 'theme');
  const backgrounds = BACKGROUND_CONFIGS.filter((b) => b.minLevel === level && b.id !== 'theme');
  return { themes, fonts, backgrounds };
}

/**
 * Calculates keyboard coverage statistics based on mastery stages.
 */
export function calculateCoverage(stages: Record<string, number>): {
  count: number;
  total: number;
  percent: number;
} {
  const total = allInputCharactersArray.length;
  // Characters practiced and advanced at least to stage 1
  const count = Object.values(stages).filter((stage) => stage > 0).length;
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return { count, total, percent };
}

/**
 * Calculates all-time accuracy percentage.
 */
export function calculateAccuracy(
  charsAnswered: number,
  mistakes: Record<string, number>
): number {
  const totalMistakes = Object.values(mistakes).reduce((sum, val) => sum + val, 0);
  const totalAttempts = charsAnswered + totalMistakes;
  if (totalAttempts === 0) return 100;
  return Math.round((charsAnswered / totalAttempts) * 1000) / 10;
}

/**
 * Computes user level, XP progress, accuracy, keyboard coverage, and speed.
 */
export function computeGamificationStats(
  charsAnswered: number,
  stages: Record<string, number>,
  mistakes: Record<string, number>,
  speedCPM: number = 0
): GamificationStats {
  const coverage = calculateCoverage(stages);
  const accuracy = calculateAccuracy(charsAnswered, mistakes);
  const totalMistakes = Object.values(mistakes).reduce((sum, val) => sum + val, 0);
  const totalStages = Object.values(stages).reduce((sum, val) => sum + val, 0);

  // Gamified XP formula:
  // - 8 XP per correct answer
  // - 15 XP per unique character mastered (coverage)
  // - 12 XP per stage upgrade
  // - Multiplied by accuracy efficiency factor (70% to 125%)
  // - Bonus for sustained typing rhythm
  let rawXP = charsAnswered * 8 + coverage.count * 15 + totalStages * 12;
  const accuracyMultiplier = Math.max(0.65, Math.min(1.25, accuracy / 90));
  let calculatedXP = Math.round(rawXP * accuracyMultiplier);

  if (speedCPM > 40) {
    calculatedXP += Math.round((speedCPM - 40) * 0.4);
  }

  calculatedXP = Math.max(0, calculatedXP);

  // Determine Level from thresholds
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = LEVEL_THRESHOLDS[i] ?? 0;
    if (calculatedXP >= threshold) {
      level = i + 1;
      break;
    }
  }

  // Calculate progress toward the next level
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 12000;
  const levelXPNeeded = Math.max(1, nextThreshold - currentThreshold);
  const xpIntoCurrentLevel = Math.max(0, calculatedXP - currentThreshold);
  const progressPercent = Math.min(
    100,
    Math.round((xpIntoCurrentLevel / levelXPNeeded) * 100)
  );

  return {
    level,
    currentXP: calculatedXP,
    nextLevelXP: nextThreshold,
    progressPercent,
    coveragePercent: coverage.percent,
    coverageCount: coverage.count,
    totalCharacters: coverage.total,
    accuracyPercent: accuracy,
    totalCorrect: charsAnswered,
    totalMistakes,
    speedCPM: Math.max(0, Math.round(speedCPM)),
    speedWPM: Math.max(0, Math.round(speedCPM / 5)),
  };
}

/** Minimum consecutive correct answers required to activate streak visual feedback. */
export const STREAK_THRESHOLD = 20;

export interface StreakInfo {
  streak: number;
  isActive: boolean;
  /** Normalized intensity from 0 (inactive) to 1 (80-100+ streak), scaling incrementally from 20+. */
  intensity: number;
  /** Discrete intensity tier: 0 (<20), 1 (20-34), 2 (35-49), 3 (50-79), 4 (80+). */
  tier: 0 | 1 | 2 | 3 | 4;
}

/**
 * Computes incremental visual intensity metrics for a consecutive correct-answer streak.
 * Visual effects activate at 20+ characters and scale continuously up to 100+.
 */
export function getStreakInfo(streak: number): StreakInfo {
  const safeStreak = Math.max(0, Math.floor(streak));
  if (safeStreak < STREAK_THRESHOLD) {
    return { streak: safeStreak, isActive: false, intensity: 0, tier: 0 };
  }

  const intensity = Math.min(1, Math.round((0.2 + ((safeStreak - STREAK_THRESHOLD) / 80) * 0.8) * 1000) / 1000);
  let tier: 1 | 2 | 3 | 4 = 1;
  if (safeStreak >= 80) {
    tier = 4;
  } else if (safeStreak >= 50) {
    tier = 3;
  } else if (safeStreak >= 35) {
    tier = 2;
  }

  return {
    streak: safeStreak,
    isActive: true,
    intensity,
    tier,
  };
}

/**
 * Returns a GamificationStats object overridden to a specific level (used in Developer Mode).
 * Preserves Coverage, Accuracy, and Speed metrics while updating level and XP thresholds.
 */
export function applyLevelOverride(
  stats: GamificationStats,
  overrideLevel: number | null
): GamificationStats {
  if (overrideLevel === null || !Number.isFinite(overrideLevel) || overrideLevel < 1) {
    return stats;
  }

  const level = Math.floor(overrideLevel);
  const lastDefinedIndex = LEVEL_THRESHOLDS.length - 1;
  const lastDefinedXP = LEVEL_THRESHOLDS[lastDefinedIndex] ?? 46000;

  const currentThreshold =
    level - 1 <= lastDefinedIndex
      ? (LEVEL_THRESHOLDS[level - 1] ?? 0)
      : lastDefinedXP + (level - 1 - lastDefinedIndex) * 12000;

  const nextThreshold =
    level <= lastDefinedIndex
      ? (LEVEL_THRESHOLDS[level] ?? currentThreshold + 12000)
      : currentThreshold + 12000;

  return {
    ...stats,
    level,
    currentXP: currentThreshold,
    nextLevelXP: nextThreshold,
    progressPercent: 0,
  };
}
