import React from 'react';
import { KANA_CATEGORIES } from '@/constants/kanas';
import { KanaCategoryId } from '@/types/kana';

interface KanaCategorySwitchesProps {
  /** Map of category IDs to their boolean enabled states */
  enabledCategories: Record<KanaCategoryId, boolean>;
  /** Callback invoked when user toggles a category switch */
  onToggle: (category: KanaCategoryId) => void;
}

/**
 * Minimal category switch panel fitting the application's clean Bootstrap aesthetic.
 * Allows users to selectively test specific character groups (Basic, Dakuten, Handakuten, Shift, Punctuation).
 */
export default function KanaCategorySwitches({
  enabledCategories,
  onToggle,
}: KanaCategorySwitchesProps) {
  // Count how many categories are currently active
  const enabledCount = Object.values(enabledCategories).filter(Boolean).length;

  return (
    <div className="kana-category-switches my-3 p-2 border rounded bg-light">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-1">
        <span className="text-secondary small fw-semibold">Quiz Character Categories:</span>
        <span className="text-muted small">
          {enabledCount} of {KANA_CATEGORIES.length} active
        </span>
      </div>

      <div className="d-flex flex-wrap gap-3 align-items-center">
        {KANA_CATEGORIES.map((cat) => {
          const isEnabled = enabledCategories[cat.id] ?? true;
          // Prevent turning off the last remaining active category
          const isOnlyActive = isEnabled && enabledCount <= 1;

          return (
            <div
              key={cat.id}
              className="form-check form-switch form-check-inline mb-0"
              title={`${cat.label} (${cat.characters.length} characters: ${cat.sample})`}
            >
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id={`category-switch-${cat.id}`}
                checked={isEnabled}
                disabled={isOnlyActive}
                onChange={() => onToggle(cat.id)}
                style={{ cursor: isOnlyActive ? 'not-allowed' : 'pointer' }}
              />
              <label
                className={`form-check-label small ${isOnlyActive ? 'text-muted' : ''}`}
                htmlFor={`category-switch-${cat.id}`}
                style={{ cursor: isOnlyActive ? 'not-allowed' : 'pointer', userSelect: 'none' }}
              >
                {cat.label}{' '}
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  ({cat.characters.length})
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
