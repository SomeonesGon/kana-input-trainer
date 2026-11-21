import { useState, useRef, ChangeEvent, useMemo, useEffect } from 'react';
import useKanaState from '@/hooks/useKanaState';
import { useFileBackup } from '@/hooks/useFileBackup';
import { useAutosave } from '@/hooks/useAutosave';
import KanaPrompt from '@/components/KanaPrompt';
import KanaCategorySwitches from '@/components/KanaCategorySwitches';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import SettingsModal from '@/components/SettingsModal';
import GamificationBar from '@/components/GamificationBar';
import LevelUpBanner from '@/components/LevelUpBanner';
import { evaluateKanaInput } from '@/utils/srs';
import { KanaState, KanaSettings } from '@/types/kana';
import {
  useTheme,
  THEMES,
  Theme,
  FontId,
  BackgroundId,
  FONT_CONFIGS,
  BACKGROUND_CONFIGS,
} from '@/hooks/useTheme';
import { computeGamificationStats } from '@/utils/gamification';

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
  /** Callback to directly set keyboard image visibility (used during import). */
  onSetShowKeyboard?: (show: boolean) => void;
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
export default function KanaInputTrainer({
  showKeyboard,
  onToggleKeyboard,
  onSetShowKeyboard,
}: KanaInputTrainerProps) {
  const [state, dispatch, lookahead, activeQueue] = useKanaState();
  const {
    theme,
    setTheme,
    font,
    setFont,
    background,
    setBackground,
    triggerLevelUpAnimation,
  } = useTheme();
  const [wasCorrect, setWasCorrect] = useState<boolean>(true);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  // Controlled input value ensuring the active typing slot stays clean
  const [inputValue, setInputValue] = useState<string>('');
  // 1 past character pushed to the left slot for clear visual feedback
  const [pastInput, setPastInput] = useState<PastInputRecord | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Live speed tracking (Characters Per Minute)
  const keystrokeTimestampsRef = useRef<number[]>([]);
  const [speedCPM, setSpeedCPM] = useState<number>(0);

  // Computed gamification metrics (Level, XP, Coverage, Accuracy, Speed)
  const gamificationStats = useMemo(
    () => computeGamificationStats(state.charsAnswered, state.stages, state.mistakes, speedCPM),
    [state.charsAnswered, state.stages, state.mistakes, speedCPM]
  );

  // Level-up celebration state
  const [showLevelUpBanner, setShowLevelUpBanner] = useState<boolean>(false);
  const [levelUpLevel, setLevelUpLevel] = useState<number>(1);
  const previousLevelRef = useRef<number | null>(null);

  // Detect Level-Up transitions to trigger celebration animation & banner drop
  useEffect(() => {
    if (previousLevelRef.current === null) {
      previousLevelRef.current = gamificationStats.level;
      return;
    }
    if (gamificationStats.level > previousLevelRef.current) {
      setLevelUpLevel(gamificationStats.level);
      setShowLevelUpBanner(true);
      triggerLevelUpAnimation();
      previousLevelRef.current = gamificationStats.level;
      const timer = setTimeout(() => {
        setShowLevelUpBanner(false);
      }, 4500);
      return () => clearTimeout(timer);
    } else {
      previousLevelRef.current = gamificationStats.level;
    }
  }, [gamificationStats.level, triggerLevelUpAnimation]);

  // Active prompt is the head of the enabled category queue
  const activePrompt = activeQueue[0];
  // Pre-calculate upcoming preview characters for lookahead from the active queue
  const lookaheadKanas = activeQueue.slice(1, 1 + lookahead).join('');

  // Bundle complete SRS state together with user preferences for seamless autosaving and exporting
  const fullSavePayload = useMemo(
    () => ({
      ...state,
      settings: {
        theme,
        font,
        background,
        showKeyboard,
      },
      theme,
      font,
      background,
      showKeyboard,
    }),
    [state, theme, font, background, showKeyboard]
  );

  // 1. Continuous Autosave hook: automatically saves to browser localStorage on every state transition
  const { autosaveStatus } = useAutosave<
    KanaState & {
      settings?: KanaSettings;
      theme?: Theme;
      font?: FontId;
      background?: BackgroundId;
      showKeyboard?: boolean;
    }
  >({
    state: fullSavePayload,
    onLoad: (loadedState) => {
      // Restore theme if present in saved settings
      const loadedTheme = loadedState.settings?.theme ?? loadedState.theme;
      if (loadedTheme && (THEMES as string[]).includes(loadedTheme)) {
        setTheme(loadedTheme);
      }
      // Restore font style if present
      const loadedFont = loadedState.settings?.font ?? loadedState.font;
      if (loadedFont && FONT_CONFIGS.some((f) => f.id === loadedFont)) {
        setFont(loadedFont);
      }
      // Restore background effect if present
      const loadedBg = loadedState.settings?.background ?? loadedState.background;
      if (loadedBg && BACKGROUND_CONFIGS.some((b) => b.id === loadedBg)) {
        setBackground(loadedBg);
      }
      // Restore keyboard visibility if present
      const loadedKeyboard = loadedState.settings?.showKeyboard ?? loadedState.showKeyboard;
      if (typeof loadedKeyboard === 'boolean') {
        onSetShowKeyboard?.(loadedKeyboard);
      }
      dispatch({ type: 'loadState', state: loadedState });
    },
  });

  // 2. Manual Export / Import file backup hook
  const {
    saveState: triggerExportState,
    loadState: triggerImportState,
    openFile,
    fileDownloadUrl,
    fileDownloadRef,
    fileUploadRef,
  } = useFileBackup<
    KanaState & {
      settings?: KanaSettings;
      theme?: Theme;
      font?: FontId;
      background?: BackgroundId;
      showKeyboard?: boolean;
    }
  >({
    fileNamePrefix: 'kanaState',
    onLoad: (loadedState) => {
      // Restore theme if present in backup file
      const loadedTheme = loadedState.settings?.theme ?? loadedState.theme;
      if (loadedTheme && (THEMES as string[]).includes(loadedTheme)) {
        setTheme(loadedTheme);
      }
      // Restore font style if present
      const loadedFont = loadedState.settings?.font ?? loadedState.font;
      if (loadedFont && FONT_CONFIGS.some((f) => f.id === loadedFont)) {
        setFont(loadedFont);
      }
      // Restore background effect if present
      const loadedBg = loadedState.settings?.background ?? loadedState.background;
      if (loadedBg && BACKGROUND_CONFIGS.some((b) => b.id === loadedBg)) {
        setBackground(loadedBg);
      }
      // Restore keyboard visibility if present in backup file
      const loadedKeyboard = loadedState.settings?.showKeyboard ?? loadedState.showKeyboard;
      if (typeof loadedKeyboard === 'boolean') {
        onSetShowKeyboard?.(loadedKeyboard);
      }
      dispatch({ type: 'loadState', state: loadedState });
      // Reset input history when loading a backup
      setPastInput(null);
      setInputValue('');
    },
  });

  function exportState() {
    triggerExportState(fullSavePayload);
  }

  function importState() {
    triggerImportState();
  }

  function handleResetProgress() {
    dispatch({ type: 'resetProgress' });
    setPastInput(null);
    setInputValue('');
    keystrokeTimestampsRef.current = [];
    setSpeedCPM(0);
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
      // Update typing speed metrics
      const now = Date.now();
      keystrokeTimestampsRef.current.push(now);
      const cutoff = now - 30000;
      keystrokeTimestampsRef.current = keystrokeTimestampsRef.current.filter((t) => t > cutoff);
      if (keystrokeTimestampsRef.current.length >= 2) {
        const first = keystrokeTimestampsRef.current[0] ?? now;
        const elapsedMinutes = (now - first) / 60000;
        if (elapsedMinutes > 0) {
          const calculatedCPM = Math.round(keystrokeTimestampsRef.current.length / elapsedMinutes);
          setSpeedCPM(calculatedCPM);
        }
      }

      dispatch({ type: 'correct' });
      setWasCorrect(true);
      setIsShaking(false);
      // Push the completed character to the past slot on the left
      setPastInput({ char: targetKana ?? val, wasCorrect: true });
      // Erase active slot immediately so no trail remains
      setInputValue('');
    } else if (result === 'intermediate') {
      // User typed base character (e.g. 'か' for 'が') and is awaiting modifier '゛'
      console.log('intermediate keystroke for compound kana:', val[val.length - 1]);
      setWasCorrect(true);
      setIsShaking(false);
      setInputValue(val);
    } else if (result === 'wrong') {
      const ans = val.length > 0 ? val[val.length - 1] : undefined;
      console.log('dispatch wrong');
      dispatch({ type: 'wrong', ans });
      setWasCorrect(false);
      // Trigger horizontal shake animation (resetting first to guarantee re-trigger on consecutive mistakes)
      setIsShaking(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsShaking(true);
        });
      });
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
            Uses an in-session Leitner SRS algorithm.{' '}
            <a href='https://github.com/SomeonesGon/kana-input-trainer' target="_blank" rel="noreferrer">Source Code</a>.{' '}
            <a href='https://github.com/justremember/kana-input-trainer' target="_blank" rel="noreferrer">Forked from original</a>.
          </p>
        </div>

        {/* Right: Keyboard toggle, Settings button, Autosave indicator & Characters Answered */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Toggle keyboard reference image */}
          <button
            className={`btn btn-sm px-2 py-1 ${showKeyboard ? 'btn-outline-secondary' : 'btn-secondary'}`}
            onClick={onToggleKeyboard}
            title={showKeyboard ? 'Hide keyboard reference image' : 'Show keyboard reference image'}
          >
            {showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}
          </button>

          {/* Settings button */}
          <button
            className="btn btn-outline-secondary btn-sm px-2 py-1"
            onClick={() => setIsSettingsOpen(true)}
            title="Open Settings (Theme, Backup, Reset)"
          >
            Settings
          </button>

          <div className="vr d-none d-sm-block my-1" style={{ height: '18px' }} />

          <div className="d-flex align-items-center gap-2">
            <AutosaveIndicator status={autosaveStatus} />
            <span className="badge text-bg-light border text-secondary fw-normal px-2 py-1">
              Answered: <strong className="text-dark">{ state.charsAnswered }</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Fixed-position level-up toast — position:fixed so it never shifts page elements */}
      {showLevelUpBanner && <LevelUpBanner level={levelUpLevel} />}

      {/* Main Interactive Stage: Symmetrical 3-column grid ensuring Center is ALWAYS 50% dead-center */}
      <div className="kana-stage-grid">
        {/* Left Column: GamificationBar anchored top-left, balancing Column 3 */}
        <div className="kana-stage-left">
          <GamificationBar stats={gamificationStats} />
        </div>

        {/* Center Column: ALWAYS mathematically locked in the dead-center (50%) */}
        <div className="kana-stage-center">
          <KanaPrompt
            currentKana={activePrompt}
            lookaheadKanas={lookaheadKanas}
          />

          {/* Dual-slot input card: Past character on left (smaller, gray), active input on right */}
          <div className='kana-input-wrapper mt-3'>
            <div
              className={`kana-input-card ${wasCorrect ? 'was-correct' : 'was-wrong'} ${
                isShaking ? 'shake-wrong' : ''
              }`}
              onAnimationEnd={() => setIsShaking(false)}
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

      {/* Settings Modal (Theme, Backup & Restore, Reset Progress) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        userLevel={gamificationStats.level}
        onClose={() => setIsSettingsOpen(false)}
        onExport={exportState}
        onImport={importState}
        onResetProgress={handleResetProgress}
      />

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
