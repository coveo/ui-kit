# KIT-6490: JavaScript compile target for v4

**Status:** spike findings behind the proposed [ADR 0008](docs/adr/0008-javascript-compile-target.md). The build configuration changes in this PR are a prototype for measuring, not a change to merge.

**Evidence:** builds compared with `main` at `593ab276f`. The scripts and raw results are in [`spike/KIT-6490`](spike/KIT-6490/), and the full per-bundle tables are in [`spike/KIT-6490/results/tables.md`](spike/KIT-6490/results/tables.md). Browser release dates and API support come from MDN browser-compat-data 8.1.10.

Browser support isn't defined by ui-kit: it follows Coveo's [Browser Conformity](https://coveord.atlassian.net/wiki/spaces/DATA/pages/4489085043/Browser+Conformity) policy. These findings only check that v4's output fits it.

## Which ES target do the v4 bundles use?

**ES2022** for Headless and Atomic, as [ADR 0008](docs/adr/0008-javascript-compile-target.md) proposes.

| Output                              | Today                        | ES2022 prototype                   |
| ----------------------------------- | ---------------------------- | ---------------------------------- |
| Headless CDN, CommonJS and Quantic  | esbuild `es2020`             | esbuild `es2022`                   |
| Headless npm ESM (`dist/esm`)       | `tsc`, already ES2022        | unchanged                          |
| Atomic npm (`dist/esm`, `dist/cjs`) | `rslib` `es2021`, tsc ES2021 | `rslib` `es2022`, tsc ES2022       |
| Atomic CDN                          | Rsbuild default browser list | unchanged: it already emits ES2022 |

ES2023, ES2024 and esnext produce Headless bundles that are byte-identical to ES2022, so a newer target brings nothing measurable today.

The wrappers (`@coveo/atomic-react`, `@coveo/atomic-angular`, `@coveo/headless-react`) already target ES2022.

## Do the chosen target and the APIs v4 relies on fit the Browser Conformity policy at the v4 release?

**Yes.** The policy covers each browser's latest release, plus older versions until one year after their release. Chrome also includes extended stable, and Firefox also includes ESR. Every API below shipped years before the start of that one-year window, both today and at any v4 release date. No v4 GA date is set in Jira yet. No release gate is needed.

- **ES2022 syntax:** the last of it to ship everywhere was class static blocks, in Safari in March 2023. Class fields, private methods and `#x in obj` shipped in every engine by September 2022.
- **Newest built-in in use:** `Promise.withResolvers`, which ES2022 doesn't polyfill. Atomic v3 already calls it in all five interface components on `main` (for example `packages/atomic/src/components/search/atomic-search-interface/atomic-search-interface.ts:293`). It shipped in:
  - Chrome on 2023-10-31 and Edge on 2023-11-02
  - Firefox on 2023-12-19
  - Safari, desktop and iOS, on 2024-03-05
- **Other built-ins** in Headless and Atomic, such as `.at()`, `Object.hasOwn` and `findLast`, are older.

To keep fitting, nothing new should require a browser released inside the policy's one-year window. That covers v4 code and dependencies. For example, top-level await isn't used today, and Safari only supports it fully since September 2026.

## Do the three ponyfills and `abortcontroller-polyfill` go?

**No, not while Quantic supports Lightning Locker.**

- **Where they are:** the `Headers`, `globalThis` and abortable-fetch shims, plus `navigator.sendbeacon`, are injected only into the Quantic UMD bundle (`dist/quantic/**`). The CDN and npm bundles don't contain them.
- **Why they exist:** each one was added because Salesforce Lightning Locker lacks that API. Quantic still supports Locker.
- **The dependencies stay too:** the shims need `abortcontroller-polyfill` and `headers-polyfill` as long as the shims exist.
- **`navigator.sendbeacon`** can go if Quantic agrees: Relay now sends events with `fetch` and `keepalive`.
- **What removal would save:** dropping all four saves about 5.9 to 6.4 kB gzip per Quantic bundle. That's the only sizable gain the spike measured, and it depends on Quantic dropping Locker, not on the target.

## What is the TypeScript floor?

**Recommended: `typescript >=5.9.0`, as an input to KIT-6127, which decides it.**

- **What the published types need:** Atomic's declarations use `export type *` (TypeScript 5.0). Headless's dependency declarations need 5.4 (Redux Toolkit).
- **Why 5.9:** the Angular majors v4 is expected to support require TypeScript 5.9.
- **Not validated yet:** type-checking the emitted declarations with `skipLibCheck: false` showed separate problems, a `lib.dom` conflict and a CommonJS/ESM import issue. A packed-consumer type-check at 5.9 with `skipLibCheck: false` must pass before the floor is published.

## What are the measured size and performance gains?

Negligible. Sizes are in kB, gzip at level 9.

| Output                                              | Baseline gzip | ES2022 change       |
| --------------------------------------------------- | ------------: | ------------------- |
| Headless CDN entries (ESM and UMD), 18 bundles      | 141.7 – 187.2 | −0.19 to −0.31 each |
| Headless CommonJS entries, 9 bundles                |  69.2 – 134.5 | −0.18 to −0.24 each |
| Headless Quantic entries, 5 bundles                 | 148.7 – 193.1 | −0.17 to −0.27 each |
| Headless npm ESM, all files                         |         544.9 | 0 (already ES2022)  |
| Atomic CDN, all JavaScript                          |         657.0 | 0                   |
| Atomic npm ESM, all JavaScript                      |         625.8 | −0.96 in total      |
| Atomic npm CommonJS, all JavaScript                 |         872.0 | −0.88 in total      |
| Atomic size-limit, loader with all lazy components  | 617.93 brotli | 617.10 (−0.83)      |
| Headless Quantic, all four shims removed (separate) | 148.7 – 193.1 | −5.86 to −6.35 each |

- **Performance:** V8 compile time of the Headless search UMD bundle stays at a median of 6.32 ms before and 6.35 ms after, over 60 runs (`spike/KIT-6490/parse-bench.mjs`).
- **Tests:** the Headless and Atomic unit tests pass on the ES2022 prototype. Headless ran 456 files and 5,815 tests. Atomic ran 7,275 tests with 81 skipped.

## Other findings

- **Node.js floor (input to KIT-6387):**
  - Recommendation: `^22.12.0 || ^24.11.0 || ^26.0.0`.
  - Node 20 reached end of life in April 2026.
  - Node 22.12 is the first Node 22 release with unflagged `require(esm)`. Consider 22.13, because 22.12 still prints an experimental warning.
  - If Headless keeps CommonJS output, its esbuild target can follow the Node floor (`node22.12`).
- **`require('@coveo/headless')` is broken today:**
  - Published Headless 3.59.0 fails on Node 20.19, 22.14 and 24 with `StringValue is not a constructor`.
  - The cause: `@coveo/bueno` declares `"type": "module"`, but its `require` entry, `dist/bueno.js`, is CommonJS. Node loads it as ESM, so it exports nothing.
  - It's unrelated to the compile target and needs its own fix.
- **Out of scope here, unchanged:** `coveo-analytics`, `atomic-legacy`, Quantic, the samples and the create-* templates have their own builds.

## Draft v4 story

**Title:** `[Headless][Atomic] v4: compile to ES2022`

**User story:** As a ui-kit maintainer, I want Headless and Atomic to compile to ES2022, like their wrappers, so that every v4 package emits the same JavaScript target.

**Acceptance criteria:**

1. Headless's esbuild bundles (CDN, CommonJS, Quantic) and Atomic's `rslib` output and `tsconfig` target ES2022.
2. The wrappers (`@coveo/atomic-react`, `@coveo/atomic-angular`, `@coveo/headless-react`) are audited, and any package that keeps another target is listed with the reason.
3. The Quantic UMD bundle keeps its Lightning Locker shims and their dependencies.
4. The TypeScript and Node.js floors follow the decisions of KIT-6127 and KIT-6387.
5. The release notes and the v3 to v4 upgrade guide state the target change.

**Migration note:**

- **Syntax:** Headless and Atomic v4 ship ES2022 syntax. Toolchains that parse or re-bundle them must accept ES2022, as they already must for the wrappers and for Headless's npm ESM output.
- **TypeScript and Node.js:** the minimum versions change as KIT-6127 and KIT-6387 decide.
- **Browsers:** browser support follows Coveo's [Browser Conformity](https://coveord.atlassian.net/wiki/spaces/DATA/pages/4489085043/Browser+Conformity) policy.
