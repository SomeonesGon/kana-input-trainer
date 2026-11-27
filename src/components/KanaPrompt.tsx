import React, { useState, useEffect } from 'react';
import { SMALL_KANA_MAP } from '@/constants/kanas';

/** localStorage key used to remember that the user has already seen the small-kana notice. */
const SMALL_KANA_SEEN_KEY = 'kana_small_seen';

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
  const isLookaheadSmall = Boolean(lookaheadKanas && SMALL_KANA_MAP[lookaheadKanas[0] ?? '']);

  // Track whether the user has already been shown the small-kana notice at least once.
  // Initialises synchronously to 'true' (already seen) on the server to avoid hydration mismatch;
  // corrected to the real localStorage value in an effect on the client.
  const [smallKanaSeen, setSmallKanaSeen] = useState<boolean>(true);

  useEffect(() => {
    // Read the persisted flag on the client after mount
    setSmallKanaSeen(Boolean(localStorage.getItem(SMALL_KANA_SEEN_KEY)));
  }, []);

  // The first time a small kana appears we show the badge and immediately persist the flag so
  // it won't appear again on future visits.
  useEffect(() => {
    if (isSmall && !smallKanaSeen) {
      setSmallKanaSeen(true);
      localStorage.setItem(SMALL_KANA_SEEN_KEY, '1');
    }
  }, [isSmall, smallKanaSeen]);

  return (
    <div className="kana-prompt-container text-center my-2">
      {/* Visual Badge for Small Kana — shown only on the user's first encounter, then never again */}
      <div className="kana-badge-container d-flex justify-content-center align-items-center" style={{ minHeight: '32px' }}>
        {smallKanaInfo && !smallKanaSeen ? (
          <span className="badge text-bg-warning px-3 py-1 fw-semibold shadow-sm">
            Small Kana / 小文字 ({smallKanaInfo.label})
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
        <div className={`kana-questions-after ${isLookaheadSmall ? 'is-small-preview' : ''}`}>
          {lookaheadKanas}
        </div>
      </div>
    </div>
  );
}
