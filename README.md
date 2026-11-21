# Kana Input Trainer with SRS

An interactive web application designed to help learners master direct Japanese Kana keyboard input using a Spaced Repetition System (SRS).

Built with **Next.js**, **React 19**, and **TypeScript** (Strict mode with `noUncheckedIndexedAccess`).

Forked, parsed into typescript manually, and vibecoded new features.
---

## Features

- **Spaced Repetition Algorithm (SRS)**: Dynamically adjusts character presentation frequency based on user recall ease.
- **Lookahead Window**: Previews upcoming kana characters to improve typing rhythm.
- **Automatic Background Persistence**: Automatically saves your progress (SRS queue, priority scores, ease factors, and switch preferences) to browser local storage on every question with real-time visual feedback.
- **Export & Import Backups**: Export and import your training progress as a JSON backup file to transfer between devices. Seamlessly compatible with older save formats.
- **Direct Input Support**: Focuses purely on direct Japanese keyboard layout key mapping without relying on standard IME conversion loops.
- **Complete Kana Layout Character Coverage (92 characters)**:
  - **Basic single-key Kana** (45 chars: `ちとしはきく...`)
  - **Shift-modified Kana** (13 chars: `を`, small vowels `ぁぃぅぇぉ`, small `っ`, `ゃゅょ`, `ゎ`, `ゕ`, `ゖ`)
  - **Voiced Kana / Dakuten** (21 chars: `がぎぐげござ...` and `ゔ`)
  - **Semi-voiced Kana / Handakuten** (5 chars: `ぱぴぷぺぽ`)
  - **Punctuation & Symbols** (8 chars: `ー`, `、`, `。`, `・`, `「`, `」`, `゛`, `゜`)
- **Full TypeScript Type Safety**: Fully typed with strict null and unchecked index access checking.

---

## How the Spaced Repetition (SRS) Works

The trainer tracks three primary metrics for each kana character in state:

1. **`queue`**: The list of kana characters queued up for presentation. The first character (`queue[0]`) is the active prompt.
2. **`ease`**: A recall confidence multiplier (defaults to `2`):
   - **Correct Answer**: Ease value doubles (`ease = ease * 2`).
   - **Wrong Answer**: Ease value drops sharply (`ease = max(1, floor(ease / 8))`).
3. **`priority`**: A numerical scheduling score:
   - When a character is answered correctly, its new priority increases by its `ease` plus random jitter:
     $$\text{priority} = \text{priority} + \text{ease} + \lfloor \text{random} \times (\text{ease} / 2) \rfloor$$
   - The queue backlog beyond the lookahead window is sorted in ascending order of priority. Characters with lower priority scores reappear sooner.

---

## Project Structure

```text
kana-input-trainer/
├── src/
│   ├── components/
│   │   ├── KanaInputTrainer.tsx  # Main interactive trainer view
│   │   └── KanaPrompt.tsx        # Centered prompt display with lookahead
│   ├── constants/
│   │   └── kanas.ts              # Kana character lists, lookahead, and initial state
│   ├── hooks/
│   │   ├── useKanaState.ts       # Hook managing SRS queue and action dispatching
│   │   ├── useFileBackup.ts      # Hook handling JSON export and file upload parsing
│   │   └── usePersistReducer.ts  # Generic hook synchronizing reducer state with localStorage
│   ├── types/
│   │   └── kana.ts               # Core TypeScript definitions (KanaState, KanaAction)
│   ├── utils/
│   │   └── srs.ts                # Pure Spaced Repetition queue rescheduling algorithm
│   ├── pages/
│   │   ├── _app.tsx              # Next.js custom app wrapper
│   │   ├── _document.tsx         # Next.js custom HTML document
│   │   └── index.tsx             # Main landing page
│   └── styles/
│       ├── globals.css           # Global application styles
│       └── Home.module.css       # Page styling module
├── tsconfig.json                 # TypeScript compiler configuration (strict mode)
└── package.json                  # Dependencies and build scripts
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```bash
npm install
```

### Development Server

Run the development server with Turbopack:

```bash
npm run dev
```

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

### To Do
- Better the pink theme.
- Correct answer streak visual feedback/reward.
- Add an option to disable gamification effects.