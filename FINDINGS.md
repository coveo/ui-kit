# KIT-6672 spike: move SSR out of headless into its own package

<!-- cspell:ignore definitons jscodeshift -->

Spike: [KIT-6672](https://coveord.atlassian.net/browse/KIT-6672). Prototype branch: `KIT-6672-headless-ssr-package`, built on main @ `987a91c03`. The prototype is not meant to merge. The scripts and the full per-symbol analysis are in [`spike/KIT-6672/`](spike/KIT-6672/README.md).

## Recommendation

**Go: make `@coveo/headless-ssr` the v4 SSR package, under three conditions.** The prototype shows the move works:

- The `-next` SSR code depends on `@coveo/headless` only through its public entries plus one internal entry, with no deep imports.
- No headless module or state is duplicated in a single-install app.
- The three entries that were moved keep identical exports. Customers on those entries only rename their imports, and a codemod can do it.
- The sample's e2e suite passes against the built package.

Conditions:

1. **Land after the KIT-6384 stack merges.**
   - All 10 open KIT-6384 PRs touch the moved files: 3 to 114 files each, and 49 files they add sit under the moved folders.
   - A trial merge of #8889 onto the prototype gives 3 conflicts. A trial merge of #8946, which sits on top of other stacked PRs, gives 32.
   - Land the move as one mechanical PR on main, on the experimental track, before the v4 freeze. See [When to land](#when-to-land).
2. **Shrink the internal entry first.** The prototype needs 69 internal symbols, because it changes no code. The per-symbol analysis (not prototyped) brings that down to **4** if the API decisions below go through, or **7** if three re-exported types stay.
   - Swap internal imports for public loaders.
   - Copy small pure helpers into the SSR package.
   - Make 7 commerce types public.
   - Move both serializers into the SSR package.
   - Fold the facet-generator state into a single internal function.
   - See [What SSR imports from headless](#what-ssr-imports-from-headless).
3. **Make headless tree-shakable through its barrels (`sideEffects`).** Importing from the `@coveo/headless` and `@coveo/headless/commerce` barrels instead of deep files costs about **+9 kB gzip**, because headless declares no `sideEffects`. With `"sideEffects": false` on headless, the move costs between −0.07 and +0.75 kB gzip against main with the same flag, so it's size-neutral. The flag needs an audit of headless's module-level side effects first. See [Bundle size](#bundle-size).

**Why go:**

- `@coveo/headless-react` contains only SSR code. One package, `@coveo/headless-ssr` with `/react` subpaths, replaces the SSR halves of two packages, and `@coveo/headless-react` can retire after v4.
- Headless loses 135 source files (106 without tests), and 6 SSR-only build outputs: 2 CJS bundles of about 0.75 MB each and 4 CDN bundles of about 0.7 MB each.

**What it costs:**

- SSR customers change their imports on top of the v4 API change. The current v4 upgrade guides publish the next API under the **same paths** (`@coveo/headless/ssr`), so imports keep resolving. With the move they become `@coveo/headless-ssr`.
- An internal entry ties `@coveo/headless-ssr` to one exact `@coveo/headless` version.
- The docs and release tooling need work (listed below).
- The landing has to be sequenced after the KIT-6384 stack.

**What would make it a no-go:**

- Alex values the guides' "your imports still resolve" more than one SSR package.
- The internal entry can't get down to the 4 to 7 symbols above.
- The team can't take on a new package's docs and release pipeline before the v4 freeze.

**Alternatives** if the import rename is the blocker:

- Keep SSR in headless (option C).
- Publish a facade package (option D).

Both are covered under [Package shape and name](#package-shape-and-name).

## What the prototype does

|                    | Before (main)                                                                     | Prototype                                                         |
| ------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Search SSR         | `@coveo/headless/ssr-next`                                                        | `@coveo/headless-ssr`                                             |
| Commerce SSR       | `@coveo/headless/ssr-commerce-next`                                               | `@coveo/headless-ssr/commerce`                                    |
| React commerce SSR | `@coveo/headless-react/ssr-commerce-next`                                         | `@coveo/headless-ssr/react/commerce`                              |
| React search SSR   | `@coveo/headless-react/ssr-next`, which re-exports the **legacy** API (see below) | `@coveo/headless-ssr/react`, a placeholder that is not equivalent |
| Internal entry     | none                                                                              | `@coveo/headless/ssr-internal` (ESM and types only, `@internal`)  |

- **What moved, with `git mv`:**
  - `packages/headless/src/ssr-next/**` (135 files, plus the two entry files) went to `packages/headless-ssr/src/`.
  - `packages/headless-react/src/ssr-commerce-next/**` went to `packages/headless-ssr/src/react/commerce/`.
  - `mock-ssr-controller-definitions.ts`, used only by SSR, moved too.
  - `utils.ts`, `client-utils.ts` and `errors.ts`, which headless-react shares with its legacy code, were **copied**.
- **How imports were rewritten** (`spike/KIT-6672/rewrite-imports.mjs`): a script using the TypeScript checker rewrote them per symbol.
  - 501 symbols now come from `@coveo/headless` and 258 from `@coveo/headless/commerce`. Each one is the same declaration as before, matched by symbol identity, not by name.
  - The rest come from `@coveo/headless/ssr-internal`.
  - Each `export * from '<internal module>'` became named exports.
- **The export surface didn't change for the three entries that were moved.** A checker-based comparison of the built entries (`api-parity.mjs`) gives identical names and value/type kinds:

| Old entry                                 | Exports | New entry                            | Exports |
| ----------------------------------------- | ------: | ------------------------------------ | ------: |
| `@coveo/headless/ssr-next`                |     568 | `@coveo/headless-ssr`                |     568 |
| `@coveo/headless/ssr-commerce-next`       |     362 | `@coveo/headless-ssr/commerce`       |     362 |
| `@coveo/headless-react/ssr-commerce-next` |     367 | `@coveo/headless-ssr/react/commerce` |     367 |

- **`@coveo/headless-react/ssr-next` is a different case.** The prototype deletes it, and `@coveo/headless-ssr/react` doesn't replace it (see below).
- **Build:** the package builds with `tsc` and ships ESM only, like headless-react. `@coveo/headless` stays external (a dependency) and is never bundled.

**Checks:**

| Check                                                                                                   | Result                                                                                                               |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `pnpm turbo build --filter=@coveo/headless --filter=@coveo/headless-ssr --filter=@coveo/headless-react` | passes                                                                                                               |
| `pnpm --filter @coveo/headless-ssr test`                                                                | 32 files, 291 tests (the same 29 test files and 3 type-test files as before the move), no type errors                |
| `pnpm --filter @coveo/headless test`                                                                    | 408 files, 5409 tests                                                                                                |
| `pnpm --filter @coveo/headless-react test`                                                              | 6 files, 55 tests                                                                                                    |
| `pnpm turbo build --filter=@samples/headless-ssr-commerce-nextjs-v4`                                    | passes against `@coveo/headless-ssr/react/commerce`                                                                  |
| The sample's Playwright e2e suite (production server, real platform)                                    | **29 of 29 pass** (listing, search, facets, cart). This exercises SSR fetch and hydration through the built package. |
| `pnpm --filter @coveo/headless-ssr size`                                                                | 2.7 kB search, 4.7 kB commerce, 5.5 kB React commerce (gzip, `@coveo/headless` ignored)                              |
| knip on the four workspaces                                                                             | clean, except a `reselect` configuration hint on headless that isn't caused by this change                           |
| oxlint and oxfmt                                                                                        | clean                                                                                                                |

**Two things on main didn't match the plan:**

- **`@coveo/headless-react/ssr-next` (search) isn't next code.** It re-exports the legacy `@coveo/headless/ssr` and the legacy React `defineSearchEngine`. The React wrapper of the next search API lands with the open PR #8890 (`ssr-next/search-engine.tsx`, `ssr-common/`). The prototype's `./react` is a placeholder that re-exports `@coveo/headless-ssr` and `MissingEngineProviderError`. Its `defineSearchEngine` is the non-React one, so it is **not** a replacement for the old entry. After #8890 merges, its files move to `src/react/` the same way the commerce files did.
- **`samples/headless-ssr/search-nextjs` uses the legacy API** (19 imports from `@coveo/headless/ssr`). Under the v4 rules, samples without the `-v4` suffix stay on v3, so the prototype proves the build and the runtime with `commerce-nextjs-v4`, the only sample that uses the `-next` entries.

## Answers to the questions

### Can SSR depend on `@coveo/headless` through public or internal exports only, with no deep imports and no duplicated state?

**Yes, as long as the app installs a single copy of `@coveo/headless`.**

- **No deep imports.** The production code imports only `@coveo/headless`, `@coveo/headless/commerce` and `@coveo/headless/ssr-internal`. The React layer imports only the package's own entries. Tests also reach headless's shared mocks through a test-only alias (see [Test mocks](#test-mocks)).
- **ESM: one shared module graph.** Headless's ESM build is per-file `tsc` output. `@coveo/headless`, `/commerce` and `/ssr-internal` resolve into one module graph and share every module instance. Every measured bundle has a single `stateKey` and 0 duplicated headless modules, and the e2e suite passes.
- **CJS (not shipped by the prototype): duplicated modules, but nothing breaks.** Headless's CJS build is one esbuild bundle per entry, so a CJS internal entry would get its own copy of every module it reaches. A 6-agent analysis (a module-state scan, a review of each symbol group, and 2 adversarial verifiers) found that nothing crossing that boundary depends on identity:
  - `stateKey` is `Symbol.for(...)`. That's load-bearing, so keep it and add a test that guards it.
  - Slice reducers register by string key, and the first registration wins.
  - The wait-for-action middlewares match action types with a regex.
  - Selectors read plain state.
  - **Access-token renewal** keeps its state in a closure per engine and compares `error.name`, not `instanceof`.
  - **`navigatorContext`** comes from a provider closure built per request.
  - The real module-level singletons (the RTK Query `answerApi`, the relay LRU selector, the `HistoryStore` singleton, `coveo.analytics` storage) are only used by the engine's bundle.
  - Details: [`spike/KIT-6672/internal-symbols.md`](spike/KIT-6672/internal-symbols.md).
- **The single-copy condition.**
  - The prototype declares `"@coveo/headless": "workspace:*"` as a dependency, as headless-react does today. That publishes as an exact pin.
  - If an app's own `@coveo/headless` resolves to a different version, the package manager nests a second copy under `@coveo/headless-ssr`. The app's `load*Actions` would then come from a different module graph than the SSR engine.
  - headless-react has the same exposure today.
  - The real package should make `@coveo/headless` an exact peer dependency, or document the pin (follow-up 5).
- **Rules for the internal entry.** Its header states:
  - Export only pure functions, slice reducers, selectors, schemas and types.
  - Never thunks, RTK Query APIs, classes checked with `instanceof`, or `Symbol()` keys.
  - Separately, this spike recommends releasing both packages together (a Changesets "fixed" group). That isn't in the header.

### Package shape and name: `@coveo/headless-ssr` with `/react` and `/commerce` subpaths, or separate packages?

**Recommended: option A, one `@coveo/headless-ssr` package with `.`, `./commerce`, `./react` and `./react/commerce`,** with `react`, `react-dom` and `@types/react*` as **optional** peers.

- It mirrors `@coveo/headless`, where `.` is search and `/commerce` is commerce. The codemod can then swap a prefix with no per-name mapping.
- The prototype shows it works: the Next.js sample builds and passes its e2e suite.
- knip needed an `ignoreDependencies` entry for the optional peers, since `react` becomes optional where it's required in headless-react. The type-test entry pattern also moved from headless's knip config to the new package's.

The alternatives are compared under [Package shape and name](#package-shape-and-name).

### Do the legacy `/ssr` and `/ssr-commerce` entries go away in v4, leaving only the `-next` ones to move (KIT-6384)?

**Yes.**

- KIT-6384 is merged as the plan of record.
- Both upgrade guides (`packages/headless/source_docs/upgrade-from-v3-to-v4.md` and `packages/headless-react/source_docs/upgrade-from-v3-to-v4.md`) say v4 removes the v3 API of `/ssr` and `/ssr-commerce`. They publish the API that v3 shipped as a preview (the `-next` entries) under those same paths.
- #8955 (KIT-6389) adds the runtime deprecation warnings.

So only the `-next` code moves, and the legacy code is deleted in v4. The guides currently promise "your imports still resolve". The move breaks that promise, so the guide entries need new before and after blocks (follow-up 8).

### What is the effect on bundle size, peer dependencies (React, Next.js) and docs?

- **Bundle size:** +9 kB gzip as prototyped, all of it from importing through the barrels. With `sideEffects: false` on headless the move is neutral (−0.07 to +0.75 kB). See [Bundle size](#bundle-size).
- **Peer dependencies:**
  - `react` and `react-dom` become optional peers.
  - There's no Next.js dependency anywhere. Neither headless nor headless-react depends on `next`, and the SSR API is framework-agnostic.
  - The new package depends on `@coveo/bueno` at runtime. It needs `@reduxjs/toolkit`, `@coveo/relay` and `coveo.analytics` for types the entries re-export.
  - `pino` and `@coveo/relay-event-types` are only used in tests, so they are devDependencies.
  - Re-exporting those three types through `@coveo/headless` would leave only `@coveo/bueno`.
- **Docs:**
  - The `-next` entries have **no TypeDoc config today**. Headless's and headless-react's TypeDoc only cover the legacy `/ssr` and `/ssr-commerce`.
  - The new package needs a TypeDoc config and its own docs site entry, including `headerNav` and a CD job like `typedoc-headless-react` in `.github/workflows/cd.yml`.
  - `scripts/notify-docs/published-ui-kit.mjs` needs the new package.
  - The SSR guides move to the new package, from `packages/headless-react/source_docs/` and from `packages/headless/source_docs/`: `server-side-rendering.md`, `getting-started-ssr-search.md`, `getting-started-ssr-commerce.md`, `ssr-usage.md`, `ssr-send-context.md`, `ssr-manage-access-tokens.md`, `ssr-implement-search-parameter-support.md` and `ssr-extend-engine-definitons.md`.
  - These name the old paths and need updating: `packages/headless/README.md`, `packages/headless-react/README.md`, `packages/headless-react/CONTRIBUTING.md` and `.github/copilot-instructions.md`.
  - The prototype already updated the module docs of the new entries.

### What does the migration look like for customers, and can a codemod do it?

- For the three moved `-next` entries, and for their v4 successors, it's a pure import rename that a codemod can do. See [Customer migration](#customer-migration) and [Codemod sketch](#codemod-sketch-kit-6538).
- `@coveo/headless-react/ssr-next` isn't a rename until #8890 gives it a real next-API wrapper.
- Code on the legacy v3 API needs the API migration from the guide anyway.

## What SSR imports from headless

`spike/KIT-6672/map-imports.mjs` follows every import and export from `src/ssr-next/**` and the two entry files to the declaring symbol. It then checks whether a public entry exports **the same declaration**.

|                                                                                                  |                                                     Symbols |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------: |
| Distinct headless declarations used by production SSR code, including what the entries re-export |                                                         803 |
| Public in `@coveo/headless` or `@coveo/headless/commerce`                                        |                                                         732 |
| Internal-only (51 values, 20 types)                                                              |                                                          71 |
| In `@coveo/headless/ssr-internal` after the prototype (2 of the 71 were only leaked re-exports)  |                                **69** (50 values, 19 types) |
| Internal symbols that only tests use                                                             | 31 (they go through the test alias, not the internal entry) |

The table below groups the 69 internal symbols and gives the recommendation for each group. Each symbol was read at its use site, and none of the recommendations changes behavior. The per-symbol table, with use sites and reasons, is in [`spike/KIT-6672/internal-symbols.md`](spike/KIT-6672/internal-symbols.md).

| Group                                                                               | Symbols                                                                                                                                                                                                                                                                                                                                                                                                       | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search slice reducers that `defineSearchParameterManager` registers (14)            | `advancedSearchQueriesReducer`, `automaticFacetSetReducer`, `categoryFacetSetReducer`, `configurationReducer`, `dateFacetSetReducer`, `debugReducer`, `facetOptionsReducer`, `facetSetReducer`, `numericFacetSetReducer`, `paginationReducer`, `queryReducer`, `sortCriteriaReducer`, `staticFilterSetReducer`, `tabSetReducer`                                                                               | **Use the public loaders**, such as `loadFacetSetActions(engine)`. They register the same key. The engine already preloads `configuration` and `debug`, so those calls do nothing.                                                                                                                                                                                                                                                                        |
| Commerce slice reducers that the parameter manager and facet generator register (8) | `commerceFacetOrderReducer`, `commerceFacetSetReducer`, `commercePaginationReducer`, `parametersReducer`, `commerceQuerySetReducer`, `commerceQueryReducer`, `sortReducer`, `manualNumericFacetReducer`                                                                                                                                                                                                       | **Use the public loaders, or drop the call.** `buildCommerceEngine` already preloads most of these, and `loadSearchParametersActions` covers `query` and `querySet`.                                                                                                                                                                                                                                                                                      |
| Commerce facet-generator state (16, plus `CoreCommerceFacet`)                       | `getCoreFacetState`, `getCategoryFacetState`, `getNumericFacetState`, `getRegularFacetState`, `getDateFacetState`, the two `facetResponseSelector`s, the two `isFacetLoadingResponseSelector`s, `facetRequestSelector`, `manualNumericFacetSelector`, `categoryFacetSearchStateSelector`, `specificFacetSearchStateSelector`, plus the types `AnyFacetResponse`, `CategoryFacetRequest`, `ManualRangeSection` | **One internal function**, `getFacetGeneratorState(engine, solutionType)`, next to the client-side generator. It replaces all of these, and keeps the SSR and client facet state from drifting apart.                                                                                                                                                                                                                                                     |
| Small pure utilities (12)                                                           | `clone`, `mapObject`, `filterObject`, `createWaitForActionMiddleware`, `createWaitForActionMiddlewareForRecommendation`, `isBrowser`, `loadReducerError`, `nonEmptyString`, `nonRequiredEmptyAllowedString`, `parametersDefinition`, `stateKey`, `contextDefinition`                                                                                                                                          | **Copy into the SSR package.** Each is 1 to 30 lines and holds no mutable state. `stateKey` is `Symbol.for`, so a copy is the same symbol. `contextDefinition` (about 40 lines, which builds a currency list from `Intl` at load) can stay internal to avoid drift.                                                                                                                                                                                       |
| Logger                                                                              | `buildLogger`                                                                                                                                                                                                                                                                                                                                                                                                 | **Internal entry.** Copying it would make `pino` a runtime dependency.                                                                                                                                                                                                                                                                                                                                                                                    |
| Types the SSR entries re-export as customer API (12)                                | `CoreCommerceFacet`, `CorePaginationOptions`, `SummaryState`, `ProductListingParameters`, `CommerceAppState`, `CommerceProductListingParametersState`, `CommerceSearchParametersState`, `SearchBox` (exported as `CoreSearchBox`), `BaseFacetSearchResult`, `NavigatorContextProvider`, `BrowserNavigatorContextProvider`, `LegacySearchAction`                                                               | **Make the first seven public** in `@coveo/headless/commerce`. **Replace** `BaseFacetSearchResult` with the public `RegularFacetSearchResult`. **Drop** `NavigatorContextProvider`, `BrowserNavigatorContextProvider` and `CoreSearchBox`, or keep them internal: they describe options the next API forbids, or duplicate public shapes. Dropping them changes the API, so that's Alex's decision. `LegacySearchAction` is type-only and stays internal. |
| SSR serializers                                                                     | `buildSSRSearchParameterSerializer`, `buildParameterSerializer`                                                                                                                                                                                                                                                                                                                                               | **Move into `@coveo/headless-ssr`.** Both are `*.ssr.ts` files that only the SSR entries export.                                                                                                                                                                                                                                                                                                                                                          |
| `preprocessRequest` types                                                           | `PreprocessRequest`, `PlatformRequestOptions`, `PlatformClientOrigin`, `RequestMetadata`                                                                                                                                                                                                                                                                                                                      | **Derive from public types**, for example `NonNullable<EngineConfiguration['preprocessRequest']>` and its parameters.                                                                                                                                                                                                                                                                                                                                     |

**What stays in the internal entry after the shrink:**

- 4 symbols if the API decisions go through: `getFacetGeneratorState` (new), `buildLogger`, `LegacySearchAction` (a type) and `contextDefinition`.
- 7 if `CoreSearchBox`, `NavigatorContextProvider` and `BrowserNavigatorContextProvider` are kept.

This was analysed, not prototyped.

## Package shape and name

| Option                                                                                                             | Pros                                                                                                                                                                                                    | Cons                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A. `@coveo/headless-ssr` with `.`, `/commerce`, `/react`, `/react/commerce`** (prototyped, recommended)          | One install for SSR, and `@coveo/headless-react` can retire. React is an optional peer, so non-React users install nothing extra. It mirrors headless (`.` is search), so the codemod is a prefix swap. | `.` means "search" implicitly. A release of `/react` also releases the core, and the reverse.                                                                |
| A'. Same package, with `/search` and `/react/search` instead of `.` and `/react`                                   | Symmetric and explicit, and leaves room for other use cases.                                                                                                                                            | One more path segment for the most common case, and it no longer mirrors headless.                                                                           |
| B. Two packages, `@coveo/headless-ssr` and `@coveo/headless-ssr-react` (or keep `@coveo/headless-react` for React) | React peers are exact, not optional. Versions can be independent.                                                                                                                                       | Two packages to install and release. If `@coveo/headless-react` stays, its name no longer says SSR.                                                          |
| C. Keep SSR in headless, and later move the React layer into `@coveo/headless/ssr/react` subpaths                  | No internal entry. The "imports still resolve" promise holds for `@coveo/headless` users.                                                                                                               | It holds for React users only while `@coveo/headless-react` keeps re-exporting. `@coveo/headless` gets React as an optional peer, and SSR stays in the core. |
| D. A facade `@coveo/headless-ssr` that re-exports `@coveo/headless/ssr*`, with the code staying in headless        | No internal entry, and could be a transition step.                                                                                                                                                      | Two import paths for one API, and headless keeps all the code.                                                                                               |

The name `@coveo/headless-ssr` fits headless's naming and the existing `samples/headless-ssr` folder. The prototype package is `"private": true` at version `0.0.0`.

## Build and publish impact

- **Exports:**
  - The new package's `exports` are in place in the prototype.
  - Headless drops its `./ssr-next` and `./ssr-commerce-next` exports, `build.config.json` entries and `esbuild.mjs` global names, and gains `./ssr-internal` (ESM and types only).
  - headless-react drops `./ssr-next` and `./ssr-commerce-next`.
- **CJS and CDN:**
  - Today the `-next` entries ship CJS (`dist/cjs/ssr-next/headless.cjs`, 772 kB) and CDN ESM and UMD bundles. The prototype ships ESM only, like headless-react.
  - With the `engines` range `^20.9.0 || ^22.11.0 || ^24.11.0`, CJS users on Node 20.9 to 20.18 and on 22.11.x can't `require()` ESM. If CJS matters, add per-entry esbuild bundles; the internal-entry rules above keep that safe.
  - `cdn/ssr-next` and `cdn/ssr-commerce-next` disappear. ui-kit-cd's deploy config sources `cdn/`, so check it for those paths.
- **Changesets:**
  - The new package needs a first changeset.
  - Add `@coveo/headless-ssr` to the existing `@coveo/headless` "fixed" group. The internal entry ties the two to one version, and a fixed group gives them the **same version number** (4.x at v4).
  - The `@coveo/headless-react` + `@coveo/ui-kit-sample-headless-ssr-commerce-nextjs` group stays while that legacy sample uses headless-react. Revisit it at GA, when the `-v4` sample takes over the name.
- **Tooling that names the packages or entries** (untouched in the prototype):
  - `utils/ci/changeset-major-guard.mjs` (packages and guides)
  - `.agents/skills/working-on-ui-kit-v4/scripts/check-v4-change.mjs` (`EXPERIMENTAL_ENTRY_POINTS = /ssr-next|ssr-commerce-next/` and `GUIDE_BY_PACKAGE`)
  - `scripts/notify-docs/published-ui-kit.mjs`
  - `.github/workflows/cd.yml` (TypeDoc job)
- **Repo files the prototype changed:** `knip.js`, `.areas/ssr.yml`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, the generated `AGENTS.md` and `catalog-info.yaml`, and a `.size-limit.json` for the new package.
- **KIT-6484 (API-surface diff):** the moved exports show up as removals from `@coveo/headless/ssr*` and `@coveo/headless-react/ssr*`. The diff needs an old-path to new-path mapping, so that it reports one move instead of about 1,300 removals. `api-parity.mjs` can produce it.
- **Samples:**
  - `commerce-nextjs-v4` is switched.
  - `search-nextjs`, `commerce-nextjs`, `commerce-react-router` and `commerce-express` use the legacy API and stay on v3.
  - There is no `search-nextjs-v4` yet; it's needed once #8890 lands.
- **`create-ui`:** the `headless-ssr-commerce-nextjs` template points at the legacy `commerce-nextjs` sample and picks up the new package when the `-v4` sample replaces it at GA. The template labels name the old package (`packages/create-ui/src/templates.ts:112`, `:119`), and `index.test.ts:28` asserts them, so their strings need an update.

### Test mocks

- `mock-ssr-controller-definitions.ts` moved with the code.
- `mock-navigator-context.ts` **stays** in headless: the legacy SSR tests also use it.
- The tests reach 44 headless modules through a test-only alias, `@coveo/headless-src/*`: shared mocks like `mock-engine-v2`, `mock-state` and `mock-commerce-state`, and modules they `vi.mock`.
- Vitest aliases `@coveo/headless`, `/commerce` and `/ssr-internal` to headless's **sources**, so `vi.mock('@coveo/headless-src/app/logger.js')` also replaces the logger behind `@coveo/headless/ssr-internal`. The moved tests ran unchanged.
- The turbo `test` task depends on `^build`, so a change in headless still invalidates the cached headless-ssr tests.

| Option                                                 | Trade-off                                                                                                                                                                         |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Alias to the headless sources** (prototyped)         | No copies, and `vi.mock` works across packages. Tests depend on headless's source layout, and run against headless sources rather than its build. The e2e suite covers the build. |
| Export mocks from a `@coveo/headless/test-utils` entry | A supported surface built from `dist`. `vi.mock` of headless internals stops working, and there's one more entry to maintain.                                                     |
| Copy the mocks                                         | Independent, but the copies drift.                                                                                                                                                |

**Gotcha:** don't put the source mapping in the package's `tsconfig.json`. esbuild, and other bundlers inside the monorepo, apply `paths` from the importing file's nearest tsconfig. `dist/*.js` then resolved `@coveo/headless` to the TypeScript sources, and the bundle grew by 116 kB. The prototype keeps only the `@coveo/headless-src/*` alias in `tsconfig.json`, and the full mapping in `tsconfig.typecheck.json`.

## Bundle size

`spike/KIT-6672/measure.mjs` bundles a small consumer entry with esbuild (browser, ESM, minified, React external), once against main and once against the prototype. Sizes are minified / gzip.

| Scenario                                                                             |             main |        prototype |  Δ gzip | Δ gzip, both with `sideEffects: false` |
| ------------------------------------------------------------------------------------ | ---------------: | ---------------: | ------: | -------------------------------------: |
| search: `defineSearchEngine`, `defineResultList`, `defineSearchBox`                  | 612.3 / 163.6 kB | 650.0 / 172.6 kB | +9.0 kB |                               −0.07 kB |
| commerce: `defineCommerceEngine`, `defineProductList`                                | 649.0 / 171.4 kB | 682.3 / 180.8 kB | +9.3 kB |                               +0.74 kB |
| React commerce: the same, through the React entry                                    | 652.2 / 172.5 kB | 685.5 / 181.9 kB | +9.4 kB |                               +0.69 kB |
| mixed: SSR commerce plus `loadProductListingActions` from `@coveo/headless/commerce` | 649.4 / 171.6 kB | 682.5 / 180.8 kB | +9.2 kB |                               +0.75 kB |
| the whole commerce SSR entry (`export *`)                                            | 674.8 / 178.9 kB | 708.0 / 188.3 kB | +9.4 kB |                               +0.72 kB |
| the whole search SSR entry (`export *`)                                              | 692.9 / 184.8 kB | 730.7 / 194.0 kB | +9.2 kB |                               −0.04 kB |

- **No duplication.** Every bundle has 0 duplicated headless modules and at most one `stateKey`.
- **Why it grows:** the old code imported deep relative modules. The new code imports the `@coveo/headless` and `/commerce` barrels. Headless has no `sideEffects` field, so bundlers keep every barrel module that runs top-level calls (`createAction`, `createSlice`). Most of the extra is search features: `generated-answer`, `follow-up-answers`, `folding`, `history` and facets.
- **With `"sideEffects": false` on headless,** the move is size-neutral: the last column compares main and the prototype, both with the flag. The flag also shrinks main itself, by up to 8 kB gzip.
  - The flag needs an audit first: headless has module-level side effects, for example `dayjs.extend(...)` in `features/configuration/configuration-state.ts`.
  - Under the flag, the search scenarios drop the `state-key` module. That's expected: search's `engine.ts` imports `stateKey` only to type an interface key, and only the commerce engine uses it at runtime.

## Customer migration

For preview users of the `-next` entries:

```ts
// Before
import {defineSearchEngine, defineResultList} from '@coveo/headless/ssr-next';
import {defineCommerceEngine, defineProductList} from '@coveo/headless/ssr-commerce-next';
import {
  defineCommerceEngine,
  buildProviderWithDefinition,
} from '@coveo/headless-react/ssr-commerce-next';

// After
import {defineSearchEngine, defineResultList} from '@coveo/headless-ssr';
import {defineCommerceEngine, defineProductList} from '@coveo/headless-ssr/commerce';
import {
  defineCommerceEngine,
  buildProviderWithDefinition,
} from '@coveo/headless-ssr/react/commerce';
```

```jsonc
// package.json, at v4, with @coveo/headless-ssr in the @coveo/headless "fixed" group
"dependencies": {
  "@coveo/headless": "4.x.y",       // only if the app imports headless directly; same version as @coveo/headless-ssr
  "@coveo/headless-react": "...",   // remove: replaced by @coveo/headless-ssr
  "@coveo/headless-ssr": "4.x.y"
}
```

v3 customers on the legacy `/ssr` API migrate the API anyway (KIT-6384). The rename adds a path change to code that changes regardless.

## Codemod sketch (KIT-6538)

| From                                                                                 | To                                                                                      | When                                                                                                                                               |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@coveo/headless/ssr-next`                                                           | `@coveo/headless-ssr`                                                                   | preview users, whenever the move ships                                                                                                             |
| `@coveo/headless/ssr-commerce-next`                                                  | `@coveo/headless-ssr/commerce`                                                          | same                                                                                                                                               |
| `@coveo/headless-react/ssr-commerce-next`                                            | `@coveo/headless-ssr/react/commerce`                                                    | same                                                                                                                                               |
| `@coveo/headless-react/ssr-next`                                                     | **no rewrite.** It serves the legacy API, which needs the API migration from the guide. | after #8890, map it to `@coveo/headless-ssr/react`                                                                                                 |
| `@coveo/headless/ssr`, `/ssr-commerce`, `@coveo/headless-react/ssr`, `/ssr-commerce` | the four new paths                                                                      | only if a v4.0 ever ships them with the next API. If the move lands before v4.0, they're legacy-only and need the API migration, not this codemod. |

- **Where to rewrite:** the module specifier of `import`, `export ... from`, `export * from`, dynamic `import()`, `require()`, `jest.mock` and `vi.mock`, and TypeScript `import('...')` types.
- **package.json:** add `@coveo/headless-ssr` at the installed `@coveo/headless` version, and remove `@coveo/headless-react` when nothing imports it anymore.
- **Telling v3 from v4:** for the last row, read the installed `@coveo/headless` major from `package.json` or the lockfile.

```ts
// jscodeshift with the tsx parser, sketch only
const MAP = {/* rows 1 to 3 above */};
export default (file, api) => {
  const j = api.jscodeshift.withParser('tsx');
  const root = j(file.source);
  const rename = (lit) => {
    if (MAP[lit.value]) lit.value = MAP[lit.value];
  };
  root.find(j.ImportDeclaration).forEach((p) => rename(p.value.source));
  root
    .find(j.ExportNamedDeclaration)
    .filter((p) => p.value.source)
    .forEach((p) => rename(p.value.source));
  root.find(j.ExportAllDeclaration).forEach((p) => rename(p.value.source));
  root
    .find(j.CallExpression)
    .filter(
      (p) =>
        p.value.arguments[0]?.type === 'StringLiteral' &&
        (p.value.callee.type === 'Import' ||
          /^(require|(vi|jest)\.mock)$/.test(j(p.get('callee')).toSource()))
    )
    .forEach((p) => rename(p.value.arguments[0]));
  root.find(j.TSImportType).forEach((p) => rename(p.value.argument.literal ?? p.value.argument));
  return root.toSource();
};
```

## Overlap with the in-flight KIT-6384 work

File counts come from `gh api --paginate .../pulls/N/files`. "Moved paths" are `packages/headless/src/ssr-next/**`, the two `-next` entry files and `packages/headless-react/src/ssr*-next/**`.

| PR                                                           | State             | Files | Under moved paths | Added under moved paths | Samples |
| ------------------------------------------------------------ | ----------------- | ----: | ----------------: | ----------------------: | ------: |
| #8884 docs: correct the SSR next examples                    | draft, approved   |   133 |                80 |                      11 |      19 |
| #8889 default the commerce view URL to the navigator context | ready, approved   |    16 |                14 |                       2 |       1 |
| #8890 wrap the SSR next search API (React)                   | draft             |   105 |                72 |                      13 |       0 |
| #8891 recommendation slots from any commerce page            | ready, approved   |    48 |                32 |                       0 |      12 |
| #8897 static state from page facts only                      | draft             |   122 |               114 |                       4 |       3 |
| #8898 `enableResults` once on the commerce definition        | draft             |    41 |                36 |                       8 |       2 |
| #8899 name the context hooks after their package             | draft             |    14 |                 8 |                       1 |       3 |
| #8924 search engine options without a type argument          | draft             |    77 |                53 |                       5 |       0 |
| #8946 aliases of the commerce static state                   | ready, approved   |     4 |                 3 |                       0 |       0 |
| #8996 one client ID per visitor, after consent               | draft             |    53 |                36 |                       5 |      11 |
| #8955 (KIT-6389) runtime deprecation warnings                | changes requested |    19 |                 0 |                       0 |       2 |

**Trial merges onto the prototype commit:**

- #8889 (3 commits of its own) gives **3 conflicts**: the entry file and the two files it adds (`view-url.ts` and its test).
- #8946 sits on top of other stacked PRs (13 commits ahead of main) and gives **32 conflicts**. Several are modify/delete conflicts where heavily edited files lost rename detection.

Rebasing the stack over the move would be costly, while the move itself is mechanical. #8890 also adds `packages/headless-react/src/ssr-common/` and a real `ssr-next/` folder, which the move has to pick up.

### When to land

1. Now, on main and outside the moved folders:
   - the internal-entry shrink (public loaders, copied helpers, newly public types)
   - the `sideEffects` audit
2. After the KIT-6384 stack merges: re-run `rewrite-imports.mjs` on the new main and `git mv`, as one PR on the **experimental** track (a minor bump). The `-next` entries change without deprecation under the v4 rules. Preview users get a hard break, described in the changeset and covered by the codemod. Leave `@coveo/headless-react/ssr-next` in place in that PR, because it serves the legacy API.
3. At v4, remove the legacy `/ssr*` entries from headless and headless-react, and retire headless-react.

Until the new package is no longer experimental, the KIT-6389 deprecation warnings should keep naming the v3 replacement, as the v4 rules require, not `@coveo/headless-ssr`.

## Follow-up stories (if go)

1. **[Headless] v3: make SSR's internal imports replaceable:** public loaders instead of reducer imports, `getFacetGeneratorState`, and 7 commerce types made public. This shrinks the internal surface from 69 to 4–7 symbols.
2. **[Headless] v3: audit module side effects and declare `sideEffects`.** This removes the +9 kB barrel cost, and also shrinks today's bundles by up to 8 kB gzip.
3. **[Headless SSR] create `@coveo/headless-ssr` and move the `-next` code** (experimental track, after KIT-6384). It includes:
   - the `./ssr-internal` entry, with a test that guards `stateKey` as `Symbol.for`
   - the Changesets "fixed" group and the first changeset
   - a runtime check: the `-v4` sample e2e suite against the built package
4. **[Headless SSR] move the React layer into `/react` and `/react/commerce`,** including #8890's search wrapper and `ssr-common`.
5. **[Headless SSR] decide how the package declares `@coveo/headless`** (exact peer or exact dependency) and document the single-install requirement.
6. **[Headless SSR] decide the test-mock strategy:** keep the source alias, or add a `test-utils` entry.
7. **[CI] update the release and docs tooling for the new package:**
   - `changeset-major-guard`, `check-v4-change` and `notify-docs`
   - the `cd.yml` TypeDoc job
   - the CJS and CDN decision, and checking ui-kit-cd for `cdn/ssr-next` and `cdn/ssr-commerce-next`
8. **[Docs] TypeDoc and source docs for `@coveo/headless-ssr`.** This moves the SSR guides out of headless and headless-react, updates the READMEs, `CONTRIBUTING.md` and the Copilot instructions, and rewrites the SSR entries of both v4 upgrade guides for the new paths.
9. **[Samples] point the `-v4` samples at `@coveo/headless-ssr`, add `search-nextjs-v4`, and update the `create-ui` template labels.**
10. **[Headless React] v3: deprecate `@coveo/headless-react`; v4: retire it** in favor of `@coveo/headless-ssr/react`.
11. **[Codemod] KIT-6538:** the rename rules above.
12. **[CI] KIT-6484:** map the moved exports to their new package.

## Open questions for Alex

- `./react` (search) is a placeholder until #8890 merges. Keep the subpath, drop it, or wait?
- Package shape: A (recommended) or A' (explicit `/search`)?
- Ship ESM only, or keep CJS (`require()` users on Node 20.9 to 20.18 and 22.11.x)? Keep the CDN bundles?
- Should the SSR entries drop the re-exports the next API doesn't need (`NavigatorContextProvider`, `BrowserNavigatorContextProvider`, `CoreSearchBox`)? That changes the API.
- Is losing the v4 guides' "your imports still resolve" acceptable?
