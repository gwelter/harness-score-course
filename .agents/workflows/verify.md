---
description: Verify Meeting Cost CLI with the real local sensors
---

# Verify

Run this workflow when the user asks to verify, smoke-test, or check the app.

## Commands

1. Full gate (preferred):

   ```bash
   npm run check
   ```

   Runs `lint`, `typecheck`, and `test`.

2. Individual sensors when debugging a failure:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

3. Optional CLI smoke:

   ```bash
   npm start -- 6 45 120
   ```

   Expect: `Meeting cost: 540.00 (6 participants × 45 min × 120/hour)`.

## Notes

- Format with `npm run format` when Biome reports style/format issues.
- CI (`.github/workflows/ci.yml`) repeats `npm ci`, lint, typecheck, and test on
  `main` pushes and pull requests.
- Do not invent extra scripts beyond those in `package.json`.
