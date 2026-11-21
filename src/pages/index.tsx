import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import KanaInputTrainer from '@/components/KanaInputTrainer';
import kanaInputLayout from '@/images/kana-input-layout.png';

/**
 * Main application landing page for Kana Input Trainer.
 *
 * Configured with full-width container-fluid layout:
 * - Top-right utility toolbar spans across the top right of the viewport.
 * - Center quiz arena (prompt & dual-slot input card) is always mathematically locked at 50% dead-center.
 * - Quiz category switches are arranged vertically on the right.
 */
export default function Home() {
  // Controls visibility of the keyboard reference image at the bottom of the page
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);

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
            showKeyboard / onToggleKeyboard are threaded through so the toggle button lives in the toolbar. */}
        <KanaInputTrainer
          showKeyboard={showKeyboard}
          onToggleKeyboard={() => setShowKeyboard((v) => !v)}
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

        <div className='mx-auto mt-4' style={{ maxWidth: '800px' }}>
          <h5>How to use</h5>
          <p>Click on the text box. Type the kana as shown on the center of the screen.</p>
          <p>
            Ignore the textbox. Ignore the IME. No need to press backspace, enter, tab, or space. Just focus on pressing the correct key. If experiencing issues try pressing enter to &quot;reset&quot; the IME.
          </p>
          <h5>Progress &amp; Backups</h5>
          <ul>
            <li>Progress automatically saves to your browser&apos;s local storage after every question.</li>
            <li>Use <strong>Export State</strong> and <strong>Import State</strong> in the top right to download backup files or transfer your training progress across different devices and browsers.</li>
          </ul>
        </div>
      </main>
    </>
  );
}
