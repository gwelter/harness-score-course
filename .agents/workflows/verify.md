---
description: Verify Meeting Cost CLI using only commands that exist today
---

# Verify

Run this workflow when the user asks to verify, smoke-test, or check the app.

## Existing sensors

1. Start the CLI with a known-good example:

   ```bash
   npm start -- 6 45 120
   ```

   Expect stdout:

   ```text
   Meeting cost: 540.00 (6 participants × 45 min × 120/hour)
   ```

2. Smoke an invalid input (optional but recommended):

   ```bash
   npm start -- 0 45 120
   ```

   Expect stderr with an actionable `Error:` plus usage, and a non-zero exit.

## Pending sensors

Do **not** invent commands. These are not configured yet:

- tests (`npm test` / test runner) — pending
- lint — pending
- typecheck — pending
- formatter — pending
- CI workflow — pending

If verification is requested beyond `npm start`, report those sensors as pending instead of fabricating scripts.
