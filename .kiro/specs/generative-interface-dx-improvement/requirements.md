# Requirements Document

## Introduction

This feature removes the need for developers to pass controller builders (e.g., `buildProductListController`, `buildResultListController`) as options when calling `buildGenerativeInterface`. Currently, the generative interface requires upfront registration of controller builders for sub-interface hydration, which is inconsistent with other interface types (`buildCommerceInterface`, `buildSearchInterface`) that only require `{engine, id?}`. The goal is to align the generative interface DX with other interfaces while preserving tree-shaking and hydration functionality.

## Glossary

- **Generative_Interface**: The interface object created by `buildGenerativeInterface` that manages conversational interactions with the `/converse` SSE endpoint
- **Sub_Interface**: A child interface (commerce or search) created during hydration when an ACTIVITY_SNAPSHOT arrives with a recognized activity type
- **Builder_Registry**: The current mechanism that stores arrays of controller builder functions per use-case on the generative interface
- **Hydration**: The process of creating a sub-interface, adopting slices, and dispatching snapshot data into the store when a routed ACTIVITY_SNAPSHOT arrives
- **Controller_Builder**: A function (e.g., `buildProductListController`) that creates a controller by adopting a slice and setting up selectors against a given interface
- **ACTIVITY_SNAPSHOT**: An SSE event from the `/converse` endpoint indicating the prompt was routed to a known API and contains response data
- **Tree_Shaking**: Bundler optimization that eliminates unused code; if a controller builder is never imported, its associated slice code is excluded from the bundle
- **Converse_Controller**: The public controller that manages the conversational lifecycle (submit, retry, selectTurn) and consumes the SSE stream
- **Engine**: The Redux store wrapper that supports slice adoption, pub/sub, and state reading
- **Routed_Interface**: The object stored on a turn containing the use-case key and the hydrated Sub_Interface

## Requirements

### Requirement 1: Simplified Generative Interface Construction

**User Story:** As a developer, I want to build a generative interface without specifying controller builders upfront, so that the API is consistent with other interface types.

#### Acceptance Criteria

1. THE Generative_Interface SHALL accept construction options containing only `engine` and an optional `id`, where `engine` is a valid Engine instance and `id` is a string identifier (maximum 128 characters)
2. WHEN `buildGenerativeInterface` is called with only `{engine}` or `{engine, id}` and no Builder_Registry, THE Generative_Interface SHALL return a valid GenerativeInterface object without throwing an error
3. THE Generative_Interface SHALL not accept the `options` property containing `commerceSearchControllers` or `searchControllers` arrays, and THE type signature SHALL not include those fields (breaking change is acceptable). IF legacy code passes these fields, THE function SHALL silently ignore them and proceed with construction
4. IF a routed response (commerce-search or search activity) arrives on a Generative_Interface, THEN THE Hydration module SHALL create an inert Sub_Interface (containing the hydrated snapshot data but no controller logic) and SHALL return a valid RoutedInterface containing the use-case key and hydrated sub-interface

### Requirement 2: Deferred Hydration via Controller Building

**User Story:** As a developer, I want controllers built against routed sub-interfaces to work correctly without upfront registration, so that I only import what I use.

#### Acceptance Criteria

1. WHEN an ACTIVITY_SNAPSHOT with an activity type present in the recognized activity type map arrives, THE Hydration module SHALL create the use-case-specific Sub_Interface, dispatch the `hydrateFromSnapshot` action with the snapshot payload into the Engine store, and return the Sub_Interface paired with its use-case key
2. IF an ACTIVITY_SNAPSHOT arrives with an activity type not present in the recognized activity type map, THEN THE Hydration module SHALL return null without creating a Sub_Interface or dispatching any action
3. WHEN a developer builds a controller against a previously hydrated Sub_Interface, THE Controller_Builder SHALL adopt its slice into the Engine store and expose state that reflects the snapshot data already dispatched during hydration. IF slice adoption or data reflection fails partway through, THE system SHALL allow partial adoption rather than failing atomically
4. THE Hydration module SHALL dispatch the `hydrateFromSnapshot` action into the Sub_Interface store without requiring any controller builders to be invoked beforehand or registered in advance for the target Sub_Interface
5. WHEN a Controller_Builder adopts a slice that was already adopted for the same Sub_Interface, THE Engine SHALL treat the duplicate adoption as a no-op and preserve the existing slice state

### Requirement 3: Tree-Shaking Preservation

**User Story:** As a developer, I want unused controller code to be excluded from my production bundle, so that my application remains optimally sized.

#### Acceptance Criteria

1. WHILE a developer does not import `buildProductListController`, THE bundler SHALL exclude the product-list slice module and its associated actions module from the final bundle
2. WHILE a developer does not import `buildResultListController`, THE bundler SHALL exclude the result-list slice module and its associated actions module from the final bundle
3. THE Hydration module (`generative-hydration`) SHALL not contain static import statements referencing any feature-specific slice modules (product-list slice, result-list slice, or any future feature slice)
4. THE feature-specific slice modules SHALL import the hydration action creator from the Hydration module (not the reverse), so that the dependency edge points from slice toward hydration and the bundler can eliminate the slice when no controller references it
5. WHEN a production bundle is produced with only a subset of controllers imported, THE bundler SHALL produce a bundle whose parsed size for the unused feature slice modules is zero bytes, as verified by bundle-analysis tooling (e.g., a build-time import graph check or bundle-size snapshot test)

### Requirement 4: Slice Adoption After Hydration

**User Story:** As a developer, I want controllers to correctly read hydrated state even when built after the snapshot has been dispatched, so that the rendering order does not affect correctness.

#### Acceptance Criteria

1. WHEN a Controller_Builder adopts a slice after the `hydrateFromSnapshot` action has already been dispatched for that sub-interface, THE Engine SHALL initialize the slice state from the stored snapshot content so that the slice reducer produces the same state as if it had been present before dispatch
2. WHEN a controller subscribes to state after hydration has occurred, THE controller SHALL return state derived from the snapshot content (e.g., products array for a ProductList slice, results array for a Results slice) within the same synchronous execution frame as the subscription call
3. IF the `hydrateFromSnapshot` action is dispatched and the snapshot content does not contain data relevant to a late-adopted slice, THEN THE Engine SHALL initialize that slice with its default initial state without error
4. IF a slice is adopted after `hydrateFromSnapshot` has been dispatched, THEN THE Engine SHALL ensure that subscribers registered on that slice receive a callback reflecting the hydrated state within 1 synchronous dispatch cycle of the adoption

### Requirement 5: Backward-Compatible Hydration Triggering

**User Story:** As a developer, I want the hydration flow to continue working automatically when routed snapshots arrive, so that I do not need to manually trigger hydration in my component code.

#### Acceptance Criteria

1. WHEN the Generative_Runtime receives an ACTIVITY_SNAPSHOT event with an activity type present in the ACTIVITY_TYPE_TO_USE_CASE mapping (i.e., `commerce-search-api-response` or `search-api-response`), THE Generative_Runtime SHALL always invoke the Hydration module which creates a Sub_Interface, dispatches the snapshot data into it, and stores the resulting Routed_Interface on the turn via the state port
2. WHEN the Hydration module successfully creates a Routed_Interface for a turn, THE Generative_Runtime SHALL mark that turn's status as `complete`
3. WHEN a turn has a Routed_Interface stored, THE Converse_Controller SHALL always expose it on the turn state (regardless of turn status or other conditions) such that the developer can access the Sub_Interface at `turn.routedInterface.interface` and pass it to controller builder functions (e.g., `buildResultListController`, `buildProductListController`) with no additional hydration calls required
4. IF the Generative_Runtime receives an ACTIVITY_SNAPSHOT event with an activity type NOT present in the ACTIVITY_TYPE_TO_USE_CASE mapping, THEN THE Generative_Runtime SHALL treat the snapshot content as an opaque A2UI surface and append it to the turn's agent response without creating a Sub_Interface

### Requirement 6: API Consistency Across Interface Types

**User Story:** As a developer, I want all interface builders to follow the same pattern, so that the API is predictable and easy to learn.

#### Acceptance Criteria

1. THE `buildGenerativeInterface` function SHALL accept a single options object containing only `engine` (of type `Engine`) and an optional `id` (of type `string`), matching the parameter shape of `buildSearchInterface` and `buildCommerceInterface`
2. THE `BuildGenerativeInterfaceOptions` type SHALL not include the `options` property, `commerceSearchControllers`, `searchControllers`, or any other controller-specific configuration fields
3. WHEN migrating from the current API, THE developer SHALL achieve a successful TypeScript compilation by removing the `options` property from the `buildGenerativeInterface` call with no other code changes required to the call site
4. IF a developer passes an unrecognized property (such as the removed `options` property) to `buildGenerativeInterface`, THEN THE TypeScript compiler SHALL report a type error at compile time

### Requirement 7: Removal of Builder Registry

**User Story:** As a developer maintaining the headless-future package, I want to remove the Builder_Registry concept from the codebase, so that the architecture is simpler and has fewer indirection layers.

#### Acceptance Criteria

1. THE Generative_Interface object SHALL not contain a `BUILDER_REGISTRY` symbol property, and THE `BUILDER_REGISTRY` symbol SHALL be removed from the symbols module
2. THE `createHydrateSubInterface` function SHALL accept only an `engine` parameter and SHALL not accept a `BuilderRegistry` parameter
3. THE `GenerativeInterfaceOptions` type, `ControllerBuilder` type, and `BuilderRegistry` interface SHALL be removed from the public API exports
4. THE `buildConverseController` function SHALL not read a `BUILDER_REGISTRY` property from the Generative_Interface and SHALL not pass a builder registry to the Generative_Runtime configuration
5. THE `buildGenerativeInterface` function SHALL not require controller builder arrays in its options and SHALL not store a builder registry on the returned interface object

### Requirement 8: Sub-Interface Use-Case Discrimination

**User Story:** As a developer rendering routed results, I want to know what type of sub-interface was created (e.g., commerce search vs. search), so that I can render the appropriate UI component and build the correct controllers against it.

#### Acceptance Criteria

1. THE Routed_Interface object SHALL expose a `useCase` field of type `RoutedUseCase` (a union of `'commerceSearch' | 'search'`) that identifies the feature domain of the hydrated Sub_Interface
2. WHEN the activity type `commerce-search-api-response` is received, THE Routed_Interface SHALL set `useCase` to `'commerceSearch'`
3. WHEN the activity type `search-api-response` is received, THE Routed_Interface SHALL set `useCase` to `'search'`
4. THE developer SHALL use the `useCase` field to conditionally render feature-specific components and build the appropriate controllers (e.g., `buildProductListController` for `'commerceSearch'`, `buildResultListController` for `'search'`)

### Requirement 9: Public API Surface Encapsulation

**User Story:** As a developer consuming headless-future, I want the public type surface to only expose types I need to interact with, so that internal implementation details do not leak into my application's type dependencies.

#### Acceptance Criteria

1. _(Optional, best-effort)_ THE `FullEngine` type SHOULD not appear in the public `.d.ts` output or be reachable through any publicly exported type (e.g., `Interface`, `Requires`, `GenerativeInterface`). IF a simple solution is not feasible without major refactoring, this criterion MAY be deferred
2. THE `Operations` type and `EndpointStateScope` type SHALL be removed from the package's public exports in `index.ts`
3. _(Optional, best-effort)_ THE public `Interface` type SHOULD use an opaque type (e.g., `unknown`) for symbol-keyed properties that reference internal engine or thunk types. IF this introduces excessive internal casting complexity, this criterion MAY be deferred
4. WHEN a consumer inspects the type of an Interface object (e.g., via IDE hover or `.d.ts` inspection), THEY SHOULD not see `FullEngine`, `adoptSlice`, `mutate`, `read`, or other internal engine methods in the type signature (best-effort)
