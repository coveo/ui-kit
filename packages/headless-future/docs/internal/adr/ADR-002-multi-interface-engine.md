# Introduce multi-interface engine architecture

**Status**: Proposed
**Related docs**: -

## 1. Context

- **Business/context drivers**: Real-world implementations combine search, commerce, and conversation from a single page with shared UI (e.g., one search box driving both search and commerce endpoints). Today, an engine supports only one execution context.
- **Technical constraints**: Must preserve TypeScript type safety, tree-shaking, and state isolation. Must not preclude future SSR. Endpoint-specific logic must be tree-shakeable.
- **Known assumptions**: headless-future is a POC. No backward compatibility constraint. SSR is aspirational. Interface types are compatibility constraints, not feature manifests.

## 2. Decision Statement

Introduce `Interface<T>` as the single typed construct for declaring execution contexts. The type parameter `T` constrains which capabilities (`with*`) the interface accepts and which controllers are compatible. Capabilities declare endpoint-specific behavior and are tree-shakeable. Capability bundles (`withAllSearchCapabilities`, etc.) provide batteries-included convenience. For multi-interface use cases, `composeInterfaces` merges configured interfaces into a composite. The engine is fully opaque; interfaces are the exclusive public surface.

## 3. Requirements & Considerations Mapping

- **Full use-case support** — Impact: Positive. All known interface types supported. Composition via `composeInterfaces` enables cross-interface controllers.
- **Public API independence** — Impact: None. All public surface is domain-level. Redux, feature slugs, and selectors are internal.
- **First-class SSR** — Impact: None. Orthogonal. Guardrails (optional explicit IDs, serializable state) ensure no blockers.

1. **Tree-shaking efficiency** — Impact: Positive. Two levels: unused interface types (never imported) + unused capabilities (selective `with*` imports). `withAll*` bundles are an explicit opt-in to ship everything.
2. **Migration simplicity** — Impact: Negative. New concepts, breaking change. Accepted.
3. **External contribution readiness** — Impact: None. Uniform pattern once documented.

## 4. Options Considered

### Option A (Selected): Unified `Interface<T>` + capabilities + `composeInterfaces`

Single constructor for all interfaces. Capabilities are explicit imports. No class hierarchy. `composeInterfaces` handles multi-interface use cases.

**Simple case (batteries-included):**

```ts
const engine = new Engine({
  /* ... */
});

const commerce = new Interface<CommerceSearch>({
  engine,
  capabilities: [...withAllCommerceSearchCapabilities()],
});

const productList = buildProductListController({interface: commerce});
const searchBox = buildSearchBoxController({interface: commerce});
```

**Selective capabilities (tree-shaken):**

```ts
const search = new Interface<Search>({
  engine,
  capabilities: [withSearch(), withQuerySuggest()],
});

const pagination = buildPaginationController({interface: search});
const searchBoxState = getSearchBoxState({interface: search});
const facetActions = loadFacetActions({interface: search});

search.beforeSubmit(() => {
  if (searchBoxState.query === 'test') {
    facetActions.selectValue({facetId: 'category', value: 'electronics'});
  }
});
```

**Multi-interface composition:**

```ts
const commerce = new Interface<CommerceSearch>({
  engine,
  capabilities: [withCommerceSearch(), withProductSuggest()],
});

const search = new Interface<Search>({
  engine,
  capabilities: [withSearch(), withQuerySuggest()],
});

const hybrid = composeInterfaces({interfaces: [commerce, search]});

const searchBox = buildSearchBoxController({interface: hybrid});
const searchBoxState = getSearchBoxState({interface: hybrid});

// Type error: pagination doesn't accept composed interfaces
// buildPaginationController({ interface: hybrid }); // TS error
```

**Key details:**

- Type parameter `T` constrains both acceptable capabilities and compatible controllers.
- One constructor (`Interface<T>`), no class hierarchy. `withAll*` bundles are convenience functions returning capability arrays.
- Features self-register on first use (controller, state getter, or action loader).
- Two-tier request selectors: default (static) when feature inactive, operational (live) once registered.
- Only specific controllers accept composed interfaces (search box, analytics). Enforced at type level, widenable later.

### Option B: Built-in interface subclasses

Dedicated classes per type (`CommerceSearchInterface`, `SearchInterface`). Less verbose for simple cases but introduces a class hierarchy, makes extension/override less composable, and adds exports per interface type.

### Option C: Generic register function with type parameter

Single `registerInterface<'search'>({ engine, type: 'search' })`. Requires explicit generics. Poor tree-shaking (all types bundled).

### Option D: Separate engine instances (status quo)

Multiple engines. Cross-cutting controllers impossible. Doesn't solve the problem.

### Option E (Rejected): Engine-pass-through with default interface

Controllers accept `engine` directly. Forces engine to expose public state/hooks, collapsing boundaries.

### Option F (Rejected): `interfaces` array on controllers

Endpoint logic in controllers (non-tree-shakeable). State ownership ambiguous.

## 5. Decision Rationale

Option A: one constructor, capabilities as the sole extension point. No class hierarchy. `withAll*` bundles cover the simple case without adding architectural complexity. `composeInterfaces` handles multi-interface cleanly. Options B–F each add unnecessary hierarchy, sacrifice tree-shaking, or collapse architectural boundaries.

## 6. Public API and Contract Impact

- **Changes**: `Interface<T>` class, `composeInterfaces`, individual `with*` capability functions, `withAll*` bundle functions, per-feature state getters/action loaders, `interface` option on controllers.
- **Backward compatibility**: Breaking. All access requires an explicit interface.
- **Stability**: New capabilities and bundles are additive. Composed-interface acceptance widenable on controllers.
- **Non-leakage check**: Pass.

## 7. Operational and Runtime Impact

- **Performance**: Negligible. Flat state O(1). Two-tier selector switching at registration time only.
- **Reliability**: Improved. State isolation. Valid requests guaranteed via two-tier selectors.
- **SSR**: Deferred. Optional explicit IDs and serializable state preserve future compatibility.

## 8. Migration and Rollout Plan

- **Impact**: Breaking. Construct `Interface<T>` with capabilities, pass to controllers. Multi-interface uses `composeInterfaces`.
- **Strategy**: Big-bang with headless-future major.
- **Communication**: Migration guide with before/after examples.
