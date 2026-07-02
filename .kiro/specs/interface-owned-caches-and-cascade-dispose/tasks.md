# Implementation Plan: Interface-Owned Caches and Cascade Dispose

## Overview

Migrate 37 module-level `Map` caches from global scope to interface-level ownership via a new `InterfaceCacheRegistry` class with typed `CacheKey<T>` branded symbols. Factory functions accept `iface: Supports<Facades[InterfaceType]>` and internally extract `stateId` + `cacheRegistry` via `getHandleInternals`. `BaseInterface` owns the registry and registers with the engine via `addInterface`/`removeInterface`. `Engine.dispose()` cascades teardown through all registered interfaces (unordered Set). `ComposedInterface` owns a shared registry for composed-scoped caches and registers with the Engine. All paths relative to `packages/thermidor/`.

## Tasks

- [x] 1. Create InterfaceCacheRegistry with CacheKey<T> pattern
  - [x] 1.1 Create `src/core/interface/cache/interface-cache-registry.ts`
    - Implement `CacheKey<T>` branded symbol type and `createCacheKey<T>(description: string)` helper
    - Implement `InterfaceCacheRegistry` class with `#entries: Map<symbol, unknown>`, `#disposed: boolean`
    - Implement methods: `set<T>()`, `get<T>()`, `has()`, `getOrCreate<T>(key, factory)`, `dispose()`
    - `getOrCreate<T>()` is lazy: only invokes `factory` when key is absent
    - `dispose()` is idempotent (early return if already disposed), clears `#entries`
    - `#assertNotDisposed()` guard on all read/write methods
    - Expose `getInterfaceCacheRegistryInternals` via `static {}` hook per ADR-005
    - All `if` statements must have braces
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.2 Write property tests for InterfaceCacheRegistry
    - **Property 1: Registry store/retrieve round-trip**
    - **Property 2: Registry dispose clears all entries**
    - **Property 7: Disposed registry throws on access**
    - **Property 8: Dispose idempotence (registry)**
    - **Validates: Requirements 1.1, 1.2, 1.3, 7.1, 7.2**

  - [ ]* 1.3 Write unit tests for InterfaceCacheRegistry
    - Test `set`/`get`/`has` with heterogeneous value types via typed CacheKey<T>
    - Test `getOrCreate` lazy factory invocation (factory called only once)
    - Test `getOrCreate` returns existing value without calling factory on second call
    - Test `dispose()` clears entries and blocks further access with thrown error
    - Test idempotent dispose (no error on second call)
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 2. Extend BaseInterface with InterfaceCacheRegistry ownership
  - [x] 2.1 Modify `src/core/interface/base-interface.ts`
    - Add `#cacheRegistry: InterfaceCacheRegistry` field, instantiate in constructor
    - Add `cacheRegistry` to `InterfaceInternals` type and expose in `getInterfaceInternals` static accessor
    - Add `#disposed: boolean` field with idempotent guard in `dispose()`
    - Call `#cacheRegistry.dispose()` before clearing `#facadeCache`
    - Call `engine.addInterface(this)` in constructor
    - Call `engine.removeInterface(this)` in `dispose()`
    - Add public getter `get disposed(): boolean`
    - All `if` statements must have braces
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.3, 7.2_

  - [ ]* 2.2 Write property test for BaseInterface dispose cascade
    - **Property 3: BaseInterface dispose cascades to registry**
    - **Property 8: Dispose idempotence (BaseInterface)**
    - **Validates: Requirements 2.3, 7.2**

  - [ ]* 2.3 Write unit tests for BaseInterface changes
    - Test that constructing a BaseInterface creates a registry accessible via `getInterfaceInternals`
    - Test that constructing a BaseInterface calls `engine.addInterface`
    - Test that `dispose()` calls `engine.removeInterface`
    - Test that `dispose()` sets `registry.disposed = true`
    - Test idempotent dispose
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.3_

- [x] 3. Extend Engine with interface tracking and cascade dispose
  - [x] 3.1 Modify `src/core/interface/engine/engine.ts`
    - Define `type EngineTrackedInterface = { disposed: boolean; dispose(): void }`
    - Add `#interfaces: Set<EngineTrackedInterface>` field
    - Add private `#addInterface(iface)` and `#removeInterface(iface)` methods
    - Expose `addInterface` and `removeInterface` on `FullEngine` type via `getFullEngine` wrapper
    - `#addInterface` calls `#assertNotDisposed()` before adding
    - `#removeInterface` does NOT assert not-disposed (called during cascade)
    - Update `dispose()`: add idempotent guard, iterate `#interfaces` calling `iface.dispose()` on non-already-disposed interfaces, then `#interfaces.clear()`, then existing cleanup
    - No ordering guarantee (Set, not array)
    - All `if` statements must have braces
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 7.3_

  - [ ]* 3.2 Write property tests for Engine registration and cascade dispose
    - **Property 5: Engine registration invariant**
    - **Property 6: Engine cascade dispose**
    - **Property 9: Engine cascade skips pre-disposed interfaces**
    - **Validates: Requirements 4.1, 4.2, 4.3, 5.1, 5.2, 5.3**

  - [ ]* 3.3 Write unit tests for Engine interface tracking
    - Test `addInterface` / `removeInterface` membership (Set size)
    - Test cascade dispose disposes all registered interfaces
    - Test idempotent engine dispose
    - Test skipping already-disposed interfaces during cascade
    - Test `addInterface` on disposed engine throws
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 7.3_

- [x] 4. Checkpoint - Core infrastructure tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Migrate search-box feature module caches (3 caches)
  - [x] 5.1 Migrate `src/core/internal/search-box/search-box-actions.ts`
    - Remove module-level `actionsCache` Map
    - Declare `const CACHE_KEY: CacheKey<SearchBoxActions> = createCacheKey<SearchBoxActions>('searchBox/actions')`
    - Change signature: `getOrCreateSearchBoxActions(iface: Supports<Facades[InterfaceType]>)`
    - Extract `{stateId, cacheRegistry}` from `getHandleInternals(iface)`
    - Use `cacheRegistry.getOrCreate(CACHE_KEY, () => createSearchBoxActions(stateId))`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 5.2 Migrate `src/core/internal/search-box/search-box-slice.ts`
    - Remove module-level `sliceCache` Map
    - Declare `const CACHE_KEY: CacheKey<SearchBoxSlice> = createCacheKey<SearchBoxSlice>('searchBox/slice')`
    - Change signature: `getOrCreateSearchBoxSlice(iface: Supports<Facades[InterfaceType]>)`
    - Extract `{stateId, cacheRegistry}` from `getHandleInternals(iface)`
    - Call `getOrCreateSearchBoxActions(iface)` inside factory (pass `iface`, not registry)
    - Use `cacheRegistry.getOrCreate(CACHE_KEY, () => createSearchBoxSlice(stateId, actions))`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 5.3 Migrate `src/core/internal/search-box/search-box-selectors.ts`
    - Remove module-level `selectorsCache` Map
    - Declare `const CACHE_KEY: CacheKey<SearchBoxSelectors> = createCacheKey<SearchBoxSelectors>('searchBox/selectors')`
    - Change signature: `getOrCreateSearchBoxSelectors(iface: Supports<Facades[InterfaceType]>)`
    - Extract `{stateId, cacheRegistry}` from `getHandleInternals(iface)`
    - Use `cacheRegistry.getOrCreate(CACHE_KEY, () => createSearchBoxSelectors(stateId))`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 5.4 Write property test for search-box factory idempotence
    - **Property 4: Factory idempotence via registry**
    - Test that calling `getOrCreateSearchBoxActions(iface)` twice returns same reference
    - **Validates: Requirements 3.1, 3.2**

- [ ] 6. Migrate search-parameters feature module caches (3 caches)
  - [x] 6.1 Migrate `src/core/internal/search-parameters/search-parameters-actions.ts`
    - Same pattern: remove Map, add `CacheKey<T>`, accept `iface: Supports<Facades[InterfaceType]>`, use `cacheRegistry.getOrCreate`
    - Key: `'searchParameters/actions'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.2 Migrate `src/core/internal/search-parameters/search-parameters-slice.ts`
    - Same pattern, key: `'searchParameters/slice'`
    - Internal dependency: call `getOrCreateSearchParametersActions(iface)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.3 Migrate `src/core/internal/search-parameters/search-parameters-selectors.ts`
    - Same pattern, key: `'searchParameters/selectors'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7. Migrate cart feature module caches (3 caches)
  - [x] 7.1 Migrate `src/core/internal/cart/cart-actions.ts`
    - Same pattern, key: `'cart/actions'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 7.2 Migrate `src/core/internal/cart/cart-slice.ts`
    - Same pattern, key: `'cart/slice'`
    - Internal dependency: call `getOrCreateCartActions(iface)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 7.3 Migrate `src/core/internal/cart/cart-selectors.ts`
    - Same pattern, key: `'cart/selectors'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 8. Migrate pagination feature module caches (3 caches)
  - [x] 8.1 Migrate `src/core/internal/pagination/pagination-actions.ts`
    - Same pattern, key: `'pagination/actions'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 8.2 Migrate `src/core/internal/pagination/pagination-slice.ts`
    - Same pattern, key: `'pagination/slice'`
    - Internal dependency: call `getOrCreatePaginationActions(iface)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 8.3 Migrate `src/core/internal/pagination/pagination-selectors.ts`
    - Same pattern, key: `'pagination/selectors'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 9. Migrate facets feature module caches (3 caches)
  - [x] 9.1 Migrate `src/core/internal/facets/facets-actions.ts`
    - Same pattern, key: `'facets/actions'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 9.2 Migrate `src/core/internal/facets/facets-slice.ts`
    - Same pattern, key: `'facets/slice'`
    - Internal dependency: call `getOrCreateFacetsActions(iface)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 9.3 Migrate `src/core/internal/facets/facets-selectors.ts`
    - Same pattern, key: `'facets/selectors'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 10. Migrate result-list feature module caches (3 caches)
  - [x] 10.1 Migrate `src/core/internal/result-list/result-list-actions.ts`
    - Same pattern, key: `'resultList/actions'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 10.2 Migrate `src/core/internal/result-list/result-list-slice.ts`
    - Same pattern, key: `'resultList/slice'`
    - Internal dependency: call `getOrCreateResultListActions(iface)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 10.3 Migrate `src/core/internal/result-list/result-list-selectors.ts`
    - Same pattern, key: `'resultList/selectors'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 11. Migrate product-list feature module caches (3 caches)
  - [x] 11.1 Migrate `src/core/internal/product-list/product-list-actions.ts`
    - Same pattern, key: `'productList/actions'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 11.2 Migrate `src/core/internal/product-list/product-list-slice.ts`
    - Same pattern, key: `'productList/slice'`
    - Internal dependency: call `getOrCreateProductListActions(iface)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 11.3 Migrate `src/core/internal/product-list/product-list-selectors.ts`
    - Same pattern, key: `'productList/selectors'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 12. Migrate sort feature module caches (3 caches)
  - [x] 12.1 Migrate `src/core/internal/sort/sort-actions.ts`
    - Same pattern, key: `'sort/actions'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 12.2 Migrate `src/core/internal/sort/sort-slice.ts`
    - Same pattern, key: `'sort/slice'`
    - Internal dependency: call `getOrCreateSortActions(iface)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 12.3 Migrate `src/core/internal/sort/sort-selectors.ts`
    - Same pattern, key: `'sort/selectors'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 13. Migrate query-correction feature module caches (2 caches)
  - [x] 13.1 Migrate `src/core/internal/query-correction/query-correction-actions.ts`
    - Same pattern, key: `'queryCorrection/actions'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 13.2 Migrate `src/core/internal/query-correction/query-correction-slice.ts`
    - Same pattern, key: `'queryCorrection/slice'`
    - Internal dependency: call `getOrCreateQueryCorrectionActions(iface)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 14. Migrate generative feature module caches (3 caches)
  - [x] 14.1 Migrate `src/core/internal/generative/generative-actions.ts`
    - Same pattern, key: `'generative/actions'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 14.2 Migrate `src/core/internal/generative/generative-slice.ts`
    - Same pattern, key: `'generative/slice'`
    - Internal dependency: call `getOrCreateGenerativeActions(iface)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 14.3 Migrate `src/core/internal/generative/generative-selectors.ts`
    - Same pattern, key: `'generative/selectors'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 15. Migrate triggers feature module caches (2 caches)
  - [x] 15.1 Migrate `src/core/internal/triggers/triggers-actions.ts`
    - Same pattern, key: `'triggers/actions'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 15.2 Migrate `src/core/internal/triggers/triggers-slice.ts`
    - Same pattern, key: `'triggers/slice'`
    - Internal dependency: call `getOrCreateTriggersActions(iface)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 16. Migrate API endpoint caches (4 caches across 2 files)
  - [x] 16.1 Migrate `src/core/internal/api/search/search-thunk-slice.ts`
    - Remove module-level `sliceCache` and `selectorsCache` Maps
    - Declare two CacheKeys: `'api/search/endpointSlice'` and `'api/search/endpointSelectors'`
    - Change both `getOrCreateSearchEndpointSlice` and `getOrCreateSearchEndpointSelectors` to accept `iface: Supports<Facades[InterfaceType]>`
    - Extract `{stateId, cacheRegistry}` from `getHandleInternals(iface)` and use `cacheRegistry.getOrCreate()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 16.2 Migrate `src/core/internal/api/search/commerce-search-thunk-slice.ts`
    - Remove module-level `sliceCache` and `selectorsCache` Maps
    - Declare two CacheKeys: `'api/commerceSearch/endpointSlice'` and `'api/commerceSearch/endpointSelectors'`
    - Change both `getOrCreateCommerceSearchEndpointSlice` and `getOrCreateCommerceSearchEndpointSelectors` to accept `iface: Supports<Facades[InterfaceType]>`
    - Extract `{stateId, cacheRegistry}` from `getHandleInternals(iface)` and use `cacheRegistry.getOrCreate()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 17. Migrate generative-hydration cache (1 cache)
  - [x] 17.1 Migrate `src/core/interface/generative/generative-hydration.ts`
    - Remove module-level `hydrateActionCache` Map
    - Declare `const CACHE_KEY: CacheKey<...> = createCacheKey<...>('generative/hydrateAction')`
    - Change `getOrCreateHydrateFromSnapshotAction` to accept `iface: Supports<Facades[InterfaceType]>`
    - Extract `{stateId, cacheRegistry}` from `getHandleInternals(iface)` and use `cacheRegistry.getOrCreate()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 18. Checkpoint - Feature module migration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Update all call-sites to pass `iface` instead of `stateId`
  - [x] 19.1 Update build functions (interface constructors)
    - `src/public/interfaces/search.ts` — pass `iface` (the constructed SearchInterface) to all `getOrCreate*` calls
    - `src/public/interfaces/commerce.ts` — pass `iface` to all `getOrCreate*` calls
    - `src/public/interfaces/generative.ts` — pass `iface` to all `getOrCreate*` calls
    - _Requirements: 2.2, 3.1_

  - [x] 19.2 Update controllers
    - `src/public/controllers/search-box/search-box-controller.ts` — replace `stateId` arg with `options.interface` in all `getOrCreate*` calls
    - `src/public/controllers/pagination/pagination-controller.ts` — same pattern
    - `src/public/controllers/result-list/result-list-controller.ts` — same pattern
    - `src/public/controllers/product-list/product-list-controller.ts` — same pattern
    - _Requirements: 3.1_

  - [x] 19.3 Update public action files
    - `src/public/actions/search-box/search-box-actions.ts` — pass `iface` to factory calls
    - `src/public/actions/search-box/search-box-state-getter.ts` — pass `iface` to factory calls
    - `src/public/actions/search-parameters/search-parameters-actions.ts` — pass `iface` to factory calls
    - `src/public/actions/cart/cart-actions.ts` — pass `iface` to factory calls
    - _Requirements: 3.1_

  - [x] 19.4 Update loaders
    - `src/core/interface/cart/cart-loader.ts` — pass `iface` to factory calls
    - `src/core/interface/generative/generative-loader.ts` — pass `iface` to factory calls
    - `src/core/interface/result-list/result-list-loader.ts` — pass `iface` to factory calls
    - `src/core/interface/search-box/search-box-loader.ts` — pass `iface` to factory calls
    - _Requirements: 3.1_

  - [x] 19.5 Update search thunk call-sites
    - `src/core/internal/api/search/search-thunk.ts` — pass `iface` to `getOrCreateSearchEndpointSlice` / `getOrCreateSearchEndpointSelectors`
    - `src/core/internal/api/search/commerce-search-thunk.ts` — pass `iface` to commerce variants
    - _Requirements: 3.1_

  - [x] 19.6 Update mutators
    - `src/core/interface/search-box/search-box-mutators.ts` — pass `iface` to `getOrCreateSearchBoxActions`
    - _Requirements: 3.1_

  - [x] 19.7 Update generative-hydration call-site
    - `src/core/interface/generative/generative-hydration.ts` — internal calls to `getOrCreateHydrateFromSnapshotAction` use `iface` (the sub-interface passed to hydration logic)
    - _Requirements: 3.1_

  - [x] 19.8 Update `src/core/interface/utils/get-handle-internals.ts`
    - Add `cacheRegistry` to the returned object
    - Extract from `getInterfaceInternals` or `getComposedInternals` depending on handle type
    - Both BaseInterface and ComposedInterface now provide it
    - _Requirements: 2.2, 6.2_

- [x] 20. Update existing tests to use new signatures
  - [x] 20.1 Update unit tests that call `getOrCreate*` factory functions
    - Update all test files under `src/core/internal/` that invoke factory functions with old `(stateId)` or `(stateId, registry)` signatures
    - Create test utility (or update existing) to construct a minimal interface handle for testing
    - _Requirements: 3.1_

  - [x] 20.2 Update loader and controller tests
    - Update test files under `src/core/interface/` and `src/public/controllers/` that set up factory mocks
    - Ensure mocks match new `(iface: Supports<Facades[InterfaceType]>)` signatures
    - _Requirements: 3.1, 4.1_

- [x] 21. Update ComposedInterface with registry and engine registration
  - [x] 21.1 Modify `src/public/interfaces/compose.ts`
    - Add `#cacheRegistry: InterfaceCacheRegistry` field, instantiate in constructor
    - Add `#disposed: boolean` field with idempotent guard
    - Add `cacheRegistry` to `ComposedInternals` type and expose via `getComposedInternals`
    - Call `engine.addInterface(this)` in constructor
    - Implement `dispose()`: dispose registry, call `engine.removeInterface(this)`, do NOT dispose sub-interfaces
    - Add `get disposed(): boolean` getter
    - All `if` statements must have braces
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7_

  - [ ]* 21.2 Write unit tests for ComposedInterface registry
    - Test that ComposedInterface creates a registry
    - Test that ComposedInterface registers with engine
    - Test that dispose() clears registry but not sub-interfaces
    - Test that disposing a sub-interface does not affect composed registry
    - Test idempotent dispose
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6_

- [x] 22. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The migration of feature modules (tasks 5–17) follows an identical pattern per directory — only cache key descriptions and type aliases differ
- All paths relative to `packages/thermidor/`
- Factory signature is always `getOrCreateXxx(iface: Supports<Facades[InterfaceType]>)` — no registry in the public signature
- `CacheKey<T>` constants are module-private (not exported), co-located with the factory function
- `configuration-selectors.ts` (`getOrCreateConfigurationSelectors`) is intentionally EXCLUDED — it is a global singleton managed by Engine, not per-interface
- All `if` statements must have braces per project lint rules

## Task Dependency Graph

```
Wave 0: [1.1]                         — InterfaceCacheRegistry class
Wave 1: [1.2*, 1.3*, 2.1]            — Registry tests + BaseInterface changes
Wave 2: [2.2*, 2.3*, 3.1, 21.1]      — BaseInterface tests + Engine changes + ComposedInterface changes
Wave 3: [3.2*, 3.3*, 21.2*]          — Engine tests + ComposedInterface tests
Wave 4: [4]                           — Checkpoint: core infra
Wave 5: [5.1, 6.1, 7.1, 8.1, 9.1,   — All *-actions.ts migrations (parallel)
         10.1, 11.1, 12.1, 13.1,
         14.1, 15.1]
Wave 6: [5.2, 5.3, 6.2, 6.3, 7.2,   — All *-slice.ts and *-selectors.ts migrations (parallel)
         7.3, 8.2, 8.3, 9.2, 9.3,      (depend on actions from Wave 5)
         10.2, 10.3, 11.2, 11.3,
         12.2, 12.3, 13.2, 14.2,
         14.3, 15.2, 16.1, 16.2,
         17.1]
Wave 7: [5.4*]                        — Property test for factory idempotence
Wave 8: [18]                          — Checkpoint: feature migration
Wave 9: [19.1, 19.2, 19.3, 19.4,    — All call-site updates (parallel)
         19.5, 19.6, 19.7, 19.8]
Wave 10: [20.1, 20.2]                — Test updates
Wave 11: [22]                         — Final checkpoint
```
