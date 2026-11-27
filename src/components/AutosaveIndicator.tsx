import React from 'react';
import { AutosaveStatus } from '@/hooks/useAutosave';
import SweepText from '@/components/SweepText';

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
}

/**
 * Visual badge indicating current autosave status to the user.
 * - 'saving': Displays a subtle spinner with "Saving..."
 * - 'saved': Displays a soft green badge with "✓ Autosaved"
 * - 'idle': Displays a muted, unobtrusive "✓ Autosaved"
 * - 'error': Displays a warning badge if localStorage is full or unavailable
 */
export default function AutosaveIndicator({ status }: AutosaveIndicatorProps) {
  if (status === 'saving') {
    return (
      <span
        className="badge bg-secondary-subtle text-secondary border border-secondary-subtle d-inline-flex align-items-center gap-1"
        title="Saving progress to browser storage..."
      >
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          style={{ width: '0.65rem', height: '0.65rem', borderWidth: '1.5px' }}
        />
        <span><SweepText>Saving...</SweepText></span>
      </span>
    );
  }

  if (status === 'saved') {
    return (
      <span
        className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1"
        title="Progress automatically saved to local storage"
        style={{ transition: 'all 0.2s ease' }}
      >
        <span>✓</span>
        <span><SweepText>Autosaved</SweepText></span>
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span
        className="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1"
        title="Could not save to browser storage (storage may be disabled or full)"
      >
        <span>!</span>
        <span><SweepText>Autosave failed</SweepText></span>
      </span>
    );
  }

  // 'idle' status: keep subtle confirmation visible without visual distraction
  return (
    <span
      className="badge bg-light text-muted border d-inline-flex align-items-center gap-1"
      title="Progress is automatically saved to local storage"
      style={{ opacity: 0.85, transition: 'all 0.3s ease' }}
    >
      <span>✓</span>
      <span><SweepText>Autosaved</SweepText></span>
    </span>
  );
}
