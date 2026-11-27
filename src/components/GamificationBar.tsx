import React from 'react';
import { GamificationStats, StreakInfo } from '@/utils/gamification';

interface GamificationBarProps {
  stats: GamificationStats;
  /** When true, hides the Level badge and XP progress bar and shows only the plain stats row */
  statsOnly?: boolean;
  /** Active streak intensity details (effects activate at 20+ consecutive correct answers) */
  streakInfo?: StreakInfo;
}

/**
 * Compact Gamification Progress Bar displayed on the top left under title and details.
 * Shows player Level, XP bar progress, active 20+ streak badge, and live metrics for Coverage, Accuracy, and Speed.
 * All text colours reference CSS custom properties so they remain legible on every theme.
 */
export default function GamificationBar({
  stats,
  statsOnly = false,
  streakInfo,
}: GamificationBarProps) {
  const {
    level,
    currentXP,
    nextLevelXP,
    progressPercent,
    coveragePercent,
    coverageCount,
    totalCharacters,
    accuracyPercent,
    speedCPM,
    speedWPM,
  } = stats;

  const isStreaking = !statsOnly && Boolean(streakInfo?.isActive);
  const streakIntensity = streakInfo?.intensity ?? 0;

  return (
    <div
      className={`gamification-bar p-2 rounded-2 ${isStreaking ? 'is-streaking' : ''}`}
      style={
        {
          maxWidth: '380px',
          backgroundColor: 'var(--bg-card-past, rgba(0, 0, 0, 0.04))',
          border: '1px solid var(--border-past, rgba(0, 0, 0, 0.1))',
          '--streak-intensity': isStreaking ? streakIntensity : 0,
        } as React.CSSProperties
      }
    >
      {!statsOnly && (
        <>
          {/* Top line: Level badge, optional 20+ Streak badge, and XP text */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
            <div className="d-flex align-items-center gap-1">
              <span
                className="badge text-bg-primary px-2 py-0 fw-bold d-flex align-items-center gap-1"
                style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
              >
                LEVEL {level}
              </span>
              {isStreaking && streakInfo && (
                <span
                  className={`badge px-2 py-0 fw-bold gamification-streak-badge tier-${streakInfo.tier}`}
                  style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}
                  title={`Correct answer streak: ${streakInfo.streak}`}
                >
                  {streakInfo.streak} STREAK
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {currentXP} / {nextLevelXP} XP
            </span>
          </div>

          {/* Progress Bar (Small) */}
          <div
            className="progress"
            style={{ height: '5px', backgroundColor: 'var(--border-card, #e2e8f0)' }}
          >
            <div
              className="progress-bar bg-primary"
              role="progressbar"
              style={{ width: `${progressPercent}%`, transition: 'width 0.4s ease' }}
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </>
      )}

      {/* Bottom stats row: Coverage, Accuracy, Speed */}
      <div
        className={`d-flex align-items-center justify-content-between px-1 ${statsOnly ? '' : 'mt-1'}`}
        style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}
      >
        <span title={`Practiced ${coverageCount} of ${totalCharacters} Kana characters`}>
          Coverage:{' '}
          <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {coveragePercent}%
          </strong>
        </span>
        <span style={{ opacity: 0.4, color: 'var(--text-muted)' }}>•</span>
        <span title={`All-time typing accuracy: ${stats.totalCorrect} correct, ${stats.totalMistakes} mistakes`}>
          Accuracy:{' '}
          <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {accuracyPercent}%
          </strong>
        </span>
        <span style={{ opacity: 0.4, color: 'var(--text-muted)' }}>•</span>
        <span title={`Typing speed: ${speedCPM} characters/min (~${speedWPM} WPM)`}>
          Speed:{' '}
          <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {speedCPM} CPM
          </strong>
        </span>
      </div>
    </div>
  );
}
