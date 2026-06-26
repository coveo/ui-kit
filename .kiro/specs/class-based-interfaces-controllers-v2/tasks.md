# Implementation Plan: Class-Based Interfaces & Controllers (ADR-005 v2)

## Overview

Migrate the thermidor package from factory-function frozen object literals to a class-based internal architecture using non-exported symbols for internal access. The migration proceeds incrementally: base classes first, then concrete implementations, then cleanup. The public API remains unchanged throughout.

## Tasks

- [x] 1. Create base classes and update core types
  - [x] 1.1 Update symbols module — remove `KIND`, `INTERFACES`, `FACADE_RESOLVERS` exports; retain `ENGINE`, `STATE_ID`, `TYPE`, `SOURCE_ENGINE`
    - Modify `src/core/interface/utils/symbols.ts`
    - Remove the three unused symbol exports
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 1.2 Update type definitions — replace old `Interface`, `ComposedInterface`, `Supports` types with new structural `Supports<F>` type and `FacadeResolverFactory`
    - Modify `src/core/interface/utils/interface-types.ts`
    - Remove old `Interface<T>` and `ComposedInterface<T>` interfaces that use `KIND`, `INTERFACES`, `FACADE_RESOLVERS`
    - Add `FacadeResolverFactory` type: `(engine: FullEngine) => FacadeResolver`
    - Replace `Supports<F>` with the structural type requiring `[STATE_ID]`, `resolveFacades()`, and `dispose()`
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 1.3 Create `BaseInterface<T>` abstract class
    - Create new file `src/core/interface/base-interface.ts`
    - Implement symbol-keyed properties `[ENGINE]`, `[STATE_ID]`, `[TYPE]` initialized via constructor
    - Implement abstract `resolvers` getter returning `Record<Facades[T], FacadeResolverFactory>`
    - Implement `resolveFacades(facade, composedInterfaceId?)` with internal `#facadeCache` Map
    - Implement `dispose()` that sets `#disposed = true` and clears cache
    - Implement `disposed` getter
    - Throw error in `resolveFacades` when disposed
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 1.4 Create `BaseController<TState>` abstract class
    - Create new file `src/core/interface/base-controller.ts`
    - Implement `Controller<TState>` interface
    - Provide `protected engine: FullEngine` property
    - Accept `(engine, stateSelector)` in constructor
    - Implement `get state()` delegating to `engine.read(stateSelector)`
    - Implement `subscribe(callback)` delegating to `engine.subscribe(stateSelector, callback)`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x]* 1.5 Write unit tests for `BaseInterface`
    - **Property 1: Symbol-keyed properties reflect constructor arguments**
    - **Property 2: resolveFacades returns consistent cached references (idempotence)**
    - **Property 3: Disposed interface rejects all thunk resolution**
    - **Validates: Requirements 1.1, 1.3, 1.4, 1.5, 1.6, 1.7**

  - [x]* 1.6 Write unit tests for `BaseController`
    - **Property 6: BaseController delegates state access to engine**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 2. Migrate concrete interface classes
  - [x] 2.1 Update facade resolver factories to match `FacadeResolverFactory` signature
    - Modify `src/core/interface/api/search/search-facade.ts` — change to `(engine) => (scope) => EndpointThunk`
    - Modify query-suggest, commerce-search, and commerce-query-suggest facades similarly
    - Remove usage of `createFacadeCache` utility from all facade files
    - _Requirements: 1.2, 1.3_

  - [x] 2.2 Rewrite `SearchInterface` as a class extending `BaseInterface<'search'>`
    - Rewrite `src/public/interfaces/search.ts`
    - Define `resolverFactories` Record mapping `search` and `suggestions` to resolver factories
    - Implement `get resolvers()` returning the factories Record
    - Retain `buildSearchInterface()` factory function — construct SearchInterface instance, adopt search-parameters slice
    - Export `SearchInterface` class as a type (for consumer type annotations)
    - _Requirements: 2.1, 2.5_

  - [x] 2.3 Rewrite `CommerceInterface` as a class extending `BaseInterface<'commerce'>`
    - Rewrite `src/public/interfaces/commerce.ts`
    - Same pattern as SearchInterface with commerce-specific resolver factories
    - Retain `buildCommerceInterface()` factory function
    - _Requirements: 2.2, 2.6_

  - [x] 2.4 Rewrite `GenerativeInterface` as a class extending `BaseInterface<'generative'>`
    - Rewrite `src/public/interfaces/generative.ts`
    - Add `[SOURCE_ENGINE]` readonly property referencing the original Engine
    - Use noop conversation resolver factory
    - Retain `buildGenerativeInterface()` factory function — invoke generative loader
    - _Requirements: 2.3, 2.4, 2.7_

  - [x] 2.5 Rewrite `ComposedInterface` as a standalone class implementing `Supports<F>`
    - Rewrite `src/public/interfaces/compose.ts`
    - Create `ComposedInterface<T>` class with `[STATE_ID]`, `resolveFacades(facade, composedInterfaceId?)`, and `dispose()` (no-op)
    - Constructor accepts validated sub-interfaces array and composedId
    - `resolveFacades` flat-maps sub-interface `resolveFacades` calls passing composed ID
    - Validate non-empty array, same engine, same type in `composeInterfaces()` factory
    - `composeInterfaces()` instantiates `new ComposedInterface(interfaces, generateId())`
    - Export `ComposedInterface<T>` class
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x]* 2.6 Write unit tests for `ComposedInterface`
    - **Property 4: ComposedInterface delegates to all sub-interfaces**
    - **Property 8: composeInterfaces validates homogeneity**
    - **Validates: Requirements 3.1, 3.2, 3.4, 3.5, 3.6**

- [x] 3. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Migrate controllers to extend BaseController
  - [x] 4.1 Migrate `SearchBoxControllerImpl` to extend `BaseController`
    - Rewrite `src/public/controllers/search-box/search-box-controller.ts`
    - Extend `BaseController<SearchBoxControllerState>`
    - Use `options.interface[ENGINE]` and `options.interface[STATE_ID]` for engine/stateId access
    - Use `options.interface.resolveFacades('search')` instead of `resolveFacades`
    - Retain `setQuery` and `submit` methods using `this.engine.mutate(...)`
    - _Requirements: 6.1, 6.7_

  - [x] 4.2 Migrate `ResultListControllerImpl` to extend `BaseController`
    - Rewrite `src/public/controllers/result-list/result-list-controller.ts`
    - Extend `BaseController<ResultListControllerState>`
    - Read-only controller — only needs state/subscribe from base class
    - _Requirements: 6.2, 6.7_

  - [x] 4.3 Migrate `ProductListControllerImpl` to extend `BaseController`
    - Rewrite `src/public/controllers/product-list/product-list-controller.ts`
    - Extend `BaseController<ProductListControllerState>`
    - Read-only controller — same pattern as ResultList
    - _Requirements: 6.3, 6.7_

  - [x] 4.4 Migrate `PaginationControllerImpl` to extend `BaseController`
    - Rewrite `src/public/controllers/pagination/pagination-controller.ts`
    - Extend `BaseController<PaginationControllerState>`
    - Retain `selectPage` and `setPageSize` methods
    - _Requirements: 6.4, 6.7_

  - [x] 4.5 Migrate `CartControllerImpl` to extend `BaseController`
    - Rewrite `src/public/controllers/cart/cart-controller.ts`
    - Extend `BaseController<CartControllerState>`
    - Retain `setItems` and `updateItemQuantity` methods
    - _Requirements: 6.5, 6.7_

  - [x] 4.6 Migrate `ConverseControllerImpl` to extend `BaseController`
    - Rewrite `src/public/controllers/converse/converse-controller.ts`
    - Extend `BaseController<ConverseControllerState>`
    - Retain `submit`, `selectTurn`, `retry` methods and `GenerativeRuntime` integration
    - Access `[SOURCE_ENGINE]` from GenerativeInterface for hydration
    - _Requirements: 6.6, 6.7_

  - [x]* 4.7 Write unit tests for migrated controllers
    - **Property 5: Supports<F> structural compatibility** — verify controllers accept both class instances and composed objects
    - Test SearchBoxController `setQuery`/`submit` behavior
    - Test PaginationController `selectPage`/`setPageSize` behavior
    - **Validates: Requirements 4.4, 6.1, 6.4**

- [x] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Add Engine.dispose() and cleanup
  - [x] 6.1 Add `dispose()` method to `Engine` class
    - Modify `src/core/interface/engine/engine.ts`
    - Add `#disposed` flag, `disposed` getter, `#assertNotDisposed()` private method
    - Guard `mutate`, `read`, `subscribe`, `adoptSlice` with `#assertNotDisposed()`
    - In `dispose()`: nullify store, rootReducer, adoptedSlices, clear hydration snapshots, delete from `fullEngineWrappers`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x]* 6.2 Write unit tests for `Engine.dispose()`
    - **Property 7: Disposed engine rejects all operations**
    - Test that `mutate`, `read`, `subscribe`, `adoptSlice` all throw after `dispose()`
    - Test that `disposed` getter returns correct state
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

  - [x] 6.3 Delete dead code files
    - Delete `src/core/interface/utils/facade-cache.ts`
    - Delete `src/core/interface/utils/resolve-facades.ts`
    - Remove any remaining imports of these files across the codebase
    - _Requirements: 9.1, 9.2_

  - [x] 6.4 Remove sub-path exports from `package.json`
    - Modify `packages/thermidor/package.json`
    - Remove `./interfaces/commerce`, `./interfaces/compose`, `./interfaces/generative`, `./interfaces/search` entries
    - Retain only `"."` and `"./package.json"` entries
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 6.5 Update `src/index.ts` public API exports
    - Ensure `buildSearchInterface`, `buildCommerceInterface`, `buildGenerativeInterface`, `composeInterfaces` are exported
    - Ensure `Engine`, `EngineOptions`, `Supports`, `InterfaceType` types are exported
    - Export updated `SearchInterface`, `CommerceInterface`, `GenerativeInterface`, `ComposedInterface` as types
    - Verify symbols (`ENGINE`, `STATE_ID`, `TYPE`, `SOURCE_ENGINE`) are NOT re-exported
    - Verify `BaseInterface` and `BaseController` are NOT re-exported
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [x] 7. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The public API remains unchanged throughout — factory functions are the consumer-facing entry points
- TypeScript is used for all implementation (existing project language)
- All facade resolver files need their signature updated before interface classes can consume them

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5", "1.6", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 4, "tasks": ["2.5"] },
    { "id": 5, "tasks": ["2.6", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "id": 6, "tasks": ["4.7"] },
    { "id": 7, "tasks": ["6.1", "6.3"] },
    { "id": 8, "tasks": ["6.2", "6.4", "6.5"] }
  ]
}
```
