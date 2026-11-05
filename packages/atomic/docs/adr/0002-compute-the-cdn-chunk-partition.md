---
status: Proposed
date: 2026-11-03
related:
  - https://coveord.atlassian.net/browse/KIT-6364
  - https://coveord.atlassian.net/wiki/spaces/JSUI/pages/7120093190
  - https://github.com/coveo/ui-kit/pull/8823
  - https://github.com/coveo-incubator/web-bundle-partition
  - ./0001-group-shared-modules-in-one-cdn-chunk.md
---

# Compute the CDN chunk partition

## Context and Problem Statement

ADR 0001 groups the modules that at least 10 chunks use into one shared chunk, `atomic-shared`. The threshold was the best of the six options measured, and it halved the files a typical search page fetches. It is still one rule with one knob. The decision underneath, which modules travel together in which file, trades the bytes a page downloads but never runs against the requests it makes, and a threshold cannot see what pages load: every page downloads the whole shared chunk, and the modules under the threshold stay in hundreds of small files.

A prototype computed that decision instead. Modules are grouped by the set of page shapes that need them, and a solver decides which groups share a chunk, minimizing bytes plus a price per request fitted on ADR 0001's own measurements. Measured with ADR 0001's harness on its four pages, under Lighthouse's mobile throttling, the computed partition makes the pages ready 39, 300, 605 and 453 ms sooner than `minChunks: 10` (1 to 13%), within 140 ms of what the model predicted. The method, every run and the two failures measurement caught are on the Confluence page and in the paper attached to it.

The decision is how to ship a computed partition so that it stays right as components change.

## Decision Drivers

- The gains ADR 0001's harness measured: files and time until ready on a mid-range phone, on a search box alone, a typical search page, a rich search page and a commerce page.
- The entry files keep loading what they load today, and chunking never changes which code runs or when (ADR 0001's constraints).
- A partition is data computed from the module graph at one commit. Two days of ordinary work changed the search box's imports enough to cancel its gain: a module the map placed in a 15 KB chunk became a dependency of the search box, so the search-box page downloaded that chunk for one module.
- Headless and Bueno are externals imported from their own CDN paths. Grouping their import wrappers delayed their download until the whole chunk had arrived and made every page loading the chunk fetch the bundle, which cost the typical page 274 ms.
- The build and the checks must run in CI without a solver: a greedy heuristic reaches CP-SAT's objective within 0.2% on the repository's pages.

## Considered Options

### Option A: Keep the threshold

- **Summary:** ADR 0001 as it is.
- **Pros:** Nothing to maintain beyond one number.
- **Cons:** The measured gains are left on the table, and the pages the shared chunk serves badly (the search box downloads 72 KB of code it never runs) stay that way.

### Option B: Compute the partition at build time

- **Summary:** `rsbuild.cdn.mjs` runs the analysis and the heuristic before every CDN build.
- **Pros:** Never stale.
- **Cons:** The CDN build needs a second build, with module concatenation off, and the page shapes before it can start, so every `build:cdn` takes twice as long and depends on files outside the package. What a release ships is decided at release time, so nobody reviews the partition before it reaches the CDN.

### Option C: Ship the partition as data, with a check that it is current

- **Summary:** A committed `cdn-chunk-map.json` maps modules to chunk names. `rsbuild.cdn.mjs` turns it into one enforced async cache group per chunk, in front of ADR 0001's groups, which keep the modules the map does not name. A script computes the map from an analysis build and the page shapes of the repository; a check recomputes which pages need each module and fails when the map no longer follows from the module graph. On a pull request, CI regenerates a stale map and commits it.
- **Pros:** The partition is reviewed with the code that changes it, the CDN build stays one build, a stale map degrades to ADR 0001's rules instead of breaking a page, and staleness is caught before a release.
- **Cons:** A generated file of about 1,500 lines changes whenever the module graph does. The page shapes are the repository's own pages, with equal weights, not customers' pages weighted by traffic. The generator lives in another repository, pinned by commit; CI reaches it as a shared action, a developer regenerating locally needs access to it.

## Decision Outcome

Chosen option: C.

### Rationale

- Shipping data keeps the CDN build simple and reviewable: the map is a plain list, the build reads it, and the generated-files job already commits files CI derives from the sources.
- The check is what keeps the gain. Without it, the map would go stale within days, silently, and the search box would lose its gain first.
- The heuristic replaces the solver at no measurable cost, so the generator runs in a few seconds in CI with no new dependency.
- Externals stay out of the map by construction, and modules the map does not name fall back to ADR 0001's cache groups, so a map computed on an older commit still produces a working build.

## Consequences

- **Positive:** In a browser, with this map, the typical search page fetches 16 Atomic files instead of 73 and 6 KB gzipped less, the rich page 27 instead of 131 and 40 KB less, and the commerce page 17 instead of 107 and 37 KB less. The CDN folder holds 215 JavaScript files instead of 433. The entry file `index.esm.js` is byte-identical; `atomic.esm.js` and `index.js` only list fewer chunk files.
- **Negative:** The search-box page fetches 11 files instead of 29 but 8 KB gzipped more, and a page shape the map was not computed for can download more bytes than before: the harness's dates page, with five components, fetches 10 files instead of 31 but 26 KB more. Every change to the module graph regenerates the map, so pull requests that touch components carry a generated diff.
- **Neutral:** Modules run in the same order as before; only the file that delivers them changes. The chunk names `atomic-c<n>` change meaning whenever the map is regenerated, which costs nothing, because every release has its own CDN path.

## Implementation and Follow-up

- The generator is [web-bundle-partition](https://github.com/coveo-incubator/web-bundle-partition), the internal repository that also holds the solver, the harness and the paper: it reads the stats of an analysis build and the page shapes, groups the modules by usage, runs the heuristic, and writes or checks the map. `scripts/cdn-chunk-map/` in this package prepares its inputs: `pages.mjs` collects the page shapes (the Storybook sample pages, the CDN smoke-test pages, the sample applications and a search box alone), `index.mjs prepare` runs the analysis build and writes the request the tool reads, and `chunk-map.mjs` names modules the way the tool does, so that the build finds them in the map.
- `pnpm run generate:cdn-chunk-map` rewrites the map when it is stale; `pnpm run validate:cdn-chunk-map` fails when it is; both fetch the tool with npx. In CI the tool runs as a GitHub Action from the internal repository, pinned by commit: the check runs on every change to the sources or the page shapes, and the generated-files job commits a fresh map on pull requests.
- Before a release that changes the map substantially, measure the four pages with ADR 0001's harness, as the prototype did.
- Feed the generator real page compositions, weighted by traffic, when they are available: trained on 12 repository pages and tested on 30 others, the partition kept 78% of its file savings but none of its byte savings.
