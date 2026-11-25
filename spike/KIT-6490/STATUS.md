# KIT-6490 spike status

The decision is in `docs/adr/0008-javascript-compile-target.md` and the answers are in `FINDINGS.md`. This folder holds the evidence.

## Contents

- `measure.mjs`: raw, gzip and brotli sizes of the Headless and Atomic outputs, written to `results/<label>.json`.
- `table.mjs`: markdown comparison tables. The output is in `results/tables.md`.
- `parse-bench.mjs`: V8 compile-time comparison of two builds of one bundle.
- `results/`:
  - `baseline.json`: `main` at `593ab276f`.
  - `headless-*.json`: Headless at es2021, es2022, es2023, es2024 and esnext, plus one run at Atomic CDN's Rsbuild default target (`headless-chrome10.json`), and two Quantic shim-removal variants.
  - `atomic-*.json`: Atomic at es2022, es2023 and es2024.
- `research-workflow-output.json`: raw research notes (ponyfills, browser APIs, TypeScript, Node.js), each fact-checked.
  - Browser support follows Coveo's Browser Conformity policy, so any browser list suggested in those notes is superseded and not a ui-kit decision.

## Prototype state on this branch

Not meant to merge:

- Headless esbuild target is `es2022`.
- Atomic is at `rslib` syntax `es2022` with `tsconfig` target `ES2022`.
- The Quantic shims are unchanged.
