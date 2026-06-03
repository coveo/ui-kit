# Introduce multi-interface engine architecture

**Status**: Proposed
**Related docs**: -

## 1. Context

Describe the problem, constraints, and why a decision is needed now.

- **Business/context drivers**: Real-world implementations need to combine search, commerce search, product listing, and conversation from a single page with shared UI elements (e.g., one search box driving both a search endpoint and a commerce-search endpoint in parallel). Today, a headless-future `Engine` instance supports only a single execution context.

- **Technical constraints**: The architecture must preserve full TypeScript type safety, tree-shaking efficiency, and state isolation between execution contexts. It must not preclude future SSR support.

- **Known assumptions**: headless-future is a POC. Backward compatibility with the current headless package is not a constraint. This will be a major version with breaking changes. SSR is aspirational and not yet designed.

## 2. Decision Statement

Introduce "interfaces" as typed, independently stateful execution contexts registered against a shared engine via per-type register functions. Controllers, actions, and hooks bind to one or more interfaces. State is partitioned by interface ID within a single store. Optional explicit IDs and a serializable-state constraint preserve future SSR compatibility without designing for it now.

## 3. Requirements & Considerations Mapping

Map this decision to headless-future's Architecture Decision Charter requirements.

- **Requirement**: Full use-case support
  - **Impact**: High. This is the core motivation for the feature.
  - **How satisfied**: All known interface types (search, commerceSearch, commerceProductListing, commerceRecommendations, conversation) are supported. Multiple instances of the same type are allowed. Cross-interface controllers (search box) enable combined use cases.

- **Requirement**: Public API independence
  - **Impact**: High. Introduces new public surface (register functions, interface objects, controller binding options).
  - **How satisfied**: Public API exposes domain-level concepts only (interface types, controller bindings). Redux store structure, slice internals, and state partitioning strategy are not observable through the public contract.

- **Requirement**: First-class SSR
  - **Impact**: Medium. Deferred but not blocked.
  - **How satisfied**: Optional explicit interface IDs enable deterministic hydration matching. Serializable-state constraint ensures state can be transferred across runtime boundaries. No SSR machinery is implemented now.

1. **Consideration**: Tree-shaking efficiency
   - **Impact**: High. Per-type register functions ensure unused interface types are dead-code eliminated.
   - **How addressed (or why deferred)**: Each interface type has its own register function (`registerSearchInterface`, etc.). Unused types and their associated reducers/selectors are tree-shaken at build time.

2. **Consideration**: Migration simplicity
   - **Impact**: Medium. Introduces a new concept ("interface") that doesn't exist in current headless.
   - **How addressed (or why deferred)**: Hard break accepted. Migration path is conceptually straightforward: register an interface, pass it to controllers. A default interface mechanism was considered to soften migration but rejected to keep the engine fully opaque (see Option D).

3. **Consideration**: External contribution readiness
   - **Impact**: Low-medium. Clear separation between interface registration, state partitioning, and controller logic.
   - **How addressed (or why deferred)**: Per-type register functions make it straightforward to add new interface types without touching existing ones. Controller binding model is uniform across all controllers.

## 4. Options Considered

### Option A (Selected): Per-type register functions with keyed state partitions

- **Summary**: Typed register functions (`registerSearchInterface`, etc.) return interface objects. State is keyed by interface ID in a single Redux store. Controllers accept `interface` (singular) or `interfaces` (array).
- **Pros**: Full type inference without generics annotations. Tree-shakeable. Unified devtools/middleware. Simple common case (single interface per controller).
- **Cons**: Introduces a new concept. Keyed partitions add indirection in selectors/mutators.
- **Risks**: Multi-interface controllers (search box spanning search + commerce) have complex state aggregation logic.

**DX example:**

```ts
const engine = new Engine({
  /* ... */
});

// Per-type register functions: full type inference, no generics needed
const search = registerSearchInterface({engine});
const commerce = registerCommerceSearchInterface({engine});

// Controllers bound to a single interface
const searchPagination = buildSearchPaginationController({interface: search});
const productList = buildCommerceProductListController({interface: commerce});

// Cross-interface controller (search box drives both)
const searchBox = buildSearchBoxController({
  interfaces: [search, commerce],
});

// Per-feature state getters (live, scoped to interface)
const searchBoxState = getSearchBoxState({interface: search});
const paginationState = getPaginationState({interface: search});

// Per-feature action loaders (scoped to interface)
const facetActions = loadFacetActions({interface: search});

// Lifecycle hooks on interface
search.beforeSubmit(() => {
  if (searchBoxState.query === 'test' && paginationState.page === 5) {
    facetActions.selectValue({facetId: 'category', value: 'electronics'});
  }
});

// Type error at compile time. Commerce interface is incompatible with search pagination
// const bad = buildSearchPaginationController({ interface: commerce }); // TS error
```

### Option B: Generic register function with type parameter

- **Summary**: Single `registerInterface({ engine, type: "search" })` function with a string union type parameter.
- **Pros**: Single entry point, fewer exported functions.
- **Cons**: Requires explicit generic annotation for full type safety. All interface type code is bundled regardless of usage (poor tree-shaking). Type narrowing is less ergonomic.
- **Risks**: Bundle size grows linearly with supported interface types.

**DX example:**

```ts
const engine = new Engine({
  /* ... */
});

// Generic register: type parameter required for full type safety
const search = registerInterface<'search'>({engine, type: 'search'});
const commerce = registerInterface<'commerceSearch'>({
  engine,
  type: 'commerceSearch',
});

// Without the generic, type is widened to Interface<InterfaceType> and loses specificity
// const search = registerInterface({ engine, type: 'search' }); // type: Interface<'search' | 'commerceSearch' | ...>

// Controllers bound to a single interface. Same DX as Option A
const searchPagination = buildSearchPaginationController({interface: search});
const productList = buildCommerceProductListController({interface: commerce});

// Cross-interface controller
const searchBox = buildSearchBoxController({
  interfaces: [search, commerce],
});

// State getters and action loaders. Same as Option A
const searchBoxState = getSearchBoxState({interface: search});
const paginationState = getPaginationState({interface: search});
const facetActions = loadFacetActions({interface: search});

search.beforeSubmit(() => {
  if (searchBoxState.query === 'test' && paginationState.page === 5) {
    facetActions.selectValue({facetId: 'category', value: 'electronics'});
  }
});

// Downside: all interface type code (search, commerce, conversation, etc.)
// is bundled even if only 'search' is used; no tree-shaking on unused types.
```

### Option C: Separate engine instances per use case (status quo)

- **Summary**: Keep the current one-engine-per-context model. Consumers create multiple engines for multiple use cases.
- **Pros**: No architectural change. State isolation is trivial (separate stores).
- **Cons**: Cross-cutting controllers (shared search box) become impossible or require manual coordination. Duplicate configuration and middleware. No shared subscription model.
- **Risks**: Fundamentally doesn't solve the problem statement.

### Option D (Rejected): Allow passing engine directly to controllers/actions (default interface shortcut)

- **Summary**: Controllers and action loaders accept either an `interface` or an `engine`. When `engine` is passed, it resolves to the engine's default interface internally. This softens migration by preserving the current `buildController({ engine })` signature.
- **Pros**: Familiar API for single-use-case apps. Reduces migration friction: register an interface, set it as default, existing controller calls stay unchanged.
- **Cons**: Requires the engine to expose public state and hook registration to be usable as a standalone interaction surface, effectively duplicating interface responsibilities on the engine. Loses compile-time type narrowing on the engine path (default interface type isn't statically encoded on the engine). Two ways to do the same thing increases API surface and documentation burden.
- **Risks**: Erodes the clean separation between engine (opaque infrastructure) and interface (DX surface). Once the engine has public state and hooks, it becomes hard to argue why interfaces exist at all.

## 5. Decision Rationale

Option A provides the best balance of type safety, tree-shaking, and DX. Per-type functions give consumers fully-typed interface objects out of the box without requiring generic annotations: the return type is inferred from the function itself. The single-store approach keeps devtools, middleware, and cross-interface subscriptions unified, while keyed partitions guarantee isolation. Option B sacrifices tree-shaking and ergonomics for a marginally simpler API surface. Option C doesn't solve the core problem. Option D was considered as a migration convenience but rejected because it forces the engine to grow a public state surface and hook registration, collapsing the engine/interface boundary that makes the architecture clean. A fully opaque engine (infrastructure only) with interfaces as the exclusive public interaction surface is a stronger design.

## 6. Public API and Contract Impact

- **Public API changes**: Yes. New `registerXInterface` functions, `interface`/`interfaces` options on controller build functions and action loaders, per-feature state getters (`getXState`), and `Interface` object type with `id`, `type`, and hook registration methods.
- **Backward compatibility impact**: Breaking. Existing code that passes `Engine` directly to controllers will need to register an interface and pass it explicitly.
- **Deprecations required**: None (clean break in a new major).
- **Type/contract stability notes**: `InterfaceType` union is extensible. New types can be added without breaking existing consumers.
- **Non-leakage check (implementation details not exposed)**: Pass. Redux store structure, slice names, and partition keys are not observable through the public API.

## 7. Operational and Runtime Impact

- **Performance impact**: Negligible. Keyed state lookup is O(1). Subscription filtering by interface ID adds minimal overhead.
- **Reliability impact**: Improved. State isolation prevents cross-interface interference that could occur in a flat state model.
- **Security/privacy impact**: None.
- **SSR impact (if applicable)**: Deferred. Optional explicit IDs and serializable state constraint preserve future compatibility.
- **Observability impact (logs/metrics/traces)**: Dev-mode warnings for singleton controller duplicates. Interface ID appears in warning messages for debuggability.

## 8. Migration and Rollout Plan

- **Consumer migration impact**: Breaking change. Consumers must register at least one interface and pass it to controllers/actions. The engine is fully opaque: no public state or hooks on the engine itself.
- **Rollout strategy (flagged, phased, big-bang)**: Big-bang as part of the headless-future major release.
- **Rollback strategy**: N/A. This is a new package, not a patch to existing headless.
- **Communication plan**: Migration guide will document the interface registration pattern and show before/after examples for common use cases.
