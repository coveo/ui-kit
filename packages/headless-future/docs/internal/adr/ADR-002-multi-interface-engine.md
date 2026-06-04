# Introduce multi-interface engine architecture

**Status**: Proposed
**Related docs**: -

## 1. Context

- **Business/context drivers**: Real-world implementations need to combine search, commerce search, product listing, and conversation from a single page with shared UI elements (e.g., one search box driving both a search endpoint and a commerce-search endpoint in parallel). Today, a headless-future `Engine` instance supports only a single execution context.

- **Technical constraints**: The architecture must preserve full TypeScript type safety, tree-shaking efficiency, and state isolation between execution contexts. It must not preclude future SSR support. Endpoint-specific logic (facades) must be tree-shakeable: a search box used only for search should not ship commerce facade code.

- **Known assumptions**: headless-future is a POC. Backward compatibility with the current headless package is not a constraint. This will be a major version with breaking changes. SSR is aspirational and not yet designed. Interface types are compatibility constraints (which features can be used together), not feature manifests (which features are present).

## 2. Decision Statement

Introduce "interfaces" as typed, independently stateful execution contexts registered against a shared engine via per-type register functions. Controllers bind to a single interface. For multi-interface use cases, a generic "interface adapter" composes multiple interfaces and exposes endpoint-specific behavior via tree-shakeable sub-features. State is partitioned flat in the store using feature-slug keys. The engine remains fully opaque; interfaces (and adapters) are the exclusive public interaction surface. Optional explicit IDs and a serializable-state constraint preserve future SSR compatibility.

## 3. Requirements & Considerations Mapping

- **Requirement**: Full use-case support
  - **Impact**: Positive. This is the core motivation for the feature.
  - **How satisfied**: All known interface types (search, commerceSearch, commerceProductListing, commerceRecommendations, conversation) are supported. Multiple instances of the same type are allowed. Cross-interface controllers use interface adapters with sub-features.

- **Requirement**: Public API independence
  - **Impact**: None. The new public surface (interfaces, adapters, sub-features, state getters) is entirely domain-level. No implementation plumbing is exposed.
  - **How satisfied**: The engine is fully opaque. Redux store structure, feature slugs, two-tier selectors, and state partitioning strategy are internal implementation details not observable through the public contract. All public types are domain concepts, not library wrappers.

- **Requirement**: First-class SSR
  - **Impact**: None. This decision is orthogonal to SSR. It neither enables nor blocks it.
  - **How satisfied**: Not applicable to this decision. As guardrails, optional explicit Interface_IDs and the serializable-state design constraint ensure no architectural choices inadvertently preclude future SSR. A dedicated SSR ADR will address the full lifecycle independently.

1. **Consideration**: Tree-shaking efficiency
   - **Impact**: Positive. Two levels of dead-code elimination: unused interface types (per-type register functions) and unused endpoint logic (sub-features).
   - **How addressed**: Each interface type has its own register function. Endpoint-specific behavior is encapsulated in `with*` sub-feature functions. If you never import `withCommerceSearch`, it's eliminated. Controllers themselves carry no endpoint knowledge.

2. **Consideration**: Migration simplicity
   - **Impact**: Negative. Introduces new concepts (interface, adapter, sub-features) and is a breaking change.
   - **How addressed**: Hard break accepted. Migration path is conceptually straightforward: register an interface, pass it to controllers. A Default_Interface mechanism and engine-pass-through were considered but rejected to keep the engine fully opaque (see Options D/E).

3. **Consideration**: External contribution readiness
   - **Impact**: None. The pattern is uniform and well-bounded once understood.
   - **How addressed**: Adding a new interface type means writing a register function. Adding a new sub-feature means implementing a lifecycle contract. No extra ceremony or indirection for contributors working within an interface.

## 4. Options Considered

### Option A (Selected): Per-type register functions + InterfaceAdapter + Sub-features

- **Summary**: Typed register functions return interface objects. A generic `buildInterfaceAdapter` composes multiple interfaces with tree-shakeable sub-features for multi-interface use cases. Controllers always bind to a single `interface` (real or adapter). State is stored flat using feature-slug keys. Per-feature state getters and action loaders provide controller-less access scoped to an interface/adapter.
- **Pros**: Full type inference. Tree-shakeable at both the interface-type and endpoint-behavior levels. Controllers stay simple (always single-interface). Uniform `interface` parameter across the API. Adapters give multi-interface state a natural home.
- **Cons**: Introduces three new concepts (interface, adapter, sub-features). Adapter adds indirection for multi-interface cases.
- **Risks**: Sub-feature lifecycle contract must be well-defined per controller type.

**DX example - simple case (single interface):**

```ts
const engine = new Engine({
  /* ... */
});
const search = buildSearchInterface({engine});

// Controller bound to a single interface
const pagination = buildPaginationController({interface: search});
const resultList = buildResultListController({interface: search});
const searchBox = buildSearchBoxController({interface: search});

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
```

**DX example - multi-interface case (adapter with sub-features):**

```ts
const engine = new Engine({
  /* ... */
});
const search = buildSearchInterface({engine});
const commerce = buildCommerceInterface({engine});

// Single-interface controllers
const searchPagination = buildPaginationController({interface: search});
const productList = buildProductListController({interface: commerce});

// Multi-interface adapter for search box
const searchBoxAdapter = buildInterfaceAdapter({
  engine,
  subFeatures: [
    withSearch({interface: search}),
    withCommerceSearch({interface: commerce}),
    withQuerySuggest({interface: search}),
    withProductSuggest({interface: commerce}),
  ],
});

// Search box binds to the adapter (single `interface` param)
const searchBox = buildSearchBoxController({interface: searchBoxAdapter});

// State getters and action loaders scoped to the adapter
const searchBoxState = getSearchBoxState({interface: searchBoxAdapter});
const searchBoxActions = loadSearchBoxActions({interface: searchBoxAdapter});

// Hooks on the adapter
searchBoxAdapter.beforeSubmit(() => {
  if (searchBoxState.query === 'test') {
    // ...
  }
});

// Type error: pagination doesn't accept adapters
// const bad = buildPaginationController({ interface: searchBoxAdapter }); // TS error
```

**Key architectural details:**

- **Interface types are compatibility constraints.** A `SearchInterface` is compatible with pagination, facets, result list, etc., but a given search interface instance doesn't necessarily have all features active. Features self-register on first use (via controller, state getter, or action loader).
- **Two-tier request section selectors.** Each section of an API request has a default selector (static, deterministic) and an operational selector (live, state-dependent). When a feature registers with an interface, the interface's request builder switches from default to operational for that section. This means an API request always has valid values even when features aren't active.
- **Only specific controllers accept adapters.** Controllers like search box and analytics accept `Interface | InterfaceAdapter`. Single-interface controllers (pagination, result list, facets) only accept `Interface`. This is enforced at the type level and can be widened later without breaking changes.
- **Sub-features define a lifecycle contract per controller type.** For search box: `onQueryChange`, `onSubmit`, `fetchSuggestions`. Each `with*` function implements the relevant hooks. The controller iterates sub-features at the right lifecycle moment. Sub-features are typed so incompatible ones produce compile errors.

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

// Without the generic, type is widened and loses specificity
// const search = registerInterface({ engine, type: 'search' }); // type: Interface<'search' | 'commerceSearch' | ...>

// Multi-interface via adapter (same as Option A)
const adapter = buildInterfaceAdapter({
  engine,
  subFeatures: [
    withSearch({interface: search}),
    withCommerceSearch({interface: commerce}),
  ],
});

const searchBox = buildSearchBoxController({interface: adapter});

// Downside: all interface type code is bundled even if only 'search' is used.
```

### Option C: Separate engine instances per use case (status quo)

- **Summary**: Keep the current one-engine-per-context model. Consumers create multiple engines for multiple use cases.
- **Pros**: No architectural change. State isolation is trivial.
- **Cons**: Cross-cutting controllers become impossible or require manual coordination. Duplicate configuration and middleware.
- **Risks**: Fundamentally doesn't solve the problem statement.

### Option D (Rejected): Allow passing engine directly to controllers (default interface shortcut)

- **Summary**: Controllers accept either `interface` or `engine`. When `engine` is passed, it resolves to the engine's default interface.
- **Pros**: Familiar API for single-use-case apps.
- **Cons**: Requires the engine to expose public state and hook registration, duplicating interface responsibilities. Loses compile-time type narrowing. Two ways to do the same thing.
- **Risks**: Erodes the engine/interface boundary. Once the engine has public state, interfaces become redundant.

### Option E (Rejected): Multi-interface via `interfaces` array on controller

- **Summary**: Controllers like search box accept `interfaces: [search, commerce]` directly, with multi-interface logic inside the controller.
- **Pros**: No adapter concept needed.
- **Cons**: Controllers must contain endpoint-specific branching logic (check interface type → load appropriate facade). This logic is not tree-shakeable: a search box controller ships all facade code for all interface types it might receive. State ownership is ambiguous: which interface owns the shared query? State getters/action loaders can't unambiguously identify which search box instance to target when multiple interfaces are involved.
- **Risks**: Bundle size grows with supported interface types. Singleton controller semantics become confused when a feature spans interfaces without a clear "home."

## 5. Decision Rationale

Option A provides the best balance of type safety, tree-shaking, and DX. Per-type register functions give fully-typed interface objects without generic annotations. The InterfaceAdapter pattern solves multi-interface state ownership cleanly; the adapter is the "home" for cross-interface features, giving state getters and action loaders an unambiguous target. Sub-features push endpoint-specific logic out of controllers into tree-shakeable composable units.

Option B sacrifices tree-shaking and ergonomics. Option C doesn't solve the problem. Option D collapses the engine/interface boundary. Option E makes controllers non-tree-shakeable and creates ambiguous state ownership.

## 6. Public API and Contract Impact

- **Public API changes**: Yes.
  - `buildSearchInterface`, `buildCommerceInterface`, etc. (per-type register functions)
  - `buildInterfaceAdapter` (generic adapter builder)
  - `with*` sub-feature functions (`withSearch`, `withCommerceSearch`, `withQuerySuggest`, `withProductSuggest`, etc.)
  - `interface` option on controller build functions (accepts `Interface` or `Interface | InterfaceAdapter` depending on controller)
  - Per-feature state getters (`getSearchBoxState`, `getPaginationState`, etc.) and action loaders (`loadFacetActions`, etc.) scoped to interface/adapter
  - `Interface` object type with `id`, `type`, and hook registration methods (`beforeSubmit`)
- **Backward compatibility impact**: Breaking. All controller/action/state access requires an explicit interface.
- **Deprecations required**: None (clean break).
- **Type/contract stability notes**: Adding new interface types (new `buildXInterface` functions) or new sub-features is additive and non-breaking to existing consumers. Adapter acceptance can be widened on controllers without breaking changes.
- **Non-leakage check**: Pass. Redux store structure, feature slugs, and two-tier selector internals are not observable through the public API.

## 7. Operational and Runtime Impact

- **Performance impact**: Negligible. Flat state lookup by feature-slug is O(1). Two-tier selector switching is a one-time registration-time operation.
- **Reliability impact**: Improved. State isolation prevents cross-interface interference. Two-tier selectors ensure request builders always produce valid requests regardless of which features are active.
- **Security/privacy impact**: None.
- **SSR impact**: Deferred. Optional explicit IDs and serializable state constraint preserve future compatibility.
- **Observability impact**: Dev-mode warnings for singleton controller duplicates. Interface/adapter IDs appear in warning messages.

## 8. Migration and Rollout Plan

- **Consumer migration impact**: Breaking change. Consumers must: register at least one interface, pass it to controllers/actions/state-getters. Multi-interface use cases require an adapter with sub-features. The engine is fully opaque.
- **Rollout strategy**: Big-bang as part of the headless-future major release.
- **Rollback strategy**: N/A. New package.
- **Communication plan**: Migration guide with before/after examples for single-interface and multi-interface use cases.
