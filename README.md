# Kana Input Trainer with SRS

> **For AI Agents:** Before making any changes to this repository, read [agents/README.md](./agents/README.md) for the mandatory pseudonym, real-time logging, and handoff protocol.

An interactive web application designed to help learners master direct Japanese Kana keyboard input using an in-session Spaced Repetition System (SRS).

Built with **Next.js 16**, **React 19**, and **TypeScript** (Strict mode with `noUncheckedIndexedAccess`).

Forked, parsed into TypeScript manually, and expanded with new features.

---

## Features

- **In-Session Leitner Spaced Repetition (SRS)**: Dynamically schedules each kana character across mastery stages (`0`–`5`) using keystroke-based due intervals (`dueSteps`), immediate lapse recovery, and streak protection.
- **Desktop JIS & Mobile 12-Key Flick Input Modes**:
  - **Desktop JIS Mode (89 characters)**: Practice direct Japanese Kana keyboard layout without relying on standard IME conversion loops. Recognizes two-stroke dakuten (`゛`) / handakuten (`゜`) base keystrokes as valid intermediates so you are not prematurely penalized.
  - **Mobile 12-Key Flick Mode (84 characters)**: Adapts the character set and categories for `12キー / フリック入力` (auto-detected on touch mobile viewports or selectable manually), recognizing `゛゜小` cycling intermediates (e.g. `つ` → `っ` → `づ`, `は` → `ば` → `ぱ`).
- **Lookahead Window & Small-Kana Hints**: Previews the upcoming kana character to improve typing rhythm and highlights small kana (`ぁぃぅぇぉっゃゅょ`) so they are not confused with full-sized characters.
- **Category Switches**: Toggle individual character groups (`Basic Kana`, `Dakuten`, `Handakuten`, `Shift / Small Kana`, `Punctuation`) on or off.
- **Gamification & Unlockable Rewards**:
  - Live **Level & XP Progress Bar** tracking **Coverage %**, **All-Time Accuracy %**, and **Speed (CPM / WPM)**, plus incremental **20+ Correct Answer Streak** visual feedback across the level bar, input box, and background.
  - **12 Unlockable Themes**, custom **Fonts**, and animated **Background Particle Effects** unlocked from Level 1 through Level 10 (`Light`, `Midnight Dark`, `Sakura Blossom`, `Cyberpunk Terminal`, `The Matrix`, `Synthwave Neon`, `Imperial Gold`, `Sakura Zen`, `8-Bit Retro Arcade`, `Mystic Cosmic Nebula`, `Emerald Shrine`, `Bloodmoon Samurai`).
  - Optional **Auto-switch to unlocked themes**, **Disable gamification effects**, and **Classic Mode** (minimalist distraction-free mode).
- **Automatic Background Persistence**: Automatically saves your SRS state, category switches, and settings to `localStorage` with a live autosave indicator.
- **Export, Import & Reset**: Export and import full progress + settings as a JSON backup file, with automatic migration for older save formats, plus an inline-guarded progress reset.
- **Kana Layout Character Coverage**:
  - **Basic single-key Kana** (45 chars: `ちとしはきく...`)
  - **Shift / Small Kana** (10 chars: `を`, `ぁぃぅぇぉ`, `っ`, `ゃゅょ` — `を` shifts into Basic Kana in Mobile 12-key mode)
  - **Voiced Kana / Dakuten** (21 chars: `がぎぐげござ...` and `ゔ`)
  - **Semi-voiced Kana / Handakuten** (5 chars: `ぱぴぷぺぽ`)
  - **Punctuation & Symbols** (8 chars on Desktop: `ー`, `、`, `。`, `・`, `「`, `」`, `゛`, `゜`; `ー、。` on Mobile)
- **Full TypeScript Type Safety**: Strict null checking and `noUncheckedIndexedAccess`.

---

## How the Spaced Repetition (SRS) Works

The trainer uses a bounded **in-session Leitner SRS** (`src/utils/srs.ts`) rather than an unbounded priority score:

1. **`stages`** (`0`–`5` per character, starting at `0`):
   - **Correct Answer**: Advances the character by `+1` stage (up to stage `5`) and schedules it ahead using the stage's keystroke interval (`STAGE_INTERVALS`):
     - Stage `0`: `2`–`3` steps
     - Stage `1`: `5`–`7` steps
     - Stage `2`: `12`–`16` steps
     - Stage `3`: `25`–`35` steps
     - Stage `4`: `50`–`70` steps
     - Stage `5`: `100`–`140` steps
   - **Wrong Answer**: Drops the character back to Stage `0` (`2`–`3` steps away) and marks `hasLapsed = true` so subsequent mistakes do not re-trigger penalties on the same prompt.
2. **`dueSteps`**: Tracks the target `charsAnswered` step at which each character becomes due again.
3. **`queue`**: Maintained so `activeQueue[0]` is the current prompt, `activeQueue[1]` is the lookahead preview, and overdue/low-stage characters bubble to the front.
4. **Backward Compatibility**: `migrateLoadedState()` upgrades legacy `ease`/`priority` saves into `stages`/`dueSteps` without losing progress.

---

## Project Structure

```text
kana-input-trainer/
├── agents/
│   └── README.md                       # Mandatory agent pseudonym & real-time logging protocol
├── src/
│   ├── components/
│   │   ├── AutosaveIndicator.tsx       # Live localStorage save status indicator
│   │   ├── BackgroundParticles.tsx     # Theme-aware background particles & level-up burst
│   │   ├── GamificationBar.tsx         # Compact Level, XP, Coverage, Accuracy & Speed bar
│   │   ├── KanaCategorySwitches.tsx    # Category toggle panel (adapts to Desktop/Mobile)
│   │   ├── KanaInputTrainer.tsx        # Main interactive trainer view & input loop
│   │   ├── KanaPrompt.tsx              # Centered prompt display with lookahead & small-kana hint
│   │   ├── LevelUpBanner.tsx           # Fixed-position level-up notification toast
│   │   ├── SettingsModal.tsx           # Settings dialog (appearance, toggles, backup, reset)
│   │   ├── ThemeProvider.tsx           # Theme, font, background & level-up celebration context
│   │   └── ThemeSelector.tsx           # AppearanceCustomizer for unlocked themes/fonts/backgrounds
│   ├── constants/
│   │   └── kanas.ts                    # Kana sets, STAGE_INTERVALS, mobile mappings & initialState
│   ├── hooks/
│   │   ├── useAutosave.ts              # Debounced localStorage autosave & hydration hook
│   │   ├── useFileBackup.ts            # JSON export and file upload import hook
│   │   ├── useKanaState.ts             # Reducer hook managing SRS state and settings
│   │   ├── useKeyboardSetting.ts       # Persisted keyboard reference visibility hook
│   │   ├── usePersistReducer.ts        # Generic localStorage-backed reducer hook
│   │   └── useTheme.ts                 # Theme/font/background configs & React context
│   ├── images/
│   │   └── kana-input-layout.png       # JIS Kana keyboard reference image
│   ├── pages/
│   │   ├── _app.tsx                    # Next.js custom app wrapper
│   │   ├── _document.tsx               # Next.js custom HTML document
│   │   └── index.tsx                   # Main landing page
│   ├── styles/
│   │   ├── globals.css                 # Theme tokens, animations, and trainer layout styles
│   │   └── Home.module.css             # Page styling module
│   ├── types/
│   │   └── kana.ts                     # Core TypeScript definitions (KanaState, KanaAction, etc.)
│   └── utils/
│       ├── gamification.ts             # XP formula, level thresholds, and stats calculations
│       └── srs.ts                      # Input evaluation, Leitner scheduler & state migration
├── next.config.js                      # Next.js configuration (webpack polling + turbopack key)
├── tsconfig.json                       # TypeScript compiler configuration (strict mode)
└── package.json                        # Dependencies and build scripts
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended; note Next.js 16 production builds require Node.js 20+)
- npm

### Installation

```bash
npm install
```

### Development Server

Run the development server (configured with `--webpack` and polling in `next.config.js` / `.env.local` to avoid `EMFILE` watcher limits):

```bash
npm run dev
```

To enable developer preview controls (such as the live streak preview slider), add `DEVELOPER_MODE=true` to `.env.local` (disabled by default).

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Checking & Building

```bash
# Type check without emitting files
npx tsc --noEmit

# Production build
npm run build

# Start production server
npm start
```

---

## Vercel Demo
[Available here!](https://kana-input-trainer-omega.vercel.app/)

---

### To Do
- Other input modes (work in progress)
