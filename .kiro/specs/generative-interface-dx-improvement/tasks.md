# Implementation Plan: Generative Interface DX Improvement

## Overview

Simplify `buildGenerativeInterface` to accept only `{engine, id?}` by removing the Builder Registry, adding a snapshot-cache + re-dispatch mechanism on the Engine for order-independent hydration, and cleaning up the public API surface. Changes are confined to the generative interface, engine, hydration module, converse controller, and public exports.

## Tasks

- [x] 1. Engine enhancement — Add snapshot cache and re-dispatch on adoption
  - [x] 1.1 Add `storeHydrationSnapshot` method and snapshot cache to Engine
    - Add private `#hydrationSnapshots = new Map<string, Record<string, unknown>>()` field
    - Implement `storeHydrationSnapshot(interfaceId, content)` that stores snapshot in the map
    - Expose `storeHydrationSnapshot` on the `FullEngine` type and the `getFullEngine` wrapper
    - _Requirements: 4.1, 4.2_

  - [x] 1.2 Add re-dispatch logic to `#adoptSlice`
    - After `this.#rootReducer.inject(slice)` and the `@@engine/ADOPT_SLICE` dispatch, extract the interface ID from the slice name using `lastIndexOf('/')`
    - If a snapshot exists for that interface ID, call `getOrCreateHydrateFromSnapshotAction(interfaceId)` and dispatch the hydrate action
    - Import `getOrCreateHydrateFromSnapshotAction` from `generative-hydration.ts`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]\* 1.3 Write property test for idempotent slice adoption (Property 5)
    - **Property 5: Idempotent slice adoption**
    - Generate random slice instances via `getOrCreateProductListSlice` with random IDs, adopt twice, assert state is identical before and after duplicate call
    - **Validates: Requirements 2.5**

  - [ ]\* 1.4 Write property test for late-adoption state equivalence (Property 4)
    - **Property 4: Late-adoption state equivalence (order independence)**
    - Generate random snapshot payloads, compare state of slice adopted before hydrate dispatch vs. slice adopted after hydrate dispatch — they must be equal
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 2.3**

- [x] 2. Type system changes — Remove BuilderRegistry, update RoutedInterface
  - [x] 2.1 Remove `BUILDER_REGISTRY` symbol from `symbols.ts`
    - Delete the `BUILDER_REGISTRY` export from `packages/headless-future/src/core/interface/utils/symbols.ts`
    - _Requirements: 7.1_

  - [x] 2.2 Update `RoutedInterface` to discriminated union in `generative-types.ts`
    - Add `UseCaseInterfaceMap` mapped type
    - Redefine `RoutedInterface` as `{ [K in RoutedUseCase]: { useCase: K; interface: UseCaseInterfaceMap[K] } }[RoutedUseCase]`
    - Remove `ControllerBuilder` type and `GenerativeInterfaceOptions` interface from this file
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 7.3_

  - [x] 2.3 Remove `Operations` and `EndpointStateScope` from public exports in `index.ts`
    - Remove `Operations` and `EndpointStateScope` from the `export type` statement referencing `interface-types.js`
    - Remove `ControllerBuilder`, `GenerativeInterfaceOptions` from the generative-types exports
    - Remove `BuilderRegistry` from the generative.ts exports
    - _Requirements: 9.2, 7.3_

- [x] 3. Hydration module refactor
  - [x] 3.1 Refactor `createHydrateSubInterface` to remove builder registry parameter
    - Change signature to `createHydrateSubInterface(engine: Engine): HydrateSubInterface`
    - Remove `builderRegistry` parameter and the builder invocation loop
    - Remove `ACTIVITY_TYPE_TO_USE_CASE` map (no longer needed)
    - Remove import of `BuilderRegistry` and `GenerativeInterfaceOptions`
    - _Requirements: 7.2, 2.4_

  - [x] 3.2 Add snapshot storage and dispatch logic to hydration function
    - After building the sub-interface, call `fullEngine.storeHydrationSnapshot(subId, contentRecord)`
    - Then dispatch `hydrateAction(contentRecord)` as before
    - Branch by use case: `commerceSearch` → `buildCommerceInterface`, `search` → `buildSearchInterface`
    - Return typed discriminated union variants with `as const`
    - _Requirements: 2.1, 1.4, 4.1_

  - [ ]\* 3.3 Write property test for hydration with recognized activity types (Property 2)
    - **Property 2: Hydration produces valid RoutedInterface for recognized activity types**
    - Pick from recognized activity types, generate arbitrary `Record<string, unknown>` payloads, assert non-null return with correct useCase and valid sub-interface
    - **Validates: Requirements 1.4, 2.1, 2.4, 8.1**

  - [ ]\* 3.4 Write property test for hydration with unrecognized activity types (Property 3)
    - **Property 3: Hydration returns null for unrecognized activity types**
    - Generate arbitrary strings excluding the two recognized types, assert null return with no side effects
    - **Validates: Requirements 2.2**

- [x] 4. Converse controller update
  - [x] 4.1 Remove `BUILDER_REGISTRY` usage from `buildConverseController`
    - Remove import of `BUILDER_REGISTRY` from symbols
    - Remove `const builderRegistry = options.interface[BUILDER_REGISTRY]` line
    - Change `createHydrateSubInterface(sourceEngine, builderRegistry)` to `createHydrateSubInterface(sourceEngine)`
    - _Requirements: 7.4_

- [x] 5. Simplify `buildGenerativeInterface`
  - [x] 5.1 Rewrite `buildGenerativeInterface` to accept only `{engine, id?}`
    - Update `BuildGenerativeInterfaceOptions` to `{ engine: Engine; id?: string }`
    - Remove `options` property handling, builder registry construction, and the validation error
    - Remove `BUILDER_REGISTRY` from the returned frozen object
    - Remove import of `BUILDER_REGISTRY` symbol, `ControllerBuilder`, `GenerativeInterfaceOptions`
    - Remove `BuilderRegistry` interface from this file
    - Update `GenerativeInterface` type to remove `[BUILDER_REGISTRY]` property
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.2, 6.3, 6.4, 7.5_

  - [ ]\* 5.2 Write property test for construction (Property 1)
    - **Property 1: Construction succeeds for all valid inputs**
    - Generate arbitrary strings for `id` (unicode, empty, max-length 128), construct with minimal valid Engine, assert frozen interface returned with valid STATE_ID and ENGINE
    - **Validates: Requirements 1.1, 1.2, 6.1**

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Public export cleanup and type encapsulation
  - [x] 7.1 Clean up `index.ts` exports
    - Verify `Operations`, `EndpointStateScope`, `ControllerBuilder`, `GenerativeInterfaceOptions`, `BuilderRegistry` are removed (done in 2.3)
    - Ensure `Turn`, `TurnStatus`, `AgentResponse`, `AgentMessage`, `A2UISurface`, `ToolCall`, `ToolCallStatus`, `RoutedInterface`, `RoutedUseCase` remain exported
    - Ensure `Interface`, `ComposedInterface`, `Requires` remain exported
    - _Requirements: 9.2, 7.3_

  - [x] 7.2 (Best-effort) Hide `FullEngine` from public Interface type
    - Replace `FullEngine` with `unknown` in the public `Interface`, `ComposedInterface`, and `Requires` type definitions for symbol-keyed properties (`[ENGINE]`)
    - Internal modules that need `FullEngine` access use direct imports and cast as needed
    - _Requirements: 9.1, 9.3, 9.4_

- [x] 8. Sample app update
  - [x] 8.1 Simplify `generative-setup.ts` in conversation-react sample
    - Change `buildGenerativeInterface({engine, options: {...}})` to `buildGenerativeInterface({engine})`
    - Remove unused imports of `buildProductListController` and `buildResultListController` from the setup file (controllers are built lazily in components)
    - _Requirements: 1.1, 6.3_

- [ ] 9. Integration tests and final verification
  - [ ]\* 9.1 Write unit tests for simplified `buildGenerativeInterface`
    - Test construction with only `{engine}`, with `{engine, id}`, and verify BUILDER_REGISTRY is absent
    - Test that legacy `options` field is silently ignored if passed at runtime
    - _Requirements: 1.2, 1.3, 7.1, 7.5_

  - [ ]\* 9.2 Write unit tests for updated hydration module
    - Test that `createHydrateSubInterface(engine)` accepts single param
    - Test activity type mapping correctness for both commerce-search and search
    - Test null return for unrecognized types
    - _Requirements: 7.2, 8.2, 8.3, 2.2_

  - [ ]\* 9.3 Write integration test for end-to-end hydrate → late build → read state
    - Create engine, build generative interface, simulate ACTIVITY_SNAPSHOT, then build controller after hydration, verify controller state reflects snapshot data
    - _Requirements: 2.3, 4.1, 5.1, 5.2, 5.3_

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The `FullEngine` encapsulation (7.2) is best-effort per Requirement 9.1/9.3 — defer if casting complexity is excessive
- Tree-shaking guarantees (Req 3.x) are validated by the dependency graph structure (no reverse imports) and can be confirmed with a bundle-size snapshot test post-implementation

## Task Dependency Graph

```json
{
  "waves": [
    {"id": 0, "tasks": ["1.1", "2.1", "2.2"]},
    {"id": 1, "tasks": ["1.2", "2.3", "5.1"]},
    {"id": 2, "tasks": ["3.1", "4.1", "1.3", "1.4"]},
    {"id": 3, "tasks": ["3.2", "5.2"]},
    {"id": 4, "tasks": ["3.3", "3.4", "7.1", "7.2"]},
    {"id": 5, "tasks": ["8.1"]},
    {"id": 6, "tasks": ["9.1", "9.2", "9.3"]}
  ]
}
```
