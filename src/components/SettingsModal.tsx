import React, { useState, useEffect } from 'react';
import { AppearanceCustomizer } from '@/components/ThemeSelector';
import SweepText from '@/components/SweepText';

interface SettingsModalProps {
  /** Whether the settings modal is currently visible */
  isOpen: boolean;
  /** Current player level to determine unlocked themes */
  userLevel?: number;
  /** Whether newly unlocked themes are automatically applied on level-up */
  autoSwitchTheme?: boolean;
  /** Callback to toggle auto-switching to newly unlocked themes */
  onToggleAutoSwitchTheme?: () => void;
  /** Whether gamification visuals (level/XP bar, level-up effects, notifications) are hidden */
  disableGamificationEffects?: boolean;
  /** Callback to toggle disabling gamification visuals */
  onToggleDisableGamificationEffects?: () => void;
  /** Whether Classic minimalist mode is enabled */
  classicMode?: boolean;
  /** Callback to toggle Classic minimalist mode */
  onToggleClassicMode?: () => void;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback to trigger exporting progress to a JSON backup file */
  onExport: () => void;
  /** Callback to trigger importing progress from a JSON backup file */
  onImport: () => void;
  /** Callback to reset all training progress back to initial default state */
  onResetProgress: () => void;
}

/**
 * Settings modal dialog triggered via the header cog wheel button.
 *
 * Houses:
 * - Appearance & Unlocked Rewards Customizer (Theme, Font, Background Effect)
 * - Backup controls (Export State & Import State)
 * - Progress Reset with inline confirmation guard
 */
export default function SettingsModal({
  isOpen,
  userLevel = 1,
  autoSwitchTheme = false,
  onToggleAutoSwitchTheme,
  disableGamificationEffects = false,
  onToggleDisableGamificationEffects,
  classicMode = false,
  onToggleClassicMode,
  onClose,
  onExport,
  onImport,
  onResetProgress,
}: SettingsModalProps) {
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  // Reset confirmation state whenever the modal opens or closes
  useEffect(() => {
    setShowConfirmReset(false);
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleConfirmReset() {
    onResetProgress();
    setShowConfirmReset(false);
    onClose();
  }

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 1050,
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        className="card shadow-lg p-3 p-sm-4 mx-3"
        style={{
          maxWidth: '500px',
          maxHeight: '92vh',
          overflowY: 'auto',
          width: '100%',
          backgroundColor: 'var(--bg-card, #ffffff)',
          color: 'var(--text-primary, #212529)',
          border: '1px solid var(--border-card, #dee2e6)',
          borderRadius: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        {/* Modal Header */}
        <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
          <h2 id="settings-modal-title" className="h5 mb-0 fw-bold">
            <SweepText>Settings &amp; Customization</SweepText>
          </h2>
          <button
            type="button"
            className="btn btn-sm btn-close"
            aria-label="Close settings"
            onClick={onClose}
          />
        </div>

        {/* Modal Body */}
        <div className="d-flex flex-column gap-3">
          {/* Section 1: Appearance & Unlocked Rewards */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>
                <SweepText>Appearance &amp; Rewards</SweepText>
              </span>
              <span className="badge text-bg-primary" style={{ fontSize: '0.72rem' }}>
                <SweepText>{`Level ${userLevel}`}</SweepText>
              </span>
            </div>
            <AppearanceCustomizer userLevel={userLevel} />

            {/* Toggle for automatic theme switching upon unlocking a new theme */}
            <div className="form-check form-switch d-flex align-items-center justify-content-between ps-0 mt-3 pt-2 border-top">
              <label
                className="form-check-label small user-select-none mb-0"
                htmlFor="auto-switch-theme-toggle"
                style={{ cursor: 'pointer' }}
              >
                <span className="fw-medium"><SweepText>Auto-switch to unlocked themes</SweepText></span>
                <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                  <SweepText>Automatically equips a new theme when you level up and unlock it</SweepText>
                </span>
              </label>
              <input
                className="form-check-input ms-3 flex-shrink-0"
                type="checkbox"
                role="switch"
                id="auto-switch-theme-toggle"
                checked={autoSwitchTheme}
                onChange={onToggleAutoSwitchTheme}
                style={{ cursor: 'pointer' }}
              />
            </div>

            {/* Toggle for hiding gamification visuals while keeping stats & background progress */}
            <div className="form-check form-switch d-flex align-items-center justify-content-between ps-0 mt-2 pt-2 border-top">
              <label
                className="form-check-label small user-select-none mb-0"
                htmlFor="disable-gamification-toggle"
                style={{ cursor: 'pointer' }}
              >
                <span className="fw-medium"><SweepText>Disable gamification effects</SweepText></span>
                <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                  <SweepText>Hides the level/XP bar, level-up effects, and notifications while keeping stats</SweepText>
                </span>
              </label>
              <input
                className="form-check-input ms-3 flex-shrink-0"
                type="checkbox"
                role="switch"
                id="disable-gamification-toggle"
                checked={disableGamificationEffects}
                onChange={onToggleDisableGamificationEffects}
                style={{ cursor: 'pointer' }}
              />
            </div>

            {/* Toggle for Classic minimalist mode */}
            <div className="form-check form-switch d-flex align-items-center justify-content-between ps-0 mt-2 pt-2 border-top">
              <label
                className="form-check-label small user-select-none mb-0"
                htmlFor="classic-mode-toggle"
                style={{ cursor: 'pointer' }}
              >
                <span className="fw-medium"><SweepText>Classic minimalist mode</SweepText></span>
                <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                  <SweepText>Keeps active theme colors while disabling animations, particles, and extra UI</SweepText>
                </span>
              </label>
              <input
                className="form-check-input ms-3 flex-shrink-0"
                type="checkbox"
                role="switch"
                id="classic-mode-toggle"
                checked={classicMode}
                onChange={onToggleClassicMode}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>

          <hr className="my-1" />

          {/* Section 2: Backup & Restore */}
          <div>
            <label className="form-label small fw-semibold text-secondary mb-1">
              <SweepText>Data &amp; Backup</SweepText>
            </label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm flex-fill d-flex align-items-center justify-content-center"
                onClick={() => {
                  onExport();
                }}
                title="Download training state as a JSON backup file"
              >
                <SweepText>Export State</SweepText>
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm flex-fill d-flex align-items-center justify-content-center"
                onClick={() => {
                  onImport();
                }}
                title="Upload training state from a JSON backup file"
              >
                <SweepText>Import State</SweepText>
              </button>
            </div>
            <small className="text-muted d-block mt-1" style={{ fontSize: '0.78rem' }}>
              <SweepText>Transfer your progress, SRS levels, theme, and custom styles across devices.</SweepText>
            </small>
          </div>

          <hr className="my-1" />

          {/* Section 3: Reset Progress */}
          <div>
            <label className="form-label small fw-semibold text-danger mb-1">
              <SweepText>Reset Training Progress</SweepText>
            </label>
            {!showConfirmReset ? (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center"
                onClick={() => setShowConfirmReset(true)}
              >
                <SweepText>Reset All Progress</SweepText>
              </button>
            ) : (
              <div className="p-2 border border-danger rounded bg-danger-subtle">
                <p className="small text-danger mb-2 fw-medium">
                  <SweepText>Are you sure? This will reset all your SRS character mastery stages, due steps, and answer counts back to zero.</SweepText>
                </p>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm flex-fill fw-semibold"
                    onClick={handleConfirmReset}
                  >
                    <SweepText>Yes, Reset Progress</SweepText>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm flex-fill"
                    onClick={() => setShowConfirmReset(false)}
                  >
                    <SweepText>Cancel</SweepText>
                  </button>
                </div>
              </div>
            )}
            <small className="text-muted d-block mt-1" style={{ fontSize: '0.78rem' }}>
              <SweepText>Clears spaced repetition learning history so you can restart from scratch.</SweepText>
            </small>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 mt-3 border-top text-end">
          <button
            type="button"
            className="btn btn-secondary btn-sm px-3"
            onClick={onClose}
          >
            <SweepText>Done</SweepText>
          </button>
        </div>
      </div>
    </div>
  );
}
