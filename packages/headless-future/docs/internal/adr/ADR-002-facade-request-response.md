# ADR-002: Centralized Request Building and Response Handling for Endpoint Facades

**Status**: Proposed  
**Related Docs**: -

## 1. Context

Endpoint facades (e.g., `SearchEndpointFacade`, `ConversationEndpointFacade`) orchestrate the full API lifecycle: build a request from state, execute the HTTP call, and write the response back to state. Multiple state slices participate in both directions.

- **Business/context drivers**: Endpoint requests have finite, well-known schemas defined at design time. Internal wiring should be simple, traceable, and type-safe.
- **Technical constraints**: A decentralized contributor approach uses zero-argument closures that can read from anything, violating the architectural rule that all state access goes through the Engine. Contributors are anonymous, order-dependent, and produce an opaque merged request that is hard to inspect or test.
- **Known assumptions**: Non-adopted slices are safe to read (selectors fall back to initial state) and safe to write to (dispatched actions are ignored when no reducer is injected). This eliminates the need for guards or lazy registration.

## 2. Decision Statement

Endpoint facades should use symmetric centralized patterns for both request building and response handling: a composed memoized selector to build the request from state, and a centralized response handler to distribute the response via standalone actions.

## 3. Requirements Mapping

Map this decision to headless-future's Architecture Decision Charter requirements.

### MUST

1. **Requirement**: Full use-case support
   - **Impact**: Positive
   - **How satisfied**: The composed selector reads from all feature slices with fallbacks to initial state, ensuring every use case contributes to the request regardless of adoption order.

2. **Requirement**: Public API independence
   - **Impact**: Positive
   - **How satisfied**: Internal request composition is hidden behind the facade.

3. **Requirement**: First-class SSR
   - **Impact**: None
   - **How satisfied**: N/A

### SHOULD

1. **Requirement**: Tree-shaking efficiency
   - **Impact**: None
   - **How addressed (or why deferred)**: Non-adopted slices contribute safe defaults (no dead code retained at runtime).

2. **Requirement**: Migration simplicity
   - **Impact**: Positive
   - **How addressed (or why deferred)**: The pattern is simpler to learn and use than a contributor registry. Adding a new feature requires modifying two well-known files per endpoint (the request selector and the response handler).

3. **Requirement**: External contribution readiness
   - **Impact**: Positive
   - **How addressed (or why deferred)**: Clear guidelines for adding new features (create actions, create slice, add to selector, add to handler). One mental model for both directions, consistent across all endpoint facades.

## 4. Options Considered

### Option A (Selected): Symmetric Centralized Patterns

- **Summary**: Each endpoint facade uses a composed memoized selector to build its request from state, and a centralized handler to distribute its response via standalone actions dispatched toward relevant slices.

  **Request building** — composed selector:

  ```ts
  // search-endpoint-selectors.ts
  export const buildSearchEndpointRequest = createMemoizedStateSelector(
    searchBoxSelectors.query,
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

  **Response handling** — centralized handler with standalone actions:

  ```ts
  // search-endpoint-response-handler.ts
  export const handleSearchEndpointResponse = (
    engine: FullEngine,
    response: CoveoSearchEndpointResponse
  ) => {
    engine.mutate(resultListActions.setResults(mapResults(response)));
    engine.mutate(paginationActions.setTotalCount(response.totalCount));
    engine.mutate(facetsActions.setFacets(response.facets));
  };
  ```

- **Pros**:
  - **Type safety** — TypeScript guarantees the output matches the endpoint request type at compile time
  - **Debuggability** — one file per direction defines the full request shape or response distribution
  - **No timing issues** — always runs, non-adopted slices simply produce safe no-ops
  - **Consistency** — follows how the rest of Layer 0 works (state → selectors → derived values)
  - **Symmetry** — one mental model for both directions (composed selector ↔ composed handler)
- **Cons**:
  - **Central modification required** — adding a new feature requires modifying the centralized selector/handler for the relevant endpoint
  - **Cross-feature imports** — the selector file imports from all contributing feature modules
- **Risks**:
  - **File growth** — the selector file may grow large if many features are added (mitigated by keeping each sub-selector in its own feature module)

### Option B: Decentralized `onRequest`/`onResponse` Contributors

- **Summary**: Each feature loader registers an `onRequest` contributor that returns a `Partial<TRequest>` and/or an `onResponse` handler that writes response data to its own slice. The facade merges all request contributions via `deepMerge` at call time, and invokes all response handlers after receiving the response.

  **Request contributor** — registered by each loader:

  ```ts
  // search-box-loader.ts
  export const loadSearchBox = (engine: FullEngine) => {
    engine.adoptSlice(searchBoxSlice);

    const facade = SearchEndpointFacade.getInstance(engine);
    facade.onRequest(() => ({
      q: engine.read(searchBoxSelectors.getQuery),
    }));
  };
  ```

  **Response handler** — registered by each loader:

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

- **Pros**:
  - **Open/closed principle** — new features don't modify the facade or a central file
  - **Lazy composition** — unloaded features contribute nothing
  - **Separation of concerns** — each feature owns its request-to-state and response-to-state mappings
- **Cons**:
  - **Unconstrained closures** — zero-argument closures can read from anything, violating the Layer 0 state-access rule
  - **Opaque request shape** — scattered across loaders, no single place to inspect the full request
  - **Opaque response flow** — "what happens on response?" requires tracing all loaders
  - **Silent field collisions** — overlapping fields resolved by implicit registration order
  - **Array replacement** — `deepMerge` replaces arrays instead of merging them, causing silent data loss
  - **Registration timing** — calling the endpoint before a loader registers means params silently missing or response data silently lost
  - **No fault isolation** — any contributor throwing aborts the entire call
  - **Contributor leak** — unsubscribe handles are easily discarded
- **Risks**:
  - **Order sensitivity** — changing controller instantiation order in consumer code silently changes the request
  - **Hidden side effects** — response handlers fire implicitly; harder to debug ordering issues

### Option C: Centralized Request Selector with Decentralized `onResponse` Handlers

- **Summary**: Use a composed selector for request building (centralized), but each feature loader registers an `onResponse` handler for response distribution (decentralized). This is an asymmetric approach — one pattern for request, another for response.

  **Request** — same composed selector as Option A:

  ```ts
  // search-endpoint-facade.ts
  const request = engine.read(buildSearchEndpointRequest);
  ```

  **Response** — decentralized handlers registered per loader:

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

- **Pros**:
  - **Type-safe requests** — request side gets full type safety and single-file debuggability
  - **Lazy response composition** — response side benefits from lazy composition and separation of concerns
- **Cons**:
  - **Two patterns** — two different patterns to learn (centralized for request, decentralized for response)
  - **Response timing sensitivity** — a feature that registers its handler after the first call misses that response
  - **Response side effects** — response side retains hidden side effects and ordering concerns
  - **Unjustified asymmetry** — adds cognitive overhead without clear justification when non-adopted slices already safely ignore dispatched actions
- **Risks**:
  - **Inconsistency** — invites confusion about which pattern to use when

## 5. Decision Rationale

Endpoint request schemas are finite, well-known, and defined at design time. There is no internal scenario requiring dynamic composition — every feature always contributes its fields. The decentralized contributor pattern's complexity (registry, merge semantics, implicit ordering) buys composability that is not needed for internal wiring.

**Option A** is recommended because it provides one mental model (state-driven selectors for request, standalone actions for response), full type safety, single-file debuggability per direction, and eliminates the architectural flaw of zero-argument closures. The key insight that makes symmetric centralization viable is that non-adopted slices are safe no-ops in both directions: selectors fall back to initial state, and dispatched actions are ignored without a reducer.

**Option B** was rejected because its costs (opacity, silent collisions, ordering fragility, hidden side effects) outweigh its benefits for fixed-schema endpoints.

**Option C** was rejected because its asymmetry adds cognitive overhead without justification — the same safe no-op property that makes the centralized selector work also makes the centralized response handler work.

## 6. Public API and Contract Impact

- **Public API changes**: None — internal architecture decision
- **Backward compatibility impact**: None for consumers; internal architecture decision
- **Deprecations required**: None
- **Type/contract stability notes**: Composed selectors produce compile-time-verified request types, improving type stability
- **Non-leakage check (implementation details not exposed)**: Pass

## 7. Operational and Runtime Impact

- **Performance impact**: Positive — memoized selectors avoid redundant request recomputation
- **Reliability impact**: Positive — eliminates silent field collisions, array replacement bugs, and registration timing issues
- **Security/privacy impact**: None
- **SSR impact (if applicable)**: None
- **Observability impact (logs/metrics/traces)**: Positive — the full request is inspectable at any time via the composed selector without triggering a network call

## 8. Migration and Rollout Plan

- **Consumer migration impact**: None — this is an internal architectural decision
- **Rollout strategy (flagged, phased, big-bang)**: Big-bang (internal to headless-future)
- **Rollback strategy**: Revert to contributor-based wiring
- **Communication plan**: None required (internal decision, no public API impact)
