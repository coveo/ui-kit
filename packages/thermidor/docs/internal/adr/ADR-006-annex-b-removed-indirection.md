# ADR-006 — Annex B: Removed Indirection

This annex catalogs the `core/interface/` concepts that become unnecessary after the restructuring. These files exist solely to bridge the `core/interface/` ↔ `core/internal/` boundary — a boundary that will no longer exist.

## Summary

The `core/interface/` layer currently provides three categories of indirection:

1. **Mutators** — functions that wrap `core/internal/` actions, adding only a `StateMutation` return type annotation
2. **Re-exported selectors** — files that simply `export { ... } from '../internal/...'` or wrap an internal selector with a hardcoded `'default'` scope
3. **Loaders** — functions that call `engine.adoptSlice(getOrCreate*Slice(interfaceId))` and track whether they've already been called

In the new structure, controllers and actions import directly from the `internal/features/<name>` barrel (which exposes the `getOrCreate*` factories). The wrapping layer is eliminated.

## Mutators (to be removed)

These files wrap internal actions with a `StateMutation` return type. After restructuring, consumers of these mutations (controllers, actions, response handlers) will call the internal action factories directly.

| File | What it does |
|------|-------------|
| `core/interface/pagination/pagination-mutators.ts` | Wraps `getOrCreatePaginationActions('default')` calls as `StateMutation` |
| `core/interface/facets/facets-mutators.ts` | Wraps `getOrCreateFacetsActions('default')` calls as `StateMutation` |
| `core/interface/result-list/result-list-mutators.ts` | Wraps `getOrCreateResultsActions(interfaceId)` as `StateMutation` |
| `core/interface/cart/cart-mutators.ts` | Wraps `getOrCreateCartActions(interfaceId)` as `StateMutation` |
| `core/interface/search-box/search-box-mutators.ts` | Wraps `getOrCreateSearchBoxActions(interfaceId)` as `StateMutation` |
| `core/interface/configuration/configuration-mutators.ts` | Wraps each configuration action with `StateMutation` return type |

**Why they're unnecessary**: The `StateMutation` type is already the return type of `createAction()` from RTK. The wrapping provides no additional type safety or abstraction — it just adds a call frame. Controllers and public actions already know they're producing mutations. In the new structure, they call `getOrCreatePaginationActions(stateId).setFirstResult(value)` directly, which already returns a `StateMutation`-compatible object.

**Note on `configuration-mutators.ts`**: This file is imported by `public/actions/configuration/configuration-actions.ts`. After restructuring, the public configuration actions will import directly from `internal/features/configuration` (the barrel), eliminating this wrapper.

## Re-exported selectors (to be removed or merged)

| File | What it does |
|------|-------------|
| `core/interface/cart/cart-selectors.ts` | Pure re-export: `export { createCartSelectors, getOrCreateCartSelectors } from '../../internal/...'` |
| `core/interface/result-list/result-list-selectors.ts` | Wraps one default-scoped selector + re-exports from internal |
| `core/interface/search-box/search-box-selectors.ts` | Creates one hardcoded-`'default'` selector + re-exports from internal |
| `core/interface/pagination/pagination-selectors.ts` | Hardcoded-`'default'` selectors that duplicate internal's scoped selectors |

**Why they're unnecessary**: These serve two purposes today:
1. Re-exporting internal factories (no-op, just path aliasing)
2. Creating "convenience" selectors hardcoded to `interfaceId = 'default'`

The hardcoded-default selectors are only used in tests and `core/index.ts` exports. After restructuring:
- Tests can use `getOrCreatePaginationSelectors('default')` directly — one extra arg, no wrapper
- `core/index.ts` (which becomes the package's `index.ts` re-exporting from `public/`) won't export raw selectors anyway (those are implementation details per ADR-001)

## Selectors with actual logic (to be kept)

| File | Why it stays |
|------|-------------|
| `core/interface/facets/facets-selectors.ts` | Contains `buildFacetsRequest` — a derived selector with real transformation logic (converts facet state to API request shape). This moves to `internal/features/facets/facets-selectors.ts`. |
| `core/interface/configuration/configuration-selectors.ts` | Contains selectors used by public actions in tests. Moves to `internal/features/configuration/configuration-selectors.ts`. |

## Loaders (to be removed)

| File | What it does |
|------|-------------|
| `core/interface/result-list/result-list-loader.ts` | Calls `engine.adoptSlice(getOrCreateResultsSlice(interfaceId))` with a WeakSet guard |
| `core/interface/cart/cart-loader.ts` | Calls `engine.adoptSlice(getOrCreateCartSlice(interfaceId))` |
| `core/interface/search-box/search-box-loader.ts` | Calls `engine.adoptSlice(getOrCreateSearchBoxSlice(interfaceId))` |

**Why they're unnecessary**: Controllers already perform `engine.adoptSlice(getOrCreate*Slice(stateId))` inline (see `pagination-controller.ts`, `product-list-controller.ts`). The loader pattern adds a WeakSet guard for idempotency, but `adoptSlice` is already idempotent by design (it's a no-op if the slice is already adopted). The guard is redundant.

## Types (to be consolidated)

| File | Disposition |
|------|------------|
| `core/interface/pagination/pagination-types.ts` | Merge with `internal/features/pagination/pagination-types.ts` (currently duplicated) |
| `core/interface/facets/facets-types.ts` | Move to `internal/features/facets/facets-types.ts` |
| `core/interface/cart/cart-types.ts` | Move to `internal/features/cart/cart-types.ts` |
| `core/interface/result-list/result-list-types.ts` | Move to `internal/features/result-list/result-list-types.ts` |
| `core/interface/generative/generative-types.ts` | Move to `internal/features/generative/generative-types.ts` |
| `core/interface/navigator-context/navigator-context-types.ts` | Move to `internal/utils/navigator-context-types.ts` |
| `core/interface/utils/interface-types.ts` | Move to `internal/utils/interface-types.ts` |

## Test files for removed indirection

| File | Disposition |
|------|------------|
| `core/interface/cart/cart-mutators.test.ts` | Remove (tests a wrapper that no longer exists) |
| `core/interface/cart/cart-selectors.test.ts` | Remove (tests a re-export) |
| `core/interface/cart/cart-loader.test.ts` | Remove (tests redundant idempotency guard) |
| `core/interface/result-list/result-list-mutators.test.ts` | Remove (tests a wrapper) |
| `core/interface/result-list/result-list-selectors.test.ts` | Move relevant assertions to internal selector tests |
| `core/interface/result-list/result-list-loader.test.ts` | Remove |
| `core/interface/pagination/pagination-mutators.test.ts` | Remove |
| `core/interface/pagination/pagination-selectors.test.ts` | Move relevant assertions to internal selector tests |
| `core/interface/search-box/search-box-mutators.test.ts` | Remove |
| `core/interface/search-box/search-box-selectors.test.ts` | Move relevant assertions to internal selector tests |
| `core/interface/search-box/search-box-loader.test.ts` | Remove |
| `core/interface/configuration/configuration-mutators.test.ts` | Remove |
| `core/interface/configuration/configuration-selectors.test.ts` | Move to internal |
| `core/interface/facets/facets-mutators.test.ts` | Remove |
| `core/interface/facets/facets-selectors.test.ts` | Move to internal |

## Net impact

- **Files removed**: ~15–20 indirection files (mutators, loaders, re-exported selectors) + their associated tests
- **Files moved**: ~10 type/logic files consolidated into `internal/features/`
- **Net reduction**: Approximately 25–30 fewer files in the codebase
- **Lines of code removed**: Estimated 300–500 lines of pure delegation code
