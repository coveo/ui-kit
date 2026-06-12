# Glossary

Quick reference for terms used throughout the `@coveo/headless-future` codebase and documentation. Many of these terms are either novel to this architecture or have specific meanings that differ from general usage.

---

### Engine

The central state container. An instance of the `Engine` class wraps a Redux Toolkit store but exposes only four methods: `read()`, `subscribe()`, `mutate()`, and `adoptSlice()`. Multiple independent engines can coexist (multi-engine paradigm).

**File**: [`src/core/interface/engine/engine.ts`](../src/core/interface/engine/engine.ts)

```typescript
const engine = new Engine();
```

---

### Slice

A feature-scoped unit of state. Under the hood, it's a Redux Toolkit `createSlice()` — but consumers only see the library-agnostic interface layer (types, mutations, selectors).

Each slice owns:

- A state shape (e.g., `SearchBoxState = { query: string }`)
- Reducers (how state changes)
- Selectors (how to read from state)

**Example**: The `searchBox` slice manages the search query string.  
**File**: [`src/core/internal/searchBox/slice.ts`](../src/core/internal/searchBox/slice.ts)

---

### Slice Adoption

The mechanism by which slices are lazily, dynamically registered into the Engine's store. The store starts empty — a slice is adopted the first time a controller or action needs it.

Adoption is **idempotent**: calling `adoptSlice(searchBoxSlice)` multiple times has no additional effect.

**File**: [`SLICE_ADOPTION.md`](../SLICE_ADOPTION.md)

```typescript
engine.adoptSlice(searchBoxSlice); // First call: registers the slice
engine.adoptSlice(searchBoxSlice); // Subsequent calls: no-op
```

---

### StateMutation

A library-agnostic `{ type, payload }` object representing a state change. It's the `@coveo/headless-future` equivalent of a Redux action — but its type is a plain TypeScript interface with no Redux imports.

```typescript
interface StateMutation {
  type: string; // e.g., 'searchBox/setQuery'
  payload?: unknown; // e.g., 'laptops'
}
```

Mutations are created by **mutation factories** (e.g., `searchBoxMutations.setQuery('laptops')`) and dispatched via `engine.mutate(mutation)`.

**File**: [`src/core/interface/types.ts`](../src/core/interface/types.ts)

---

### Mutation Factory

A function that creates a `StateMutation` object without dispatching it. The two-step pattern (create → dispatch) keeps things composable and testable.

```typescript
// Create the mutation
const mutation = searchBoxMutations.setQuery('laptops');
// mutation = { type: 'searchBox/setQuery', payload: 'laptops' }

// Dispatch it
engine.mutate(mutation);
```

**Files**: `src/core/interface/{feature}/mutate.ts` (one per feature)

---

### StateSelector

A pure function `(state: State) => T` that extracts a value from state. Used with `engine.read()` and `engine.subscribe()`.

```typescript
type StateSelector<T> = (state: State) => T;

// Example
const query: StateSelector<string> = (state) => state.searchBox?.query ?? '';
```

**File**: [`src/core/interface/types.ts`](../src/core/interface/types.ts)

---

### Interface (`core/interface/`)

The **library-agnostic surface** of Layer 0. Contains types, selector wrappers, and mutation factories — everything that other layers import from Layer 0.

**Rule**: No `@reduxjs/toolkit` or `immer` imports allowed here (except in `engine.ts` which wraps the Redux store).

Not to be confused with TypeScript's `interface` keyword — this is a directory name reflecting "the public interface of the core module."

---

### Internal (`core/internal/`)

The **Redux Toolkit implementation** of Layer 0. Contains `createSlice()` definitions, reducers, and Redux-specific logic. Files here are never exported to consumers.

**Rule**: This is the only place where Redux primitives (`createSlice`, `PayloadAction`, etc.) should appear.

---

### Controller

A Layer 2 factory function that takes an `Engine` and returns a plain object with methods and state accessors. Controllers are the primary public API for building UIs.

```typescript
const controller = buildSearchBoxController(engine);
controller.updateQuery('laptops');
controller.submit();
console.log(controller.state); // { query: 'laptops' }
```

Controllers adopt their required slices at construction time and orchestrate Layer 0 (state) and Layer 1 (API) operations.

**Directory**: `src/public/controllers/`

---

### Action (Layer 3)

A power-user API that exposes direct state mutations without the orchestration logic of a controller. Actions adopt slices and return bound mutation functions.

Two flavors:

- **Loader pattern**: `loadSearchBoxActions(engine)` returns an object of all bound mutations.
- **Curried pattern**: `setQuery(engine)` returns a single bound mutation function.

**Directory**: `src/public/actions/`

---

### result vs results

Two separate feature domains that are easy to conflate:

| Term                  | Domain            | State Shape                              | Purpose                                                     |
| --------------------- | ----------------- | ---------------------------------------- | ----------------------------------------------------------- |
| **result** (singular) | Per-item UI state | `Record<id, { isSelected, isExpanded }>` | Tracks ephemeral UI state for each individual result        |
| **results** (plural)  | Collection state  | `{ results[], isLoading, error }`        | The list of results from a search, plus loading/error state |

**Files**:

- `src/core/interface/result/` — individual result types and per-result UI state
- `src/core/interface/results/` — collection-level state

---

### StateWithXxxSlice

A type narrowing pattern used in selectors. Since all state properties are optional (slices may not be adopted yet), selectors define a local type that guarantees the slice is present:

```typescript
// In search-box/selectors.ts
type StateWithSearchBoxSlice = {searchBox: SearchBoxState};

export const query = (state: StateWithSearchBoxSlice) => {
  return searchBoxSlice.selectors.query(state);
};
```

This means: "this selector requires the searchBox slice to be adopted." It fails at the type level if you try to use it with a bare `State` (where `searchBox` is optional).

---

### WeakSet\<Engine\> Pattern

An idempotency mechanism used in Actions (Layer 3). A `WeakSet<Engine>` tracks which engines have already adopted a particular slice, so slice adoption doesn't happen more than once:

```typescript
const loadedEngine = new WeakSet<Engine>();

export const setQuery = (engine: Engine) => {
  if (!loadedEngine.has(engine)) {
    engine.adoptSlice(searchBoxSlice);
    loadedEngine.add(engine);
  }
  return (query: string) => {
    engine.mutate(searchBoxMutations.setQuery(query));
  };
};
```

`WeakSet` is used (rather than `Set`) so that engines can be garbage collected when no longer referenced elsewhere.

**File**: [`src/public/actions/search-box.ts`](../src/public/actions/search-box.ts)

---

### Engine-First Pattern

A convention where API functions take `Engine` as their first argument. The API client reads configuration (org ID, token, endpoint) from Engine state rather than accepting them as parameters.

```typescript
// Layer 1 API function
export async function executeSearchAPI(engine: Engine): Promise<void> {
  const query = engine.read(searchBoxSelectors.query);
  const orgId = engine.read(configurationSelectors.organizationId);
  // ... make API call, write results back to engine state
}
```

This means once the engine is configured, all API calls are automatically authenticated.

---

### Hub-and-Spoke Model

The architectural pattern where Layer 0 (Core State) is the "hub" and all other layers are "spokes" radiating from it. Every layer communicates through state — no direct inter-layer communication except the explicit Layer 2 → Layer 1 dependency for API calls.
