# AGENTS.md

Prefer the source of truth in the repo over this file when they disagree.

## Product and layout

- Meeting Cost CLI: local Node CLI that estimates meeting labor cost from
  `participants`, `durationMinutes`, and `hourlyCost`.
- Formula: `participants * (durationMinutes / 60) * hourlyCost`.
- No HTTP API, database, UI, or external services.
- Keep domain pure in `src/meeting-cost.js` (`calculateMeetingCost`); keep argv
  parsing and stdout/stderr I/O in `src/cli.js`.
- Real tree: `package.json`, `package-lock.json`, `src/`, `PROJETO.md`,
  `README.md`, `LICENSE`, `AGENTS.md`, `.gitignore`, `.agents/` (rules, skills,
  workflows). Do not invent missing tooling.

## Commands, domain, and runtime

- Only npm script: `npm start -- <participants> <durationMinutes> <hourlyCost>`
  (`node src/cli.js`). Example: `npm start -- 6 45 120` →
  `Meeting cost: 540.00 (6 participants × 45 min × 120/hour)`.
- Do not invent `test`, `lint`, `format`, `typecheck`, `build`, or `dev`.
- Domain invariants in `calculateMeetingCost`: all inputs finite; participants
  ≥ 1; durationMinutes > 0; hourlyCost ≥ 0. Do not weaken without an explicit ask.
- CLI: require three args; `Number(...)` convert; on missing/invalid input print
  actionable error + usage on stderr and set `process.exitCode = 1`; on success
  print one clear stdout line with two decimal places.
- ESM only (`"type": "module"`, `.js` import specifiers). Node `>=24`. Native
  Node only; no runtime dependencies today—ask before adding any. Do not switch
  to CommonJS without an explicit ask.
- Path-scoped source rules: `.agents/rules/`. Calculation changes: skill
  `add-calculation-case`. Verification: `.agents/workflows/verify.md`.

## Safety and done criteria

- Do not embed secrets; do not run destructive git/fs commands without an
  explicit ask; do not exfiltrate repo contents; do not `eval` CLI args; do not
  change `LICENSE` unless asked. App stays local/offline unless asked otherwise.
- Do not invent CI, hooks, MCP, or sensors that are not in the repo.
- Do not edit `README.md`, `LICENSE`, or `PROJETO.md` unless asked. Do not
  auto-commit.
- Done when: request met without invented commands; domain/CLI split and
  invariants held; only real commands used; ESM/Node/deps policy kept; errors
  actionable; no secrets or unsolicited destructive actions; out-of-scope files
  untouched.
