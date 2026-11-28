import { useState, useRef, ChangeEvent, useMemo, useEffect } from 'react';
import useKanaState from '@/hooks/useKanaState';
import { useFileBackup } from '@/hooks/useFileBackup';
import { useAutosave } from '@/hooks/useAutosave';
import KanaPrompt from '@/components/KanaPrompt';
import KanaCategorySwitches from '@/components/KanaCategorySwitches';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import SettingsModal from '@/components/SettingsModal';
import { AppearanceCustomizer } from '@/components/ThemeSelector';
import GamificationBar from '@/components/GamificationBar';
import LevelUpBanner from '@/components/LevelUpBanner';
import SweepText from '@/components/SweepText';
import { evaluateKanaInput } from '@/utils/srs';
import { INPUT_MODE_CONFIGS } from '@/constants/kanas';
import { InputMode, KanaState, KanaSettings } from '@/types/kana';
import {
  useTheme,
  THEMES,
  THEME_CONFIGS,
  Theme,
  FontId,
  BackgroundId,
  FONT_CONFIGS,
  BACKGROUND_CONFIGS,
} from '@/hooks/useTheme';
import { computeGamificationStats, getStreakInfo, applyLevelOverride } from '@/utils/gamification';

const IS_DEVELOPER_MODE = process.env.DEVELOPER_MODE === 'true';

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
    setStreakIntensity,
    triggerStreakBreak,
  } = useTheme();
  const [wasCorrect, setWasCorrect] = useState<boolean>(true);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [streakPulseTick, setStreakPulseTick] = useState<number>(0);
  const [brokenStreak, setBrokenStreak] = useState<number | null>(null);
  const [streakBreakTick, setStreakBreakTick] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  // Controlled input value ensuring the active typing slot stays clean
  const [inputValue, setInputValue] = useState<string>('');
  // 1 past character pushed to the left slot for clear visual feedback
  const [pastInput, setPastInput] = useState<PastInputRecord | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Live speed tracking (Characters Per Minute)
  const keystrokeTimestampsRef = useRef<number[]>([]);
  const [speedCPM, setSpeedCPM] = useState<number>(0);

  // Developer Mode overrides & collapsible panel states (only active when IS_DEVELOPER_MODE is true)
  const [devLevelOverride, setDevLevelOverride] = useState<number | null>(null);
  const [devInvincibleMode, setDevInvincibleMode] = useState<boolean>(false);
  const [devToolsOpen, setDevToolsOpen] = useState<boolean>(true);
  const [devSettingsOpen, setDevSettingsOpen] = useState<boolean>(false);

  // Computed gamification metrics (Level, XP, Coverage, Accuracy, Speed)
  const baseGamificationStats = useMemo(
    () => computeGamificationStats(state.charsAnswered, state.stages, state.mistakes, speedCPM),
    [state.charsAnswered, state.stages, state.mistakes, speedCPM]
  );

  const gamificationStats = useMemo(
    () =>
      IS_DEVELOPER_MODE
        ? applyLevelOverride(baseGamificationStats, devLevelOverride)
        : baseGamificationStats,
    [baseGamificationStats, devLevelOverride]
  );

  // Consecutive correct-answer streak & incremental intensity (20+ chars)
  const streak = state.streak ?? 0;
  const streakInfo = useMemo(() => getStreakInfo(streak), [streak]);

  // Level-up celebration state
  const [showLevelUpBanner, setShowLevelUpBanner] = useState<boolean>(false);
  const [levelUpLevel, setLevelUpLevel] = useState<number>(1);
  const previousLevelRef = useRef<number | null>(null);
  const pendingThemeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelUpBannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streakBreakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Whether to automatically switch to newly unlocked themes on level-up (disabled by default)
  const autoSwitchTheme: boolean = state.settings?.autoSwitchTheme ?? false;
  // Whether to hide gamification visuals (level/XP bar, level-up effects, notifications)
  const disableGamificationEffects: boolean = state.settings?.disableGamificationEffects ?? false;
  // Whether Classic minimalist mode is enabled (disables all themes, animations, and extra UI)
  const classicMode: boolean = state.settings?.classicMode ?? false;

  // Apply data-classic attribute on <html> for minimalist classic styling
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (classicMode) {
      document.documentElement.setAttribute('data-classic', 'true');
    } else {
      document.documentElement.removeAttribute('data-classic');
    }
  }, [classicMode]);

  // Sync background streak intensity (disabled in Classic or when gamification effects are off)
  useEffect(() => {
    const activeIntensity =
      classicMode || disableGamificationEffects ? 0 : streakInfo.intensity;
    setStreakIntensity(activeIntensity);
    return () => setStreakIntensity(0);
  }, [classicMode, disableGamificationEffects, streakInfo.intensity, setStreakIntensity]);

  // Clean up any pending delayed timers on unmount
  useEffect(() => {
    return () => {
      if (pendingThemeTimerRef.current) {
        clearTimeout(pendingThemeTimerRef.current);
      }
      if (levelUpBannerTimerRef.current) {
        clearTimeout(levelUpBannerTimerRef.current);
      }
      if (streakBreakTimerRef.current) {
        clearTimeout(streakBreakTimerRef.current);
      }
    };
  }, []);

  function triggerStreakBreakEffect(lostStreak: number) {
    if (classicMode || disableGamificationEffects || lostStreak < 20) return;
    setBrokenStreak(lostStreak);
    setStreakBreakTick((t) => t + 1);
    triggerStreakBreak();
    if (streakBreakTimerRef.current) {
      clearTimeout(streakBreakTimerRef.current);
    }
    streakBreakTimerRef.current = setTimeout(() => {
      streakBreakTimerRef.current = null;
      setBrokenStreak(null);
    }, 1400);
  }

  function triggerDevLevelUpReplay() {
    if (!IS_DEVELOPER_MODE || classicMode || disableGamificationEffects) return;
    setLevelUpLevel(gamificationStats.level);
    setShowLevelUpBanner(true);
    triggerLevelUpAnimation();
    if (levelUpBannerTimerRef.current) {
      clearTimeout(levelUpBannerTimerRef.current);
    }
    levelUpBannerTimerRef.current = setTimeout(() => {
      levelUpBannerTimerRef.current = null;
      setShowLevelUpBanner(false);
    }, 4500);
  }

  // Detect Level-Up transitions to trigger celebration animation, banner drop, and delayed auto-theme switch
  useEffect(() => {
    if (previousLevelRef.current === null) {
      previousLevelRef.current = gamificationStats.level;
      return;
    }
    if (gamificationStats.level > previousLevelRef.current) {
      const prevLevel = previousLevelRef.current;
      const newLevel = gamificationStats.level;
      setLevelUpLevel(newLevel);

      if (!disableGamificationEffects && !classicMode) {
        setShowLevelUpBanner(true);
        triggerLevelUpAnimation();
      }

      // Auto-switch to the newly unlocked theme mid-way through the level-up background effect
      if (autoSwitchTheme && !classicMode) {
        const unlockedThemes = THEME_CONFIGS.filter(
          (t) => t.minLevel > prevLevel && t.minLevel <= newLevel
        );
        const latestUnlocked = unlockedThemes[unlockedThemes.length - 1];
        if (latestUnlocked) {
          if (pendingThemeTimerRef.current) {
            clearTimeout(pendingThemeTimerRef.current);
          }
          pendingThemeTimerRef.current = setTimeout(() => {
            pendingThemeTimerRef.current = null;
            setTheme(latestUnlocked.id);
          }, disableGamificationEffects ? 0 : 1400);
        }
      }

      previousLevelRef.current = newLevel;
      if (!disableGamificationEffects && !classicMode) {
        const timer = setTimeout(() => {
          setShowLevelUpBanner(false);
        }, 4500);
        return () => clearTimeout(timer);
      }
    } else {
      previousLevelRef.current = gamificationStats.level;
    }
  }, [gamificationStats.level, autoSwitchTheme, disableGamificationEffects, classicMode, setTheme, triggerLevelUpAnimation]);

  // Active keyboard input mode ('desktop' JIS or 'mobile' 12-key flick)
  const inputMode: InputMode = state.settings?.inputMode ?? 'kana';
  const hasLoadedInputModeRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

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
        inputMode,
        autoSwitchTheme,
        disableGamificationEffects,
        classicMode,
      },
      theme,
      font,
      background,
      showKeyboard,
      inputMode,
    }),
    [state, theme, font, background, showKeyboard, inputMode, autoSwitchTheme, disableGamificationEffects, classicMode]
  );

  // 1. Continuous Autosave hook: automatically saves to browser localStorage on every state transition
  const { autosaveStatus } = useAutosave<
    KanaState & {
      settings?: KanaSettings;
      theme?: Theme;
      font?: FontId;
      background?: BackgroundId;
      showKeyboard?: boolean;
      inputMode?: InputMode;
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
      // Track if inputMode was explicitly saved so device auto-detection won't override it
      const loadedMode = loadedState.settings?.inputMode ?? loadedState.inputMode;
      if (loadedMode === 'kana' || loadedMode === '12-key' || loadedMode === 'gojuon' || loadedMode === 'romaji-ime' || loadedMode === 'romaji') {
        hasLoadedInputModeRef.current = true;
      }
      // Prevent false level-up / auto-theme-switch when hydrating saved state
      previousLevelRef.current = null;
      dispatch({ type: 'loadState', state: loadedState });
    },
  });

  // Cheap automatic device detection on first visit when no inputMode preference is saved
  // Also mark hydration complete after useAutosave's mount effect has run
  useEffect(() => {
    setIsHydrated(true);
    if (hasLoadedInputModeRef.current || typeof window === 'undefined') return;
    const isTouchMobile =
      window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 991;
    if (isTouchMobile) {
      dispatch({ type: 'updateSettings', settings: { inputMode: '12-key' } });
    }
  }, [dispatch]);

  // Non-optional: if the player levels down and their active theme (or font/background)
  // becomes locked, switch to the previous unlocked theme.
  useEffect(() => {
    if (!isHydrated) return;

    const currentThemeConfig = THEME_CONFIGS.find((t) => t.id === theme);
    if (currentThemeConfig && currentThemeConfig.minLevel > gamificationStats.level) {
      if (pendingThemeTimerRef.current) {
        clearTimeout(pendingThemeTimerRef.current);
        pendingThemeTimerRef.current = null;
      }
      const unlockedThemes = THEME_CONFIGS.filter((t) => t.minLevel <= gamificationStats.level);
      const previousUnlocked = unlockedThemes[unlockedThemes.length - 1];
      if (previousUnlocked) {
        setTheme(previousUnlocked.id);
      }
    }

    if (font !== 'theme') {
      const currentFontConfig = FONT_CONFIGS.find((f) => f.id === font);
      if (currentFontConfig && currentFontConfig.minLevel > gamificationStats.level) {
        setFont('theme');
      }
    }

    if (background !== 'theme') {
      const currentBgConfig = BACKGROUND_CONFIGS.find((b) => b.id === background);
      if (currentBgConfig && currentBgConfig.minLevel > gamificationStats.level) {
        setBackground('theme');
      }
    }
  }, [isHydrated, gamificationStats.level, theme, setTheme, font, setFont, background, setBackground]);

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
      inputMode?: InputMode;
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
      // Prevent false level-up / auto-theme-switch when importing a backup
      previousLevelRef.current = null;
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
    if (pendingThemeTimerRef.current) {
      clearTimeout(pendingThemeTimerRef.current);
      pendingThemeTimerRef.current = null;
    }
    previousLevelRef.current = null;
    dispatch({ type: 'resetProgress' });
    setPastInput(null);
    setInputValue('');
    keystrokeTimestampsRef.current = [];
    setSpeedCPM(0);
  }

  function handleToggleAutoSwitchTheme() {
    dispatch({ type: 'updateSettings', settings: { autoSwitchTheme: !autoSwitchTheme } });
  }

  function handleToggleDisableGamificationEffects() {
    const next = !disableGamificationEffects;
    if (next) {
      setShowLevelUpBanner(false);
    }
    dispatch({ type: 'updateSettings', settings: { disableGamificationEffects: next } });
  }

  function handleToggleClassicMode() {
    const next = !classicMode;
    if (next) {
      setShowLevelUpBanner(false);
      setIsShaking(false);
    }
    dispatch({ type: 'updateSettings', settings: { classicMode: next } });
  }

  function handleChangeInputMode(nextMode: InputMode) {
    dispatch({ type: 'updateSettings', settings: { inputMode: nextMode } });
    setPastInput(null);
    setInputValue('');
    setWasCorrect(true);
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

    const result =
      IS_DEVELOPER_MODE && devInvincibleMode && val.length > 0 && targetKana
        ? 'correct'
        : evaluateKanaInput(val, targetKana, inputMode);

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
      setBrokenStreak(null);
      if (!classicMode && !disableGamificationEffects && streak + 1 >= 20) {
        setStreakPulseTick((t) => t + 1);
      }
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
      const lostStreak = streak;
      dispatch({ type: 'wrong', ans });
      setWasCorrect(false);
      if (lostStreak >= 20) {
        triggerStreakBreakEffect(lostStreak);
      }
      if (!classicMode) {
        // Trigger horizontal shake animation (resetting first to guarantee re-trigger on consecutive mistakes)
        setIsShaking(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsShaking(true);
          });
        });
      }
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
          <h1 className="h4 mb-0 lh-sm"><SweepText>Kana Input Trainer with SRS</SweepText></h1>
          <p className="text-muted small mb-0">
            <SweepText>Uses an in-session Leitner SRS algorithm. </SweepText>
            <a href='https://github.com/SomeonesGon/kana-input-trainer' target="_blank" rel="noreferrer"><SweepText>Source Code</SweepText></a>.{' '}
            <a href='https://github.com/justremember/kana-input-trainer' target="_blank" rel="noreferrer"><SweepText>Forked from original</SweepText></a>.
          </p>
        </div>

        {/* Right: Mode switch, Keyboard toggle, Settings button, Autosave indicator & Characters Answered */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Keyboard input mode selector (JIS, 12-Key Flick, 50-Sounds, Romaji IME, Pure Romaji) */}
          <select
            className="form-select form-select-sm w-auto"
            value={inputMode}
            onChange={(e) => handleChangeInputMode(e.target.value as InputMode)}
            aria-label="Keyboard input mode"
            title={
              INPUT_MODE_CONFIGS.find((m) => m.id === inputMode)?.description ??
              'Select keyboard input mode'
            }
          >
            {INPUT_MODE_CONFIGS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Toggle keyboard reference image */}
          <button
            className={`btn btn-sm px-2 py-1 ${showKeyboard ? 'btn-outline-secondary' : 'btn-secondary'}`}
            onClick={onToggleKeyboard}
            title={showKeyboard ? 'Hide keyboard reference image' : 'Show keyboard reference image'}
          >
            <SweepText>{showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}</SweepText>
          </button>

          {/* Settings button */}
          <button
            className="btn btn-outline-secondary btn-sm px-2 py-1"
            onClick={() => setIsSettingsOpen(true)}
            title="Open Settings (Theme, Backup, Reset)"
          >
            <SweepText>Settings</SweepText>
          </button>

          <div className="vr d-none d-sm-block my-1" style={{ height: '18px' }} />

          <div className="d-flex align-items-center gap-2">
            {!classicMode && <AutosaveIndicator status={autosaveStatus} />}
            <span className="badge text-bg-light border text-secondary fw-normal px-2 py-1">
              <SweepText>Answered: </SweepText>
              <strong className="text-dark"><SweepText>{state.charsAnswered}</SweepText></strong>
            </span>
          </div>
        </div>
      </div>

      {/* Fixed-position level-up toast — position:fixed so it never shifts page elements */}
      {!classicMode && !disableGamificationEffects && showLevelUpBanner && (
        <LevelUpBanner level={levelUpLevel} />
      )}

      {/* Main Interactive Stage: Symmetrical 3-column grid ensuring Center is ALWAYS 50% dead-center */}
      <div className="kana-stage-grid">
        {/* Left Column: GamificationBar anchored top-left, balancing Column 3 */}
        <div className="kana-stage-left">
          {!classicMode && (
            <GamificationBar
              stats={gamificationStats}
              statsOnly={disableGamificationEffects}
              streakInfo={streakInfo}
              brokenStreak={brokenStreak}
            />
          )}

          {/* Developer Mode Tools & Quick Settings (only enabled when DEVELOPER_MODE=true in .env) */}
          {IS_DEVELOPER_MODE && (
            <>
              <div
                className="mt-2 p-2 rounded-2 border"
                style={{
                  maxWidth: '380px',
                  backgroundColor: 'var(--bg-card-past, rgba(0, 0, 0, 0.04))',
                  borderColor: 'var(--border-past, rgba(0, 0, 0, 0.15))',
                  fontSize: '0.75rem',
                }}
              >
                <button
                  type="button"
                  className="btn btn-link p-0 w-100 d-flex align-items-center justify-content-between text-decoration-none"
                  style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}
                  onClick={() => setDevToolsOpen((o) => !o)}
                  aria-expanded={devToolsOpen}
                >
                  <span className="fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
                    Dev Tools
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{devToolsOpen ? '▾' : '▸'}</span>
                </button>

                {devToolsOpen && (
                  <div className="pt-2 mt-1 border-top">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-uppercase" style={{ letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                        Dev: Streak Preview
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {streak} ({Math.round(streakInfo.intensity * 100)}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      className="form-range mb-1"
                      min={0}
                      max={120}
                      value={Math.min(120, streak)}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        dispatch({ type: 'setStreak', streak: next });
                        if (next >= 20 && !classicMode && !disableGamificationEffects) {
                          setStreakPulseTick((t) => t + 1);
                        }
                      }}
                      aria-label="Developer streak value slider"
                    />
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      {[0, 20, 35, 50, 80, 100].map((val) => (
                        <button
                          key={val}
                          type="button"
                          className={`btn btn-sm py-0 px-2 ${streak === val ? 'btn-primary' : 'btn-outline-secondary'}`}
                          style={{ fontSize: '0.7rem' }}
                          onClick={() => {
                            dispatch({ type: 'setStreak', streak: val });
                            if (val >= 20 && !classicMode && !disableGamificationEffects) {
                              setStreakPulseTick((t) => t + 1);
                            }
                          }}
                        >
                          {val}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm py-0 px-2"
                        style={{ fontSize: '0.7rem' }}
                        onClick={() => {
                          const lost = streak >= 20 ? streak : 25;
                          dispatch({ type: 'setStreak', streak: 0 });
                          triggerStreakBreakEffect(lost);
                        }}
                        title="Reset streak to 0 and preview the streak break effect"
                      >
                        Break
                      </button>
                    </div>

                    {/* Developer Mode Level & Level-Up/Down Controls */}
                    <div className="pt-2 mt-2 border-top">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold text-uppercase" style={{ letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                          Dev: Level &amp; Events
                        </span>
                        <div className="d-flex align-items-center gap-1">
                          <span style={{ color: 'var(--text-muted)' }}>
                            Lvl {gamificationStats.level} ({devLevelOverride !== null ? 'Override' : 'Real'})
                          </span>
                          {devLevelOverride !== null && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm py-0 px-1"
                              style={{ fontSize: '0.65rem' }}
                              onClick={() => setDevLevelOverride(null)}
                              title="Restore real computed level"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-1 mb-1">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm py-0 px-2"
                          style={{ fontSize: '0.7rem' }}
                          disabled={gamificationStats.level <= 1}
                          onClick={() => setDevLevelOverride(Math.max(1, gamificationStats.level - 1))}
                          title="Trigger level down (-1)"
                        >
                          -1 Level Down
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm py-0 px-2"
                          style={{ fontSize: '0.7rem' }}
                          onClick={() => setDevLevelOverride(gamificationStats.level + 1)}
                          title="Trigger level up (+1)"
                        >
                          +1 Level Up
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm py-0 px-2"
                          style={{ fontSize: '0.7rem' }}
                          onClick={triggerDevLevelUpReplay}
                          title="Replay level-up banner & background shower at current level"
                        >
                          Replay FX
                        </button>
                      </div>

                      <div className="d-flex flex-wrap gap-1">
                        {[1, 2, 3, 5, 7, 10, 11].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            className={`btn btn-sm py-0 px-2 ${
                              gamificationStats.level === lvl ? 'btn-primary' : 'btn-outline-secondary'
                            }`}
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => setDevLevelOverride(lvl)}
                          >
                            L{lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Developer Mode Invincible Mode Toggle */}
                    <div className="form-check form-switch d-flex align-items-center justify-content-between ps-0 pt-2 mt-2 border-top">
                      <label
                        className="form-check-label user-select-none mb-0"
                        htmlFor="dev-invincible-mode-toggle"
                        style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
                      >
                        <span className="fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
                          Dev: Invincible Mode
                        </span>
                        <span className="d-block" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Every keystroke counts as correct
                        </span>
                      </label>
                      <input
                        className="form-check-input ms-2 flex-shrink-0"
                        type="checkbox"
                        role="switch"
                        id="dev-invincible-mode-toggle"
                        checked={devInvincibleMode}
                        onChange={() => setDevInvincibleMode((v) => !v)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Quick Settings below Dev Tools (Dev Mode Only) */}
              <div
                className="mt-2 p-2 rounded-2 border"
                style={{
                  maxWidth: '380px',
                  backgroundColor: 'var(--bg-card-past, rgba(0, 0, 0, 0.04))',
                  borderColor: 'var(--border-past, rgba(0, 0, 0, 0.15))',
                  fontSize: '0.75rem',
                }}
              >
                <button
                  type="button"
                  className="btn btn-link p-0 w-100 d-flex align-items-center justify-content-between text-decoration-none"
                  style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}
                  onClick={() => setDevSettingsOpen((o) => !o)}
                  aria-expanded={devSettingsOpen}
                >
                  <span className="fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
                    Dev: Quick Settings
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{devSettingsOpen ? '▾' : '▸'}</span>
                </button>

                {devSettingsOpen && (
                  <div className="pt-2 mt-1 border-top d-flex flex-column gap-2">
                    <AppearanceCustomizer userLevel={gamificationStats.level} />

                    <div className="form-check form-switch d-flex align-items-center justify-content-between ps-0 pt-2 border-top mb-0">
                      <label
                        className="form-check-label user-select-none mb-0"
                        htmlFor="dev-auto-switch-theme-toggle"
                        style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
                      >
                        Auto-switch unlocked themes
                      </label>
                      <input
                        className="form-check-input ms-2 flex-shrink-0"
                        type="checkbox"
                        role="switch"
                        id="dev-auto-switch-theme-toggle"
                        checked={autoSwitchTheme}
                        onChange={handleToggleAutoSwitchTheme}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>

                    <div className="form-check form-switch d-flex align-items-center justify-content-between ps-0 mb-0">
                      <label
                        className="form-check-label user-select-none mb-0"
                        htmlFor="dev-disable-gamification-toggle"
                        style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
                      >
                        Disable gamification effects
                      </label>
                      <input
                        className="form-check-input ms-2 flex-shrink-0"
                        type="checkbox"
                        role="switch"
                        id="dev-disable-gamification-toggle"
                        checked={disableGamificationEffects}
                        onChange={handleToggleDisableGamificationEffects}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>

                    <div className="form-check form-switch d-flex align-items-center justify-content-between ps-0 mb-0">
                      <label
                        className="form-check-label user-select-none mb-0"
                        htmlFor="dev-classic-mode-toggle"
                        style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
                      >
                        Classic minimalist mode
                      </label>
                      <input
                        className="form-check-input ms-2 flex-shrink-0"
                        type="checkbox"
                        role="switch"
                        id="dev-classic-mode-toggle"
                        checked={classicMode}
                        onChange={handleToggleClassicMode}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>

                    <div className="d-flex gap-1 pt-2 border-top">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm flex-fill py-0"
                        style={{ fontSize: '0.72rem' }}
                        onClick={exportState}
                      >
                        Export
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm flex-fill py-0"
                        style={{ fontSize: '0.72rem' }}
                        onClick={importState}
                      >
                        Import
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm flex-fill py-0"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => setIsSettingsOpen(true)}
                      >
                        Reset…
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Center Column: ALWAYS mathematically locked in the dead-center (50%) */}
        <div className="kana-stage-center">
          <KanaPrompt
            currentKana={activePrompt}
            lookaheadKanas={lookaheadKanas}
            transitionKey={state.charsAnswered}
            classicMode={classicMode}
          />

          {/* Dual-slot input card: Past character on left (smaller, gray), active input on right */}
          <div className='kana-input-wrapper mt-3 position-relative'>
            {!classicMode && !disableGamificationEffects && streakInfo.isActive && streakPulseTick > 0 && (
              <div
                key={streakPulseTick}
                className="kana-streak-pulse-ring"
                style={{ '--streak-intensity': streakInfo.intensity } as React.CSSProperties}
                aria-hidden="true"
              />
            )}
            {!classicMode && !disableGamificationEffects && brokenStreak !== null && streakBreakTick > 0 && (
              <div
                key={`break-ring-${streakBreakTick}`}
                className="kana-streak-break-ring"
                aria-hidden="true"
              />
            )}
            <div
              className={`kana-input-card ${wasCorrect ? 'was-correct' : 'was-wrong'} ${
                isShaking ? 'shake-wrong' : ''
              } ${
                !classicMode && !disableGamificationEffects && streakInfo.isActive ? 'is-streaking' : ''
              } ${
                !classicMode && !disableGamificationEffects && brokenStreak !== null ? 'is-streak-broken' : ''
              }`}
              style={
                !classicMode && !disableGamificationEffects && streakInfo.isActive
                  ? ({ '--streak-intensity': streakInfo.intensity } as React.CSSProperties)
                  : undefined
              }
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
                  placeholder={pastInput ? '' : inputMode === 'romaji' ? 'roma' : 'かな'}
                  onChange={handleInputChange}
                  maxLength={8}
                  inputMode='text'
                  enterKeyHint='done'
                  autoFocus
                  autoComplete='off'
                  autoCorrect='off'
                  autoCapitalize='off'
                  spellCheck={false}
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
            inputMode={inputMode}
          />
        </div>
      </div>

      {/* Settings Modal (Theme, Backup & Restore, Reset Progress) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        userLevel={gamificationStats.level}
        autoSwitchTheme={autoSwitchTheme}
        onToggleAutoSwitchTheme={handleToggleAutoSwitchTheme}
        disableGamificationEffects={disableGamificationEffects}
        onToggleDisableGamificationEffects={handleToggleDisableGamificationEffects}
        classicMode={classicMode}
        onToggleClassicMode={handleToggleClassicMode}
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
