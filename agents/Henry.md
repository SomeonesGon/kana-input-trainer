# Agent Log — Henry

## 2026-11-27 — Developer Level Controls (Change Level, Level Up / Level Down Events)

- **Pseudonym:** Henry
- **Model:** Gemini 4 Hydrogen
- **Status:** `COMPLETED`
- **Branch / Base Commit:** `feature/correct-answer-streak` (`b8dfdcd`)

### Goal
Extend the `DEVELOPER_MODE=true` panel in `KanaInputTrainer` with developer controls for leveling:
- Change/override the active player level (`1`–`12`, or reset back to real computed level) without mutating SRS progress.
- Trigger Level Up (`+1`) and Level Down (`-1`) events (including level-up banner, background celebration, auto-theme-switch, and theme/font/background re-locking on level-down).
- Trigger/replay the level-up celebration effect on demand.

### Planned Steps
- [x] Add `applyLevelOverride` helper in `src/utils/gamification.ts`.
- [x] Add `devLevelOverride` state and Level Up / Level Down / Replay FX controls to the `IS_DEVELOPER_MODE` panel in `src/components/KanaInputTrainer.tsx`.
- [x] Verify `npx tsc --noEmit` passes with 0 errors.
- [x] Update `agents/Henry.md` to `COMPLETED` and commit on `feature/correct-answer-streak` with `Co-authored-by: Henry <Henry@users.noreply.github.com>`.

### Changes Made
- `src/utils/gamification.ts` — Added `applyLevelOverride(stats, overrideLevel)` to preview any level while keeping real Coverage, Accuracy, and Speed metrics intact.
- `src/components/KanaInputTrainer.tsx` — Added `devLevelOverride` state, `triggerDevLevelUpReplay()`, and the **Dev: Level & Events** controls (`-1 Level Down`, `+1 Level Up`, `Replay FX`, `Reset`, and `L1`/`L2`/`L3`/`L5`/`L7`/`L10`/`L11` quick-jump buttons) inside the `IS_DEVELOPER_MODE` panel.

### Verification
- `npx tsc --noEmit` — passed (exit code `0`).

---

## 2026-11-27 — Correct Answer Streak Visual Feedback & Developer Mode

- **Pseudonym:** Henry
- **Model:** Gemini 4 Hydrogen
- **Status:** `COMPLETED`
- **Branch / Base Commit:** `feature/correct-answer-streak` (branched from `develop` at `5aae817`)

### Goal
Implement incremental visual feedback for correct-answer streaks of `20+` characters across:
1. The Level / Gamification Bar (`GamificationBar`)
2. The input box (`KanaInputTrainer` / `.kana-input-card`)
3. The background (`BackgroundParticles` / `ThemeProvider` / `globals.css`)
Plus a Developer Mode streak switcher enabled only when `DEVELOPER_MODE=true` is set in `.env*`.

### Planned Steps
- [x] Expose `DEVELOPER_MODE` safely in `next.config.js` (defaults to `'false'`).
- [x] Add `streak` tracking to `KanaState` / `useKanaState` / `srs.ts` (`correct` increments, `wrong` & `resetProgress` reset to `0`, dev `setStreak` action).
- [x] Add `getStreakInfo(streak)` helper in `src/utils/gamification.ts`.
- [x] Wire `streakIntensity` into `ThemeProvider` / `useTheme` and `BackgroundParticles` + `globals.css` (ambient aura + particle energy scaling at 20+).
- [x] Update `GamificationBar` and `.kana-input-card` in `KanaInputTrainer` + `globals.css` for incremental streak visuals (respecting `classicMode` and `disableGamificationEffects`).
- [x] Add Developer Mode streak switcher UI in `KanaInputTrainer` (only visible when `process.env.DEVELOPER_MODE === 'true'`).
- [x] Verify with `npx tsc --noEmit`, update `README.md` if needed, and commit minimal changes on `feature/correct-answer-streak`.

### Changes Made
- `next.config.js` — Exposed `DEVELOPER_MODE` env var (`'true'` only when `process.env.DEVELOPER_MODE === 'true'`, else `'false'`).
- `src/types/kana.ts` — Added optional `streak?: number` to `KanaState` and `{ type: 'setStreak'; streak: number }` to `KanaAction`.
- `src/constants/kanas.ts` — Added `streak: 0` to `initialState`.
- `src/utils/srs.ts` — Preserved/sanitized `streak` in `migrateLoadedState()`.
- `src/hooks/useKanaState.ts` — Incremented `streak` on `correct`, reset to `0` on `wrong` and `resetProgress`, added `setStreak` case.
- `src/utils/gamification.ts` — Added `STREAK_THRESHOLD = 20`, `StreakInfo`, and `getStreakInfo()`.
- `src/hooks/useTheme.ts` & `src/components/ThemeProvider.tsx` — Added `streakIntensity` / `setStreakIntensity` to `ThemeContext`.
- `src/components/BackgroundParticles.tsx` — Added incremental `.bg-streak-aura`, ambient particle boost, and rising streak sparks when `streakIntensity > 0`.
- `src/components/GamificationBar.tsx` — Added tiered `STREAK` badge and incremental bar glow for 20+ streaks.
- `src/components/KanaInputTrainer.tsx` — Wired streak tracking, `.kana-input-card.is-streaking` + `.kana-streak-pulse-ring`, background `streakIntensity` sync, and `DEVELOPER_MODE=true` streak preview slider/presets.
- `src/styles/globals.css` — Added incremental CSS rules for GamificationBar, input card glow/pulse ring, and background streak aura/sparks (with `prefers-reduced-motion` support).
- `README.md` — Documented 20+ streak visual feedback and `DEVELOPER_MODE=true`, removed streak item from To Do.

### Remaining / Handoff Notes
- None.

### Verification
- `npx tsc --noEmit` — passed (exit code `0`).

---

## 2026-11-27 — Session Initialization & Agent Git Workflow Rules

- **Pseudonym:** Henry
- **Model:** Gemini 4 Hydrogen
- **Status:** `COMPLETED`
- **Branch / Base Commit:** `develop` (`5aae817`)

### Goal
Adopt the assigned pseudonym `Henry`, review `README.md` and `agents/README.md`, and keep the agent log synchronized with the current working tree.

### Changes Made
- `agents/README.md` — Added Section 5 (`Git Workflow & Commit Rules`) requiring pulling from `develop`, working on feature branches, making minimal commits, and adding `Co-authored-by:` trailers. *(Pending commit on a feature branch.)*
- `agents/Henry.md` — Initialized agent log file for `Henry`.

### Remaining / Handoff Notes
- `agents/README.md` (Section 5 addition) and `agents/Henry.md` are currently uncommitted in the working tree on `develop`; ready to move to a feature branch and commit or begin the next task.

### Verification
- `git status --short` & `git branch -a` — verified repository is on `develop` (`5aae817`, matching `origin/develop`).
