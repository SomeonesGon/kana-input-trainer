import React from 'react';
import { getKanaCategoriesForMode } from '@/constants/kanas';
import { InputMode, KanaCategoryId } from '@/types/kana';
import SweepText from '@/components/SweepText';

interface KanaCategorySwitchesProps {
  /** Map of category IDs to their boolean enabled states */
  enabledCategories: Record<KanaCategoryId, boolean>;
  /** Callback invoked when user toggles a category switch */
  onToggle: (category: KanaCategoryId) => void;
  /** Active keyboard input mode ('desktop' JIS or 'mobile' 12-key flick) */
  inputMode?: InputMode;
}

/**
 * Vertical category switch panel displayed on the right side of the trainer.
 * Allows users to selectively test specific character groups (Basic, Dakuten, Handakuten, Small/Shift, Punctuation)
 * in a clean, stacked vertical layout, adjusting labels & counts for Desktop vs Mobile 12-key mode.
 */
export default function KanaCategorySwitches({
  enabledCategories,
  onToggle,
  inputMode = 'kana',
}: KanaCategorySwitchesProps) {
  const categories = getKanaCategoriesForMode(inputMode);
  // Count how many categories are currently active
  const enabledCount = Object.values(enabledCategories).filter(Boolean).length;

  return (
    <div className="kana-category-switches p-3 border rounded-3 bg-light shadow-sm">
      <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
        <span className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
          <SweepText>Categories</SweepText>
        </span>
        <span className="badge text-bg-light border text-muted" style={{ fontSize: '0.75rem' }}>
          <SweepText>{`${enabledCount} of ${categories.length} active`}</SweepText>
        </span>
      </div>

      <div className="d-flex flex-column gap-2">
        {categories.map((cat) => {
          const isEnabled = enabledCategories[cat.id] ?? true;
          // Prevent turning off the last remaining active category
          const isOnlyActive = isEnabled && enabledCount <= 1;

          return (
            <div
              key={cat.id}
              className="form-check form-switch d-flex align-items-center justify-content-between ps-0 py-1"
              title={`${cat.label} (${cat.characters.length} characters: ${cat.sample})`}
            >
              <label
                className={`form-check-label small user-select-none mb-0 ${isOnlyActive ? 'text-muted' : ''}`}
                htmlFor={`category-switch-${cat.id}`}
                style={{ cursor: isOnlyActive ? 'not-allowed' : 'pointer' }}
              >
                <span className="fw-medium text-dark"><SweepText>{cat.label}</SweepText></span>{' '}
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  <SweepText>{`(${cat.characters.length})`}</SweepText>
                </span>
              </label>
              <input
                className="form-check-input ms-2"
                type="checkbox"
                role="switch"
                id={`category-switch-${cat.id}`}
                checked={isEnabled}
                disabled={isOnlyActive}
                onChange={() => onToggle(cat.id)}
                style={{ cursor: isOnlyActive ? 'not-allowed' : 'pointer' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
