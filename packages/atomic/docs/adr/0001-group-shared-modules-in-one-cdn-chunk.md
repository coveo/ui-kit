---
status: Proposed
date: 2026-10-15
related:
  - https://coveord.atlassian.net/browse/KIT-6364
  - https://github.com/coveo/ui-kit/pull/8682
  - https://github.com/coveo/ui-kit/pull/8681
---

# Group shared modules in one CDN chunk

## Context and Problem Statement

`rsbuild.cdn.mjs` splits Atomic's CDN bundle with rsbuild's `split-by-module` strategy and no minimum chunk size. Every npm package becomes one chunk, and every set of modules that the same components share becomes a chunk of its own. Components load on demand: for each one, the runtime fetches the list of chunks its code needs, then runs it.

Atomic's components share many small modules, such as Lit, base classes, controllers and utilities, so this produces hundreds of tiny chunks. With #8681 applied, a typical search page fetches 162 Atomic files, 109 of them under 2 KB, a rich search page fetches 225 and a commerce page 196. Each Atomic release is deployed under its own CDN path, so no file is reused across releases. Every first visit pays for every request, and small files compress poorly.

The decision is how to group the shared code so that pages fetch far fewer files without downloading much code they never run, and without changing what the CDN entry files load.

## Decision Drivers

- Time until a page's components are defined and its content is rendered, on a mid-range phone first and on desktop second.
- Files and bytes on four page shapes: a search box alone (often on every page of a site), a typical search page, a rich search page and a commerce page.
- The entry files keep loading what they load today. Pages load `atomic.esm.js` or `index.js`, and custom components import `initializeBindings` and other helpers from `index.esm.js`, which loads 2 KB gzipped at startup.
- Chunking may change which file delivers a module, but never which code runs or when.
- A short rule that keeps working as components are added.

## Considered Options

### Option A: `split-by-module` alone

- **Summary:** The build with #8681 applied.
- **Pros:** A page downloads only the Atomic modules its components use.
- **Cons:** 65 to 225 files per page. On mobile, every page is slower than with options C (at N = 5 and above) and D to F.

### Option B: rspack's default `splitChunks`

- **Summary:** `chunks: 'all'` with rspack's production defaults: a 20 KB minimum chunk size, plus its default and vendor groups.
- **Pros:** Fewest files, and the fastest page with only a search box.
- **Cons:** Shared modules that can't fill a 20 KB chunk are copied into every chunk that uses them. The rich page downloads 491 KB gzipped instead of 271 KB, and on mobile it is ready 20% later than with option C at N = 10.

### Option C: One chunk for the Atomic and Lit modules that at least N chunks use

- **Summary:** An `atomic-shared` cache group covers modules from Atomic's `src` and from the Lit runtime (`lit`, `lit-html`, `lit-element`, `@lit/reactive-element`, `@lit/context` and `tslib`) that at least N chunks use. It was measured for N from 2 to 50.
- **Pros:** One file replaces most of the small ones, and N sets how much shared code small pages download.
- **Cons:** At N = 9 or less, a module that `index.esm.js` loads at startup qualifies. `index.esm.js` then starts by downloading the whole shared chunk: 48 KB gzipped at N = 9 and 77 KB at N = 5, instead of 2 KB. At N = 2, `atomic.esm.js` and `index.js` also wait for a 164 KB chunk. Above N = 10, the typical, rich and commerce pages get slower at every step.

### Option D: Atomic's source only, N = 10

- **Summary:** Option C without the Lit runtime.
- **Pros:** None measured.
- **Cons:** Every page still loads Lit's packages, now as separate files. That means 4 to 6 more files per page, and pages are 1% to 2% slower on mobile.

### Option E: Every bundled module, N = 10

- **Summary:** Option C extended to npm packages. Today it adds DOMPurify and dayjs with its `customParseFormat` plugin, which every measured page loads, and `escape-html`, which every page except the search-box one loads. Externals such as Headless never qualify, because they have no source file.
- **Pros:** 2 to 3 fewer files and up to 2.7 KB less per page. The rule is the literal reading of "modules that at least 10 chunks use".
- **Cons:** It is no faster on the typical, rich and commerce pages, and only 21 ms faster on the search-box page (mobile). The chunk that every page loads first grows from 47.6 KB to 62.1 KB gzipped, and any npm package that 10 chunks use later joins it without anyone choosing it. Headless stays out only because externals have no source file: if that ever changed, every page would import every Headless bundle.

### Option F: One shared chunk per line of business, N = 10

- **Summary:** Option E, with modules from the `search` and `commerce` component folders in `atomic-shared-search` and `atomic-shared-commerce`.
- **Pros:** The search-box page skips 30 KB of decoded result-template code and is ready 44 ms sooner on mobile.
- **Cons:** It is no faster on the typical, rich and commerce pages, because folders don't match what pages load. Commerce components use the result sections and text components in the `search` folder, so commerce pages load `atomic-shared-search`, and the rich search page loads `atomic-shared-commerce`. It also needs six cache groups to keep in sync with the component folders.

### Measurements

Every option was built from the same commit, with #8681's one-chunk-per-dayjs-locale group, and measured the same way:

- Pages were served over HTTP/2 with gzip from a local server. The same server replayed recorded API answers, so only the Atomic files differed between options.
- Every load started with an empty cache.
- Two network profiles were used. Mobile is Lighthouse's throttling: 150 ms latency, 1.6 Mbps and a 4× slower CPU. Desktop is 100 ms latency and 5 Mbps.
- Each figure is the median of five mobile loads or three desktop loads, interleaved across options.

"Ready" is when every Atomic element on the page is defined and the results or products have rendered.

Mobile, ready in, with the number of Atomic files fetched:

| Option        | Search box      | Typical search  | Rich search      | Commerce         |
| ------------- | --------------- | --------------- | ---------------- | ---------------- |
| A             | 2.91 s (65)     | 4.21 s (162)    | 5.27 s (225)     | 6.09 s (196)     |
| B             | 2.53 s (15)     | 4.05 s (50)     | 5.59 s (92)      | 5.89 s (67)      |
| C, N = 5      | 2.77 s (23)     | 3.60 s (50)     | 4.55 s (97)      | 5.42 s (78)      |
| C, N = 7      | 2.70 s (27)     | 3.63 s (64)     | 4.58 s (118)     | 5.46 s (94)      |
| **C, N = 10** | **2.68 s (30)** | **3.66 s (76)** | **4.66 s (134)** | **5.54 s (108)** |
| C, N = 20     | 2.66 s (34)     | 3.85 s (106)    | 4.86 s (168)     | 5.76 s (142)     |
| C, N = 50     | 2.69 s (41)     | 4.02 s (135)    | 5.05 s (198)     | 5.92 s (169)     |
| D             | 2.74 s (36)     | 3.72 s (80)     | 4.71 s (138)     | 5.59 s (112)     |

The three closest options were then measured again together, with seven mobile loads each:

| Option        | Search box      | Typical search  | Rich search      | Commerce         |
| ------------- | --------------- | --------------- | ---------------- | ---------------- |
| **C, N = 10** | **2.66 s (30)** | **3.65 s (76)** | **4.62 s (134)** | **5.52 s (108)** |
| E             | 2.64 s (28)     | 3.63 s (74)     | 4.63 s (132)     | 5.50 s (105)     |
| F             | 2.62 s (28)     | 3.63 s (75)     | 4.63 s (134)     | 5.50 s (107)     |

Atomic JavaScript downloaded, gzipped:

| Option        | Search box   | Typical search | Rich search  | Commerce     |
| ------------- | ------------ | -------------- | ------------ | ------------ |
| A             | 130.0 KB     | 209.4 KB       | 301.2 KB     | 244.2 KB     |
| B             | 112.5 KB     | 267.8 KB       | 491.5 KB     | 326.1 KB     |
| C, N = 5      | 154.7 KB     | 188.4 KB       | 266.5 KB     | 212.6 KB     |
| **C, N = 10** | **132.4 KB** | **180.6 KB**   | **270.6 KB** | **214.7 KB** |
| C, N = 20     | 123.6 KB     | 190.2 KB       | 281.7 KB     | 226.8 KB     |
| E             | 130.2 KB     | 180.1 KB       | 270.1 KB     | 212.0 KB     |
| F             | 125.3 KB     | 179.5 KB       | 271.4 KB     | 213.3 KB     |

The desktop profile shows the same trends with smaller gaps.

## Decision Outcome

Chosen option: C with N = 10.

### Rationale

- N = 10 is the lowest threshold that leaves every entry file as it is. `index.esm.js` and the two chunks it imports are byte-identical. `atomic.esm.js` and `index.js` differ only in their table of chunk file names. The runtime chunk differs only in the list of files each component loads, and in the module id for 2 of the 206 components (`atomic-icon` and `atomic-recs-error`), which rspack now combines with their helpers differently.
- Raising N above 10 slows the typical, rich and commerce pages at every step, on both profiles. The search-box page doesn't benefit: it is within 1% on mobile and no faster on desktop. N = 10 is the fastest setting that keeps the entry files unchanged.
- Lowering N would make the larger pages up to 2.4% faster on mobile (N = 5), but every page that imports `index.esm.js` would first download 48 to 164 KB gzipped instead of 2 KB. At N = 5 the search-box page is also 3% slower.
- Lit belongs in the shared chunk. Every page loads it, and leaving it out (option D) is slower on every page.
- On mobile, options E and F come within 0.5% of C on the typical, rich and commerce pages, in both directions, and on desktop within 2.5%. They are consistently faster only on a page with nothing but a search box, by 21 ms and 44 ms on mobile. That gain doesn't justify a shared chunk that any third-party package can join (E), or six folder-based groups whose folders don't match what pages load (F).
- rspack's defaults (option B) win only on the search-box page, because they copy shared code into every chunk.

## Consequences

- **Positive:** On mobile, compared with option A, the search box is ready 0.23 s sooner, the typical search page 0.55 s sooner, the rich page 0.61 s sooner and the commerce page 0.56 s sooner. The typical search page fetches 76 files instead of 162, and 180.6 KB gzipped instead of 209.4 KB.
- **Negative:** Every page downloads the whole shared chunk (194 KB, 47.6 KB gzipped), including modules it never runs. On the search-box page that is 72 KB of decoded code, mostly components that render results and products, such as result sections and placeholders. The page downloads 2.4 KB gzipped more than with option A while fetching 35 fewer files. Typical, rich and commerce pages download 5 to 6 KB of decoded code they never run.
- **Neutral:** Modules run in the same order as before, when the code that imports them runs; only the file that delivers them changes. The seven modules that main already duplicates stay duplicated: six utilities copied into `index.esm.js`, and the loader in both `atomic.esm.js` and `index.js`. The shared chunk's file name changes with nearly every release, which costs nothing, because every release has its own CDN path.

## Implementation and Follow-up

The `shared` cache group in `rsbuild.cdn.mjs` implements the decision. It sits next to the `dayjsLocales` group from #8681.

The build was verified as follows:

- Every chunk is a plain map of module factories, so loading one runs nothing. The exceptions are five wrappers that import Headless and Bueno, which are unchanged.
- Every module that a lazily loaded component requires is in a file its import loads. This holds for all 206 components, and for the 145 dynamic imports inside them (dayjs locales, the query-error illustrations and a Stencil runtime import), from every component that can trigger them.
- All 206 components register, with the same console output as on main.
- The CDN smoke tests and CI's CDN checks pass.
- A custom component that uses `initializeBindings` works.
- Dates render the same in 10 languages, and after switching language at runtime.

Revisit after adding many components or upgrading rsbuild or rspack:

- Check that `index.esm.js` still imports only its two small chunks.
- Measure N = 10 against its neighbors again.
