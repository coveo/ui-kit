---
status: Proposed
date: 2026-11-26
related:
  - https://coveord.atlassian.net/browse/KIT-6715
  - https://coveord.atlassian.net/browse/KIT-6287
  - https://github.com/coveo/ui-kit/pull/9043
  - https://github.com/coveo/ui-kit/pull/9099
  - https://github.com/coveo/ui-kit/pull/9093
  - https://github.com/coveo/ui-kit/pull/7416
  - https://github.com/coveo/ui-kit/issues/9040
  - packages/atomic/docs/adr/0001-group-shared-modules-in-one-cdn-chunk.md
  - packages/atomic/docs/adr/0003-build-the-cdn-loader-entries-as-single-files.md
---

# Export the CDN loader from `index.esm.js`

## Context and Problem Statement

Atomic's CDN build has three entry files, and each kind of page loads a different set:

| Entry file      | What it does                                          | Who loads it                                                          |
| --------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| `atomic.esm.js` | Starts the loader itself.                             | Script-tag pages, which are the documented default, and hosted pages. |
| `index.js`      | The loader, `defineCustomElements()`.                 | Pages that start the loader from their own code.                      |
| `index.esm.js`  | The main entry: helpers such as `initializeBindings`. | Custom components, on pages that already load `atomic.esm.js`.        |

Projects that install Atomic from npm load none of these files.

KIT-6287 asks that v4 merge `index.js` into `index.esm.js`, "so `defineCustomElements` is exported from the main entrypoint". KIT-6715 prepares this in v3: export the loader from `index.esm.js`.

Two things made the earlier versions of #9043 slow:

- **Bundling the loader pulled in the shared chunk.** The first version loaded 63.9 kB gzipped at startup instead of 2.6 kB, because the loader's code brought ADR 0001's shared chunk with it.
- **`index.esm.js` imported Headless** (187 kB gzipped) for one helper, `bindLogDocumentOpenOnResult`. A browser runs a module only once every file it imports statically has arrived. A script that took the loader from `index.esm.js` could therefore call it only after Headless. The second version fetched `index.js` on the first call, and a page that only calls the loader was about 500 ms slower on mobile than through `index.js`. So `index.js` had to stay the entry to recommend.

The decision is how the CDN main entry exposes the loader so that it is a usable way to get it, and so that v4 can retire `index.js` as a public address.

## Decision Drivers

- A script gets the loader from `index.esm.js` as fast as it gets it from `index.js` today. Otherwise the main entry is the slow way to get the loader, and `index.js` has to stay.
- No kind of page that exists today gets slower than it is today.
- `index.esm.js` never bundles component code or the shared chunk. When it bundled component code, in Atomic 3.54 and 3.55, pages that used it next to `atomic.esm.js` registered tags twice and stopped initializing (#7416).
- A page never registers a component twice, and both files give the same loader.
- The npm entry points don't change in v3.

## Considered Options

Every option builds on #9093 and on the single-file loader entries of [ADR 0003](./0003-build-the-cdn-loader-entries-as-single-files.md). In options A to C, `index.esm.js` no longer imports Headless: the helper that needs it loads it when it is called. The Measurements section has the numbers and the method.

### Option A: Bundle the loader into `index.esm.js`

- **Summary:** `index.esm.js` contains its own copy of the loader and of the tag map. The shared chunk only takes modules from lazily loaded chunks, which keeps it out of the entry. v4 could then delete `index.js`.
- **Pros:** One file, as KIT-6287 is worded.
- **Cons:** Until `index.js` is deleted, the CDN ships the loader twice. A page that uses both files downloads both copies and gets two different `defineCustomElements` functions. The loader starts no sooner than in option C, because `index.esm.js` waits for its own chunks either way. It changes the shared chunk's rule for every page.

### Option B: Fetch `index.js` on the first call

- **Summary:** `defineCustomElements` in `index.esm.js` runs `import('./index.js')` when it is first called. This was the previous version of #9043, here without the Headless import.
- **Pros:** `index.esm.js` loads 2.9 kB at startup, and a page that only imports helpers never downloads the loader.
- **Cons:** A module that imports the loader from `index.esm.js` and also imports Headless waits for Headless on its own account, and only then fetches the loader: 182 ms slower on mobile than the same module with `index.js`. The two files export different functions under the same names.

### Option C: Import `index.js` statically

- **Summary:** `index.esm.js` re-exports the loader from the CDN's `index.js`. The build leaves that import to the browser instead of bundling a copy.
- **Pros:** A script gets the loader from `index.esm.js` as fast as from `index.js` today, whatever else it imports. Both files export the same functions. `index.esm.js` imports the copy of `index.js` in its own release folder, so v4 can remove the public address.
- **Cons:** A page that imports a helper downloads `index.js`, 10.3 kB gzipped, even when it never calls the loader. On a script-tag page, that is a second copy of the tag map.

### Option D: Don't export the loader from `index.esm.js`

- **Summary:** Leave `index.esm.js` as it is.
- **Pros:** No change and no cost.
- **Cons:** In v4 the npm main entry exports `defineCustomElements` (KIT-6287). The CDN main entry would not, so the same import would fail wherever `@coveo/atomic` resolves to the CDN, for example through an import map. `index.js` would stay a public address.

### Measurements

Median of 7 loads in ms, on Lighthouse's mobile profile and then on a fast connection. Each column is the build of one pull request: #9093, then #9099 (ADR 0003) on top of it, then #9043 (option C) on top of both.

| Kind of page                                                            | #9093                          | With ADR 0003         | With option C |
| ----------------------------------------------------------------------- | ------------------------------ | --------------------- | ------------- |
| Script tag only, page ready                                             | 3,706 / 824                    | 3,541 / 778           | 3,562 / 777   |
| Script tag and a custom component, first result                         | 3,671 / 814                    | 3,563 / 776           | 3,604 / 779   |
| The same page, custom component defined                                 | 2,211 / 502                    | 2,086 / 456           | 1,025 / 263   |
| Script with a helper and Headless, loader from `index.js`, first result | 3,765 / 851                    | 3,751 / 834           | 3,751 / 850   |
| The same script, loader from `index.esm.js`                             | Not exported                   | Not exported          | 3,750 / 844   |
| Script that only calls the loader, from `index.js`, page ready          | 3,864 / 872                    | 3,703 / 823           | 3,707 / 821   |
| The same script, from `index.esm.js`                                    | Not exported                   | Not exported          | 3,865 / 866   |
| `index.esm.js` startup files, gzipped                                   | 2.5 kB, then Headless (187 kB) | 2.5 kB, then Headless | 13.0 kB       |

- **Pages with a custom component.** The first result comes 67 ms sooner than with #9093 on mobile, and 41 ms later than with ADR 0003 alone. `index.esm.js` used to ask for Headless as soon as the browser read its imports. Now the first component file asks for it, 64 ms later. The custom component itself is defined about 1.1 s sooner, because the helpers no longer wait for Headless.
- **The loader through `index.esm.js`** is as fast as through `index.js` with #9093 (+1 ms), and one request slower than through `index.js` with ADR 0003 (+162 ms). A script that also imports Headless is as fast through either file, because it waits for its own Headless import.
- **Script tag only.** The page loads the same files with and without option C. Its 21 ms difference shows this run's noise.

Option C in this table was built without the early Headless request described under "Live pages". On this harness that request changes nothing, because Atomic's components ask for Headless before `index.esm.js` runs, and earlier runs of the design with it gave the same results within noise.

Options B and C were compared in an earlier run, on prototypes with single-file entries. Change against #9093, mobile then fast:

| Kind of page                                                  | B              | C         |
| ------------------------------------------------------------- | -------------- | --------- |
| Script tag and a custom component                             | −82 / −42      | −74 / −28 |
| Script with a helper and Headless, loader from `index.esm.js` | **+182 / +57** | +10 / +15 |
| Script that only calls the loader, from `index.esm.js`        | +3 / −9        | +52 / −3  |
| `index.esm.js` startup files, gzipped                         | 2.9 kB         | 13.2 kB   |

Option A was measured before ADR 0003, next to an equivalent of option C. On mobile it was 38 ms slower than that equivalent on the page with a custom component, and 16 ms slower for a script that only calls the loader. A script with a helper and Headless that kept `index.js` downloaded the loader twice and was 40 ms slower than with #9093. `index.esm.js` loaded 14.8 kB at startup. Option A wasn't measured again on top of ADR 0003.

Method: ADR 0001's harness, with a local HTTP/2 server, gzip, production's pointer files, recorded API answers and an empty cache for every load. The builds were interleaved over 7 rounds. Mobile is Lighthouse's throttling: 150 ms latency, 1.6 Mbps and a 4× slower CPU. The fast connection is 40 ms and 10 Mbps. A "script with a helper and Headless" imports the loader, a helper and Headless in one module.

**Live pages.** The harness loads little besides Atomic, so the builds were also loaded into docs.coveo.com's search page, swapping only Atomic's CDN files and blocking analytics requests. A one-line module that imports `initializeBindings` from `index.esm.js`, placed right after Atomic's script tag, stands in for a custom component. Mobile, median of 7 loads, in ms:

| Live search page with a custom component | #9093  | ADR 0003 | Option C without the early request | Option C |
| ---------------------------------------- | ------ | -------- | ---------------------------------- | -------- |
| The custom component's helpers run       | 7,963  | 7,849    | 4,385                              | 4,418    |
| Atomic's Headless requested              | 3,661  | 3,622    | 5,512                              | 4,419    |
| Search interface defined                 | 8,597  | 8,597    | 9,036                              | 8,706    |
| Search box ready                         | 9,319  | 9,154    | 9,746                              | 9,294    |
| First result                             | 12,252 | 12,296   | 12,560                             | 12,387   |
| First paint                              | 3,228  | 3,156    | 3,216                              | 3,208    |

- On this page, Atomic's components ask for Headless about a second after `index.esm.js` runs: the main thread is busy, and the loader walks the page's result templates before it loads the interface. The helpers' static import used to start that download early as a side effect. Without it, the interface was defined 439 ms later. Requesting Headless as soon as `index.esm.js` runs, without waiting for it, brings the interface back within noise.
- First paint and largest paint stayed within noise on this page, on the same page without a custom component, and on an article: two builds that load the same files differed by up to 372 ms.
- On the fast profile, no version of option C was slower than ADR 0003 alone.

What these measurements don't show:

- They come from one machine. The live page adds the network's own variation, and option C's final version was measured there with an earlier build of the same design.
- No CDN traffic data was available, so the number of pages that import `index.js` by hand is unknown. No documentation page or sample does.
- The npm sample apps weren't rebuilt. The npm entry points and the files they import are unchanged.

## Decision Outcome

Chosen option: C, on top of #9093 and ADR 0003. `index.esm.js` re-exports the loader from `index.js` and no longer imports Headless; it requests Headless as soon as it runs, without waiting for it.

### Rationale

- **C is the only option where the main entry is a full replacement for `index.js`.** A script that calls the loader is as fast through `index.esm.js` as through `index.js` today, whether it also imports Headless (−15 against −14 ms) or not (+1 ms). That is what lets v4 retire the `index.js` address.
- **B slows scripts that also import Headless.** With B, a script that imports the loader, a helper and Headless waits for Headless, and only then fetches the loader: 182 ms slower on mobile. B's smaller start doesn't show in the timings: its page with a custom component was 8 ms faster than C's, which is noise.
- **A buys nothing measurable.** A bundled loader starts no sooner than an imported one. Until `index.js` is deleted, pages that use both files download the loader twice.
- **Loading Headless on demand is what makes the main entry usable for the loader.** While `index.esm.js` imported Headless, a script could call the loader from it only after 187 kB had arrived. That import also started Headless early for Atomic's own components. On a live page with a custom component, losing it delayed Atomic's interface by 439 ms on mobile, so `index.esm.js` now requests Headless as soon as it runs, without waiting for it.
- **Importing `index.js` itself, not a new internal file,** costs pages that already import `index.js` nothing. Both files give the same module, so a page that calls the loader through one, the other or both runs it once.
- **D is free, but it leaves the two main entries different in v4.**

## Consequences

- **Positive:**
  - The CDN main entry exports `defineCustomElements` in v3, and it is `index.js`'s own function.
  - No measured page, on the harness or on the live page, is slower than with #9093 beyond noise. A script gets the loader from `index.esm.js` as fast as from `index.js` today.
  - Custom components that import helpers are defined about 1.1 s sooner on mobile on the harness, and about 3.4 s sooner on the live search page.
  - v4 can retire `index.js` as a public address without touching `index.esm.js`.
- **Negative:**
  - A page that imports a helper downloads `index.js` without calling it: `index.esm.js` loads 13.0 kB at startup instead of 2.5 kB. Its first result comes 41 ms later on mobile than with ADR 0003 alone.
  - Through `index.esm.js`, the loader starts one request later than through `index.js`: 162 ms on mobile for a script that does nothing else. No known page does only that.
  - The CDN has its own `bindLogDocumentOpenOnResult`. Its event wiring must be kept in step with the npm helper's, and an event that fires before Headless has loaded is handled once it has.
  - `index.esm.js` imports `./index.js` by name. The two files ship together, and `index.js` can't be renamed or removed alone.
- **Neutral:**
  - The npm entry points don't change. The npm package gains the two CDN-only modules, which no entry point imports, as it already has `cdn.js`.
  - ui-kit-cd's pointer files don't change.
  - `atomic.esm.js` and `index.js` are the same as with ADR 0003, module ids aside.

## Implementation and Follow-up

- **Source.** `src/cdn-index-esm.ts` is the CDN-only source of `index.esm.js`. It re-exports `src/index.ts`, then the five loader exports from `./loader.js`. An `externals` rule in `rsbuild.cdn.mjs` turns that one import into an import of the CDN's `./index.js`, which the browser resolves next to `index.esm.js`. The re-export can't live in `src/index.ts`, where a customer's bundler would resolve it and bundle every component.
- **Headless on demand.** `src/cdn-bind-log-document-open-on-result.ts` replaces the npm helper in the CDN entry only.
  - It attaches its listeners at once and forwards each event to Headless's interactive result once Headless has loaded, so no event is lost. A page that has an engine to pass in has already loaded Headless.
  - It repeats the npm helper's twenty lines of event wiring, so that the npm helper and what bundlers make of it stay as they are.
  - `externalsType: 'module-import'` keeps its `import()` of Headless a dynamic import in the build.
  - `index.esm.js` starts the Headless download as soon as it runs, without waiting for it. Atomic's components need Headless too, and on a busy live page they ask for it later.
- **Tests.**
  - A CDN test checks that `index.esm.js` exports `index.js`'s own `defineCustomElements`, and another that it exports everything `index.js` exports.
  - A budget test checks `index.esm.js`'s startup files: `index.js` and two small chunks, no shared chunk, no import of Headless, and at most 16 kB gzipped.
  - The two-loader test loads the script tag plus a loader call through each file, in both orders, and loader calls through both files. It fails if a tag is defined twice.
  - Another CDN test checks that loading `index.esm.js` alone requests Headless.
  - Unit tests cover the CDN helper, including an event that fires before Headless has loaded.
- **v3 follow-up.** Once this export is live on the CDN: deprecate `index.js` as a public address, and move the tools in this repository that map `@coveo/atomic/loader` to the CDN `index.js` over to `index.esm.js`. The notice can't be a console warning inside `index.js`, because `index.esm.js` imports that file.
- **v4.**
  - The `index.js` pointer file is removed, and the file stays in each release folder for `index.esm.js`. Customers get one entry point; the build still produces two files.
  - The npm main entry re-exports `defineCustomElements` (KIT-6287). Its cost for apps built with esbuild is tracked in #9040 and is outside this decision.
  - The CDN `index.esm.js` keeps its CDN-only source. Built from `src/index.ts`, it would bundle the loader.
- **Review this decision if** the budget test fails, or if `index.js` grows enough that pages which only import helpers pay for it in their first result.
