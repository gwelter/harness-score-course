---
description: Domain and architecture constraints for Meeting Cost CLI source files
globs: src/**
---

# Source rules (`src/**`)

Apply only when editing files under `src/`.

## Architecture

- Keep calculation pure and exported from `src/meeting-cost.js` (`calculateMeetingCost`).
- Keep argv parsing, usage text, and stdout/stderr I/O in `src/cli.js`.
- Do not move domain validation solely into the CLI; do not parse CLI args inside the domain function.

## Domain invariants

- Reject non-finite `participants`, `durationMinutes`, or `hourlyCost`.
- Reject `participants < 1`.
- Reject `durationMinutes <= 0`.
- Reject `hourlyCost < 0`.
- Valid cost: `participants * (durationMinutes / 60) * hourlyCost`.

## Runtime shape

- ESM only (`import`/`export`, `.js` specifiers).
- Native Node.js APIs only in source; do not add runtime dependencies here without an explicit ask.
