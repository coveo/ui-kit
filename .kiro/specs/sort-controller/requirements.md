# Requirements Document

## Introduction

This document specifies the requirements for adding a Sort Controller to the `@coveo/thermidor` package. The Sort Controller allows consumers to change the sort order of results (relevance, fields, date, etc.) across search interfaces, commerce search interfaces, and generative interfaces. It follows Thermidor's architecture: an internal feature module (`src/internal/features/sort/`), a public controller (`src/public/controllers/sort/`), and public actions (`src/public/actions/sort/`).

The sort criterion is a **domain-level discriminated union** that expresses intent (e.g., `{ by: 'field', field: 'price', direction: 'descending' }`) rather than transport syntax. An internal translation layer converts between domain types and API-specific formats per ADR-001 (Anti-Corruption Layer) and ADR-008 (Unified Sort Controller).

The criterion type **narrows based on the interface type**:
- **Search interfaces**: `SortByRelevance | SortByDate | SortByField | SortByQRE | SortByNoSort`
- **Commerce/Generative interfaces**: `SortByRelevance | SortByField`

This narrowing is type-level only and has zero runtime cost.

## Glossary

- **Sort_Controller**: A public controller class extending `BaseController` that provides a high-level API for sorting results, exposing the current sort state and methods to change the applied sort criterion. Generic over the interface type for criterion narrowing.
- **Sort_Actions**: A public action loader function that gives power users direct access to sort mutations without using the controller.
- **Sort_Slice**: The internal Redux Toolkit slice managing sort state (applied sort criterion, available sort criteria). Stores domain-level criterion objects.
- **Sort_Criterion**: A domain-level discriminated union representing a sort order. Discriminated on the `by` field: `'relevance'`, `'date'`, `'field'`, `'qre'`, or `'nosort'`.
- **SortDirection**: `'ascending' | 'descending'`.
- **Translation_Layer**: Internal functions that convert between domain-level Sort_Criterion objects and API-specific formats (Search API strings, Commerce API payloads). Never exposed publicly.
- **Interface_Handle**: An opaque reference to a search, commerce, or generative interface instance that controllers and actions operate on.
- **Supports**: A branded type that constrains which interface types a controller or action can accept, based on the facades they require (e.g., `Supports<'search'>`).
- **Facade**: An endpoint-specific thunk resolver (e.g., `'search'`) that triggers an API call when dispatched.
- **Engine**: The Thermidor core state management object that owns the Redux store, slice adoption, and mutation dispatch.

## Requirements

### Requirement 1: Sort Criterion Types

**User Story:** As a UI developer, I want domain-level sort criterion types that express intent without exposing REST API syntax, so that my code is decoupled from backend transport formats.

#### Acceptance Criteria

1. THE public API SHALL define a discriminated union for sort criteria with the following variants:
   - `SortByRelevance`: `{ by: 'relevance' }`
   - `SortByDate`: `{ by: 'date'; direction: SortDirection }`
   - `SortByField`: `{ by: 'field'; field: string; direction: SortDirection; displayName?: string }`
   - `SortByQRE`: `{ by: 'qre' }`
   - `SortByNoSort`: `{ by: 'nosort' }`
2. THE criterion type SHALL narrow based on the interface type via nominal branding (`InterfaceTypeBrand`):
   - Search interfaces: `SortByRelevance | SortByDate | SortByField | SortByQRE | SortByNoSort`
   - Commerce interfaces: `SortByRelevance | SortByField`
3. THE `displayName` property on `SortByField` SHALL be optional and used for UI rendering only — excluded from equality comparisons.
4. THE public API SHALL NOT expose any REST API syntax (e.g., `"@price descending"`, `{ sortCriteria: "fields" }`).

### Requirement 2: Sort Slice State Management

**User Story:** As a Thermidor developer, I want a sort slice that stores the applied sort criterion and available sort criteria, so that the sort state is managed consistently via Thermidor's dynamic slice adoption mechanism.

#### Acceptance Criteria

1. THE Sort_Slice SHALL store an `appliedSort` property representing the currently active Sort_Criterion (domain-level object), defaulting to `null`.
2. THE Sort_Slice SHALL store an `availableSorts` property representing the list of Sort_Criterion values (domain-level objects), defaulting to an empty array.
3. WHEN the `updateFromResponse` action is dispatched with a sort payload, THE Sort_Slice SHALL update `appliedSort` and `availableSorts` from the payload (translated from API format to domain types by the Translation_Layer).
4. WHEN the `updateFromResponse` action is dispatched with an undefined payload, THE Sort_Slice SHALL retain the current state without modification.
5. WHEN a `sortBy` action is dispatched with a Sort_Criterion, THE Sort_Slice SHALL update `appliedSort` to the provided criterion.
6. WHEN a `sortBy` action is dispatched, THE Sort_Slice SHALL NOT modify the `availableSorts` list.
7. WHEN a `hydrateFromSnapshot` action is dispatched with a payload containing sort data, THE Sort_Slice SHALL update `appliedSort` and `availableSorts` (translated from API format to domain types).
8. WHEN a `hydrateFromSnapshot` action is dispatched with a payload that does not contain sort data, THE Sort_Slice SHALL retain the current state without modification.

### Requirement 3: Translation Layer

**User Story:** As a Thermidor developer, I want an internal translation layer that converts between domain-level criterion types and API-specific formats, so that the public API remains decoupled from transport syntax.

#### Acceptance Criteria

1. THE Translation_Layer SHALL convert domain Sort_Criterion objects to Search API format (e.g., `{ by: 'field', field: 'price', direction: 'ascending' }` → `"@price ascending"`).
2. THE Translation_Layer SHALL convert domain Sort_Criterion objects to Commerce API format (e.g., `{ by: 'field', field: 'price', direction: 'descending' }` → `{ sortCriteria: 'fields', fields: [{field: 'price', direction: 'desc'}] }`), mapping `'ascending'`/`'descending'` to `'asc'`/`'desc'`.
3. THE Translation_Layer SHALL convert Commerce API response payloads to domain Sort_Criterion objects (including populating `displayName` from the response).
4. THE Translation_Layer SHALL convert compound sort arrays to the appropriate API format (e.g., concatenated comma-separated string for Search API).
5. THE Translation_Layer SHALL be internal — never exported from the public API surface.
6. THE Translation_Layer SHALL provide a `buildSearchSortCriteria` selector that produces a Search API `sortCriteria` string from the current sort state, returning `undefined` when no sort is applied.
7. THE Translation_Layer SHALL provide a `buildSortRequest` selector that produces a Commerce API `CommerceApiSortPayload` object from the current sort state, returning `undefined` when no sort is applied.

### Requirement 4: Sort Controller

**User Story:** As a UI developer, I want a Sort Controller that exposes the current sort state and a method to change the applied sort criterion, so that I can build sort UIs across any Thermidor interface type.

#### Acceptance Criteria

1. THE Sort_Controller SHALL accept an `interface` option typed as `Supports<'search'>`, enabling use with search interfaces, commerce interfaces, and generative interfaces alike.
2. THE Sort_Controller SHALL be generic over the interface type, narrowing the criterion type accordingly.
3. WHEN the Sort_Controller is instantiated, THE Sort_Controller SHALL adopt the Sort_Slice for the given interface.
4. THE Sort_Controller SHALL expose a `state` property containing `appliedSort` (the current Sort_Criterion or `null`) and `availableSorts` (the list of available Sort_Criterion values).
5. THE Sort_Controller SHALL expose a `sortBy` method that accepts a single Sort_Criterion or an array of Sort_Criterion (compound sort), updates the applied sort in state, and triggers a search request through the interface facades.
6. THE Sort_Controller SHALL expose an `isSortedBy` method that accepts a Sort_Criterion or array and returns `true` if it structurally matches the currently applied sort (excluding `displayName`), `false` otherwise.
7. THE Sort_Controller SHALL extend `BaseController` and support subscription-based state observation via the inherited `subscribe` method.
8. WHEN the `sortBy` method is called, THE Sort_Controller SHALL dispatch the `sortBy` mutation and then invoke all resolved `'search'` facade thunks to trigger a new API request.
9. WHEN `sortBy` triggers a search facade thunk, THE sort state SHALL be included in the outgoing API request: as a `sortCriteria` string for Search API requests, and as a `CommerceApiSortPayload` object for Commerce API requests.

### Requirement 5: Sort Public Actions

**User Story:** As a power user, I want direct access to sort actions without using the controller, so that I can build custom workflows that involve sorting.

#### Acceptance Criteria

1. THE Sort_Actions module SHALL export a `loadSortActions` function that accepts an options object with an `interface` property typed as `Supports<'search'>`.
2. WHEN `loadSortActions` is called, THE Sort_Actions module SHALL adopt the Sort_Slice for the given interface.
3. THE `loadSortActions` function SHALL return an object with a `sortBy` method that accepts a Sort_Criterion or array, updates the sort state, and triggers a search request through the interface facades.

### Requirement 6: Sort Criterion Comparison

**User Story:** As a UI developer, I want reliable sort criterion comparison, so that I can correctly highlight the active sort option in my UI.

#### Acceptance Criteria

1. WHEN `isSortedBy` is called, THE Sort_Controller SHALL use structural (deep) equality on the criterion, comparing `by`, `field`, and `direction` properties as appropriate for the variant.
2. THE `isSortedBy` comparison SHALL exclude the `displayName` property (presentational only).
3. IF the `appliedSort` is `null`, THEN THE Sort_Controller `isSortedBy` method SHALL return `false` for any criterion.
4. WHEN comparing compound sorts (arrays), THE Sort_Controller SHALL compare element-by-element in order.

### Requirement 7: Package Exports

**User Story:** As a consumer of `@coveo/thermidor`, I want the sort controller, actions, and criterion types to be exported from the package entry point, so that I can import them directly.

#### Acceptance Criteria

1. THE `@coveo/thermidor` package SHALL export the `buildSortController` factory function from its public entry point.
2. THE `@coveo/thermidor` package SHALL export the `loadSortActions` function from its public entry point.
3. THE `@coveo/thermidor` package SHALL export the `SortController`, `SortControllerState`, and `SortControllerOptions` types from its public entry point.
4. THE `@coveo/thermidor` package SHALL export the sort criterion types (`SortByRelevance`, `SortByDate`, `SortByField`, `SortByQRE`, `SortByNoSort`, `SearchSortCriterion`, `CommerceSortCriterion`, `SortDirection`) from its public entry point.
