# KIT-6490 spike status (paused at usage limit, 2026-11-24)

## Done

- Baselines measured on main @ 593ab276f: `results/baseline.json`.
- Prototype builds measured: Headless es2021, es2022, es2023, es2024, esnext and the Chrome 107/Edge 107/Firefox 104/Safari 16 measurement snapshot (`results/headless-*.json`). Atomic es2022, es2023, es2024 (`results/atomic-*.json`). Comparison tables are in `results/tables.md`.
- Working tree right now: Headless esbuild target is `es2022`, and Atomic is at rslib syntax `es2022` with tsconfig target `ES2022` (uncommitted).
- `pnpm --filter @coveo/headless test` passes: 456 files, 5815 tests. `pnpm --filter @coveo/atomic test` passes: 7275 tests, 81 skipped.
- Research workflow (ponyfills, browser baseline, TypeScript floor, Node floor, each fact-checked) is done. Its raw output is in `research-workflow-output.json`. Read it with `jq -r '.[] | .key, .report, (.verdict|tostring)'`.

## Key numbers

- **Headless es2020 → es2022:** about −0.2 to −0.3 kB gzip per CDN or CJS bundle. es2023, es2024 and esnext output is byte-identical to es2022. npm `dist/esm` doesn't change: tsc already emits ES2022 there.
- **Ponyfills:** injected only into `dist/quantic/**`, whose only in-repo consumer is Quantic. They exist for Salesforce Lightning Locker. Removing all four saves −5.9 to −6.4 kB gzip per Quantic bundle. Research recommends keeping the three shims for Quantic under Locker and dropping `navigator.sendbeacon`.
- **Atomic CDN:** no change at any target. It already uses Rsbuild 2.1.13's default browser list (Chrome 107, Edge 107, Firefox 104, Safari 16) and already ships ES2022 private fields. Atomic npm output: about −0.9 kB gzip in total. size-limit "all lazy" goes from 617.93 to 617.10 kB.
- **V8 compile time:** baseline 6.32 ms vs es2022 6.35 ms. No gain.
- **Side finding:** `require('@coveo/headless')` from npm 3.59.0 fails on Node 20.19, 22.14 and 24 with `StringValue is not a constructor`. `@coveo/bueno` is `"type":"module"` but its `require` entry `dist/bueno.js` is CommonJS (since ab8931e39, 2025-02-26).

## Left

1. Decision from the orchestrator on how to frame the ADR, because the target gain is under 1 kB gzip (see PLAN.md, "Stop and ask").
2. Write `docs/adr/0008-javascript-target-and-runtime-baseline.md` (Proposed) and `FINDINGS.md`, including the draft v4 story.
3. Run `pnpm run lint:fix`, commit, push, and open a draft PR with `j:KIT-6490`.
