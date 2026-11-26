---
status: Proposed
date: 2026-11-26
related:
  - https://coveord.atlassian.net/browse/KIT-6767
  - packages/atomic/docs/adr/0001-group-shared-modules-in-one-cdn-chunk.md
---

# Build the CDN loader entries as single files

## Context and Problem Statement

Two CDN files start Atomic's loader. `atomic.esm.js` is the file behind the documented script tag, and it starts the loader as soon as it runs. `index.js` exports `defineCustomElements` for pages that start the loader themselves.

The loader needs the tag map: the table that says which file holds each of the 207 components. Both entries use it, so rspack's chunk splitting moves it into a chunk of its own (5.0 KB gzipped), and each entry begins with a static import of that chunk. A browser therefore fetches three files in a row before the loader can look at the page: the pointer file under `/atomic/v3/`, the entry, and the tag map.

[ADR 0001](./0001-group-shared-modules-in-one-cdn-chunk.md) grouped the code that components share and kept the entry files as they were. The decision here is whether the two loader entries should keep waiting for that second file.

## Decision Drivers

- Time until a page's components are defined and its content is rendered, on a mid-range phone first and on a fast connection second.
- `atomic.esm.js` is on every page that uses the script tag, the documented way to load Atomic from the CDN.
- The entries keep their public exports, the npm package doesn't change, and the same code runs.
- A page that loads both entries keeps working.
- A test can enforce the rule, so that a later build change can't undo it unnoticed.

## Considered Options

### Option A: Keep the tag map in a chunk that the two entries share

- **Summary:** Today's build. rspack splits out any module that two entries use.
- **Pros:** A page that loads both entries downloads the tag map once.
- **Cons:** On every page, the loader waits for one more request before it starts.

### Option B: Never split the loader entries

- **Summary:** Chunk splitting leaves the `atomic.esm` and `index` entries alone, so each one contains the loader and its own copy of the tag map.
- **Pros:** The loader starts one request sooner on every page. Each entry is one file: 10.1 KB gzipped for `atomic.esm.js` (10.2 KB in two files today) and 10.3 KB for `index.js` (10.4 KB in two files today).
- **Cons:** A page that loads both entries downloads the tag map twice, about 5 KB gzipped more.

### Option C: Have the pointer files import the tag map too

- **Summary:** Keep the shared chunk, and make `/atomic/v3/atomic.esm.js` and `/atomic/v3/index.js` import it next to the entry, so that the browser fetches both at once.
- **Pros:** It saves the same request, and the tag map is still downloaded once.
- **Cons:** The deployment repository writes the pointer files, and it would need the chunk's file name for every release. Pages that load a release folder directly, and the local and pull request CDNs, would not get the gain. It was not built.

### Measurements

Options A and B were built from the same commit and measured the same way as in ADR 0001, with production's pointer files in front of the entries:

- Pages were served over HTTP/2 with gzip from a local server that also replayed recorded API answers.
- Every load started with an empty cache.
- Mobile is Lighthouse's throttling: 150 ms latency, 1.6 Mbps and a 4× slower CPU. Fast is 40 ms latency and 10 Mbps.
- Each figure is the median of seven loads, interleaved across the two builds.

"Ready" is when every Atomic element on the page is defined and the results or products have rendered. For the last two pages it is when the first result has rendered.

Ready, in ms:

| Page                                              | Mobile, A | Mobile, B | Change | Fast, A | Fast, B | Change |
| ------------------------------------------------- | --------: | --------: | -----: | ------: | ------: | -----: |
| Script tag, search box alone                      |     2,861 |     2,696 |   −165 |     640 |     587 |    −53 |
| Script tag, typical search                        |     3,723 |     3,556 |   −167 |     809 |     769 |    −40 |
| Script tag, rich search                           |     4,553 |     4,405 |   −148 |     968 |     943 |    −25 |
| Script tag, commerce                              |     5,623 |     5,444 |   −179 |   1,149 |   1,093 |    −56 |
| Loader called from `index.js`, typical search     |     3,878 |     3,708 |   −170 |     874 |     825 |    −49 |
| Script tag and a loader call from `index.js`      |     3,596 |     3,423 |   −173 |     779 |     725 |    −54 |
| Script tag and a custom component                 |     3,674 |     3,569 |   −105 |     809 |     765 |    −44 |
| One module with the loader, a helper and Headless |     3,780 |     3,771 |     −9 |     831 |     840 |     +9 |

- Every page fetches one Atomic file fewer.
- The page with both entries downloads 213.1 KB of Atomic JavaScript instead of 208.7 KB, and is still ready sooner.
- The last page imports the loader from `index.js`, a helper from `index.esm.js` and Headless in one module. That module waits for Headless before it calls the loader, with either build.
- On mobile, the two builds' ranges don't overlap on any page but the last.

**Live pages.** An earlier change that started a large download sooner gained on this harness, then delayed first paint on a live site. So both builds were also loaded into two live docs.coveo.com pages, the search page and an article. Only Atomic's CDN files were swapped for the build, and analytics requests were blocked. First paint and largest paint, median of 7 loads, in ms:

| Page                | Mobile, first | Mobile, largest | Fast, first | Fast, largest |
| ------------------- | ------------- | --------------- | ----------- | ------------- |
| Search, A → B       | 3,264 → 3,032 | 7,692 → 7,884   | 1,156 → 1,336 | 2,136 → 1,992 |
| Article, A → B      | 3,872 → 3,624 | 4,016 → 3,748   | 1,412 → 1,320 | 1,488 → 1,420 |

The changes go both ways and stay within the noise of these pages: two builds that load the same files on the search page differed by up to 372 ms. On mobile, the browser requests Atomic's entry file only at about 3 s, after the site's own blocking scripts, so the round trip saved here is a small part of these pages' load.

What these measurements don't show:

- They come from one machine. The live pages add the network's own variation.
- Option C was not built.

## Decision Outcome

Chosen option: B.

### Rationale

- B makes every page that starts the loader ready sooner: 148 to 179 ms on mobile and 25 to 56 ms on a fast connection, on ADR 0001's four pages. The gain is one round trip, so it grows with latency.
- Its cost falls only on pages that load both entries, and it is small: 4.4 KB more on a page that is still 173 ms sooner on mobile.
- C would save the same round trip without the second copy. But it ties the deployment repository to a file name that the build chooses, and it leaves out every page that isn't served through the pointer files.
- ADR 0001 kept the entry files as they were so that no entry would load more at startup. These two now load less, and `index.esm.js` doesn't change.

## Consequences

- **Positive:** On mobile, ADR 0001's four pages are ready 148 to 179 ms sooner, and a page that calls the loader from `index.js` 170 ms sooner. Every page fetches one file fewer.
- **Negative:** A page that loads both entries, the script tag and a loader call from `index.js`, downloads the tag map twice. The build as a whole grows by 4.6 KB gzipped.
- **Neutral:** `atomic.esm.js` and `index.js` no longer export `__webpack_require__`. rspack exported that internal function only so that the shared chunk could reach the entry's runtime. `index.esm.js` still loads its two small chunks and Headless at startup. Of the 435 files, 414 are byte-identical, and 19 others differ by one to three bytes, where rspack numbers a module differently. ADR 0001 noted that the loader's code is in both entries; the tag map now is too.

## Implementation and Follow-up

The `chunks` function of `chunkSplit.override` in `rsbuild.cdn.mjs` implements the decision: no cache group takes modules out of the `atomic.esm` and `index` entries. `utils/cdn/tests/loader-entries.spec.ts` fails when either entry gains a static import of another Atomic file.

Revisit if another entry starts the loader, or if the tag map grows enough that downloading it twice matters.
