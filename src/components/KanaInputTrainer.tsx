import { useState, useRef, ChangeEvent } from 'react';
import useKanaState from '@/hooks/useKanaState';
import { useFileBackup } from '@/hooks/useFileBackup';
import { useAutosave } from '@/hooks/useAutosave';
import KanaPrompt from '@/components/KanaPrompt';
import KanaCategorySwitches from '@/components/KanaCategorySwitches';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import ThemeSlider from '@/components/ThemeSlider';
import { evaluateKanaInput } from '@/utils/srs';
import { KanaState } from '@/types/kana';

/**
 * Record of the most recently entered character for visual feedback.
 */
interface PastInputRecord {
  char: string;
  wasCorrect: boolean;
}

/**
 * Props for KanaInputTrainer.
 */
interface KanaInputTrainerProps {
  /** Whether the keyboard reference image is currently visible. */
  showKeyboard: boolean;
  /** Callback to toggle keyboard image visibility. */
  onToggleKeyboard: () => void;
}

/**
 * KanaInputTrainer component.
 *
 * Core interactive training view:
 * - Top-right Utility Bar: Export/Import controls, keyboard toggle, real-time Autosave status, and Answered counter
 *   pushed all the way to the top-right corner.
 * - Center Stage (Mathematically Centered at 50%): Prompt & dual-slot input card are always dead-center.
 * - Right Sidebar: Stacked vertical category switches positioned on the right.
 */
export default function KanaInputTrainer({ showKeyboard, onToggleKeyboard }: KanaInputTrainerProps) {
  const [state, dispatch, lookahead, activeQueue] = useKanaState();
  const [wasCorrect, setWasCorrect] = useState<boolean>(true);
  // Controlled input value ensuring the active typing slot stays clean
  const [inputValue, setInputValue] = useState<string>('');
  // 1 past character pushed to the left slot for clear visual feedback
  const [pastInput, setPastInput] = useState<PastInputRecord | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Active prompt is the head of the enabled category queue
  const activePrompt = activeQueue[0];
  // Pre-calculate upcoming preview characters for lookahead from the active queue
  const lookaheadKanas = activeQueue.slice(1, 1 + lookahead).join('');

  // 1. Continuous Autosave hook: automatically saves to browser localStorage on every state transition
  const { autosaveStatus } = useAutosave<Partial<KanaState>>({
    state,
    onLoad: (loadedState) => {
      dispatch({ type: 'loadState', state: loadedState });
    },
  });

  // 2. Manual Export / Import file backup hook
  // Code from https://plainenglish.io/blog/how-to-create-download-and-upload-files-in-react-apps
  const {
    saveState: triggerExportState,
    loadState: triggerImportState,
    openFile,
    fileDownloadUrl,
    fileDownloadRef,
    fileUploadRef,
  } = useFileBackup<Partial<KanaState>>({
    fileNamePrefix: 'kanaState',
    onLoad: (loadedState) => {
      dispatch({ type: 'loadState', state: loadedState });
      // Reset input history when loading a manual backup
      setPastInput(null);
      setInputValue('');
    },
  });

  function exportState() {
    triggerExportState(state);
  }

  function importState() {
    triggerImportState();
  }

  /**
   * Evaluates user keyboard input.
   * Compares the entered character(s) with the active prompt in the enabled queue.
   * When an answer is submitted (correct or wrong), the character is pushed to the
   * left past-character slot (smaller and grayed out), and the active input is cleared.
   */
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    const targetKana = activePrompt;

    const result = evaluateKanaInput(val, targetKana);

    if (result === 'correct') {
      console.log('dispatch correct');
      dispatch({ type: 'correct' });
      setWasCorrect(true);
      // Push the completed character to the past slot on the left
      setPastInput({ char: targetKana ?? val, wasCorrect: true });
      // Erase active slot immediately so no trail remains
      setInputValue('');
    } else if (result === 'intermediate') {
      // User typed base character (e.g. 'か' for 'が') and is awaiting modifier '゛'
      console.log('intermediate keystroke for compound kana:', val[val.length - 1]);
      setWasCorrect(true);
      setInputValue(val);
    } else if (result === 'wrong') {
      const ans = val.length > 0 ? val[val.length - 1] : undefined;
      console.log('dispatch wrong');
      dispatch({ type: 'wrong', ans });
      setWasCorrect(false);
      // Push wrong character to the past slot on the left so user has clear feedback
      setPastInput({ char: ans ?? '?', wasCorrect: false });
      // Erase active slot so the user can immediately try again with a clean box
      setInputValue('');
    } else {
      // Empty input (e.g. user pressed backspace)
      setInputValue(val);
    }
  }

  return (
    <div className='kana-input-trainer w-100'>
      {/* Top Header Row: title on the left, utility controls on the right — no preceding element so this sits at the absolute top */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom w-100">
        {/* Left: Page title & subtitle */}
        <div>
          <h1 className="h4 mb-0 lh-sm">Kana Input Trainer with SRS</h1>
          <p className="text-muted small mb-0">
            Uses a simple SRS algorithm.{' '}
            <a href='https://github.com/SomeonesGon/kana-input-trainer' target="_blank" rel="noreferrer">Source Code</a>.{' '}
            <a href='https://github.com/justremember/kana-input-trainer' target="_blank" rel="noreferrer">Forked from original</a>.
          </p>
        </div>

        {/* Right: Import/Export, keyboard toggle, Autosave indicator & Characters Answered */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            className='btn btn-outline-secondary btn-sm px-2 py-1'
            onClick={exportState}
            title="Export training state to a JSON backup file"
          >
            Export State
          </button>
          <button
            className='btn btn-outline-secondary btn-sm px-2 py-1'
            onClick={importState}
            title="Import training state from a JSON backup file"
          >
            Import State
          </button>

          {/* Toggle keyboard reference image */}
          <button
            className={`btn btn-sm px-2 py-1 ${showKeyboard ? 'btn-outline-secondary' : 'btn-secondary'}`}
            onClick={onToggleKeyboard}
            title={showKeyboard ? 'Hide keyboard reference image' : 'Show keyboard reference image'}
          >
            {showKeyboard ? '⌨️ Hide Keyboard' : '⌨️ Show Keyboard'}
          </button>

          <div className="vr d-none d-sm-block my-1" style={{ height: '18px' }} />

          {/* Theme slider: Light → Dark → Pink */}
          <ThemeSlider />

          <div className="vr d-none d-sm-block my-1" style={{ height: '18px' }} />

          <div className="d-flex align-items-center gap-2">
            <AutosaveIndicator status={autosaveStatus} />
            <span className="badge text-bg-light border text-secondary fw-normal px-2 py-1">
              Answered: <strong className="text-dark">{ state.charsAnswered }</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Symmetrical 3-column grid ensuring Center is ALWAYS 50% dead-center */}
      <div className="kana-stage-grid">
        {/* Left Column: Spacer symmetrically balancing Column 3 */}
        <div className="kana-stage-left" />

        {/* Center Column: ALWAYS mathematically locked in the dead-center (50%) */}
        <div className="kana-stage-center">
          <KanaPrompt
            currentKana={activePrompt}
            lookaheadKanas={lookaheadKanas}
          />

          {/* Dual-slot input card: Past character on left (smaller, gray), active input on right */}
          <div className='kana-input-wrapper mt-3'>
            <div
              className={`kana-input-card ${wasCorrect ? 'was-correct' : 'was-wrong'}`}
              onClick={() => inputRef.current?.focus()}
              title="Click to focus typing box"
            >
              <div
                className={`kana-past-slot ${
                  pastInput ? (pastInput.wasCorrect ? 'past-correct' : 'past-wrong') : ''
                }`}
                title={
                  pastInput
                    ? `Previous input: ${pastInput.char} (${pastInput.wasCorrect ? 'correct' : 'wrong'})`
                    : 'Previous input will appear here'
                }
              >
                {pastInput ? pastInput.char : ''}
              </div>

              <div className='kana-active-slot'>
                <input
                  ref={inputRef}
                  type='text'
                  value={inputValue}
                  className='kana-active-input'
                  placeholder={pastInput ? '' : 'かな'}
                  onChange={handleInputChange}
                  maxLength={4}
                  autoFocus
                  autoComplete='off'
                  autoCorrect='off'
                  autoCapitalize='off'
                  spellCheck='false'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Vertical Category Switches aligned to the right */}
        <div className="kana-stage-right">
          <KanaCategorySwitches
            enabledCategories={state.enabledCategories}
            onToggle={(category) => dispatch({ type: 'toggleCategory', category })}
          />
        </div>
      </div>

      {/* Hidden elements for browser file download and file picker */}
      <a
        style={{ display: 'none' }}
        href={fileDownloadUrl ?? undefined}
        ref={fileDownloadRef}
      >
        download it
      </a>

      <input
        type='file'
        style={{ display: 'none' }}
        multiple={false}
        accept=".txt,.text,text/plain"
        onChange={openFile}
        ref={fileUploadRef}
      />
    </div>
  );
}
