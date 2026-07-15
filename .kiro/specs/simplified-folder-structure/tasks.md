# Implementation Plan: Simplified Internal Folder Structure (ADR-006)

## Overview

This plan implements the structural refactoring described in ADR-006 for the Thermidor package. The work is organized in dependency-aware waves: directory creation first, then file moves (which can be done in parallel since they target independent directories), then barrel creation, then import rewrites (which depend on all moves and barrels being complete), then tooling gates and documentation, and finally cleanup and verification.

All work targets `packages/thermidor/src/`.

## Task Dependency Graph

```json
{
  "waves": [
    {"id": 0, "tasks": ["1.1"]},
    {"id": 1, "tasks": ["2.1", "3.1", "4.1", "5.1"]},
    {"id": 2, "tasks": ["6.1", "7.1"]},
    {"id": 3, "tasks": ["8.1"]},
    {"id": 4, "tasks": ["9.1"]},
    {"id": 5, "tasks": ["10.1"]},
    {"id": 6, "tasks": ["11.1"]},
    {"id": 7, "tasks": ["12.1", "13.1", "14.1", "15.1"]},
    {"id": 8, "tasks": ["16.1"]},
    {"id": 9, "tasks": ["17.1"]}
  ]
}
```

## Tasks

- [x] 1. Create target directory structure
  - [x] 1.1 Create all target directories
    - Create `src/internal/` with sub-directories: `features/`, `api/`, `engine/`, `utils/`
    - Create `src/internal/api/` sub-directories: `protocol/`, `search/`, `commerce-search/`, `conversation/`, `query-suggest/`, `commerce-query-suggest/`, `generative/`
    - Create `src/internal/features/` sub-directories for all 12 domains: `pagination/`, `facets/`, `result-list/`, `product-list/`, `search-box/`, `cart/`, `configuration/`, `generative/`, `sort/`, `search-parameters/`, `query-correction/`, `triggers/`
    - _Requirements: 1.1, 1.2, 2.1_

- [x] 2. Move all feature modules from core/internal/ to internal/features/
  - [x] 2.1 Move all 12 feature directories to internal/features/
    - Move all files from each of the 12 feature directories in `core/internal/` to their corresponding directory under `internal/features/`. The directories to move are: `pagination/`, `facets/`, `result-list/`, `product-list/`, `search-box/`, `cart/`, `configuration/`, `generative/`, `sort/`, `search-parameters/`, `query-correction/`, `triggers/`
    - For each directory: preserve file names, content, and co-located test files
    - These moves are independent of each other and can be performed in any order or in parallel
    - _Requirements: 2.2, 2.4_

- [x] 3. Move utils module
  - [x] 3.1 Move all utils files to internal/utils/
    - Move all files from `core/interface/utils/` → `internal/utils/` (includes: memoized-state-selector, symbols, interface-types, select-slice, id-generator, get-handle-internals, facade-cache, resolve-facades, and their tests)
    - Move `core/interface/base-controller.ts` → `internal/utils/base-controller.ts`
    - Move `core/interface/base-interface.ts` → `internal/utils/base-interface.ts`
    - Move `core/interface/cache/interface-cache-registry.ts` → `internal/utils/interface-cache-registry.ts`
    - Move `core/interface/navigator-context/navigator-context-types.ts` → `internal/utils/navigator-context-types.ts`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Move engine module
  - [x] 4.1 Move all engine files to internal/engine/
    - Move all files from `core/interface/engine/` → `internal/engine/`
    - Includes: engine.ts, engine-types.ts, engine-configuration.ts, and any co-located tests
    - _Requirements: 5.1, 5.3_

- [x] 5. Merge API sources into internal/api/
  - [x] 5.1 Merge all API files into their domain sub-modules
    - Move transport-layer files (http, stream, sse-parser, buffer, error-handling) to `internal/api/protocol/`
    - Merge search API files into `internal/api/search/` from: `api/interface/search-endpoint/`, `core/internal/api/search/`, `core/interface/api/search/` (if exists). Include: endpoint client, types, thunk, thunk-slice, request-selector, response-handler, facade
    - Merge commerce-search API files into `internal/api/commerce-search/` from relevant source directories. Include: endpoint client, types, thunk, thunk-slice, request-selector, response-handler, facade
    - Merge conversation API files into `internal/api/conversation/`. Include: endpoint client, types, event-stream, request-selector, and tests
    - Merge query-suggest API files into `internal/api/query-suggest/`. Include: thunk, facade
    - Merge commerce-query-suggest API files into `internal/api/commerce-query-suggest/`. Include: thunk, facade
    - Merge generative API files into `internal/api/generative/`. Include: generative-runtime.ts
    - Move `organization-endpoint.ts` to `internal/api/`
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 6. Merge interface files with logic into features
  - [x] 6.1 Merge selectors, hydration, and type files into feature modules
    - Merge `core/interface/facets/facets-selectors.ts` (contains `buildFacetsRequest`) into `internal/features/facets/facets-selectors.ts`. If the target already has a selectors file from task 2, merge the content (combine exports)
    - Merge `core/interface/configuration/configuration-selectors.ts` into `internal/features/configuration/configuration-selectors.ts`
    - Move `core/interface/generative/generative-hydration.ts` and its test to `internal/features/generative/`
    - Consolidate type files from `core/interface/<feature>/` into `internal/features/<feature>/` for pagination, facets, cart, result-list, generative. If a type file already exists in the target from task 2, merge definitions into a single file
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7. Remove indirection files
  - [x] 7.1 Delete all mutator, re-exported selector, and associated test files
    - Delete the 6 mutator files from `core/interface/`: pagination-mutators.ts, facets-mutators.ts, result-list-mutators.ts, cart-mutators.ts, search-box-mutators.ts, configuration-mutators.ts
    - Delete the 4 re-exported selector files from `core/interface/`: cart-selectors.ts, result-list-selectors.ts, search-box-selectors.ts, pagination-selectors.ts
    - Delete test files for removed indirection (~12 files). Before deleting, review each test file for assertions about real behavior and migrate relevant assertions to corresponding `internal/features/` test files
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 8. Checkpoint - Verify file moves are correct
  - [x] 8.1 Verify all files are in correct locations
    - Ensure all source files are in their new locations
    - Ensure no files remain in old locations that should have been moved
    - Run `tsc --noEmit` to identify broken imports (expect failures — will be fixed in task 9/10)
    - Ask the user if questions arise.

- [x] 9. Write barrel index.ts files
  - [x] 9.1 Write all barrel files for features, API, engine, and utils
    - Write barrel files for each of the 12 feature modules. Each barrel exports `getOrCreate*` factories for slice, actions, selectors, plus type definitions. Follow the pattern in the design document
    - Write barrel files for each API domain sub-module: search/, commerce-search/, conversation/, query-suggest/, commerce-query-suggest/, generative/. Each exports client factories, types, facade resolvers, thunks as needed
    - Write barrel for `internal/api/index.ts` — re-export from domain sub-modules
    - Write barrel for `internal/engine/index.ts` — export Engine class, engine types, engine configuration factory
    - Write barrel for `internal/utils/index.ts` — export all shared utilities needed by features, api, and engine
    - _Requirements: 1.3, 2.3, 4.6, 5.2, 6.3_

- [x] 10. Update all imports to use barrel paths
  - [x] 10.1 Rewrite all imports across the codebase
    - Rewrite imports in `public/controllers/`, `public/actions/`, and `public/interfaces/` to use barrel paths. Replace all `core/internal/`, `core/interface/` imports with `internal/features/<name>`, `internal/utils`, `internal/engine`, `internal/api/<domain>`
    - Rewrite cross-module imports within `internal/`: features → `@/src/internal/utils`, API → `@/src/internal/features/<name>`, engine → `@/src/internal/utils`
    - Rewrite imports in test files to use new paths
    - Verify TypeScript compilation passes: run `tsc --noEmit` — must produce zero errors
    - _Requirements: 8.1, 8.2, 8.3, 15.1_

- [x] 11. Checkpoint - Compilation and tests pass
  - [x] 11.1 Verify compilation and test suite
    - Run `tsc --noEmit` — zero errors
    - Run `pnpm run test` in thermidor package — zero failures
    - Ask the user if questions arise.
    - _Requirements: 15.1, 15.3_

- [x] 12. Add ESLint boundary enforcement rule
  - [x] 12.1 Configure and verify lint rule
    - Add `no-restricted-imports` rule scoped to `src/public/**` files
    - Block imports of `@reduxjs/toolkit`, `@reduxjs/toolkit/*`, `immer`
    - Block deep path imports into internal sub-modules (patterns: `@/src/internal/features/*/*`, `@/src/internal/api/*/*`, `@/src/internal/engine/*`, `@/src/internal/utils/*`)
    - Include clear error messages per the design document
    - Run `pnpm run lint:check` to verify zero errors
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 13. Add API snapshot gate
  - [x] 13.1 Create API snapshot validation
    - Create a script/test that snapshots all symbols exported from `src/index.ts`
    - Verify the snapshot matches the pre-refactor public API (zero differences)
    - Add detection for any exported symbol whose type references `@reduxjs/toolkit` or `immer`
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 14. Add .d.ts validation gate
  - [x] 14.1 Create declaration file validation
    - Create a script/test that inspects generated `.d.ts` files after build
    - Scan for import statements or type references to `@reduxjs/toolkit` or `immer`
    - Fail with descriptive error identifying the offending file if any are found
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 15. Write README documentation
  - [x] 15.1 Create all module README files
    - Create `internal/README.md` — overview of the internal layer, relationship to public/, barrel convention
    - Create `internal/features/README.md` — what a feature module is, naming conventions, how to add a new feature
    - Create `internal/api/README.md` — API module purpose, domain sub-module structure, how to add a new endpoint
    - Create `internal/engine/README.md` — engine module responsibilities, what belongs here vs utils
    - Create `internal/utils/README.md` — shared utilities scope, when to put something here vs in a feature
    - _Requirements: 12.1, 12.2_

- [x] 16. Delete empty old directories
  - [x] 16.1 Remove all legacy directories
    - Delete `src/core/` and all its empty sub-directories
    - Delete top-level `src/api/` directory and all its empty sub-directories
    - Verify no empty legacy directories remain
    - _Requirements: 13.1, 13.2, 13.3_

- [x] 17. Final verification checkpoint
  - [x] 17.1 Run full verification suite
    - Run `tsc --noEmit` — zero TypeScript errors
    - Run `pnpm run test` in thermidor package — zero test failures
    - Run `pnpm run lint:check` — zero lint errors in Thermidor
    - Run circular dependency check (`madge --circular`) on `internal/` — zero cycles
    - Verify `src/index.ts` exports are unchanged
    - Verify API snapshot gate passes
    - Verify `.d.ts` validation gate passes
    - Ask the user if questions arise.
    - _Requirements: 14.1, 14.2, 14.3, 15.1, 15.2, 15.3, 15.4, 16.1, 16.2_

## Notes

- Tasks 2–5 (file moves) are independent of each other and can be executed in parallel since they target non-overlapping directories.
- Tasks 6 and 7 depend on task 2 being complete (they modify or delete files relative to the feature move).
- Task 9 (barrel creation) must happen after all moves (tasks 2–7) but before import rewrites (task 10).
- Tasks 12–15 are independent of each other and can be done in any order after task 11 passes.
- This is a pure structural refactor — no runtime behavior changes. The TypeScript compiler and existing test suite serve as the primary correctness validation.
- Property-based testing is not applicable for this refactor (no new runtime logic). Correctness is verified by the compiler, test suite, and lint rules.
