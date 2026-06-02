# Architecture: Request Building & Response Handling

## Table of Contents

- [1. Overview](#1-overview)
- [2. Request Building](#2-request-building)
  - [2.1 Approach: Centralized Composed Selector](#21-approach-centralized-composed-selector)
  - [2.2 Alternative Considered: Decentralized onRequest Contributors](#22-alternative-considered-decentralized-onrequest-contributors)
  - [2.3 Request Building Recommendation](#23-request-building-recommendation)
- [3. Response Handling](#3-response-handling)
  - [3.1 Option A: Centralized Response Handler with Standalone Actions](#31-option-a-centralized-response-handler-with-standalone-actions)
  - [3.2 Option B: Decentralized onResponse Handlers](#32-option-b-decentralized-onresponse-handlers)
  - [3.3 Response Handling Recommendation](#33-response-handling-recommendation)
- [4. Key Insight: Non-Adopted Slices Are Safe](#4-key-insight-non-adopted-slices-are-safe)
- [5. Final Recommendation](#5-final-recommendation)
- [6. Guidelines for Adding New Features](#6-guidelines-for-adding-new-features)

---

## 1. Overview

The `SearchEndpointFacade` (in `packages/headless-future/src/core/interface/api/search-endpoint/`) orchestrates the full search lifecycle:

1. **Build** a request from state
2. **Execute** the HTTP call
3. **Write** the response back to state

This document evaluates architectural options for steps 1 and 3, where multiple state slices are involved.

---

## 2. Request Building

The facade must compose a single `CoveoSearchEndpointRequest` object from data spread across multiple slices (searchBox, pagination, facets, etc.).

### 2.1 Approach: Centralized Composed Selector

A single composed selector reads from all relevant slices and produces the full request:

```ts
// search-endpoint-selectors.ts
import * as searchBoxSelectors from '@/src/core/interface/search-box/search-box-selectors.js';
import * as paginationSelectors from '@/src/core/interface/pagination/pagination-selectors.js';
import * as facetsSelectors from '@/src/core/interface/facets/facets-selectors.js';

export const buildSearchEndpointRequest = createMemoizedStateSelector(
  searchBoxSelectors.getQuery,
  paginationSelectors.currentPage,
  paginationSelectors.pageSize,
  facetsSelectors.buildFacetsRequest,
  (query, currentPage, pageSize, facets): CoveoSearchEndpointRequest => ({
    q: query,
    firstResult: (currentPage - 1) * pageSize,
    numberOfResults: pageSize,
    facets: facets,
  })
);
```

Each input selector falls back to initial state if the slice isn't adopted:

```ts
const getPaginationState = (state: State) =>
  state.pagination ?? initialPaginationState;
```

#### Pros

- **Type safety** — TypeScript guarantees the output matches `CoveoSearchEndpointRequest`
- **Debuggability** — one file defines the full request shape
- **Testability** — pass a mock state, get a deterministic request
- **Graceful defaults** — unloaded features contribute sensible defaults via `?? initialState` fallbacks

#### Cons

- Adding a new feature requires modifying this selector
- Cross-feature imports in one file

---

### 2.2 Alternative Considered: Decentralized `onRequest` Contributors

Each loader registers a request fragment contributor:

```ts
facade.onRequest(() => ({
  firstResult: (currentPage - 1) * pageSize,
  numberOfResults: pageSize,
}));
```

#### Pros

- Symmetry with a decentralized response pattern
- True lazy composition — unloaded features contribute nothing
- Open/closed principle — new features don't modify the facade's selector
- No cross-feature imports

#### Cons

- **Opaque request shape** — final request is scattered across loaders
- **Ordering and conflicts** — merge order matters for overlapping fields
- **State access** — contributors need `engine.read()` closures, making them impure
- **Harder to type** — merged `Partial<>` fragments don't guarantee completeness at compile time
- **Registration timing** — `callEndpoint()` before a loader registers means params silently missing
- **Harder to test** — requires setting up all loaders vs. calling one selector

#### When it would be appropriate

For open-ended schemas (e.g., GraphQL-style) where the request shape is dynamic and features declare their own query fragments. Not suited for a fixed REST contract like `CoveoSearchEndpointRequest`.

---

### 2.3 Request Building Recommendation

**Use the centralized composed selector.** The API has a known, finite schema. Compile-time type safety and single-file debuggability outweigh the minor cost of modifying the selector when adding features.

---

## 3. Response Handling

After receiving a `CoveoSearchEndpointResponse`, the facade must distribute data to multiple slices (results, pagination, facets, etc.).

### 3.1 Option A: Centralized Response Handler with Standalone Actions

A single composed function dispatches standalone actions toward multiple slices — the mirror of the composed selector:

```ts
// search-endpoint-response-handler.ts
import * as resultListActions from '@/src/core/interface/result-list/result-list-actions.js';
import * as paginationActions from '@/src/core/interface/pagination/pagination-actions.js';
import * as facetsActions from '@/src/core/interface/facets/facets-actions.js';

export const handleSearchEndpointResponse = (
  engine: FullEngine,
  response: CoveoSearchEndpointResponse
) => {
  engine.mutate(resultListActions.setResults(mapResults(response)));
  engine.mutate(paginationActions.setTotalCount(response.totalCount));
  engine.mutate(facetsActions.updateFromResponse(response.facets));
};
```

Actions are standalone (created with `createAction`), decoupled from slices:

```ts
// pagination-actions.ts
import {createAction} from '@reduxjs/toolkit';

export const setTotalCount = createAction<number>('pagination/setTotalCount');
```

Slices listen via `extraReducers`:

```ts
// pagination-slice.ts
import * as paginationActions from '@/src/core/interface/pagination/pagination-actions.js';

const paginationSlice = createSlice({
  name: 'pagination',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(paginationActions.setTotalCount, (state, action) => {
      state.totalCount = action.payload;
    });
  },
});
```

Called from the facade:

```ts
// In SearchEndpointFacade.callEndpoint()
handleSearchEndpointResponse(engine, responseData);
```

#### Pros

- **Symmetric with request building** — one pattern for both directions (composed selector ↔ composed handler)
- **Debuggability** — one file shows everything that happens on response
- **No registration timing issues** — always runs, non-adopted slices simply ignore the action
- **Testable** — call the handler with a mock engine and response, assert mutations
- **No hidden side effects** — no handlers registered elsewhere that fire implicitly

#### Cons

- Adding a new feature requires modifying this handler
- All actions are dispatched even if the consuming slice isn't adopted (harmless no-op, but not "lazy")

---

### 3.2 Option B: Decentralized `onResponse` Handlers

Each feature's loader registers an `onResponse` handler on the facade:

```ts
// result-list-loader.ts
export const loadResultList = (engine: FullEngine) => {
  engine.adoptSlice(resultsSlice);

  const facade = SearchEndpointFacade.getInstance(engine);
  facade.onResponse((response) => {
    engine.mutate(setResults(mapSearchEndpointResponseToResultList(response)));
  });
};
```

```ts
// pagination-loader.ts
export const loadPagination = (engine: FullEngine) => {
  engine.adoptSlice(paginationSlice);

  const facade = SearchEndpointFacade.getInstance(engine);
  facade.onResponse((response) => {
    engine.mutate(setTotalCount(response.totalCount));
  });
};
```

#### Pros

- **Lazy composition** — only loaded features register handlers
- **Separation of concerns** — each feature owns its response-to-state mapping
- **Open/closed** — new features don't modify the facade or a central handler
- **Testable in isolation** — each loader tested with a mock facade

#### Cons

- **Two patterns** — request is centralized, response is decentralized (asymmetry to learn)
- **Scattered logic** — "what happens on response?" requires tracing all loaders
- **Registration timing** — if `callEndpoint()` fires before a loader registers, that feature misses the response
- **Hidden side effects** — handlers fire implicitly; harder to debug ordering issues

---

### 3.3 Response Handling Recommendation

Both options are viable. The choice depends on which property you value more:

| Priority                                  | Choose                                |
| ----------------------------------------- | ------------------------------------- |
| Consistency (one pattern) + debuggability | Option A — Centralized handler        |
| Lazy composition + open/closed principle  | Option B — Decentralized `onResponse` |

---

## 4. Key Insight: Non-Adopted Slices Are Safe

Both reading and writing to non-adopted slices are no-ops:

| Direction            | Non-adopted slice behavior                                               |
| -------------------- | ------------------------------------------------------------------------ |
| **Read** (selector)  | `state.pagination` is `undefined` → fallback to `initialPaginationState` |
| **Write** (mutation) | Action dispatched → no reducer injected → action is ignored              |

This means:

- The centralized **selector** safely reads from all slices regardless of adoption (defaults apply)
- The centralized **handler** safely dispatches to all slices regardless of adoption (actions are ignored)

No guards, no checks, no eager adoption required. When a loader later adopts a slice, subsequent requests/responses will naturally include it.

---

## 5. Final Recommendation

Use **symmetric centralized patterns** for both request and response:

| Direction | Pattern                                            | File                                  |
| --------- | -------------------------------------------------- | ------------------------------------- |
| Request   | Composed selector reads many slices → one request  | `search-endpoint-selectors.ts`        |
| Response  | Composed handler writes one response → many slices | `search-endpoint-response-handler.ts` |

This gives:

- One mental model to learn
- One file per direction to debug
- Full type safety on request
- Safe no-op behavior for non-adopted slices
- No registration timing concerns

---

## 6. Guidelines for Adding New Features

1. **Create standalone actions** for your feature using `createAction`:

   ```ts
   // my-feature-actions.ts
   import {createAction} from '@reduxjs/toolkit';
   export const setMyData = createAction<MyData>('myFeature/setMyData');
   ```

2. **Create your slice** and listen to standalone actions via `extraReducers`:

   ```ts
   // my-feature-slice.ts
   import * as myFeatureActions from './my-feature-actions.js';

   const myFeatureSlice = createSlice({
     name: 'myFeature',
     initialState,
     reducers: {},
     extraReducers: (builder) => {
       builder.addCase(myFeatureActions.setMyData, (state, action) => {
         state.data = action.payload;
       });
     },
   });
   ```

3. **Add your selector** to the composed `buildSearchEndpointRequest` in `search-endpoint-selectors.ts`:

   ```ts
   import * as myFeatureSelectors from '@/src/core/interface/my-feature/my-feature-selectors.js';
   ```

4. **Ensure the selector has a fallback** to initial state:

   ```ts
   const getMyFeatureState = (state: State) =>
     state.myFeature ?? initialMyFeatureState;
   ```

5. **Add your action dispatch** to `handleSearchEndpointResponse` in `search-endpoint-response-handler.ts`:

   ```ts
   import * as myFeatureActions from '@/src/core/interface/my-feature/my-feature-actions.js';

   // Inside handleSearchEndpointResponse:
   engine.mutate(myFeatureActions.setMyData(mapMyData(response)));
   ```

6. **Create a loader** that adopts the slice (use a `WeakSet<FullEngine>` guard to prevent double-adoption):
   ```ts
   export const loadMyFeature = (engine: FullEngine) => {
     engine.adoptSlice(myFeatureSlice);
   };
   ```
