import { useState, useRef, ChangeEvent } from 'react';
import useKanaState from '@/hooks/useKanaState';
import { useFileBackup } from '@/hooks/useFileBackup';
import KanaPrompt from '@/components/KanaPrompt';
import KanaCategorySwitches from '@/components/KanaCategorySwitches';
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
 * KanaInputTrainer component.
 *
 * Core interactive training view:
 * - Displays the prompt and upcoming lookahead characters via KanaPrompt.
 * - Highlights small kana (ぁ, っ, ゃ, etc.) so they are visually distinct from regular kana.
 * - Dual-slot input card:
 *   - Left slot: keeps 1 past character pushed to the left, smaller and grayed out (right or wrong).
 *   - Active slot: clean, large input area that clears after each answer to avoid character accumulation.
 * - Manages user input detection and dispatches 'correct' or 'wrong' actions.
 * - Supports two-stroke compound characters (dakuten/handakuten) without premature penalty.
 * - Provides category toggle switches to test specific character groups (Basic, Dakuten, Handakuten, etc.).
 * - Provides Save State / Load State functionality using useFileBackup.
 * - Displays progress stats (prompts answered correctly).
 */
export default function KanaInputTrainer() {
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

  // Code from https://plainenglish.io/blog/how-to-create-download-and-upload-files-in-react-apps
  // Encapsulated file save/load state hook
  const {
    saveState: triggerSaveState,
    loadState,
    openFile,
    fileDownloadUrl,
    fileDownloadRef,
    fileUploadRef,
  } = useFileBackup<Partial<KanaState>>({
    fileNamePrefix: 'kanaState',
    onLoad: (loadedState) => {
      dispatch({ type: 'loadState', state: loadedState });
      // Reset input history when loading a new backup
      setPastInput(null);
      setInputValue('');
    },
  });

  function saveState() {
    triggerSaveState(state);
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
    <div className='kana-input-trainer'>
      {/* Centered Kana question prompt with small kana distinction */}
      <KanaPrompt
        currentKana={activePrompt}
        lookaheadKanas={lookaheadKanas}
      />

      {/* Category selector switches */}
      <KanaCategorySwitches
        enabledCategories={state.enabledCategories}
        onToggle={(category) => dispatch({ type: 'toggleCategory', category })}
      />

      {/* Action controls & session statistics */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-2">
        <div>
          <button className='btn btn-secondary btn-sm me-2' onClick={saveState}>
            Save State
          </button>
          <button className='btn btn-secondary btn-sm me-2' onClick={loadState}>
            Load State
          </button>
        </div>
        <span className="text-secondary small">
          Answered: <strong className="text-dark">{ state.charsAnswered }</strong>
        </span>
      </div>

      {/* Dual-slot input card: Past character pushed to left (smaller, gray), active input on right */}
      <div className='kana-input-wrapper'>
        <div
          className={`kana-input-card ${wasCorrect ? 'was-correct' : 'was-wrong'}`}
          onClick={() => inputRef.current?.focus()}
          title="Click to focus typing box"
        >
          {/* Past character slot on the left (smaller, gray, showing recent input history) */}
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

          {/* Active typing input slot on the right */}
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
