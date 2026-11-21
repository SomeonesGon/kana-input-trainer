import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import KanaInputTrainer from '@/components/KanaInputTrainer';
import kanaInputLayout from '@/images/kana-input-layout.png';
import { useKeyboardSetting } from '@/hooks/useKeyboardSetting';

export const HIDE_HOW_TO_USE_STORAGE_KEY = 'kana_hide_how_to_use';

/**
 * Main application landing page for Kana Input Trainer.
 *
 * Configured with full-width container-fluid layout:
 * - Top-right utility toolbar spans across the top right of the viewport.
 * - Center quiz arena (prompt & dual-slot input card) is always mathematically locked at 50% dead-center.
 * - Quiz category switches are arranged vertically on the right.
 */
export default function Home() {
  // Controls visibility of the keyboard reference image, auto-saved to localStorage
  const [showKeyboard, setShowKeyboard] = useKeyboardSetting();

  // Controls visibility of the "How to use" guide, permanently hidable via button
  const [showHowToUse, setShowHowToUse] = useState<boolean>(true);

  useEffect(() => {
    try {
      const isHidden = localStorage.getItem(HIDE_HOW_TO_USE_STORAGE_KEY) === 'true';
      if (isHidden) {
        setShowHowToUse(false);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  function handleHideHowToUse() {
    setShowHowToUse(false);
    try {
      localStorage.setItem(HIDE_HOW_TO_USE_STORAGE_KEY, 'true');
    } catch {
      // ignore storage errors
    }
  }

  return (
    <>
      <Head>
        <title>Kana Input Trainer</title>
        <meta name="description" content="Learn how to use kana input!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='container-fluid px-3 px-sm-4 px-md-5 py-3'>
        {/* Title is rendered inside KanaInputTrainer's top toolbar row to reach the absolute top of the page.
            showKeyboard, onToggleKeyboard, and onSetShowKeyboard are threaded through so the toggle button
            and export/import functions synchronize with page state and persistence. */}
        <KanaInputTrainer
          showKeyboard={showKeyboard}
          onToggleKeyboard={() => setShowKeyboard((v) => !v)}
          onSetShowKeyboard={setShowKeyboard}
        />

        {/* Keyboard reference image — hidden when user toggles it off */}
        {showKeyboard && (
          <div className="text-center mt-5">
            <Image
              src={kanaInputLayout}
              alt='Kana Input Layout'
              style={{ margin: '30px auto 0 auto', display: 'block', maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}

        {showHowToUse && (
          <div
            className='mx-auto mt-4 p-3 border rounded-3'
            style={{
              maxWidth: '800px',
              backgroundColor: 'var(--bg-card-past)',
              borderColor: 'var(--border-past)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="mb-0">How to use</h5>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-2 py-0"
                style={{ fontSize: '0.78rem' }}
                onClick={handleHideHowToUse}
                title="Hide this guide permanently"
              >
                Hide Guide (Don&apos;t show again)
              </button>
            </div>
            <p>Click on the text box. Type the kana as shown on the center of the screen.</p>
            <p>
              Ignore the textbox. Ignore the IME. No need to press backspace, enter, tab, or space. Just focus on pressing the correct key. If experiencing issues try pressing enter to &quot;reset&quot; the IME.
            </p>
            <h5 className="mt-3">Progress &amp; Backups</h5>
            <ul className="mb-0">
              <li>Progress and settings (theme, keyboard visibility, category switches) automatically save to your browser&apos;s local storage after every question.</li>
              <li>Use <strong>Export State</strong> and <strong>Import State</strong> in the top right to download backup files or transfer your training progress across different devices and browsers.</li>
            </ul>
          </div>
        )}
      </main>
    </>
  );
}
