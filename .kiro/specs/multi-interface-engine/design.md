# Design Document

## Overview

This design introduces a multi-interface architecture for `thermidor`, enabling a single `Engine` instance to support multiple use cases (search, commerce, conversation) simultaneously. The architecture follows **Mediator + Command + Strategy**: the Engine mediates all state flow, endpoint thunks encapsulate operations behind a dispatchable command interface, and interface factories inject interchangeable endpoint strategies per use case.

## Architecture

### Design Patterns: Mediator + Command + Strategy

- **Mediator** — The Engine coordinates all state flow; controllers, endpoints, and state consumers never communicate directly.
- **Command** — Endpoint thunks encapsulate asynchronous operations behind a dispatchable command interface. Controllers trigger commands without knowing how requests are built, executed, or handled.
- **Strategy** — Interface factories inject interchangeable endpoint strategies. Controllers remain agnostic to the underlying API implementation (Search, Commerce, Mock, etc.).

Supporting patterns:

- **Factory Method** — `build*Interface` functions and `getOrCreate*` caches produce scoped instances per interface.

### Benefits of Command-Based Endpoint Architecture

- Endpoint calls become first-class Redux operations (visible in DevTools, standard async lifecycle)
- Removes imperative orchestration from controllers — they just dispatch commands
- Consumers can execute queries via action loaders without needing internal references
- Status management (pending/fulfilled/rejected) uses standard RTK thunk lifecycle
- The endpoint logic becomes a pure function (thunk payload creator), more idiomatic RTK
- Tree-shakable: thunks in separate entry points per operation

### Layered Structure

```
┌──────────────────────────────────────────────────────────────┐
│  Consumer Layer (public API)                                  │
│  Controllers · Action Loaders · State Getters                 │
│  Interface Factories · composeInterfaces                      │
├──────────────────────────────────────────────────────────────┤
│  Core Layer (internal)                                        │
│  Endpoint Thunks (per-interface async action creators)        │
│  Scoped slices, actions, selectors                            │
│  Request selectors · Response handlers                        │
├──────────────────────────────────────────────────────────────┤
│  Engine Layer (internal)                                      │
│  Redux store · adoptSlice · read · mutate · subscribe         │
│  State keyed by interfaceId/featureName                       │
└──────────────────────────────────────────────────────────────┘
```

### State Shape

Flat keys: `"{interfaceId}/{featureName}"`. Global state (configuration) is unscoped.

```
{
  configuration: {...},
  "search-1/searchBox": {query: ''},
  "search-1/results": {results: []},
  "search-1/pagination": {firstResult: 0, pageSize: 10},
  "search-1/searchEndpoint": {status: 'idle', error: null},
  "commerce-1/results": {products: []},
  "commerce-1/pagination": {firstResult: 0, pageSize: 10},
  "composed-abc/searchBox": {query: ''},
  "composed-abc/searchEndpoint": {status: 'idle', error: null},
}
```

---

## Components and Interfaces

### Component 1: Engine (unchanged)

No changes to public API. Internally exposes `FullEngine` via `getFullEngine()`:

- `adoptSlice(slice)` — lazy slice injection
- `read(selector)` — state read
- `mutate(action)` — dispatch
- `subscribe(selector, callback)` — granular subscription

---

### Component 2: Core Types

```typescript
import type {AsyncThunk} from '@reduxjs/toolkit';

// ─── Internal Symbols (NOT exported to consumers) ──────────────────────
// These symbols key the internal fields on interface handles.
// Consumers cannot access them because the symbols are not re-exported
// from public entry points.

export const KIND: unique symbol = Symbol('kind');
export const STATE_ID: unique symbol = Symbol('stateId');
export const ENGINE: unique symbol = Symbol('engine');
export const THUNKS: unique symbol = Symbol('thunks');
export const THUNK_FACTORIES: unique symbol = Symbol('thunkFactories');
export const INTERFACES: unique symbol = Symbol('interfaces');

// ─── Operations Registry ───────────────────────────────────────────────
// Single source of truth: which operations each interface type supports.
// Add a new interface type? Add an entry. Forget an operation in the factory? Build fails.

export interface Operations {
  search: 'search' | 'suggestions';
  commerce: 'search' | 'suggestions';
  conversation: 'conversation';
}

// ─── Endpoint Thunk ────────────────────────────────────────────────────

export type EndpointThunk = AsyncThunk<void, {engine: FullEngine}, {}>;
export type EndpointThunkFactory = (
  engine: FullEngine,
  scope: EndpointStateScope
) => EndpointThunk;

// ─── Interface Handles ─────────────────────────────────────────────────

export interface Interface<T extends keyof Operations = keyof Operations> {
  readonly [KIND]: 'interface';
  readonly [STATE_ID]: string;
  readonly [ENGINE]: FullEngine;
  readonly [THUNK_FACTORIES]: Record<Operations[T], EndpointThunkFactory[]>;
  readonly [THUNKS]: Record<Operations[T], EndpointThunk[]>;
}

export interface ComposedInterface<
  T extends keyof Operations = keyof Operations,
> {
  readonly [KIND]: 'composed';
  readonly [STATE_ID]: string;
  readonly [ENGINE]: FullEngine;
  readonly [INTERFACES]: Interface[];
  readonly [THUNKS]: Record<Operations[T], EndpointThunk[]>;
}

// ─── Controller Constraint ─────────────────────────────────────────────
// "I need these operations to exist on whatever handle I receive"

export type Requires<T extends Operations[keyof Operations]> = {
  readonly [STATE_ID]: string;
  readonly [ENGINE]: FullEngine;
  readonly [THUNKS]: Record<T, EndpointThunk[]>;
};

// ─── Endpoint State Scope ──────────────────────────────────────────────

export interface EndpointStateScope {
  interfaceId: string; // the interface this thunk belongs to
  composedInterfaceId?: string; // present only when part of a composition
}
```

**What the type system enforces:**

| Concern                                             | Mechanism                                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Factory must populate all declared operations       | Return type `Interface<'search'>` requires `Record<Operations['search'], ...>` on both `[THUNK_FACTORIES]` and `[THUNKS]` |
| Adding an operation to a type forces factory update | `Operations['search']` widens → factory body incomplete → build error                                                     |
| Controller rejects incompatible interfaces          | `Requires<'search'>` structural check via symbol-keyed `[THUNKS]`                                                         |
| Single-interface controller rejects composed        | `Interface` via `[KIND]: 'interface'` discriminator                                                                       |
| Different types can have different operations       | `conversation` only requires `'conversation'`, not `'search'`                                                             |
| Consumers cannot access internal fields             | Symbol keys are not exported from public entry points                                                                     |
| Composition re-uses correct thunk creators          | `[THUNK_FACTORIES]` stores the creator functions; `composeInterfaces` calls them with composed scope                      |

---

### Component 3: Interface Factories

**Purpose:** Tree-shaking boundary. Each factory imports only its own endpoint thunk creators.

```typescript
export interface BuildSearchInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildSearchInterface(
  options: BuildSearchInterfaceOptions
): Interface<'search'> {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();
  const scope: EndpointStateScope = {interfaceId};

  const factories: Record<Operations['search'], EndpointThunkFactory[]> = {
    search: [createSearchEndpointThunk],
    suggestions: [createQuerySuggestThunk],
  };

  return Object.freeze({
    [KIND]: 'interface',
    [STATE_ID]: interfaceId,
    [ENGINE]: fullEngine,
    [THUNK_FACTORIES]: factories,
    [THUNKS]: {
      search: factories.search.map((factory) => factory(fullEngine, scope)),
      suggestions: factories.suggestions.map((factory) =>
        factory(fullEngine, scope)
      ),
    },
  });
}
```

**Subpath export:** `@coveo/thermidor/interfaces/search` — unused interface types are dead-code eliminated.

---

### Component 4: `composeInterfaces`

**Purpose:** Combines multiple interfaces into a composite with its own state partition for shared features (query, status). Each thunk reads shared features from the composed partition and reads/writes local features from its sub-interface's partition. The composed interface dispatches thunks to all sub-interfaces in parallel.

```typescript
export function composeInterfaces<T extends keyof Operations>(options: {
  interfaces: Interface<T>[];
}): ComposedInterface<T> {
  const composedId = generateId();
  const engine = options.interfaces[0][ENGINE];

  // For each sub-interface, re-create its thunks scoped to the composed partition
  const composedThunks = options.interfaces.reduce(
    (acc, iface) => {
      const scope: EndpointStateScope = {
        interfaceId: iface[STATE_ID],
        composedInterfaceId: composedId,
      };

      for (const [operation, factories] of Object.entries(
        iface[THUNK_FACTORIES]
      )) {
        const key = operation as Operations[T];
        acc[key] ??= [];
        acc[key].push(...factories.map((factory) => factory(engine, scope)));
      }

      return acc;
    },
    {} as Record<Operations[T], EndpointThunk[]>
  );

  return Object.freeze({
    [KIND]: 'composed',
    [STATE_ID]: composedId,
    [ENGINE]: engine,
    [INTERFACES]: options.interfaces,
    [THUNKS]: composedThunks,
  });
}
```

**Parallel dispatch:** When a controller dispatches a composed operation, all sub-interface thunks are dispatched concurrently via `Promise.all(thunks.map(t => engine.mutate(t({engine}))))`. Each thunk runs independently — failures in one do not block others.

---

### Component 5: Scoped Actions, Selectors, and Slices

Each feature (searchBox, results, pagination, facets) provides three independent factories scoped by `interfaceId`.

**Key principle (ADR-003):** Non-adopted slices are safe no-ops — selectors fall back to initial state, dispatched actions are ignored when no reducer is injected.

**Actions** — standalone, dispatchable without adoption:

```typescript
export function createSearchBoxActions(interfaceId: string) {
  return {
    setQuery: createAction<string>(`${interfaceId}/searchBox/setQuery`),
  };
}
```

**Selectors** — standalone, return initial state if slice not adopted:

```typescript
export function createSearchBoxSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'searchBox',
    initialSearchBoxState
  );
  return {
    getQuery: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.query
    ),
  };
}
```

**Slices** — adopted lazily by controllers:

```typescript
export function createSearchBoxSlice(interfaceId: string) {
  const actions = getOrCreateSearchBoxActions(interfaceId);
  return createSlice({
    name: `${interfaceId}/searchBox`,
    initialState: initialSearchBoxState,
    extraReducers: (builder) => {
      builder.addCase(actions.setQuery, (state, action) => {
        state.query = action.payload;
      });
    },
  });
}
```

**Memoized caches** — one instance per feature per interface:

```typescript
const cache = new Map<string, ReturnType<typeof createSearchBoxActions>>();
export function getOrCreateSearchBoxActions(interfaceId: string) {
  if (!cache.has(interfaceId)) {
    cache.set(interfaceId, createSearchBoxActions(interfaceId));
  }
  return cache.get(interfaceId)!;
}
```

---

### Component 6: Endpoint Thunks

**Purpose:** Scoped API call logic as first-class Redux async actions. Each thunk action creator encapsulates one endpoint for one interface. The payload creator is a pure function containing request building, API call, and response handling — replacing the imperative facade class.

**The composition problem:** A composed search box writes query to the composed partition, but pagination/facets live on each sub-interface. The thunk must read from two partitions.

**Solution:** `EndpointStateScope` captured at thunk creation time with `interfaceId` (always) + optional `composedInterfaceId`. Shared features read from `composedInterfaceId ?? interfaceId`.

```typescript
import {createAsyncThunk} from '@reduxjs/toolkit';

export function createSearchEndpointThunk(
  engine: FullEngine,
  scope: EndpointStateScope
): EndpointThunk {
  const sharableInterfaceId = scope.composedInterfaceId ?? scope.interfaceId;

  // Adopt endpoint slice at creation time (before thunk is ever dispatched)
  engine.adoptSlice(getOrCreateSearchEndpointSlice(sharableInterfaceId));

  const buildRequest = createSearchEndpointRequestSelector(scope);
  const handleResponse = createSearchEndpointResponseHandler(scope.interfaceId);

  const thunk = createAsyncThunk<void, {engine: FullEngine}>(
    `${sharableInterfaceId}/searchEndpoint/execute`,
    async ({engine}) => {
      const request = engine.read(buildRequest);
      const config = readEndpointClientConfiguration(engine);
      const response = await createSearchEndpointClient().call(request, config);

      if (!response.success) {
        throw new Error(response.error);
      }
      if (response.data) {
        handleResponse(engine, response.data);
      }
    }
  );

  return thunk;
}

// The endpoint slice handles lifecycle automatically:
function createSearchEndpointSlice(interfaceId: string, thunk: EndpointThunk) {
  return createSlice({
    name: `${interfaceId}/searchEndpoint`,
    initialState: {status: 'idle', error: null} as SearchEndpointState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'pending';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state) => {
          state.status = 'idle';
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'idle';
          state.error = action.error.message ?? 'An unexpected error occurred.';
        });
    },
  });
}
```

**Request selector — reads from two partitions:**

```typescript
function createSearchEndpointRequestSelector(scope: EndpointStateScope) {
  const sharableInterfaceId = scope.composedInterfaceId ?? scope.interfaceId;

  const searchBox = getOrCreateSearchBoxSelectors(sharableInterfaceId); // query from composed (or self)
  const pagination = getOrCreatePaginationSelectors(scope.interfaceId); // pagination from own interface
  const facets = getOrCreateFacetsSelectors(scope.interfaceId); // facets from own interface

  return createMemoizedStateSelector(
    searchBox.getQuery,
    pagination.getFirstResult,
    pagination.getPageSize,
    facets.buildFacetsRequest,
    (query, firstResult, pageSize, facets): CoveoSearchEndpointRequest => ({
      q: query,
      firstResult,
      numberOfResults: pageSize,
      facets,
    })
  );
}
```

**Response handler — always writes to own interface:**

```typescript
function createSearchEndpointResponseHandler(interfaceId: string) {
  const resultActions = getOrCreateResultsActions(interfaceId);
  const paginationActions = getOrCreatePaginationActions(interfaceId);
  const facetActions = getOrCreateFacetsActions(interfaceId);

  return (engine: FullEngine, response: CoveoSearchEndpointResponse) => {
    engine.mutate(resultActions.setResultsFromResponse(response.results));
    engine.mutate(paginationActions.setTotalCount(response.totalCount));
    engine.mutate(facetActions.updateFromResponse(response.facets));
  };
}
```

**Data flow summary:**

| Feature             | Single Interface | Composed Interface            |
| ------------------- | ---------------- | ----------------------------- |
| Query (read/write)  | `interfaceId`    | `composedInterfaceId`         |
| Pagination (read)   | `interfaceId`    | `interfaceId` (sub-interface) |
| Facets (read)       | `interfaceId`    | `interfaceId` (sub-interface) |
| Results (write)     | `interfaceId`    | `interfaceId` (sub-interface) |
| Status (read/write) | `interfaceId`    | `composedInterfaceId`         |

---

### Component 7: Controllers

**Multi-interface controller:**

Controllers dispatch endpoint thunks instead of calling facade methods. The controller's `submit()` dispatches all thunks for the operation in parallel. Status is derived from the standard RTK thunk lifecycle.

```typescript
export interface SearchBoxControllerOptions {
  interface: Requires<'search'>;
}

export function buildSearchBoxController(
  options: SearchBoxControllerOptions
): SearchBoxController {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const thunks = options.interface[THUNKS].search;

  engine.adoptSlice(getOrCreateSearchBoxSlice(stateId));

  const actions = getOrCreateSearchBoxActions(stateId);
  const selectors = getOrCreateSearchBoxSelectors(stateId);
  const endpointSelectors = getOrCreateSearchEndpointSelectors(stateId);

  const controllerState = createMemoizedStateSelector(
    selectors.getQuery,
    endpointSelectors.getStatus,
    endpointSelectors.getError,
    (query, status, error) => ({
      query,
      isLoading: status === 'pending',
      error,
    })
  );

  return {
    setQuery({query}: {query: string}) {
      engine.mutate(actions.setQuery(query));
    },
    submit() {
      return Promise.all(thunks.map((thunk) => engine.mutate(thunk({engine}))));
    },
    get state() {
      return engine.read(controllerState);
    },
    subscribe(callback: () => void) {
      return engine.subscribe(controllerState, callback);
    },
  };
}
```

**Single-interface controller:**

```typescript
export interface ResultListControllerOptions {
  interface: Interface & Requires<'search'>;
}

export function buildResultListController(
  options: ResultListControllerOptions
): ResultListController {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

  engine.adoptSlice(getOrCreateResultsSlice(stateId));

  const selectors = getOrCreateResultsSelectors(stateId);

  const controllerState = createMemoizedStateSelector(
    selectors.getResults,
    (results) => ({results})
  );

  return {
    get state() {
      return engine.read(controllerState);
    },
    subscribe(callback: () => void) {
      return engine.subscribe(controllerState, callback);
    },
  };
}
```

---

### Component 8: State Getters and Action Loaders

Power-user escape hatches. Separate functions per feature for tree-shaking. Consumers can dispatch endpoint thunks directly via action loaders without needing to know about the internal thunk structure.

```typescript
export interface GetSearchBoxStateOptions {
  interface: Requires<'search'>;
}

export function getSearchBoxState(options: GetSearchBoxStateOptions) {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

  engine.adoptSlice(getOrCreateSearchBoxSlice(stateId));

  const selectors = getOrCreateSearchBoxSelectors(stateId);

  const stateSelector = createMemoizedStateSelector(
    selectors.getQuery,
    (query) => ({query})
  );

  return {
    get query() {
      return engine.read(stateSelector).query;
    },
    subscribe(callback: (state: {query: string}) => void) {
      return engine.subscribe(stateSelector, callback);
    },
  };
}
```

```typescript
export interface LoadSearchBoxActionsOptions {
  interface: Requires<'search'>;
}

export function loadSearchBoxActions(options: LoadSearchBoxActionsOptions) {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const thunks = options.interface[THUNKS].search;

  engine.adoptSlice(getOrCreateSearchBoxSlice(stateId));

  const actions = getOrCreateSearchBoxActions(stateId);

  return {
    setQuery(query: string) {
      engine.mutate(actions.setQuery(query));
    },
    submit() {
      return Promise.all(thunks.map((thunk) => engine.mutate(thunk({engine}))));
    },
  };
}
```

**Key benefit:** Consumers do not need internal knowledge of the endpoint execution machinery. The `submit()` method in action loaders dispatches the same endpoint thunks that controllers use, making the full query lifecycle accessible without building a controller.

---

## Data Models

### State Partitions

Each interface (single or composed) owns state partitions keyed by `"{interfaceId}/{featureName}"`:

```typescript
// Feature state types
interface SearchBoxState {
  query: string;
}

interface ResultListState {
  results: SearchResult[];
}

interface PaginationState {
  firstResult: number;
  pageSize: number;
  totalCount: number;
}

interface FacetState {
  facets: FacetValue[];
}

interface SearchEndpointState {
  status: 'idle' | 'pending';
  error: string | null;
}
```

### EndpointStateScope

```typescript
interface EndpointStateScope {
  interfaceId: string; // the interface this thunk targets
  composedInterfaceId?: string; // present only when part of a composition
}
```

### API Request/Response

```typescript
interface CoveoSearchEndpointRequest {
  q: string;
  firstResult: number;
  numberOfResults: number;
  facets: FacetRequestValue[];
}

interface CoveoSearchEndpointResponse {
  results: SearchResult[];
  totalCount: number;
  facets: FacetValue[];
}
```

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: State Isolation

_For any_ two interfaces A and B built on the same engine, dispatching any mutation (including thunk-generated actions) scoped to Interface A SHALL NOT alter state partitions belonging to Interface B, and SHALL NOT trigger state change notifications for Interface B subscribers.

**Validates: Requirements 6.1, 6.2, 6.3, 3.1, 3.2**

### Property 2: Non-Adopted Slice Safety (Two-Tier Selectors)

_For any_ interface and any feature that has not been adopted, selectors reading from that feature's slice SHALL return deterministic initial state values. Actions dispatched targeting that slice SHALL be no-ops. Once the feature self-registers (via controller or action loader), selectors SHALL switch to reading live state.

**Validates: Requirements 8.1, 8.3, 9.1, 9.2, 9.3**

### Property 3: Composed Query Propagation

_For any_ composed interface with N sub-interfaces, when a controller bound to the composed interface sets a query and dispatches the search thunk, all N endpoint thunks SHALL read that same query value when building their request.

**Validates: Requirements 4.4, 7.1**

### Property 4: Parallel Independence

_For any_ composed interface with N sub-interfaces, if one sub-interface's endpoint thunk rejects, the remaining thunks SHALL complete independently and update their respective state partitions without waiting.

**Validates: Requirements 7.2, 7.3**

### Property 5: Idempotent Adoption

_For any_ interface and any feature slice, calling `adoptSlice` multiple times with the same slice SHALL have no effect beyond the first call — state and behavior are identical whether adopted once or N times.

**Validates: Requirements 8.2, 9.4**

### Property 6: Type-Safe Operation Enforcement

_For any_ interface without a required operation, passing it to a controller or action loader that requires that operation SHALL produce a compile-time error. Verified via type-level tests (expect-error assertions).

**Validates: Requirements 2.2, 2.3, 2.4**

---

## Error Handling

- **Thunk-level:** Each endpoint thunk wraps its payload creator in try/catch. On failure, it dispatches `setError` on the status slice (or the thunk's `rejected` lifecycle fires) and resets status to `'idle'`. Other thunks in a composition are unaffected.
- **Composed submit:** `Promise.all` dispatches all thunks. Individual failures are caught inside each thunk's payload creator — the promise array always resolves (thunks handle their own errors internally).
- **Non-adopted slices:** No error — selectors return initial state, dispatched actions are silently ignored. This is by design, not an error condition.
- **Invalid composition:** Runtime validation (empty array, mismatched engines) throws immediately with a descriptive error at `composeInterfaces` call time.
- **DevTools visibility:** Failed thunks appear as `rejected` actions in Redux DevTools, providing immediate observability without additional instrumentation.

---

## Testing Strategy

- **Unit tests (Vitest):** Each scoped factory (actions, selectors, slices) tested in isolation per feature. Endpoint thunks tested with mocked HTTP clients — assert that dispatching the thunk produces the correct action sequence (pending → fulfilled/rejected). Controllers tested with real engine + adopted slices.
- **Integration tests:** End-to-end flows (build interface → build controller → set query → submit → assert state) verifying the full data path through thunk dispatch.
- **Type-level tests:** `// @ts-expect-error` assertions verifying that incompatible interface/controller combinations fail at compile time.
- **Property-based tests:** State isolation (random mutations on one interface never affect another), idempotent adoption, and composed query propagation.
- **Redux DevTools assertions:** Verify that thunk dispatches produce the expected action type strings in the correct order.

---

## Key Design Decisions

| #   | Decision                                                   | Rationale                                                                                                                                                                           |
| --- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Interface factories as tree-shaking boundary               | Simple DX; per-capability granularity deferred as additive future option                                                                                                            |
| 2   | Flat keyed state (`interfaceId/feature`)                   | Works natively with RTK `combineSlices().inject()`; O(1) lookup                                                                                                                     |
| 3   | Uniform singular `interface` parameter                     | Eliminates `interface` vs `interfaces` inconsistency                                                                                                                                |
| 4   | Centralized request/response (ADR-003)                     | Type-safe, debuggable, single-file traceability; non-adopted slices make it safe                                                                                                    |
| 5   | `[KIND]` discriminator                                     | Compile-time enforcement that single-interface controllers reject composed; widenable later                                                                                         |
| 6   | `Operations` interface + `Requires<T>`                     | `Operations` forces factory completeness per interface type; `Requires` lets controllers declare needs; zero runtime cost                                                           |
| 7   | `EndpointStateScope { interfaceId, composedInterfaceId? }` | Clean separation: thunk always knows its interface; composition is an optional overlay                                                                                              |
| 8   | Endpoint thunks over facade classes                        | First-class Redux operations: visible in DevTools, standard async lifecycle (pending/fulfilled/rejected), tree-shakable, pure payload creators, eliminates imperative orchestration |
| 9   | Thunks dispatched in parallel for composed interfaces      | `Promise.all(thunks.map(...))` preserves parallel independence; each thunk handles its own errors                                                                                   |
| 10  | Unexported symbols for internal fields                     | Consumers cannot access `[ENGINE]`, `[THUNKS]`, `[STATE_ID]` — symbols not re-exported from public entry points. Eliminates "used private API" support burden                       |

---

## Consumer API

```typescript
import {
  Engine,
  buildSearchBoxController,
  buildResultListController,
} from '@coveo/thermidor';
import {buildSearchInterface} from '@coveo/thermidor/interfaces/search';
import {buildCommerceInterface} from '@coveo/thermidor/interfaces/commerce';
import {composeInterfaces} from '@coveo/thermidor';

const engine = new Engine({
  configuration: {
    organizationId: 'myorg',
    accessToken: 'token',
    trackingId: 'sports',
  },
});

const search = buildSearchInterface({engine});
const commerce = buildCommerceInterface({engine});
const composed = composeInterfaces({interfaces: [search, commerce]});

const searchBox = buildSearchBoxController({interface: composed});
const searchResults = buildResultListController({interface: search});
const productResults = buildResultListController({interface: commerce});

searchBox.setQuery({query: 'laptops'});
await searchBox.submit(); // parallel: search + commerce

searchBox.state.isLoading; // true while any request is in flight
searchBox.state.error; // first error, or null
```

---

## File Structure

```
src/
├── index.ts
├── public/
│   ├── interfaces/
│   │   ├── interface-types.ts          # Operations, Interface<T>, ComposedInterface<T>, Requires<T>, EndpointThunk
│   │   ├── search.ts                   # buildSearchInterface
│   │   ├── commerce.ts                 # buildCommerceInterface
│   │   └── compose.ts                  # composeInterfaces
│   ├── controllers/
│   │   ├── search-box/
│   │   │   └── search-box-controller.ts
│   │   ├── result-list/
│   │   │   └── result-list-controller.ts
│   │   └── ...
│   └── actions/
│       ├── search-box/
│       │   ├── search-box-actions.ts
│       │   └── search-box-state.ts
│       └── ...
├── core/
│   ├── interface/
│   │   ├── engine/
│   │   ├── search-box/
│   │   │   ├── search-box-actions.ts
│   │   │   ├── search-box-selectors.ts
│   │   │   ├── search-box-slice.ts
│   │   │   └── search-box-cache.ts
│   │   ├── result-list/
│   │   ├── pagination/
│   │   ├── facets/
│   │   └── utils/
│   │       ├── id-generator.ts
│   │       ├── symbols.ts               # KIND, STATE_ID, ENGINE, THUNKS, THUNK_FACTORIES, INTERFACES
│   │       └── select-slice.ts
│   └── internal/
│       └── api/
│           ├── search-endpoint/
│           │   ├── search-endpoint-thunk.ts
│           │   ├── search-endpoint-request-selector.ts
│           │   └── search-endpoint-response-handler.ts
│           └── commerce-endpoint/
│               ├── commerce-endpoint-thunk.ts
│               ├── commerce-endpoint-request-selector.ts
│               └── commerce-endpoint-response-handler.ts
└── package.json exports:
    "."                       → src/index.ts
    "./interfaces/search"     → src/public/interfaces/search.ts
    "./interfaces/commerce"   → src/public/interfaces/commerce.ts
```

---

## Requirement Mapping

| Requirement                     | How Satisfied                                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| R1: Build an Interface          | Per-type build functions return typed Interface with auto-generated or explicit ID                                      |
| R2: Interface Type Safety       | `[KIND]` discriminator + `Operations` interface + `Requires<T>` enforce compile-time compatibility                      |
| R3: Controller Binding          | Single `interface` param; state read/write scoped to `[STATE_ID]`                                                       |
| R4: Interface Composition       | `composeInterfaces` returns generic `ComposedInterface` with own state partition; parallel thunk dispatch               |
| R5: Actions Scoped to Interface | Action loaders bound to interface's `[STATE_ID]`; can dispatch endpoint thunks directly; type-checked via `Requires<T>` |
| R6: Interface State Isolation   | Flat `interfaceId/feature` keys; mutations target single partition                                                      |
| R7: Parallel Endpoint Requests  | `Promise.all(thunks.map(t => engine.mutate(t({engine}))))` — each thunk dispatched independently                        |
| R8: Feature Self-Registration   | Controllers call `engine.adoptSlice()` on first use; idempotent                                                         |
| R9: Two-Tier Request Selectors  | `createSelectSlice` falls back to initialState; operational once adopted                                                |

## Constraints Satisfied

| Constraint         | How                                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Serializable state | Plain data in Redux store; no closures or class instances in state. Thunks are action creators stored on the interface object (not in Redux state). |
| Opaque Engine      | No new public methods; interface factories use `getFullEngine()` internally                                                                         |
