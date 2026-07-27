# Requirements Document

## Introduction

This document specifies the requirements for adding a Sort Controller to the `@coveo/thermidor` package. The Sort Controller allows consumers to change the sort order of results (relevance, fields, date, etc.) across search interfaces, commerce search interfaces, and generative interfaces. It follows Thermidor's architecture: an internal feature module (`src/internal/features/sort/`), a public controller (`src/public/controllers/sort/`), and public actions (`src/public/actions/sort/`).

The Search API and Commerce Search API have fundamentally different sort contracts:
- **Search API**: Sorting is controlled via a `sortCriteria` string in the request body. The sort state is NOT reflected in the response — the controller must manage state entirely client-side.
- **Commerce Search API**: Sorting uses a structured `sort` object in the request. The response includes a `Sort` object with `appliedSort` and `availableSorts`, enabling response-driven state updates.

Both APIs are unified behind the `CommerceSearchSortCriterion` type (`{sortCriteria: string}`), which serves as a simple wrapper for sort criteria regardless of interface type.

## Glossary

- **Sort_Controller**: A public controller class extending `BaseController` that provides a high-level API for sorting results, exposing the current sort state and methods to change the applied sort criterion.
- **Sort_Actions**: A public action loader function that gives power users direct access to sort mutations without using the controller.
- **Sort_Slice**: The internal Redux Toolkit slice managing sort state (applied sort criterion, available sort criteria).
- **Sort_Criterion**: A descriptor representing a sort order, represented by the `CommerceSearchSortCriterion` type (`{sortCriteria: string}`). For search interfaces, the `sortCriteria` string directly holds values like `"relevancy"`, `"date ascending"`, `"@price descending"`. For commerce interfaces, it holds values corresponding to the Commerce `SortBy` type.
- **Interface_Handle**: An opaque reference to a search, commerce, or generative interface instance that controllers and actions operate on.
- **Supports**: A branded type that constrains which interface types a controller or action can accept, based on the facades they require (e.g., `Supports<'search'>`).
- **Facade**: An endpoint-specific thunk resolver (e.g., `'search'`, `'suggestions'`, `'conversation'`) that triggers an API call when dispatched.
- **Engine**: The Thermidor core state management object that owns the Redux store, slice adoption, and mutation dispatch.
- **Search_Interface**: An interface targeting the Coveo Search API, where sort state is fully client-managed (no sort info returned in API response).
- **Commerce_Interface**: An interface targeting the Coveo Commerce Search API, where the response provides both `appliedSort` and `availableSorts`.
- **Generative_Interface**: An interface targeting generative/conversational endpoints that also returns sort information in responses (similar to Commerce_Interface).

## Requirements

### Requirement 1: Sort Slice State Management

**User Story:** As a Thermidor developer, I want a sort slice that stores the applied sort criterion and available sort criteria, so that the sort state is managed consistently via Thermidor's dynamic slice adoption mechanism.

#### Acceptance Criteria

1. THE Sort_Slice SHALL store an `appliedSort` property representing the currently active Sort_Criterion, defaulting to `null`.
2. THE Sort_Slice SHALL store an `availableSorts` property representing the list of Sort_Criterion values, defaulting to an empty array.
3. WHEN the `updateFromResponse` action is dispatched with a sort payload, THE Sort_Slice SHALL update `appliedSort` and `availableSorts` from the payload.
4. WHEN the `updateFromResponse` action is dispatched with an undefined payload, THE Sort_Slice SHALL retain the current state without modification.
5. WHEN a `sortBy` action is dispatched with a Sort_Criterion, THE Sort_Slice SHALL update `appliedSort` to the provided criterion.
6. WHEN a `sortBy` action is dispatched, THE Sort_Slice SHALL NOT modify the `availableSorts` list.
7. WHEN a `hydrateFromSnapshot` action is dispatched with a payload containing a `sort` object (with `appliedSort` and `availableSorts` properties), THE Sort_Slice SHALL update `appliedSort` and `availableSorts` from the `sort` object in the payload.
8. WHEN a `hydrateFromSnapshot` action is dispatched with a payload that does not contain a `sort` object, THE Sort_Slice SHALL retain the current state without modification.

### Requirement 2: Sort Controller

**User Story:** As a UI developer, I want a Sort Controller that exposes the current sort state and a method to change the applied sort criterion, so that I can build sort UIs across any Thermidor interface type.

#### Acceptance Criteria

1. THE Sort_Controller SHALL accept an `interface` option typed as `Supports<'search'>`, enabling use with search interfaces, commerce interfaces, and generative interfaces alike.
2. WHEN the Sort_Controller is instantiated, THE Sort_Controller SHALL adopt the Sort_Slice for the given interface.
3. THE Sort_Controller SHALL expose a `state` property containing `appliedSort` (the current Sort_Criterion or `null`) and `availableSorts` (the list of available Sort_Criterion values).
4. THE Sort_Controller SHALL expose a `sortBy` method that accepts a Sort_Criterion, updates the applied sort in state, and triggers a search request through the interface facades.
5. THE Sort_Controller SHALL expose an `isSortedBy` method that accepts a Sort_Criterion and returns `true` if it matches the currently applied sort, `false` otherwise.
6. THE Sort_Controller SHALL extend `BaseController` and support subscription-based state observation via the inherited `subscribe` method.
7. WHEN the `sortBy` method is called, THE Sort_Controller SHALL dispatch the `sortBy` mutation and then invoke all resolved `'search'` facade thunks to trigger a new API request.

### Requirement 3: Sort Public Actions

**User Story:** As a power user, I want direct access to sort actions without using the controller, so that I can build custom workflows that involve sorting.

#### Acceptance Criteria

1. THE Sort_Actions module SHALL export a `loadSortActions` function that accepts an options object with an `interface` property typed as `Supports<'search'>`.
2. WHEN `loadSortActions` is called, THE Sort_Actions module SHALL adopt the Sort_Slice for the given interface.
3. THE `loadSortActions` function SHALL return an object with a `sortBy` method that accepts a Sort_Criterion, updates the sort state, and triggers a search request through the interface facades.
4. THE `loadSortActions` function SHALL return an object with a `getState` method that returns the current sort state (`appliedSort` and `availableSorts`).

### Requirement 4: Search Interface Sort Behavior

**User Story:** As a UI developer building a search interface, I want the Sort Controller to manage sort state entirely client-side, so that sorting works correctly even though the Search API does not return sort information in its response.

#### Acceptance Criteria

1. WHEN a Sort_Controller is used with a Search_Interface, THE Sort_Controller `availableSorts` SHALL remain as initialized (empty array) because the Search API does not provide available sorts in its response.
2. WHEN a Sort_Controller is used with a Search_Interface, THE Sort_Controller SHALL update `appliedSort` exclusively through the `sortBy` action (client-initiated).
3. WHEN the `sortBy` method is called on a Search_Interface, THE Sort_Controller SHALL update `appliedSort` in state and include the `sortCriteria` string in the next search request body.
4. THE Sort_Controller SHALL accept `sortCriteria` string values conforming to the Search API format: `"relevancy"`, `"date ascending"`, `"date descending"`, `"qre"`, `"nosort"`, or `"@[field] ascending"` / `"@[field] descending"`.
5. THE Sort_Controller SHALL accept comma-separated combinations of multiple field criteria or a single date criterion with field criteria (e.g., `"@price ascending,@name descending"`).

### Requirement 5: Commerce and Generative Interface Sort Behavior

**User Story:** As a UI developer building a commerce or generative interface, I want the Sort Controller to reflect the sort state returned in the API response, so that `availableSorts` and `appliedSort` are automatically populated from the server.

#### Acceptance Criteria

1. WHEN a Commerce_Interface or Generative_Interface receives a search response containing sort information, THE Sort_Slice SHALL update both `appliedSort` and `availableSorts` from the response via the `updateFromResponse` action.
2. WHEN a Sort_Controller is used with a Commerce_Interface, THE Sort_Controller `availableSorts` SHALL be populated from the `availableSorts` array in the Commerce Search API response.
3. WHEN the `sortBy` method is called on a Commerce_Interface, THE Sort_Controller SHALL update `appliedSort` in state and trigger a new commerce search request.
4. WHEN the commerce search response is received after a `sortBy` call, THE Sort_Slice SHALL reconcile state by applying the response payload via `updateFromResponse`, which may update both `appliedSort` and `availableSorts`.

### Requirement 6: Sort Criterion Comparison

**User Story:** As a UI developer, I want reliable sort criterion comparison, so that I can correctly highlight the active sort option in my UI.

#### Acceptance Criteria

1. WHEN `isSortedBy` is called, THE Sort_Controller SHALL compare the `sortCriteria` string property of the provided criterion against the `sortCriteria` string property of the applied sort using string equality.
2. IF the `appliedSort` is `null`, THEN THE Sort_Controller `isSortedBy` method SHALL return `false` for any criterion.

### Requirement 7: Package Exports

**User Story:** As a consumer of `@coveo/thermidor`, I want the sort controller and actions to be exported from the package entry point, so that I can import them directly.

#### Acceptance Criteria

1. THE `@coveo/thermidor` package SHALL export the `buildSortController` factory function from its public entry point.
2. THE `@coveo/thermidor` package SHALL export the `loadSortActions` function from its public entry point.
3. THE `@coveo/thermidor` package SHALL export the `SortController`, `SortControllerState`, and `SortControllerOptions` types from its public entry point.
