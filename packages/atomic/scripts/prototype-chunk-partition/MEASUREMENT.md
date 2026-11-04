# Harness measurement (2026-11-03)

The solver partition measured with ADR 0001's own harness (`atomic-perf-harness/chunk-sweep`, copies with fixed paths in `atomic-perf-harness/partition-check`): the four ADR pages served over HTTP/2 with gzip from a local server meant to replay recorded API answers (see the caveat below), fresh browser context per load, Lighthouse mobile throttling (150 ms, 1.6 Mbps, 4× CPU) and a desktop profile (100 ms, 5 Mbps), builds interleaved on each page, median of 7 mobile and 3 desktop loads. "Ready" is when every Atomic tag is defined and the results or products have rendered. Headless and Bueno come from the local CDN builds; themes, language files and icons are overlaid from `packages/atomic/cdn`.

**Caveat (found on 2026-11-03 while building the field-test pages):** in `initialize()`, `proxyBaseUrl` at the root is the analytics proxy; the Search API proxy is `search: {proxyBaseUrl}`. The chunk-sweep init script set the root option, so the search-box, typical and rich pages queried the live Search API in every run below and in the ADR's own measurement; the commerce engine reads the root option as its own proxy, so the commerce page replayed its recording. The same for every build, so the comparisons stand, but each mobile load of the typical page carries about 90 ms of live round trip (3,742 ms against 3,648 ms with the fix; `results/2026-11-03-field/live-vs-mock.jsonl` in the [web-bundle-partition](https://github.com/coveo-incubator/web-bundle-partition) repository). The script is fixed; the field test (Section 6.8 of the paper, which lives in that repository with the field pages and their results) replayed its recordings.

## Result: three builds of one commit, fresh map

Mobile, ready in ms, one interleaved run of the three builds (`analyze.py results-v4.jsonl`, run 5):

| Page           | Before the ADR | N = 10 | Solver | Solver vs N = 10 | Modelled | Files, N = 10 → solver |
| -------------- | -------------- | ------ | ------ | ---------------- | -------- | ---------------------- |
| Search box     | 2862           | 2715   | 2676   | −39 (−1 %)       | −30      | 30 → 12                |
| Typical search | 4174           | 3688   | 3388   | −300 (−8 %)      | −328     | 74 → 16                |
| Rich search    | 5223           | 4765   | 4160   | −605 (−13 %)     | −648     | 132 → 29               |
| Commerce       | 6144           | 5601   | 5148   | −453 (−8 %)      | −586     | 108 → 17               |

Desktop: −80, −135, −248 and −126 ms. Mean mobile gain 349 ms measured against 398 ms modelled. The two-build run on the same builds (run 4, `results-v3b.jsonl`) gave −28, −307, −510 and −502 ms. The harness reproduces the ADR's published times: the pre-ADR build lands within 54 ms of option A, the N = 10 build within 105 ms of option C. All 206 components register on every build, 0 failed requests, no API misses.

Builds: runs 3 to 5 come from main of 2026-11-03 plus five commits to the custom elements manifest build (the build checkout changed branches between runs 2 and 3). Run 3 (`results-v3.jsonl`) compared a solver build from that commit with an N = 10 build from main of 2026-11-02 and is not used.

`report-measured.mjs <measure dir> <strategies dir> <out.html>` draws the figures of the paper and the Confluence page from these files: measured ready times, measured versus modelled gain per run, and request waterfalls of the typical page (`waterfalls.jsonl`, one throttled load per build; the recorder captures scripts only, not the API calls).

## What the first two runs taught

1. **Externals must never be grouped.** The 2026-10-31 map treated the five externals (Headless search, commerce, insight, recommendation; Bueno) as 42-byte modules and merged them into solver chunks. A chunk's `import` of an external only starts when the whole chunk has arrived, and every page loading the chunk fetches the bundle. On the typical search page, Headless (179 KB) started at 1502 ms instead of 748 ms, and a 2.7 KB chunk the page loads carried the import of the 139 KB recommendation bundle, which downloaded first. Measured: +43, +274, +7 and −524 ms on the four pages against a modelled −128, −321, −629 and −583. `analyze.mjs` now keeps externals out of the groups, so they stay in their own 160-byte chunks as on main.
2. **The map goes stale.** With the externals fixed but the two-day-old map, the typical, rich and commerce pages gained −317, −489 and −500 ms, but the search box stayed neutral: the search box merged on 2026-11-02 depends on `validate-props-controller.ts`, which the old map had put in a 15 KB chunk. A committed map needs regeneration on component changes, or a CI check that every module is mapped where the map expects it.
3. **The registration check must serve externals locally.** Fetching `/headless/v3.58.1/...` from the real CDN answered 403 for the unreleased version and 139 components went missing; `check-registration.mjs` now serves Headless and Bueno from `packages/*/cdn`.

The model stays as fitted (5.0 ms per KB, 4.6 ms per file): with externals apart it predicts every page within 140 ms and the mean within 60 ms, and it still overstates the two largest gains a little.
