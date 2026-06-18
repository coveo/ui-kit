# Implementation Plan: Multi-Interface Engine

## Overview

This plan transforms the existing POC in `packages/headless-future/src/` into the multi-interface architecture defined in the design. The work progresses through logical phases: core type system → scoped state infrastructure → endpoint thunks → interface factories → composition → controllers → public API (state getters & action loaders). Each phase builds on the previous, ensuring no orphaned code.

## Tasks

- [x] 1. Core type system and symbols
  - [x] 1.1 Create internal symbols module
    - Create `src/core/interface/utils/symbols.ts` with all unexported unique symbols: `KIND`, `STATE_ID`, `ENGINE`, `THUNKS`, `THUNK_FACTORIES`, `INTERFACES`
    - These symbols MUST NOT be re-exported from any public entry point
    - _Requirements: 6.1, 2.1_

  - [x] 1.2 Create the `Operations` interface and handle types
    - Create `src/core/interface/utils/interface-types.ts` defining:
      - `Operations` interface mapping each interface type to its operation union (`search: 'search' | 'suggestions'`, `commerce: 'search' | 'suggestions'`, `conversation: 'conversation'`)
      - `EndpointThunk` type as `AsyncThunk<void, {engine: FullEngine}, {}>`
      - `EndpointThunkFactory` type as `(engine: FullEngine, scope: EndpointStateScope) => EndpointThunk`
      - `Interface<T>` with `[KIND]: 'interface'`, `[STATE_ID]`, `[ENGINE]`, `[THUNK_FACTORIES]`, `[THUNKS]`
      - `ComposedInterface<T>` with `[KIND]: 'composed'`, `[STATE_ID]`, `[ENGINE]`, `[INTERFACES]`, `[THUNKS]`
      - `Requires<T>` structural constraint type keyed by `[STATE_ID]`, `[ENGINE]`, `[THUNKS]`
      - `EndpointStateScope` with `interfaceId` and optional `composedInterfaceId`
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 4.5_

  - [x] 1.3 Create ID generator utility
    - Create `src/core/interface/utils/id-generator.ts` with a `generateId()` function returning unique string identifiers for interfaces
    - _Requirements: 1.1, 1.4_

  - [x]\* 1.4 Write type-level tests for interface type safety
    - Create `src/core/interface/utils/interface-types.test-d.ts` using `// @ts-expect-error` assertions:
      - **Property 6: Type-Safe Operation Enforcement**
      - Verify `Requires<'search'>` rejects an interface missing search thunks
      - Verify `Interface<'search'>` requires both `[THUNK_FACTORIES]` and `[THUNKS]` records
      - Verify `ComposedInterface` cannot satisfy `Interface & Requires<...>` (KIND discriminator)
    - **Validates: Requirements 2.2, 2.3, 2.4, 4.5**

- [x] 2. Scoped state infrastructure (actions, selectors, slices)
  - [x] 2.1 Refactor search-box feature to scoped factories
    - Refactor `src/core/internal/search-box/` to export scoped factory functions:
      - `createSearchBoxActions(interfaceId: string)` returning `{setQuery}`
      - `createSearchBoxSelectors(interfaceId: string)` returning `{getQuery}` using `createMemoizedStateSelector`
      - `createSearchBoxSlice(interfaceId: string)` returning a scoped slice with name `${interfaceId}/searchBox`
    - Add `getOrCreate*` memoized caches (Map-based) for each factory
    - Use `createSelectSlice(interfaceId, 'searchBox', initialState)` pattern for selectors
    - _Requirements: 6.1, 8.1, 9.1, 9.2_

  - [x] 2.2 Implement `createSelectSlice` utility
    - Create `src/core/interface/utils/select-slice.ts` implementing the flat-key state accessor:
      - Given `interfaceId` and `featureName`, returns a selector reading `state[${interfaceId}/${featureName}]`
      - Falls back to provided `initialState` when slice is not adopted (Two-Tier selector behavior)
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 2.3 Refactor result-list feature to scoped factories
    - Refactor `src/core/internal/result-list/` to export scoped factories:
      - `createResultsActions(interfaceId)` returning `{setResultsFromResponse}`
      - `createResultsSelectors(interfaceId)` returning `{getResults}`
      - `createResultsSlice(interfaceId)` with scoped name
    - Add `getOrCreate*` memoized caches
    - _Requirements: 6.1, 8.1_

  - [x] 2.4 Refactor pagination feature to scoped factories
    - Refactor `src/core/internal/pagination/` to export scoped factories:
      - `createPaginationActions(interfaceId)` returning `{setTotalCount, setPageSize, setFirstResult}`
      - `createPaginationSelectors(interfaceId)` returning `{getFirstResult, getPageSize, getTotalCount}`
      - `createPaginationSlice(interfaceId)` with scoped name
    - Add `getOrCreate*` memoized caches
    - _Requirements: 6.1, 8.1_

  - [x] 2.5 Refactor facets feature to scoped factories
    - Refactor `src/core/internal/facets/` to export scoped factories:
      - `createFacetsActions(interfaceId)` returning `{updateFromResponse}`
      - `createFacetsSelectors(interfaceId)` returning `{buildFacetsRequest}`
      - `createFacetsSlice(interfaceId)` with scoped name
    - Add `getOrCreate*` memoized caches
    - _Requirements: 6.1, 8.1_

  - [x]\* 2.6 Write unit tests for scoped state factories
    - Test that `createSearchBoxActions` with different IDs produces independent action creators
    - Test that `createSearchBoxSelectors` returns initial state when slice is not adopted
    - Test `getOrCreate*` cache returns same reference on repeated calls
    - **Property 2: Non-Adopted Slice Safety (Two-Tier Selectors)**
    - **Validates: Requirements 8.1, 8.3, 9.1, 9.2, 9.3**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Endpoint thunks (Command pattern)
  - [x] 4.1 Create search endpoint thunk factory
    - Create `src/core/internal/api/search-endpoint/search-endpoint-thunk.ts` implementing `createSearchEndpointThunk`:
      - Signature: `(engine: FullEngine, scope: EndpointStateScope) => EndpointThunk`
      - Compute `sharableInterfaceId = scope.composedInterfaceId ?? scope.interfaceId`
      - Adopt endpoint slice at thunk creation time (NOT inside payload creator)
      - Build request selector using `createSearchEndpointRequestSelector(scope)` reading query from `sharableInterfaceId`, pagination/facets from `scope.interfaceId`
      - Execute search API call via `createSearchEndpointClient`
      - Handle response via `createSearchEndpointResponseHandler(scope.interfaceId)` — dispatches to own interface
    - _Requirements: 7.1, 4.4, 6.1, 6.2_

  - [x] 4.2 Create search endpoint slice with RTK lifecycle matchers
    - Create `src/core/internal/api/search-endpoint/search-endpoint-slice.ts`:
      - `createSearchEndpointSlice(interfaceId, thunk)` returning a slice with `extraReducers` using `builder.addCase(thunk.pending, ...)`, `builder.addCase(thunk.fulfilled, ...)`, `builder.addCase(thunk.rejected, ...)`
      - State: `{status: 'idle' | 'pending', error: string | null}`
      - Add `getOrCreateSearchEndpointSlice` cache
    - Create corresponding selectors: `createSearchEndpointSelectors(interfaceId)` returning `{getStatus, getError}`
    - _Requirements: 8.1, 9.1_

  - [x] 4.3 Create search endpoint request selector
    - Create `src/core/internal/api/search-endpoint/search-endpoint-request-selector.ts`:
      - `createSearchEndpointRequestSelector(scope: EndpointStateScope)` composing query from `sharableInterfaceId`, pagination and facets from `scope.interfaceId`
      - Uses `createMemoizedStateSelector` combining `searchBox.getQuery`, `pagination.getFirstResult`, `pagination.getPageSize`, `facets.buildFacetsRequest`
    - _Requirements: 4.4, 9.1, 9.2, 9.3_

  - [x] 4.4 Create search endpoint response handler
    - Create `src/core/internal/api/search-endpoint/search-endpoint-response-handler.ts`:
      - `createSearchEndpointResponseHandler(interfaceId: string)` returning a function that dispatches results, pagination totalCount, and facet updates to the specified interface's partitions
    - _Requirements: 6.1, 6.2_

  - [x]\* 4.5 Write unit tests for search endpoint thunk
    - Test thunk dispatches pending → fulfilled lifecycle on success
    - Test thunk dispatches pending → rejected lifecycle on failure
    - Test request selector reads query from `composedInterfaceId` when present
    - Test response handler writes to own `interfaceId` partition
    - **Property 3: Composed Query Propagation** (partial)
    - **Validates: Requirements 4.4, 7.1, 6.1**

- [x] 5. Interface factories
  - [x] 5.1 Implement `buildSearchInterface`
    - Create `src/public/interfaces/search.ts`:
      - Accept `{engine: Engine, id?: string}` options
      - Get `FullEngine` via `getFullEngine`
      - Generate or use provided `interfaceId`
      - Build `[THUNK_FACTORIES]` record with `search: [createSearchEndpointThunk]`, `suggestions: [createQuerySuggestThunk]`
      - Build `[THUNKS]` by calling each factory with `(engine, scope)`
      - Return frozen `Interface<'search'>` object
    - Add subpath export `./interfaces/search` in `package.json`
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_

  - [x] 5.2 Implement `buildCommerceInterface` (stub)
    - Create `src/public/interfaces/commerce.ts`:
      - Same pattern as search, with commerce-specific thunk factories
      - Return frozen `Interface<'commerce'>` object
    - Add subpath export `./interfaces/commerce` in `package.json`
    - _Requirements: 1.1, 1.4_

  - [x] 5.3 Implement `composeInterfaces`
    - Create `src/public/interfaces/compose.ts`:
      - Accept `{interfaces: Interface<T>[]}` options
      - Generate a `composedId`
      - Use `reduce` pattern over sub-interfaces' `[THUNK_FACTORIES]`, calling each factory with `(engine, {interfaceId: iface[STATE_ID], composedInterfaceId: composedId})`
      - Return frozen `ComposedInterface<T>` with `[INTERFACES]` and composed `[THUNKS]`
      - Runtime validation: throw on empty array or mismatched engines
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7_

  - [ ]\* 5.4 Write unit tests for interface factories and composition
    - Test `buildSearchInterface` returns frozen object with correct symbol keys
    - Test explicit `id` parameter is used as `[STATE_ID]`
    - Test `composeInterfaces` re-creates thunks with composed scope
    - Test `composeInterfaces` throws on empty array
    - **Property 5: Idempotent Adoption** (interface-level)
    - **Validates: Requirements 1.1, 1.4, 1.5, 4.1, 4.3**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Controllers (multi-interface and single-interface)
  - [x] 7.1 Refactor `buildSearchBoxController` to interface-based binding
    - Rewrite `src/public/controllers/search-box/search-box-controller.ts`:
      - Accept `{interface: Requires<'search'>}` options instead of `{engine: Engine}`
      - Extract `engine` from `options.interface[ENGINE]`, `stateId` from `options.interface[STATE_ID]`, `thunks` from `options.interface[THUNKS].search`
      - Adopt search-box slice with `stateId`
      - Build compound `controllerState` selector via `createMemoizedStateSelector` combining query, status, error
      - `submit()` dispatches all thunks in parallel via `Promise.all(thunks.map(...))`
      - `state` getter uses `engine.read(controllerState)`
      - `subscribe` uses `engine.subscribe(controllerState, callback)`
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 7.1_

  - [x] 7.2 Implement `buildResultListController` with single-interface constraint
    - Rewrite `src/public/controllers/result-list/result-list-controller.ts`:
      - Accept `{interface: Interface & Requires<'search'>}` — requires `[KIND]: 'interface'` discriminator
      - Adopt results slice, build state selector, expose `state` and `subscribe`
    - _Requirements: 3.1, 3.4, 4.5_

  - [x] 7.3 Update `ControllerOptions` type
    - Update `src/public/controllers/controller-types.ts`:
      - Remove `engine: Engine` from `ControllerOptions`
      - Replace with `interface: Requires<...>` per-controller pattern (or remove shared `ControllerOptions` if each controller defines its own)
    - _Requirements: 3.5_

  - [ ]\* 7.4 Write unit tests for controllers
    - Test `buildSearchBoxController` dispatches all thunks on `submit()`
    - Test `buildResultListController` rejects composed interface at compile time (type test)
    - Test controller state is reactive via subscribe
    - **Property 1: State Isolation** (controller scope)
    - **Validates: Requirements 3.1, 3.2, 3.3, 4.5, 6.2, 6.3**

- [x] 8. State getters and action loaders (public API)
  - [x] 8.1 Implement `getSearchBoxState`
    - Create `src/public/actions/search-box/search-box-state-getter.ts`:
      - Accept `{interface: Requires<'search'>}` options
      - Adopt search-box slice, build memoized state selector
      - Return object with `query` getter and `subscribe` method
    - _Requirements: 5.1, 5.3_

  - [x] 8.2 Implement `loadSearchBoxActions`
    - Rewrite `src/public/actions/search-box/search-box-actions.ts`:
      - Accept `{interface: Requires<'search'>}` options instead of `engine: Engine`
      - Return `{setQuery, submit}` where `submit` dispatches all thunks from `[THUNKS].search`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]\* 8.3 Write unit tests for state getters and action loaders
    - Test `getSearchBoxState` returns current query and subscribes to changes
    - Test `loadSearchBoxActions.submit()` dispatches thunks in parallel
    - Test type-level: incompatible interface produces compile error
    - **Validates: Requirements 5.1, 5.2, 5.4**

- [x] 9. Package exports and entry points
  - [x] 9.1 Configure subpath exports in `package.json`
    - Add exports for `./interfaces/search`, `./interfaces/commerce`
    - Ensure main entry (`"."`) re-exports: `Engine`, `composeInterfaces`, controller builders, state getters, action loaders
    - Ensure internal symbols are NOT re-exported from any public entry point
    - _Requirements: 1.6, 2.1_

  - [x] 9.2 Update `src/index.ts` barrel exports
    - Export public API: `Engine`, `buildSearchBoxController`, `buildResultListController`, `composeInterfaces`, `getSearchBoxState`, `loadSearchBoxActions`
    - Export types: `Interface`, `ComposedInterface`, `Requires`, `Operations` (types only, not symbols)
    - Do NOT export: `KIND`, `STATE_ID`, `ENGINE`, `THUNKS`, `THUNK_FACTORIES`, `INTERFACES` symbols
    - _Requirements: 1.2, 1.3, 2.1_

- [ ] 10. Integration tests
  - [ ]\* 10.1 Write integration test for full single-interface flow
    - Build engine → build search interface → build search-box controller → set query → submit → assert state updates
    - Verify thunk lifecycle: state transitions from idle → pending → idle
    - **Property 2: Non-Adopted Slice Safety** (end-to-end)
    - **Validates: Requirements 1.1, 3.1, 8.1, 9.1**

  - [ ]\* 10.2 Write integration test for composed interface flow
    - Build engine → build two search interfaces → compose → build search-box controller on composed → set query → submit → verify both sub-interfaces receive results
    - **Property 3: Composed Query Propagation**
    - **Property 4: Parallel Independence**
    - **Validates: Requirements 4.1, 4.4, 7.1, 7.2, 7.3**

  - [ ]\* 10.3 Write property test for state isolation
    - For any two interfaces on the same engine, mutations on one SHALL NOT alter state of the other or trigger notifications on the other's subscribers
    - **Property 1: State Isolation**
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The existing POC facade pattern (`SearchEndpointFacade`) is replaced by the endpoint thunk pattern — the facade file can be removed once thunks are validated
- Configuration slice remains global (unscoped) — no refactoring needed for it
- The `FullEngine.mutate` signature may need updating to accept RTK `AsyncThunk` dispatch (currently typed as `StateMutation`) — address in task 4.1

## Task Dependency Graph

```json
{
  "waves": [
    {"id": 0, "tasks": ["1.1", "1.3", "2.2"]},
    {"id": 1, "tasks": ["1.2", "2.1", "2.3", "2.4", "2.5"]},
    {"id": 2, "tasks": ["1.4", "2.6", "4.3", "4.4"]},
    {"id": 3, "tasks": ["4.2", "4.1"]},
    {"id": 4, "tasks": ["4.5", "5.1", "5.2"]},
    {"id": 5, "tasks": ["5.3", "7.3"]},
    {"id": 6, "tasks": ["5.4", "7.1", "7.2"]},
    {"id": 7, "tasks": ["7.4", "8.1", "8.2"]},
    {"id": 8, "tasks": ["8.3", "9.1", "9.2"]},
    {"id": 9, "tasks": ["10.1", "10.2", "10.3"]}
  ]
}
```
