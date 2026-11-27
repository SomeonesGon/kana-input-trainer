import React from 'react';
import SweepText from '@/components/SweepText';
import {
  useTheme,
  THEME_CONFIGS,
  FONT_CONFIGS,
  BACKGROUND_CONFIGS,
  Theme,
  FontId,
  BackgroundId,
} from '@/hooks/useTheme';

interface SelectorProps {
  userLevel?: number;
}

/**
 * Color Theme Selector Dropdown
 */
export default function ThemeSelector({ userLevel = 1 }: SelectorProps) {
  const { theme, setTheme } = useTheme();

  return (
    <select
      className="form-select form-select-sm"
      value={theme}
      onChange={(e) => setTheme(e.target.value as Theme)}
      aria-label="Color theme selector"
    >
      {THEME_CONFIGS.map((cfg) => {
        const isUnlocked = userLevel >= cfg.minLevel;
        return (
          <option key={cfg.id} value={cfg.id} disabled={!isUnlocked}>
            {isUnlocked
              ? cfg.label
              : `${cfg.label} (Locked - Level ${cfg.minLevel})`}
          </option>
        );
      })}
    </select>
  );
}

/**
 * Font Style Selector Dropdown
 */
export function FontSelector({ userLevel = 1 }: SelectorProps) {
  const { font, setFont, effectiveFont } = useTheme();

  // Find effective font label for auto mode hint
  const effConfig = FONT_CONFIGS.find((f) => f.id === effectiveFont);

  return (
    <select
      className="form-select form-select-sm"
      value={font}
      onChange={(e) => setFont(e.target.value as FontId)}
      aria-label="Font reward selector"
    >
      {FONT_CONFIGS.map((cfg) => {
        if (cfg.id === 'theme') {
          return (
            <option key={cfg.id} value={cfg.id}>
              {`Theme Default (${effConfig?.label ?? 'Auto'})`}
            </option>
          );
        }
        const isUnlocked = userLevel >= cfg.minLevel;
        return (
          <option key={cfg.id} value={cfg.id} disabled={!isUnlocked}>
            {isUnlocked
              ? cfg.label
              : `${cfg.label} (Locked - Level ${cfg.minLevel})`}
          </option>
        );
      })}
    </select>
  );
}

/**
 * Background Particle Effect Selector Dropdown
 */
export function BackgroundSelector({ userLevel = 1 }: SelectorProps) {
  const { background, setBackground, effectiveBackground } = useTheme();

  // Find effective background label for auto mode hint
  const effBgConfig = BACKGROUND_CONFIGS.find((b) => b.id === effectiveBackground);

  return (
    <select
      className="form-select form-select-sm"
      value={background}
      onChange={(e) => setBackground(e.target.value as BackgroundId)}
      aria-label="Background effect selector"
    >
      {BACKGROUND_CONFIGS.map((cfg) => {
        if (cfg.id === 'theme') {
          return (
            <option key={cfg.id} value={cfg.id}>
              {`Theme Default (${effBgConfig?.label ?? 'Auto'})`}
            </option>
          );
        }
        const isUnlocked = userLevel >= cfg.minLevel;
        return (
          <option key={cfg.id} value={cfg.id} disabled={!isUnlocked}>
            {isUnlocked
              ? cfg.label
              : `${cfg.label} (Locked - Level ${cfg.minLevel})`}
          </option>
        );
      })}
    </select>
  );
}

/**
 * Comprehensive Appearance & Rewards Customizer.
 * Provides controls for Color Theme, Font Style, and Background Effect with live combination preview.
 */
export function AppearanceCustomizer({ userLevel = 1 }: SelectorProps) {
  const { theme, font, background, effectiveFont, effectiveBackground } = useTheme();

  const themeObj = THEME_CONFIGS.find((t) => t.id === theme);
  const fontObj = FONT_CONFIGS.find((f) => f.id === effectiveFont);
  const bgObj = BACKGROUND_CONFIGS.find((b) => b.id === effectiveBackground);

  return (
    <div className="d-flex flex-column gap-3">
      {/* 1. Color Palette Theme */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-1">
          <label className="form-label small fw-semibold text-secondary mb-0">
            <SweepText>Color Palette Theme</SweepText>
          </label>
          <span className="badge text-bg-light border small" style={{ fontSize: '0.7rem' }}>
            <SweepText>{themeObj?.label ?? ''}</SweepText>
          </span>
        </div>
        <ThemeSelector userLevel={userLevel} />
        <small className="text-muted d-block mt-1" style={{ fontSize: '0.76rem' }}>
          <SweepText>{themeObj?.description ?? ''}</SweepText>
        </small>
      </div>

      {/* 2. Font Style Reward */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-1">
          <label className="form-label small fw-semibold text-secondary mb-0">
            <SweepText>Font Style Reward</SweepText>
          </label>
          <span className="badge text-bg-light border small" style={{ fontSize: '0.7rem' }}>
            <SweepText>{`${font === 'theme' ? 'Auto: ' : ''}${fontObj?.label ?? ''}`}</SweepText>
          </span>
        </div>
        <FontSelector userLevel={userLevel} />
        <small className="text-muted d-block mt-1" style={{ fontSize: '0.76rem' }}>
          <SweepText>
            {font === 'theme'
              ? `Syncs with ${themeObj?.label}: ${fontObj?.description}`
              : (fontObj?.description ?? '')}
          </SweepText>
        </small>
      </div>

      {/* 3. Background Ambience Effect */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-1">
          <label className="form-label small fw-semibold text-secondary mb-0">
            <SweepText>Background Effect Reward</SweepText>
          </label>
          <span className="badge text-bg-light border small" style={{ fontSize: '0.7rem' }}>
            <SweepText>{`${background === 'theme' ? 'Auto: ' : ''}${bgObj?.label ?? ''}`}</SweepText>
          </span>
        </div>
        <BackgroundSelector userLevel={userLevel} />
        <small className="text-muted d-block mt-1" style={{ fontSize: '0.76rem' }}>
          <SweepText>
            {background === 'theme'
              ? `Syncs with ${themeObj?.label}: ${bgObj?.description}`
              : (bgObj?.description ?? '')}
          </SweepText>
        </small>
      </div>

      {/* Visual Preset Summary Chip */}
      <div
        className="p-2 rounded border"
        style={{
          backgroundColor: 'var(--bg-card-past)',
          borderColor: 'var(--border-past)',
          fontSize: '0.76rem',
        }}
      >
        <span className="fw-semibold"><SweepText>Active: </SweepText></span>
        <span><SweepText>{themeObj?.label ?? ''}</SweepText></span>
        <span className="mx-1 opacity-50">/</span>
        <span><SweepText>{fontObj?.label ?? ''}</SweepText></span>
        <span className="mx-1 opacity-50">/</span>
        <span><SweepText>{bgObj?.label ?? ''}</SweepText></span>
      </div>
    </div>
  );
}
