import React from 'react';
import { getUnlockedRewardsForLevel } from '@/utils/gamification';
import SweepText from '@/components/SweepText';

interface LevelUpBannerProps {
  level: number;
}

/**
 * LevelUpBanner
 *
 * Minimal, non-distracting floating status badge when reaching a new level.
 * Completely free of emojis with clean, refined typography.
 */
export default function LevelUpBanner({ level }: LevelUpBannerProps) {
  const { themes } = getUnlockedRewardsForLevel(level);
  const unlockedName = themes[0]?.label;

  return (
    <div
      className="level-up-banner text-center py-1 px-3 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <span className="fw-bold" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
        <SweepText>{`LEVEL ${level} REACHED`}</SweepText>
      </span>
      {unlockedName && (
        <span className="text-muted ms-2" style={{ fontSize: '0.76rem' }}>
          <SweepText>{`| Unlocked: ${unlockedName}`}</SweepText>
        </span>
      )}
    </div>
  );
}
