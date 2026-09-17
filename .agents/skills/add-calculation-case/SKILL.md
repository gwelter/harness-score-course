---
name: add-calculation-case
description: Use when adding or changing a meeting-cost calculation rule, validation edge case, or domain formula behavior in this CLI.
---

# Add or change a calculation case

Repeatable process for domain changes in Meeting Cost CLI.

## 1. Confirm the change

- State the new or updated rule in one sentence (example: reject fractional participants, or change rounding).
- Confirm it belongs in `src/meeting-cost.js`, not in CLI formatting alone.

## 2. Update the pure domain function

- Edit `calculateMeetingCost` in `src/meeting-cost.js`.
- Keep the function pure: no `process.argv`, no `console`, no filesystem.
- Preserve existing invariants unless the user explicitly asks to change them:
  - all inputs finite
  - `participants >= 1`
  - `durationMinutes > 0`
  - `hourlyCost >= 0`
  - formula `participants * (durationMinutes / 60) * hourlyCost`

## 3. Cover edge cases

Before finishing, exercise at least:

- Valid baseline: `6, 45, 120` → `540`
- Boundary valid: `participants = 1`, tiny positive duration, `hourlyCost = 0`
- Invalid: non-finite (`NaN`, `Infinity`), `participants < 1`, `durationMinutes <= 0`, `hourlyCost < 0`
- Any new rule you added (one valid + one invalid example)

## 4. Wire CLI only if needed

- If the domain throws new messages, ensure `src/cli.js` still prints `Error: …`, usage, and `process.exitCode = 1`.
- Do not duplicate domain checks in the CLI unless argv-missing handling requires it.

## 5. Verify with real commands only

- Run: `npm start -- <participants> <durationMinutes> <hourlyCost>`
- Do not invent `npm test`, `npm run lint`, or typecheck — those sensors are pending.
- For the full verification checklist, follow `.agents/workflows/verify.md` when asked to verify.
