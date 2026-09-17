# AGENTS.md

Prefer the source of truth in the repo over this file when they disagree.

## Product and layout

- Meeting Cost CLI: local Node CLI that estimates meeting labor cost from
  `participants`, `durationMinutes`, and `hourlyCost`.
- Formula: `participants * (durationMinutes / 60) * hourlyCost`.
- No HTTP API, database, UI, or external services.
- Keep domain pure in `src/meeting-cost.js` (`calculateMeetingCost`); keep argv
  parsing and stdout/stderr I/O in `src/cli.js`.
- Real tree: `package.json`, `package-lock.json`, `src/`, `test/`,
  `tsconfig.json`, `biome.json`, `PROJETO.md`, `README.md`, `LICENSE`,
  `AGENTS.md`, `.gitignore`, `.agents/`, `.github/workflows/ci.yml`.

## Commands, domain, and runtime

- Run: `npm start -- <participants> <durationMinutes> <hourlyCost>`
  (`node src/cli.js`). Example: `npm start -- 6 45 120` →
  `Meeting cost: 540.00 (6 participants × 45 min × 120/hour)`.
- Sensors: `npm test`, `npm run lint`, `npm run format`, `npm run typecheck`,
  `npm run check` (lint + typecheck + test). Details: `.agents/workflows/verify.md`.
- Domain invariants in `calculateMeetingCost`: all inputs finite; participants
  ≥ 1; durationMinutes > 0; hourlyCost ≥ 0. Do not weaken without an explicit ask.
- CLI: require three args; `Number(...)` convert; on missing/invalid input print
  actionable error + usage on stderr and set `process.exitCode = 1`; on success
  print one clear stdout line with two decimal places.
- ESM only (`"type": "module"`, `.js` import specifiers). Node `>=24`. No runtime
  dependencies—devDependencies only for sensors. Ask before adding packages.
  Do not switch to CommonJS without an explicit ask.
- Path-scoped source rules: `.agents/rules/`. Calculation changes: skill
  `add-calculation-case`.

## Safety and done criteria

- Do not embed secrets; do not run destructive git/fs commands without an
  explicit ask; do not exfiltrate repo contents; do not `eval` CLI args; do not
  change `LICENSE` unless asked. App stays local/offline unless asked otherwise.
- Do not invent hooks, MCP, Harness Score workflow, or sensors that are not in
  the repo.
- Do not edit `README.md`, `LICENSE`, or `PROJETO.md` unless asked. Do not
  auto-commit.
- Done when: request met; domain/CLI split and invariants held; `npm run check`
  passes when sensors apply; no secrets or unsolicited destructive actions;
  out-of-scope files untouched.
