# Agent Collaboration & Logging Protocol

> **STOP AND READ THIS FIRST:** If you are an AI agent working on this repository, you **must** follow this protocol before making any code, configuration, or documentation changes.

## 1. Ask for a Pseudonym First

Before starting work on any task in this repository:

1. Check if the project owner (user) has already assigned you a **pseudonym** for this session.
2. If not, **ask the owner for a pseudonym** before making any changes.
3. Do not invent or assume a pseudonym on your own unless the owner explicitly tells you to pick one.

## 2. Log File Naming

Every agent maintains its own log file inside the `agents/` directory, named after the agent's pseudonym:

```text
agents/<pseudonym>.md
```

For example, if your owner gives you the pseudonym `kitsune`, your log file is `agents/kitsune.md`.

Naming logs after each agent's pseudonym makes it easy for the owner or another agent—including a different model deemed better suited for a task—to inspect what a specific agent did and take over cleanly.

## 3. Keep Logs On Par with Changes (Token-Exhaustion Resilience)

Logs **must be written in lockstep with your changes**, not saved up for the end of a session:

1. **Before editing code:** Create or append a new entry in `agents/<pseudonym>.md` with `Status: IN PROGRESS`, listing the goal, base git branch/commit, and planned files/steps.
2. **During work (after each logical step or file group):** Update the entry with the files modified, a concise summary of what changed, and what remains.
3. **After finishing & verifying:** Update the status to `COMPLETED`, record the exact checks run (e.g., `npx tsc --noEmit`, `npm run build`), and note any known caveats.

Because updates happen continuously alongside edits, if an agent hits a token limit, crashes, or is interrupted mid-task, the next agent can compare `git status` / `git diff` against the latest `IN PROGRESS` entry in `agents/*.md` to detect the incomplete work and pick up right where the previous agent left off.

## 4. Taking Over From Another Agent

If you are stepping in to continue or replace another agent's work:

1. Read `agents/README.md` (this file).
2. Run `git status` and `git diff` to inspect the current working tree.
3. Read the relevant `agents/<previous-pseudonym>.md` log(s) to check for any `IN PROGRESS` or `HANDOFF` entries and verify whether the working tree matches the logged changes.
4. Ask the owner for your own pseudonym (unless one was already provided), create/update `agents/<your-pseudonym>.md`, and reference the handoff in your first entry.

## 5. Log Entry Template

```markdown
## YYYY-MM-DD — <Short Task Title>

- **Pseudonym:** <your-pseudonym>
- **Model:** <human-readable model name>
- **Status:** `IN PROGRESS` | `COMPLETED` | `HANDOFF`
- **Branch / Base Commit:** `<branch>` (`<short-sha>`)

### Goal
Brief description of what the owner asked for.

### Planned Steps
- [ ] Step 1
- [ ] Step 2

### Changes Made
- `path/to/file.ts` — Description of change.

### Remaining / Handoff Notes
- Anything unfinished, blocked, or important for the next agent.

### Verification
- `npx tsc --noEmit` — pass / fail / not run yet
```
