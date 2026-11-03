# Harness measurement (2026-11-03)

The solver partition measured with ADR 0001's own harness (`atomic-perf-harness/chunk-sweep`, copies with fixed paths in `atomic-perf-harness/partition-check`): the four ADR pages served over HTTP/2 with gzip from a local server that replays recorded API answers, fresh browser context per load, Lighthouse mobile throttling (150 ms, 1.6 Mbps, 4× CPU) and a desktop profile (100 ms, 5 Mbps), builds interleaved on each page, median of 7 mobile and 3 desktop loads. "Ready" is when every Atomic tag is defined and the results or products have rendered. Headless and Bueno come from the local CDN builds; themes, language files and icons are overlaid from `packages/atomic/cdn`.

## Result: fresh map, both builds from the same source

Mobile, ready in ms, versus the ADR N = 10 build (`analyze.py results-v3b.jsonl`):

| Page | N = 10 | Solver | Measured | Modelled | Files | KB gzipped |
|---|---|---|---|---|---|---|
| Search box | 2695 | 2667 | −28 (−1 %) | −30 | 30 → 12 | 134.6 → 144.4 |
| Typical search | 3702 | 3395 | −307 (−8 %) | −328 | 74 → 16 | 179.9 → 165.1 |
| Rich search | 4702 | 4192 | −510 (−11 %) | −648 | 132 → 29 | 268.1 → 228.7 |
| Commerce | 5608 | 5106 | −502 (−9 %) | −586 | 108 → 17 | 214.3 → 176.9 |

Desktop: −65, −134, −322 and −192 ms (−5 to −15 %). Mean mobile gain 337 ms measured against 398 ms modelled. All 206 components register, 0 failed requests, no API misses. The pre-ADR build, measured in the first run, matched the model within 25 ms on every page.

## What the first two runs taught

1. **Externals must never be grouped.** The 2026-10-31 map treated the five externals (Headless search, commerce, insight, recommendation; Bueno) as 42-byte modules and merged them into solver chunks. A chunk's `import` of an external only starts when the whole chunk has arrived, and every page loading the chunk fetches the bundle. On the typical search page, Headless (179 KB) started at 1502 ms instead of 748 ms, and a 15 KB chunk dragged in the 139 KB recommendation bundle. Measured: +43, +274, +7 and −524 ms on the four pages against a modelled −128, −321, −629 and −583. `analyze.mjs` now keeps externals out of the groups, so they stay in their own 160-byte chunks as on main.
2. **The map goes stale.** With the externals fixed but the two-day-old map, the typical, rich and commerce pages gained −317, −489 and −500 ms, but the search box stayed neutral: the search box merged on 2026-11-02 depends on `validate-props-controller.ts`, which the old map had put in a 15 KB chunk. A committed map needs regeneration on component changes, or a CI check that every module is mapped where the map expects it.
3. **The registration check must serve externals locally.** Fetching `/headless/v3.58.1/...` from the real CDN answered 403 for the unreleased version and 139 components went missing; `check-registration.mjs` now serves Headless and Bueno from `packages/*/cdn`.

The model stays as fitted (5.0 ms per KB, 4.6 ms per file): with externals apart it predicts every page within 140 ms and the mean within 60 ms, and it still overstates the two largest gains a little.
