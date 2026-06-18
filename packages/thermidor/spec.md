# Headless POC Architecture Specification

> **Spec Status**: This spec reflects the implemented PoC. Sections marked with 🔧 indicate areas where the implementation intentionally diverged from the original design. See the [Architecture Guide](docs/architecture.md) for the definitive description of the implemented system.

## Project Overview

This POC demonstrates a proposed new architecture for `@coveo/headless` - a state management library and API client for Coveo implementations. The primary goal is to isolate state management implementation details while providing clean, layered APIs for different consumer types.

### Goals

1. **Library Isolation**: Encapsulate state management library (Redux Toolkit initially) to enable future migration (e.g., to Zustand) without impacting consumers
2. **Clear Boundaries**: Define distinct module layers with explicit responsibilities and dependencies
3. **Flexible Access**: Support both high-level controllers for common use cases and low-level mutators for advanced scenarios
4. **Type Safety**: Leverage TypeScript throughout for compile-time guarantees
5. **Proof of Concept**: Demonstrate architecture feasibility with 2-3 core features (search, facets, pagination)

### Non-Goals (for POC)

- Complete feature parity with existing `@coveo/headless`
- Production-ready performance optimizations
- Comprehensive test coverage (focus on architectural validation)
- Full documentation (architecture-focused only)

## Core Architectural Principles

### 1. State Library Abstraction

The state management library (Redux Toolkit) must be completely hidden from all consumers, including internal modules. No Redux types, hooks, or concepts should leak beyond Layer 0.

**Rationale**: Enables future migration to alternative state libraries (Zustand, Jotai, etc.) without breaking changes to any consumer code.

### 2. Layered Architecture

Four distinct layers in a hub-and-spoke pattern with Layer 0 as the central foundation:

```
┌─────────────────────────────────────────────────┐
│  Layer 3: Actions (Public - Power Users)        │
│  - Direct state mutation access (curated)       │
└────────────────────┬────────────────────────────┘
                     │ depends on
                     ↓
┌─────────────────────────────────────────────────┐
│       Layer 0: Core State Module (Internal)     │
│       - State management abstraction            │
│       - Read, Subscribe, Mutate interface       │
└──────────────┬──────────────────┬───────────────┘
               ↑                  ↑
               │ depends on       │ depends on
               │                  │
┌──────────────┴────────┐  ┌──────┴──────────────────────┐
│  Layer 1: API Client  │  │  Layer 2: Public Controllers │
│  (Internal Only)      │  │  (Public - Standard Users)   │
│  - Coveo REST APIs    │←─│  - Feature-oriented API      │
│  - State mutations    │  │  - Orchestrate state + APIs  │
└───────────────────────┘  └──────────────────────────────┘
                              (optionally calls Layer 1)
```

### 3. Dependency Flow

**Core Principle**: Layer 0 is the foundation. All other layers depend on it, but not on each other (except where noted).

- **Layer 0** has no dependencies on other layers
- **Layer 1** depends only on Layer 0 (reads config, dispatches mutations)
- **Layer 2** depends on Layer 0 (always) and optionally on Layer 1 (when API calls needed)
- **Layer 3** depends only on Layer 0 (mutation interface)
- **Layer 1 ≠→ Layer 2 or 3**: API client never calls controllers or actions
- **Layer 3 ≠→ Layer 1 or 2**: Actions never call APIs or controllers
- **No horizontal coupling**: Layers 1, 2, and 3 do not depend on each other (except Layer 2's optional use of Layer 1)

### 4. Export Strategy

- **Public API Surface**: Only Layer 2 (Controllers) and Layer 3 (Actions) are exported from package
- **Internal Modules**: Layer 0 and Layer 1 are implementation details, not accessible to consumers
- **Type-Only Exports**: State types may be exported for TypeScript consumers, but never implementation objects

### 5. Architectural Decision: Controller-API Coupling

**Decision**: Controllers (Layer 2) may directly import and call API Client functions (Layer 1) when needed.

**Alternative Considered**: Event-driven pattern where controllers only mutate state, and API clients reactively subscribe to state changes to trigger API calls.

**Rationale for Direct Approach**:

- **Explicitness**: Control flow is clear and traceable (debugging-friendly)
- **Simplicity**: No lifecycle management for subscriptions, no command/state mixing
- **Appropriate coupling**: The dependency is optional, uni-directional, and semantically meaningful
- **POC focus**: The primary goal is state library isolation (Layer 0), not eliminating all horizontal dependencies

**Trade-off**: Layer 2 depends on Layer 1 (in addition to Layer 0), which is acceptable because:

- The dependency is **optional** (state-only controllers don't need it)
- The dependency is **one-way** (Layer 1 never calls Layer 2)
- The dependency is **explicit** (no hidden event subscriptions)

**Future Consideration**: If full decoupling becomes necessary, the event-driven pattern could be explored, but it should be validated against the complexity cost.

### 6. Architectural Decision: No Selector Creation API

**Decision**: Layer 0 exposes only pre-built, curated selectors. Layers 1-3 cannot create custom memoized selectors.

**Alternative Considered**: Expose `createSelector(dependencies, combiner)` as a library-agnostic API for creating derived state.

**Rationale Against Exposing Selector Creation**:

1. **Pattern Leakage**: Even without Redux types, `createSelector(deps, combiner)` is the Reselect pattern. It teaches consumers a Redux-specific mental model.

2. **Library-Specific Concepts**: Different state libraries have incompatible derived state patterns:
   - Reselect: Declarative dependencies array + combiner function
   - Zustand: Inline selectors, manual shallow comparison
   - Jotai: Atom-based composition
   - Signals: Automatic dependency tracking

3. **Migration Complexity**: Migrating to Zustand/Jotai would require either:
   - Breaking API changes (new selector creation pattern)
   - Complex adapter layer (emulating Reselect in non-Redux libraries)

4. **Tight Coupling**: Exposing selector creation couples Layers 1-3 to Layer 0's internal optimization strategy.

**Trade-offs Accepted**:

- **Less Flexibility**: Layers 1-3 cannot create arbitrary derived selectors on-demand
- **Layer 0 Ownership**: All derived state patterns must be curated by Layer 0 team
- **Potential Performance**: Layers 1-3 may need to use multiple `read()` calls and compute locally without memoization

**Benefits Gained**:

- **Complete Abstraction**: No state library patterns leak beyond Layer 0
- **Simpler API**: Consumers only learn `read(selector)`, not selector creation patterns
- **Migration Freedom**: Zustand/Jotai migration only touches Layer 0 internals
- **Curated Quality**: Layer 0 controls which derived state patterns are exposed and documented

**Future Consideration**: If flexibility becomes critical, consider a truly library-agnostic computed state API, but this must be validated against complexity cost.

## Layer 0: Core State Module

### Responsibilities

- Manage application state using Redux Toolkit (initially)
- Provide abstract interface for state interactions
- Ensure state library remains swappable
- Handle state initialization and cleanup

### Public Interface (Internal-Only)

The core state module exposes an `Engine` class to internal consumers (Layer 1+). The `Engine` instance owns state access and mutations; there is no global singleton.

**Critical Constraint**: The interface MUST NOT expose any Redux Toolkit, Immer, or state library-specific types. All types should be library-agnostic abstractions.

#### 1. State Reading

```typescript
// Read current state value
engine.read<T>(selector: StateSelector<T>): T

// Subscribe to state changes
engine.subscribe<T>(selector: StateSelector<T>, callback: (value: T) => void): Unsubscribe
```

#### 2. Pre-defined Selectors

Layer 0 provides curated derived state selectors for common use cases. Layers 1-3 use these selectors via the `read()` and `subscribe()` functions.

**Important**: Layers 1-3 cannot create custom memoized selectors. This prevents leaking state library-specific patterns (e.g., Reselect's createSelector).

```typescript
// Examples of pre-built selectors
selectTotalPages: StateSelector<number>;
selectIsFirstPage: StateSelector<boolean>;
selectIsLastPage: StateSelector<boolean>;
selectHasSearchResults: StateSelector<boolean>;

// Use with read()
const totalPages = engine.read(selectTotalPages);
const hasResults = engine.read(selectHasSearchResults);
```

**For Custom Derived State**: Layers 1-3 should either:

1. **Request additions**: Ask Layer 0 team to add new curated selectors
2. **Compute locally**: Use multiple `read()` calls and compute without memoization
3. **Manage caching**: Implement their own caching if performance-critical

**Rationale**: Different state libraries have fundamentally different patterns for derived state:

- Redux/Reselect: `createSelector(deps, combiner)` with automatic memoization
- Zustand: Inline selectors with manual `useShallow` or separate memoization
- Jotai: Derived atoms with `atom((get) => ...)`
- Signals: Computed values with `computed(() => ...)`

Exposing a selector creation API would leak implementation patterns and prevent seamless library migration.

#### 3. State Mutation

```typescript
// Dispatch state changes
engine.mutate(mutation: StateMutation): void

// Create mutation factory for specific state slices
// NOTE: Reducer function receives the current state, NOT Draft<State> from Immer
createMutation<Payload>(
  type: string,
  reducer: (currentState: State, payload: Payload) => Partial<State>
): (payload: Payload) => StateMutation
```

**Type Definitions** (library-agnostic):

```typescript
type StateSelector<T> = (state: State) => T;
type Unsubscribe = () => void;
type StateMutation = {type: string; payload?: unknown};
```

### Implementation Constraints

- **No Library Primitive Exports**: Never export `store`, `dispatch`, `getState`, Redux types, Immer's `Draft<T>`, or any state library-specific primitives
- **Library-Agnostic Types**: All exposed types (StateSelector, StateMutation, etc.) must be plain TypeScript types that work with any state library
- **Immutability**: Use Immer (via Redux Toolkit) internally for mutation logic, but expose immutable API without Immer types
- **Type Safety**: All selectors and mutations must be fully typed with library-agnostic types
- **Initialization**: Single initialization point, no global state access
- **Internal Usage Only**: Redux Toolkit imports must only appear in Layer 0 implementation files, never in interface/type definition files

### Internal vs Interface Structure

Layer 0 is split into two directories to enforce library isolation by construction:

```
core/
├── internal/      # Redux Toolkit implementation details
│   └── search/
│       └── slice.ts
└── interface/     # Library-agnostic API surface
   └── search/
      ├── types.ts
      ├── mutate.ts
      └── selectors.ts
```

- **internal/**: Can import Redux Toolkit and use `createSlice`, `PayloadAction`, etc. Never exported to consumers.
- **interface/**: Exposes only library-agnostic types and functions. May wrap internal selectors and actions, but must never export Redux types.

### State Structure

State should be organized by feature domains:

```
State
├── search
│   ├── query: string
│   ├── results: SearchResult[]
│   └── isLoading: boolean
├── facets
│   └── [facetId]: FacetState
├── pagination
│   ├── currentPage: number
│   ├── pageSize: number
│   └── totalCount: number
└── configuration
    ├── organizationId: string
    └── accessToken: string
```

### Migration Path to Zustand

When migrating from Redux Toolkit to Zustand:

1. Replace Redux store creation with Zustand store in `core/internal/`
2. Reimplement `Engine.read`, `Engine.subscribe`, `Engine.mutate` using Zustand primitives
3. Keep `core/interface/` stable; it continues to expose library-agnostic selectors and mutation factories
4. No changes required in Layer 1, 2, or 3

**Key Validation**: If this migration requires changes outside Layer 0, the abstraction has failed.

## Layer 1: Internal API Client Module

### Responsibilities

- Communicate with Coveo REST APIs and other services
- Transform API responses into state mutations
- Handle API errors and retry logic
- Manage request lifecycle (loading states, caching)
- Never expose raw API implementations to public layers

### Relationship to Core State

The API Client uses Layer 0's engine capabilities:

- **Reads Configuration**: Access tokens, org IDs, endpoint URLs from state via `engine.read()`
- **Dispatches Mutations**: Updates state with API responses, loading states, errors
- **No Direct State Access**: Cannot bypass Layer 0 to touch Redux directly

### Module Organization

Organize by API domain:

```
api-client/
├── search/
│   ├── searchAPI.ts          # Search endpoint calls
│   └── searchMutations.ts    # Search-specific state mutations
├── facets/
│   ├── facetAPI.ts
│   └── facetMutations.ts
└── shared/
    ├── httpClient.ts         # Base HTTP client
    └── errorHandling.ts      # Common error patterns
```

### Error Handling

API errors should:

1. Be caught and transformed into standardized error objects
2. Trigger state mutations to reflect error states
3. Not throw exceptions to higher layers (controllers handle errors via state)

### Async Patterns

All API calls accept an `Engine` instance and return `Promise<void>` or `Promise<Result>`:

- Success: Mutate state with response data
- Failure: Mutate state with error information
- Loading: Set loading flags before/after requests

### Not Exposed Externally

Layer 1 is **internal infrastructure**. Public consumers (customers) never import or call API client functions directly. Controllers (Layer 2) orchestrate API calls.

## Layer 2: Public Controllers

### Responsibilities

- Provide high-level, feature-oriented API for standard use cases
- Orchestrate state mutations and API calls from lower layers
- Encapsulate business logic and workflows
- Expose clean, minimal API surface to customers
- Handle common patterns (loading states, error handling, validation)

### Controller Design Philosophy

Controllers represent **features**, not data models:

- `SearchController`: Execute searches, manage query state
- `FacetController`: Select/deselect facet values, manage facet state
- `PaginationController`: Navigate pages, adjust page size

Each controller:

- Accepts initialization configuration
- Exposes methods that represent user actions
- Provides reactive state access (via subscriptions or return values)
- Handles edge cases and validation internally

### Example: SearchBoxController (Conceptual)

> 🔧 **Implementation divergence**: The spec originally described controllers as classes (e.g., `SearchController`). The implementation uses **factory functions** (e.g., `buildSearchBoxController(engine)`) that return plain objects. This is simpler, avoids `this` binding issues, and aligns with functional patterns.

A SearchBoxController might expose:

**Methods**:

- `setQuery(query: string)`: Update search query
- `executeSearch()`: Trigger search API call
- `clearResults()`: Reset search results

**State Access**:

- `getQuery()`: Current query string
- `getResults()`: Current search results
- `isLoading()`: Loading state
- `subscribe(callback)`: React to state changes

**Internal Implementation**:

- Uses Layer 0 to read/mutate search state through an `Engine` instance
- Uses Layer 1 to call search API (when executing searches)
- Handles loading state transitions
- Validates query before execution

**Example of Selective Layer 1 Usage**: Not all controller methods need Layer 1:

- `setQuery()`: Only needs Layer 0 (mutate query state)
- `executeSearch()`: Needs both Layer 0 (loading states) and Layer 1 (API call)
- `getQuery()`: Only needs Layer 0 (read state)

### Controller Lifecycle

Controllers may be:

- **Stateless**: Pure functions over state (for simple cases)
- **Stateful**: Maintain subscriptions, cleanup on disposal

If stateful, controllers should expose:

- `init()`: Setup subscriptions, initialize state
- `dispose()`: Cleanup subscriptions, prevent memory leaks

### Public vs Internal Controllers

**Public Controllers** (exported from package):

- Well-documented, stable API
- Follow semantic versioning
- Designed for customer use

**Internal Controllers** (if needed):

- Share patterns with public controllers
- Used by higher-layer internal modules
- Not exported from package

## Layer 3: Actions

> 🔧 **Implementation divergence**: The spec originally called this layer "Advanced Mutators" with an `advanced/` directory. The implementation uses the name **"Actions"** with a `public/actions/` directory. The concept is the same: curated, direct state mutations for power users.

### Responsibilities

- Provide direct access to state mutation functions for power users
- Enable custom workflows not covered by standard controllers
- Maintain safety through curation mechanism
- Serve as escape hatch for advanced scenarios

### Curation Mechanism

Not all mutations are exposed to Layer 3. Only mutations explicitly marked as "safe for advanced use" are included.

**Criteria for Curation**:

- Mutation has clear, predictable behavior
- Cannot corrupt state or violate invariants
- Documented with clear use cases
- Stable API contract (versioned)

**Example Allowlist**:

- ✅ `setQuery(query: string)`: Replace search query
- ✅ `toggleFacetValue(facetId, value)`: Select/deselect facet
- ❌ `_setInternalLoadingFlag(flag)`: Implementation detail
- ❌ `_batchUpdateResults(results)`: Complex invariants

### API Design

> 🔧 **Implementation divergence**: The implementation provides two patterns:
>
> 1. **Loader pattern**: `loadSearchBoxActions(engine)` returns all bound mutations for a feature.
> 2. **Curried pattern**: `setQuery(engine)` returns a single bound mutation function.
>    Both adopt slices lazily and use a `WeakSet<Engine>` for idempotency.

Actions mirror the conceptual structure of mutations but with:

- Strong typing
- Validation (prevent invalid payloads)
- Clear documentation of side effects

**Conceptual Pattern**:

```typescript
// Instead of exposing raw Redux actions:
// ❌ dispatch({ type: 'search/setQuery', payload: 'laptops' })

// Expose typed mutation functions:
// ✅ mutateSearchQuery('laptops')
```

### When Customers Should Use Layer 3

**Use Actions When**:

- Building custom controllers or frameworks on top of headless
- Implementing workflows not supported by standard controllers
- Optimizing performance-critical operations
- Needing fine-grained control over state updates

**Use Standard Controllers When**:

- Implementing common features (search, facets, etc.)
- Following established patterns
- Prioritizing stability over flexibility
- Building standard UI components

### Versioning and Stability

Actions follow semantic versioning:

- **Major**: Breaking changes to action signatures or behavior
- **Minor**: New actions added
- **Patch**: Bug fixes in existing actions

Controllers (Layer 2) have stronger stability guarantees than actions (Layer 3).

## Module Boundaries and Dependencies

### Import Rules

**Layer 0 (Core State)**:

- ✅ Import: Redux Toolkit, Immer, utility libraries
- ❌ Import: Any other layer (1, 2, or 3)

**Layer 1 (API Client)**:

- ✅ Import: Layer 0 (state interface only - read, mutate, subscribe)
- ✅ Import: HTTP libraries, utility libraries
- ❌ Import: Layer 2 or 3
- ❌ Import: Redux Toolkit directly (even though it exists in dependencies)

**Layer 2 (Controllers)**:

- ✅ Import: Layer 0 (state interface only - read, mutate, subscribe, pre-defined selectors)
- ✅ Import: Layer 1 (API client functions) - only when controller needs to trigger API calls
- ❌ Import: Layer 3
- ❌ Import: Redux Toolkit directly
- 📝 Note: Not all controllers need Layer 1. Simple state-only controllers depend only on Layer 0.

**Layer 3 (Actions)**:

- ✅ Import: Layer 0 (mutation interface only)
- ❌ Import: Layer 1 or Layer 2
- ❌ Import: Redux Toolkit directly

### Circular Dependency Prevention

If two modules at the same layer need to share code:

1. Extract shared logic to a **utility module** at the same layer
2. Consider if logic belongs in a lower layer
3. Refactor to remove coupling

**Never** use circular imports between layers.

### Public Exports

The package's main entry point (`index.ts`) exports only:

> 🔧 **Implementation note**: The implementation uses factory functions and namespace exports rather than class-based controllers. The `Engine` class is currently exported directly (with a TODO to wrap it in a public facade).

```typescript
// Engine (TODO: wrap in public facade)
export { Engine } from './core';

// Layer 2: Public Controllers
export { buildSearchBoxController } from './public/controllers/search-box/controller';
export { buildResultListController } from './public/controllers/result-list/controller';

// Layer 3: Actions
export { loadSearchBoxActions, setQuery } from './public/actions/search-box';

// Types (exported from core)
export type { SearchResult, FacetValue, PaginationState, SearchBoxState, ... } from './core';
```

**Not exported**:

- Layer 0 internals (state module, Redux store)
- Layer 1 internals (API client implementations)
- Internal utilities or helpers

## POC Feature Scope

To validate the architecture, implement these three features:

### 1. Search

**State**:

- Current query string
- Search results array
- Loading state
- Error state

**API Client (Layer 1)**:

- `executeSearchAPI(query)`: Call Coveo search endpoint
- Handle response transformation
- Handle errors

**Controller (Layer 2)**:

- `SearchController` with methods:
  - `setQuery(query: string)`
  - `executeSearch()`
  - `getResults()`
  - `subscribe(callback)`

**Advanced Mutators (Layer 3)**:

- `setQuery(engine)`: Returns a bound mutation function
- `loadSearchBoxActions(engine)`: Returns all search box mutations

### 2. Facets

**State**:

- Facets by ID (map)
- Selected values per facet
- Available values per facet

**API Client (Layer 1)**:

- `fetchFacetValuesAPI(facetId)`: Load available values
- Handle facet result parsing

**Controller (Layer 2)**:

- `FacetController` with methods:
  - `selectValue(value)`
  - `deselectValue(value)`
  - `clearAll()`
  - `getSelectedValues()`

**Advanced Mutators (Layer 3)**:

- `mutateFacetSelection(facetId, value, selected: boolean)`
- `mutateFacetValues(facetId, values: FacetValue[])`

> 🔧 **Implementation note**: Facet actions are not yet implemented in the PoC.

### 3. Pagination

**State**:

- Current page number
- Page size
- Total results count
- Total pages (derived)

**API Client (Layer 1)**:

- Pagination parameters included in search API calls
- Extract total count from search response

**Controller (Layer 2)**:

- `PaginationController` with methods:
  - `nextPage()`
  - `previousPage()`
  - `setPage(page: number)`
  - `setPageSize(size: number)`
  - `getCurrentPage()`

**Advanced Mutators (Layer 3)**:

- `mutatePaginationPage(page: number)`
- `mutatePaginationPageSize(size: number)`

> 🔧 **Implementation note**: Pagination actions are not yet implemented in the PoC.

### Feature Interactions

These features should interact correctly:

- Changing search query resets pagination to page 1
- Selecting facet values triggers new search
- Pagination state affects search API parameters

## Verification Criteria

### Architecture Validation

The POC succeeds if:

1. **Library Isolation**:
   - ✅ No Redux imports outside Layer 0
   - ✅ No Redux/Immer types (like `Draft<T>`, `PayloadAction`, `Slice`, etc.) visible in Layer 0's public interface
   - ✅ All Layer 0 interface types are plain TypeScript (no library-specific types)
   - ✅ React/Vue/Svelte framework integration possible without Redux knowledge
   - ✅ Zustand migration estimated at < 1 day, no API changes required to Layers 1, 2, or 3

2. **Layer Boundaries**:
   - ✅ Dependency rules enforced (lint rules or manual verification)
   - ✅ No circular dependencies detected
   - ✅ Each layer's responsibilities are clear
   - 🔧 **Known deviation**: Layer 2 controllers import `createSelector` from `@reduxjs/toolkit` for memoization. This is actually from Reselect (a standalone library) and would be replaced with a direct Reselect import or Layer 0-provided utility in production.

3. **Usability**:
   - ✅ Controllers are intuitive for implementing search UI
   - ✅ Advanced mutators enable custom workflows not covered by controllers
   - ✅ TypeScript types provide helpful autocomplete and error detection

4. **Extensibility**:
   - ✅ Adding new feature (e.g., sorting) follows clear pattern
   - ✅ New controllers can be added without modifying Layer 0 or 1
   - ✅ State structure can accommodate new features

### Code Quality

- Type safety throughout (no `any` types)
- Clear module organization (file structure matches layers)
- Minimal boilerplate (Redux Toolkit reduces Redux ceremony)
- Documented architectural decisions (comments in code)

### Future Extensibility Checkpoints

1. **Can we add a new controller without touching state core?** → Yes
2. **Can we swap Redux for Zustand in < 8 hours?** → Should be possible
3. **Can we add React hooks layer without modifying controllers?** → Yes (hooks call controllers)
4. **Can we version Layer 2 and Layer 3 independently?** → Architecture should allow this

## Implementation Notes

### Development Workflow

1. **Start with Layer 0**: Implement core state module with Redux Toolkit
2. **Build Layer 1**: Create API client infrastructure, mock API responses initially
3. **Create Layer 2**: Implement controllers using Layer 0 and Layer 1
4. **Expose Layer 3**: Define curated actions and export from `public/actions/`
5. **Validate**: Test layer boundaries, attempt Zustand migration estimate

### Technology Stack

- **State Management**: Redux Toolkit (initial), Zustand (future)
- **Type System**: TypeScript 5.x with strict mode
- **Module System**: ES Modules
- **Build Tool**: TSC (TypeScript compiler) initially, consider bundler if needed
- **Testing**: Not required for POC, but architecture should be testable

### File Structure Recommendation

> 🔧 **Implementation note**: The actual structure differs from the original recommendation below. Key differences:
>
> - Controllers live under `public/controllers/` (not top-level `controllers/`)
> - Actions live under `public/actions/` (not `advanced/`)
> - Interface directories use kebab-case (`search-box/`), internal directories use camelCase (`searchBox/`)
> - Additional feature domains: `result` (per-item UI state) and `results` (collection) are separate
> - `configuration` was added as a feature domain
>
> See the [Architecture Guide](docs/architecture.md) for the actual file structure.

```
src/
├── index.ts                    # Public API exports
├── core/                       # Layer 0: Core State
│   ├── internal/               # Redux Toolkit implementation (private)
│   │   ├── search/
│   │   │   └── slice.ts
│   │   ├── facets/
│   │   │   └── slice.ts
│   │   └── pagination/
│   │       └── slice.ts
│   └── interface/              # Library-agnostic API surface
│       ├── engine/
│       │   └── engine.ts
│       ├── search/
│       │   ├── types.ts
│       │   ├── mutate.ts
│       │   └── selectors.ts
│       ├── facets/
│       │   ├── types.ts
│       │   ├── mutate.ts
│       │   └── selectors.ts
│       └── pagination/
│           ├── types.ts
│           ├── mutate.ts
│           └── selectors.ts
├── api/                        # Layer 1: API Client
│   ├── search/
│   ├── facets/
│   ├── pagination/
│   └── shared/
├── controllers/                # Layer 2: Public Controllers
│   ├── search.ts
│   ├── facet.ts
│   └── pagination.ts
├── advanced/                   # Layer 3: Advanced Mutators
│   ├── index.ts                # Allowlist
│   ├── search-mutators.ts
│   ├── facet-mutators.ts
│   └── pagination-mutators.ts
└── types/                      # Shared types
   ├── search.ts
   ├── facet.ts
   └── pagination.ts
```

### Anti-Patterns to Avoid

1. **Leaking Redux**: Exposing `store`, `dispatch`, or Redux types
2. **God Controllers**: Controllers that do too much (keep them focused)
3. **Bypassing Layers**: Higher layers directly importing lower layer internals
4. **Mutable State Exposure**: Returning mutable state objects that consumers can modify
5. **Over-Engineering**: Adding abstractions not validated by POC features

## Success Definition

This POC is successful when:

1. A developer can implement a search UI using only Layer 2 controllers
2. A power user can build custom facet behavior using Layer 3 actions
3. The state management library can be swapped without API changes
4. Layer boundaries are respected and enforced
5. The architecture scales to 10+ features without structural changes

The specification should enable an implementation team to build this POC autonomously with minimal clarifying questions.
