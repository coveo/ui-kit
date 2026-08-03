# Requirements Document

## Introduction

This feature adds surface hydration to the `UnifiedRuntime`. When the unified endpoint returns an `ACTIVITY_SNAPSHOT` event with `activityType: "a2ui-surface"` containing `createSurface` operations, the runtime hydrates a live `CommerceInterface` from the surface's data model. This allows existing controllers (pagination, facets, sort) to attach to the hydrated interface. The feature also handles `updateDataModel` operations to incrementally update an already-hydrated surface's state.

This is Task 4 of the unified endpoint integration plan. It does NOT include the real facade resolver (Task 5); the hydrated interface uses a noop facade resolver for now.

## Glossary

- **UnifiedRuntime**: The runtime class that processes the AG-UI stream from the unified endpoint and dispatches events to the state port.
- **ACTIVITY_SNAPSHOT**: An AG-UI protocol event that carries opaque surface data. When `activityType` is `"a2ui-surface"`, it contains structured operations.
- **CommerceInterface**: A sub-interface that manages commerce search state (products, facets, pagination, sort) and exposes facade resolvers for executing searches.
- **RoutedInterfaceRegistry**: A registry that maps turn IDs to hydrated interface entries, allowing the public turn shape to expose the live interface instance.
- **RoutedInterfaceEntry**: A registry entry containing a use case, interface instance, snapshot, query, and optionally a surface ID.
- **Surface_Hydration**: The process of creating a `CommerceInterface` from a `createSurface` operation's `dataModel` and populating its state via the commerce search response handler.
- **Facade_Resolver**: A factory that produces endpoint thunks for a given scope. A noop facade resolver returns a thunk that does nothing.
- **DataModel**: The structured response data within a `createSurface` operation, containing products, facets, pagination, sort, triggers, and query correction.
- **StatePort**: The interface through which the runtime mutates generative turn state (create turns, append surfaces, fail turns, etc.).

## Requirements

### Requirement 1: Hydrate CommerceInterface from createSurface operations

**User Story:** As a consumer of the generative interface, I want ACTIVITY_SNAPSHOT events with surface operations to produce a live CommerceInterface, so that existing controllers (pagination, facets, sort) can attach and render commerce results.

#### Acceptance Criteria

1. WHEN an ACTIVITY_SNAPSHOT event with `activityType` equal to `"a2ui-surface"` and a `createSurface` operation is received, THE UnifiedRuntime SHALL create a CommerceInterface and populate its state from the operation's `dataModel`.
2. WHEN the CommerceInterface is hydrated, THE UnifiedRuntime SHALL dispatch products from `dataModel.products` into the interface's product list state.
3. WHEN the CommerceInterface is hydrated, THE UnifiedRuntime SHALL dispatch pagination from `dataModel.pagination` (page, perPage, totalEntries, totalPages) into the interface's pagination state.
4. WHEN the CommerceInterface is hydrated, THE UnifiedRuntime SHALL dispatch facets from `dataModel.facets` into the interface's facets state.
5. WHEN the CommerceInterface is hydrated, THE UnifiedRuntime SHALL dispatch sort from `dataModel.sort` (appliedSort, availableSorts) into the interface's sort state.
6. WHEN the CommerceInterface is hydrated, THE UnifiedRuntime SHALL dispatch triggers from `dataModel.triggers` into the interface's triggers state.
7. WHEN the CommerceInterface is hydrated and `dataModel.queryCorrection` is present, THE UnifiedRuntime SHALL dispatch the query correction into the interface's query correction state.

### Requirement 2: Register hydrated interface with surfaceId

**User Story:** As a consumer of the generative interface, I want each hydrated surface to be identifiable by its `surfaceId`, so that subsequent operations can target the correct interface.

#### Acceptance Criteria

1. THE RoutedInterfaceEntry type SHALL support an optional `surfaceId` field of type string.
2. WHEN a CommerceInterface is hydrated from a `createSurface` operation, THE UnifiedRuntime SHALL register the interface in the RoutedInterfaceRegistry with the `surfaceId` from the operation.
3. WHEN a CommerceInterface is registered, THE RoutedInterfaceEntry SHALL contain the `useCase` set to `"commerceSearch"`, the interface instance, the data model as snapshot, and the `surfaceId`.

### Requirement 3: Handle updateDataModel operations

**User Story:** As a consumer of the generative interface, I want `updateDataModel` operations to update the existing hydrated interface's state, so that the UI reflects incremental server-side changes.

#### Acceptance Criteria

1. WHEN an `updateDataModel` operation is received for a `surfaceId` that has a registered hydrated interface, THE UnifiedRuntime SHALL update the corresponding interface's state with the new data.
2. IF an `updateDataModel` operation is received for a `surfaceId` that has no registered hydrated interface, THEN THE UnifiedRuntime SHALL ignore the update without error.
3. WHEN an `updateDataModel` operation has path `/` (root), THE UnifiedRuntime SHALL treat the value as a full data model replacement and re-run the complete response handler.
4. WHEN an `updateDataModel` operation has a path that does not correspond to a known section (e.g., `/responseId`), THE UnifiedRuntime SHALL silently ignore it.

### Requirement 4: Preserve opaque surface storage

**User Story:** As a consumer of the generative interface, I want the activity snapshot to still be stored as an opaque surface for UI rendering, so that downstream components can access the raw surface data.

#### Acceptance Criteria

1. WHEN an ACTIVITY_SNAPSHOT with `activityType` equal to `"a2ui-surface"` is received, THE UnifiedRuntime SHALL store the activity snapshot content as an opaque surface via `appendSurface` in addition to performing hydration.
2. WHEN an ACTIVITY_SNAPSHOT with an `activityType` other than `"a2ui-surface"` is received, THE UnifiedRuntime SHALL store the content as an opaque surface without performing hydration.

### Requirement 5: Use noop facade resolver

**User Story:** As a developer implementing the unified endpoint incrementally, I want the hydrated CommerceInterface to use a noop facade resolver, so that the interface is read-only until Task 5 wires the real unified search thunk.

#### Acceptance Criteria

1. THE hydrated CommerceInterface SHALL use a noop facade resolver for the `search` facade that returns a thunk performing no operation.
2. WHEN a controller triggers a search action on the hydrated CommerceInterface, THE noop facade resolver SHALL not make any network requests or modify state.

### Requirement 6: Support multiple surfaces per turn

**User Story:** As a consumer of the generative interface, I want the runtime to handle multiple `createSurface` operations within a single ACTIVITY_SNAPSHOT, so that complex responses with multiple surfaces are fully hydrated.

#### Acceptance Criteria

1. WHEN an ACTIVITY_SNAPSHOT contains multiple `createSurface` operations, THE UnifiedRuntime SHALL hydrate a separate CommerceInterface for each operation.
2. WHEN multiple surfaces are hydrated, THE UnifiedRuntime SHALL register each in the RoutedInterfaceRegistry with its respective `surfaceId`.

### Requirement 7: Surface re-creation

**User Story:** As a consumer, I want the runtime to handle re-creation of a surface with the same surfaceId, so that new search contexts produce fresh interfaces without leaking the old one.

#### Acceptance Criteria

1. WHEN a `createSurface` operation arrives for a `surfaceId` that already exists in the surface tracking map, THE UnifiedRuntime SHALL dispose the old CommerceInterface before creating and registering the new one.
2. WHEN a surface is re-created, THE UnifiedRuntime SHALL replace the entry in the surface tracking map with the new interface.
