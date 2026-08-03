# Public-Facing Abstractions

**Status**: `🟡 Proposed`  
**Related docs**: [ADR-000 Architecture Decision Charter](./ADR-000-architecture-decision-charter.md), [ADR-001 Anti-Corruption Layer](./ADR-001-anti-corruption-layer.md), [ADR-002 Multi-Interface Engine](./ADR-002-multi-interface-engine.md), [ADR-004 Lazy Facade Resolvers](./ADR-004-lazy-facade-resolvers.md)

## 1. Context

Thermidor is a proposed replacement for the current `@coveo/headless` architecture. The current library exposes Redux concepts (action creators, reducers, selectors, middleware, thunks) and Coveo REST API contracts directly to consumers, which tightly couples consumer code to both the state management implementation and the backend transport layer.

Thermidor's public API must satisfy three goals simultaneously:

1. **Hide all implementation details** (Redux, internal state shape, transport layer) behind a stable, domain-oriented contract.
2. **Support multiple execution contexts** (search, commerce, generative/agentic) from a single engine instance.
3. **Serve two distinct consumer profiles**: standard UI builders who want high-level orchestrated workflows, and power users who need fine-grained state control for custom behaviors.

This ADR crystallizes the public-facing concepts that consumers interact with, justifies why each abstraction exists, and explains why alternative models were rejected. Most of the Thermidor architecture derives from these choices — they define the developer experience (DX) and constrain all internal design decisions.

- **Business/context drivers**: Consumer code must survive internal refactors (e.g., replacing Redux with Zustand), backend API changes, and the addition of new use cases — without breaking changes. The API must be learnable for new adopters and powerful enough for advanced implementations.
- **Technical constraints**: Must support tree-shaking, SSR, lazy state loading, and multi-interface composition. Must not leak state-library or transport-layer concepts (per ADR-001).
- **Known assumptions**: The generative/agentic use case is still evolving and may influence the interface taxonomy in the future. A unified API that subsumes all interface types is being explored but not yet validated.

## 2. Decision Statement

Thermidor's public API is organized around four consumer-facing abstractions, layered from broad to specific:

1. **Engine** — an opaque state container that owns all application state for a given Coveo organization context.
2. **Interface** — a typed handle representing a specific execution context (search, commerce, generative). The scope within which controllers operate and API calls are issued.
3. **Controller** — a high-level, feature-oriented object for building UIs. Orchestrates state and API calls behind a minimal, domain-level API.
4. **Action** — a curated, low-level state mutation function for power users who need fine-grained control beyond what controllers offer.

### Planned addition: State Reader

A fifth abstraction — **State Reader** — is planned to provide symmetric read access to feature state for power users. Today, actions allow writing state without a controller, but there is no equivalent for reading or subscribing to state without instantiating a full controller. State readers would fill this gap: one per feature, lightweight (no API orchestration or facade resolution), accepting an interface parameter like controllers and actions.

This restores symmetry in the power-user API (actions for writing, state readers for observing) and supports use cases like cross-cutting analytics, custom orchestration, and testing/tooling — without forcing consumers to instantiate a full controller just to observe state.

The design and contract of state readers will be discussed in a dedicated upcoming ADR.

## 3. Requirements & Considerations Mapping

### MUST

1. **Requirement**: Full use-case support
   - **Impact**: Positive
   - **How satisfied**: The Engine + Interface + Controller layering supports search, commerce, and generative use cases. Controllers encapsulate complete feature workflows. Actions (and eventually state readers) provide an escape hatch for use cases not covered by controllers. Controllers accept any interface satisfying their facade requirements (via `Supports<F>`), enabling multi-interface patterns where a single controller spans multiple endpoints.

2. **Requirement**: Public API independence
   - **Impact**: Positive
   - **How satisfied**: All four abstractions are domain-level concepts. None expose Redux, Immer, or transport-layer types. The Engine's internal operations (`read`, `subscribe`, `mutate`) are hidden behind controllers and actions — consumers never call them directly. The anti-corruption layer (ADR-001) guarantees that internal changes cannot propagate to the public surface.

3. **Requirement**: First-class SSR
   - **Impact**: Positive
   - **How satisfied**: The Engine is a plain class (no singletons, no module-level state). Interfaces accept optional explicit IDs for deterministic hydration. Controllers are stateless factories that can be re-instantiated server-side. State is serializable.

### SHOULD

1. **Consideration**: Tree-shaking efficiency
   - **Impact**: Positive
   - **How addressed**: Each interface type is a separate `build*Interface` import — unused interface types are eliminated entirely. Controllers and actions are individual imports. Feature state is lazy-loaded (adopted on first use), so unused features add zero runtime cost.

2. **Consideration**: Migration simplicity
   - **Impact**: Mixed
   - **How addressed (or why deferred)**: Three of the four abstractions (Engine, Controller, Action) already exist in current headless — Thermidor changes their contracts but not their conceptual roles. The only net-new abstraction is the Interface, which introduces a scoping concept that has no direct equivalent today. The breaking changes are real but the mental model transition is incremental: consumers already think in terms of engines, controllers, and actions. Migration guides with before/after examples will document the transition.

3. **Consideration**: External contribution readiness
   - **Impact**: Positive
   - **How addressed**: The pattern is uniform and repeatable. Every controller follows the same factory function pattern. Every action loader follows the same slice-adoption + bound-mutation pattern. Adding a new feature means creating a new controller and optionally a new action loader — no modification to Engine or Interface required.

## 4. Options Considered

### Option A (Selected): Engine → Interface → Controller / Action (layered abstractions)

- **Summary**: Four distinct abstractions with clear responsibilities. The Engine owns state. Interfaces scope execution contexts. Controllers orchestrate features for UI builders. Actions provide direct mutations for power users. Controllers accept any interface satisfying their declared facade requirements (enforced via `Supports<F>`), enabling multi-interface patterns without additional abstractions.

  **Consumer code example (standard):**

  ```ts
  const engine = new Engine({configuration: {organizationId, accessToken}});

  const search = buildSearchInterface({engine});

  const searchBox = buildSearchBoxController({interface: search});
  const resultList = buildResultListController({interface: search});

  searchBox.subscribe((state) => renderSearchBox(state));
  resultList.subscribe((state) => renderResults(state));

  searchBox.setQuery({query: 'laptops'});
  searchBox.submit();
  ```

  **Consumer code example (power user):**

  ```ts
  const actions = loadSearchBoxActions({interface: search});
  actions.setQuery({query: 'laptops'});
  actions.submit();
  ```

  **Consumer code example (multi-interface):**

  ```ts
  const search = buildSearchInterface({engine});
  const commerce = buildCommerceInterface({engine});

  // Controllers accept any interface satisfying Supports<F>
  const searchBox = buildSearchBoxController({interface: search});
  const productList = buildProductListController({interface: commerce});
  // Multi-endpoint dispatch is handled internally by controllers
  ```

- **Pros**:
  - **Separation of concerns**: each abstraction has a single, clear responsibility
  - **Appropriate API for each audience**: controllers for UI builders, actions for framework authors
  - **Implementation-agnostic**: consumers never interact with Redux, state selectors, or mutations
  - **Extensible without breaking changes**: new interface types, controllers, and actions are additive
  - **Tree-shakeable by design**: unused interface types and controllers are eliminated
  - **SSR-compatible**: no singletons, explicit IDs, serializable state
  - **Discoverability**: `build*Interface` and `build*Controller` factories are self-documenting

- **Cons**:
  - **Interface as an intermediary** adds one layer between engine and controllers

- **Risks**:
  - The Interface concept may feel like unnecessary indirection for simple single-use-case pages
  - If a unified API is validated, the current interface taxonomy may need restructuring

### Option B: Engine + Controllers + Actions only (no Interface intermediary)

- **Summary**: Controllers and actions accept the Engine directly. The use-case scope (search vs. commerce) is declared as a controller/action option or inferred from the controller type.

  ```ts
  const engine = new Engine({ ... });
  const searchBox = buildSearchBoxController({ engine, useCase: 'search' });
  const actions = loadSearchBoxActions({ engine, useCase: 'search' });
  ```

- **Pros**:
  - Fewer concepts (no Interface to learn)
  - Simpler getting-started experience for single-use-case pages
- **Cons**:
  - **Multi-interface is awkward**: controllers that need to span multiple interfaces require special handling — scoping becomes implicit and type safety degrades.
  - **State scoping is implicit**: no explicit handle to represent "this search interface instance." Multiple independent search interfaces on one page become difficult.
  - **Facade resolution conflated with controllers**: each controller must internally decide which API facades to call based on `useCase` string, duplicating routing logic.
  - **Tree-shaking degrades**: all use-case facades must be bundled because the controller can't know at build time which use case it'll serve.
  - **Actions have no scope**: `loadSearchBoxActions({ engine })` — which interface's state is being mutated?
- **Risks**:
  - Scaling to 5+ use cases makes the controller options object unwieldy
  - Loss of type safety: `useCase: 'search'` is a runtime string, not a compile-time constraint

## 5. Decision Rationale

The selected model (Option A) satisfies all three MUST requirements simultaneously:

1. **Full use-case support**: The Engine + Interface layering handles single-use-case, multi-use-case, and hybrid scenarios. Controllers cover standard features; actions cover advanced ones.

2. **Public API independence**: Consumers interact exclusively with domain-level concepts (interfaces, controllers, actions). No state-library or transport-layer concepts leak through. The anti-corruption boundary is enforced at the Interface/Controller/Action level.

3. **First-class SSR**: The Engine is instantiable, interfaces accept explicit IDs, controllers are stateless factories. No module-level state or browser dependencies.

**Why the Interface layer is justified despite the added indirection:**

The Interface is the architectural linchpin. It provides:

- **Scoped identity**: multiple independent search interfaces on one page each have their own state partition.
- **Type-safe facade resolution**: the interface carries its own facade resolvers (per ADR-004), ensuring that controllers call the correct API endpoints without runtime configuration.
- **Polymorphic dispatch target**: controllers can dispatch against any interface that satisfies their declared facade requirements (via `Supports<F>`). The interface carries typed facade resolvers that enable polymorphic dispatch without runtime configuration.
- **Tree-shaking boundary**: unused interface types (and their facade code) are eliminated at build time.

Without it, all of these concerns collapse into the controller or the engine, violating separation of concerns and degrading extensibility. Option B demonstrates this directly: removing interfaces forces state scoping, facade resolution, and composition all into the controller layer, which degrades type safety, tree-shaking, and multi-interface support.

**Why two consumer layers (Controllers + Actions):**

A single abstraction cannot serve both UI builders (who want orchestrated, high-level APIs) and framework authors (who want raw state control). Controllers are opinionated and safe; actions are flexible and explicit. Combining them into one API either over-simplifies the power-user path or over-complicates the standard path.

## 6. Public API and Contract Impact

- **Public API changes**: Yes — this defines the proposed Thermidor public API surface, which would be a breaking change from current headless.
- **Backward compatibility impact**: Breaking. The contracts and behaviors change, but the conceptual model aims to remain familiar: Engine, Controller, and Action are all concepts that exist in current headless. Interface is the only net-new abstraction.
- **Deprecations required**: If adopted, all Redux-leaking APIs from current headless (`engine.dispatch`, `engine.state`, raw action creators, reducer registration).
- **Type/contract stability notes**: Each abstraction has explicit stability guarantees:
  - Engine: stable (constructor + `dispose()`)
  - Interface builders: stable (additive — new interface types are non-breaking)
  - Controllers: stable (new controllers are additive; existing controller APIs follow semver)
  - Actions: less stable than controllers (power-user API, may evolve faster; documented as such)
- **Non-leakage check (implementation details not exposed)**: Pass. No Redux, Immer, or transport types in the public surface.

## 7. Operational and Runtime Impact

- **Performance impact**: Positive. Lazy state adoption means unused features cost nothing. Memoized controller state selectors prevent redundant recomputation.
- **Reliability impact**: Positive. Controllers encapsulate invariant maintenance (correct mutation sequences, loading state transitions). Consumers cannot accidentally corrupt state through invalid mutation ordering.
- **Security/privacy impact**: None identified.
- **SSR impact (if applicable)**: Positive. No singletons, no module-level state, explicit interface IDs for deterministic hydration.
- **Observability impact (logs/metrics/traces)**: Neutral. Controllers could be instrumented to emit usage telemetry in the future.

## 8. Migration and Rollout Plan

- **Consumer migration impact**: High. All consumer code must be rewritten to use the new abstractions. Conceptual mapping:

  | Current Headless                    | Thermidor                                                        |
  | ----------------------------------- | ---------------------------------------------------------------- |
  | `buildSearchEngine(config)`         | `new Engine(config)` + `buildSearchInterface({ engine })`        |
  | `buildSearchBox(engine)`            | `buildSearchBoxController({ interface: searchInterface })`       |
  | `engine.dispatch(updateQuery({q}))` | `searchBox.setQuery({ query })` or `actions.setQuery({ query })` |
  | `engine.state.search.results`       | `resultList.state.results`                                       |

- **Rollout strategy (flagged, phased, big-bang)**: If adopted, big-bang with a new major version. No gradual migration path from current headless — the abstraction models are incompatible.
- **Rollback strategy**: Consumers remain on current headless until Thermidor is validated and proven stable.
- **Communication plan**: Migration guide with before/after examples for every common pattern. Deprecation notices in current headless once Thermidor's public API contract is deemed stable.

---

## Annex: Abstraction Relationships

[Abstraction relationships diagram (Mermaid source)](./ADR-005-public-facing-abstractions.mermaid)

**Cardinality notes:**

- **Engine**: typically one per application, but not enforced as a singleton — multiple engines can coexist for testing or isolated contexts.
- **Interfaces**: one or more per engine. Multiple interfaces of the same type are valid (e.g., two independent search interfaces on one page).
- **Controllers**: one or more per interface. Most controllers target a single interface. Controllers that own per-interface state (result list, pagination, converse) must target a single interface. Controllers whose semantics are "fan-out" (e.g., search box triggering queries on multiple endpoints) accept any interface satisfying their `Supports<F>` constraint.
- **Actions**: used internally by controllers for state mutations, but also callable directly by consumers for custom workflows outside the controller pattern.

## Annex: Abstraction Lifecycle

Each abstraction follows a **create → use → dispose** lifecycle. Understanding this model clarifies ownership semantics and prevents resource leaks.

- **Engine**: the root owner of all state, subscriptions, and in-flight requests. Calling `engine.dispose()` tears down these resources and severs internal references, making the engine — and everything it transitively owns — eligible for garbage collection. Primary use cases for disposal are SPA route transitions (where an engine is scoped to a view or micro-frontend being unmounted) and SSR (where the engine must be released after state serialization so the process does not accumulate memory across requests).

- **Interface**: created from an engine, active for the lifetime of its use case. Disposing the engine cascades to all interfaces it owns. An interface can also be individually disposed (e.g., removing one search panel while keeping the engine alive for another) — this unsubscribes that interface's controllers and releases its resources without affecting sibling interfaces.

- **Controllers and Actions**: stateless by design. Controllers subscribe to interface state on creation and unsubscribe when their parent interface is disposed. They hold no resources that require independent cleanup. Actions are pure mutation functions with no lifecycle of their own.
