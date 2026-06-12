# ADR-003: Centralized Request Building and Response Handling for Endpoint Facades

**Status**: `🟡 Proposed`  
**Related docs**: [ADR-000 Architecture Decision Charter](./ADR-000-architecture-decision-charter.md), [ADR-002 Multi-Interface Engine](./ADR-002-multi-interface-engine.md)

## 1. Context

Endpoint facades (e.g., `SearchEndpointFacade`, `CommerceSearchEndpointFacade`) orchestrate the full API lifecycle: build a request from state, execute the HTTP call, and write the response back to state. Multiple state slices participate in both directions.

- **Business/context drivers**: Endpoint requests have finite, well-known schemas defined at design time. Internal wiring should be simple, traceable, and type-safe. A decentralized contributor approach produces an opaque merged request from anonymous, order-dependent functions that is hard to inspect or test.
- **Technical constraints**: Each endpoint facade is instantiated per-interface with scoped IDs, meaning request selectors and response handlers must be factory functions parameterized by interfaceId (per ADR-002).
- **Known assumptions**: Non-adopted slices are safe to read (selectors fall back to initial state) and safe to write to (dispatched actions are ignored when no reducer is injected). This eliminates the need for guards or lazy registration.

## 2. Decision Statement

Endpoint facades should use symmetric centralized patterns for both request building and response handling: scoped factory functions that produce per-interface memoized selectors to build the request from state, and per-interface response handlers to distribute the response via scoped standalone actions.

## 3. Requirements & Considerations Mapping

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
   - **Impact**: None
   - **How addressed (or why deferred)**: This is an internal architectural pattern with no effect on the public API surface; consumers migrating from headless to headless-future are unaffected by how request composition is wired internally.

3. **Requirement**: External contribution readiness
   - **Impact**: Positive
   - **How addressed (or why deferred)**: Clear guidelines for adding new features (create actions, create slice, add to selector, add to handler). One mental model for both directions, consistent across all endpoint facades.

## 4. Options Considered

### Option A (Selected): Symmetric Centralized Patterns

- **Summary**: Each endpoint facade uses a composed memoized selector to build its request from state, and a centralized handler to distribute its response via standalone actions dispatched toward relevant slices.

  **Request building** — scoped factory producing a composed selector:

  ```ts
  // search-endpoint-request-selector.ts
  function createSearchEndpointRequestSelector(interfaceId: string) {
    const searchBoxSel = getOrCreateSearchBoxSelectors(interfaceId);
    const paginationSel = getOrCreatePaginationSelectors(interfaceId);
    const facetsSel = getOrCreateFacetsSelectors(interfaceId);

    return createMemoizedStateSelector(
      searchBoxSel.getQuery,
      paginationSel.getFirstResult,
      paginationSel.getPageSize,
      facetsSel.buildFacetsRequest,
      (query, firstResult, pageSize, facets): CoveoSearchEndpointRequest => ({
        q: query,
        firstResult,
        numberOfResults: pageSize,
        facets,
      })
    );
  }
  ```

  **Response handling** — scoped factory producing a handler with standalone actions:

  ```ts
  // search-endpoint-response-handler.ts
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

  **Key implementation details:**

  - **Memoized caching** — `getOrCreate*` factories (e.g., `getOrCreateSearchBoxSelectors(interfaceId)`) are memoized per interfaceId. Multiple callers (facade, controller) sharing the same interfaceId get the same instance. This ensures selector referential equality for memoization and avoids redundant object creation.
  - **Composed selector memoization** — `createMemoizedStateSelector` produces a selector that only recomputes when its input selectors return new values. The facade can call `engine.read(this.#buildRequest)` on every tick without performance cost — if no input state changed, the cached request object is returned.
  - **Non-adopted slice safety** — selectors from `getOrCreate*` fall back to `initialState` when a slice is not adopted. Actions dispatched to non-adopted slices are no-ops (no reducer to handle them). This makes the pattern completely safe and aligned with lazy loading of feature states: the facade always produces a valid request and can always dispatch response actions, regardless of which controllers have been instantiated.

- **Pros**:
  - **Type safety** — TypeScript guarantees the output matches the endpoint request type at compile time
  - **Debuggability** — one file per direction defines the full request shape or response distribution
  - **No timing issues** — always runs, non-adopted slices simply produce safe no-ops
  - **Consistency** — follows how the rest of Layer 0 works (state → selectors → derived values)
  - **Symmetry** — one mental model for both directions (composed selector ↔ composed handler)
  - **Scoped by design** — factory functions parameterized by `interfaceId` produce per-interface instances, supporting multi-interface architecture natively
- **Cons**:
  - **Central modification required** — adding a new feature requires modifying the scoped factory for the relevant endpoint
  - **Cross-feature coupling** — the factory file is aware of all contributing feature modules
- **Risks**:
  - **File growth** — the factory file may grow large if many features are added (mitigated by keeping each sub-selector in its own feature module)

### Option B: Decentralized `onRequest`/`onResponse` Contributors

- **Summary**: Each feature loader registers an `onRequest` contributor that returns a `Partial<TRequest>` and/or an `onResponse` handler that writes response data to its own slice. The facade merges all request contributions via `deepMerge` at call time, and invokes all response handlers after receiving the response.

  **Request contributor** — registered by each loader:

  ```ts
  // search-box-loader.ts
  export const loadSearchBox = (engine: FullEngine, interfaceId: string) => {
    engine.adoptSlice(getOrCreateSearchBoxSlice(interfaceId));

    const facade = SearchEndpointFacade.getInstance(engine, interfaceId);
    facade.onRequest(() => ({
      q: engine.read(getOrCreateSearchBoxSelectors(interfaceId).getQuery),
    }));
  };
  ```

  **Response handler** — registered by each loader:

  ```ts
  // result-list-loader.ts
  export const loadResultList = (engine: FullEngine, interfaceId: string) => {
    engine.adoptSlice(getOrCreateResultsSlice(interfaceId));

    const facade = SearchEndpointFacade.getInstance(engine, interfaceId);
    facade.onResponse((response) => {
      engine.mutate(getOrCreateResultsActions(interfaceId).setResultsFromResponse(response.results));
    });
  };
  ```

- **Pros**:
  - **Open/closed principle** — new features don't modify the facade or a central file
  - **Lazy composition** — unloaded features contribute nothing
  - **Separation of concerns** — each feature owns its request-to-state and response-to-state mappings
- **Cons**:
  - **Opaque request shape** — scattered across loaders, no single place to inspect the full request
  - **Opaque response flow** — "what happens on request/response?" requires tracing all loaders
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

  **Request** — same scoped factory as Option A:

  ```ts
  // search-endpoint-facade.ts
  const request = engine.read(this.#buildRequest); // scoped selector from createSearchEndpointRequestSelector(interfaceId)
  ```

  **Response** — decentralized handlers registered per loader:

  ```ts
  // pagination-loader.ts
  export const loadPagination = (engine: FullEngine, interfaceId: string) => {
    engine.adoptSlice(getOrCreatePaginationSlice(interfaceId));

    const facade = SearchEndpointFacade.getInstance(engine, interfaceId);
    facade.onResponse((response) => {
      engine.mutate(getOrCreatePaginationActions(interfaceId).setTotalCount(response.totalCount));
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

**Option A** is recommended because it provides one mental model (state-driven selectors for request, standalone actions for response), full type safety, and single-file debuggability per direction. The key insight that makes symmetric centralization viable is that non-adopted slices are safe no-ops in both directions: selectors fall back to initial state, and dispatched actions are ignored without a reducer. The scoped factory pattern (`createSearchEndpointRequestSelector(interfaceId)`) makes centralization even more natural — each facade instance owns its own selector and handler, both parameterized by the same IDs the facade receives at construction time.

**Option B** was rejected because its costs (opacity, silent collisions, ordering fragility, hidden side effects) outweigh its benefits for fixed-schema endpoints. Most of these concerns could technically be mitigated, but each mitigation adds complexity to a pattern whose purpose is to solve a problem we don't have: dynamic composition of a fixed schema.

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
