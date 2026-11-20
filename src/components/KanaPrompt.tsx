import React from 'react';
import { SMALL_KANA_MAP } from '@/constants/kanas';

/**
 * Props for the KanaPrompt component.
 */
interface KanaPromptProps {
  /** The current kana character being asked (active prompt) */
  currentKana?: string;
  /** Upcoming kana characters shown for preview lookahead */
  lookaheadKanas?: string;
}

/**
 * Displays the current kana character prompt alongside preview lookahead characters.
 *
 * Enhanced Small Kana Visual Differentiation:
 * Small kana (e.g. ぁ, っ, ゃ) are visually distinct from their regular full-sized counterparts:
 * - A clear status badge indicates "Small Kana" along with the regular counterpart (e.g. "small ぁ vs あ").
 * - The character itself is styled with a distinct scale and dashed boundary box (.is-small-kana).
 *
 * Centering mechanism:
 * The Japanese character '空' (meaning "empty" or "void") is rendered invisibly (`kana-ghost`)
 * on the left side to counterbalance the lookahead characters on the right. Because Japanese
 * full-width characters have uniform glyph widths, this ensures the active prompt in the middle
 * remains centered within the flexbox container.
 */
export default function KanaPrompt({ currentKana, lookaheadKanas = '' }: KanaPromptProps) {
  // Check if the current prompt character is a small kana
  const smallKanaInfo = currentKana ? SMALL_KANA_MAP[currentKana] : undefined;
  const isSmall = Boolean(smallKanaInfo);

  return (
    <div className="kana-prompt-container text-center my-2">
      {/* Visual Badge for Small Kana with reserved height to prevent vertical jitter */}
      <div className="kana-badge-container d-flex justify-content-center align-items-center" style={{ minHeight: '32px' }}>
        {smallKanaInfo ? (
          <span className="badge text-bg-warning px-3 py-1 fw-semibold shadow-sm">
            ⭐ Small Kana / 小文字 ({smallKanaInfo.label})
          </span>
        ) : null}
      </div>

      <div className="kana-prompt d-flex justify-content-center align-items-center">
        <div className="kana-ghost">
          {'空' /* this is a placeholder so the next-question will be centered */}
        </div>
        <div className={`kana-next-question ${isSmall ? 'is-small-kana' : ''}`}>
          {currentKana ?? ''}
        </div>
        <div className="kana-questions-after">
          {lookaheadKanas}
        </div>
      </div>
    </div>
  );
}
