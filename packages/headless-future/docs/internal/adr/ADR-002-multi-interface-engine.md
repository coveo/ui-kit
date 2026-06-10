# Introduce multi-conduit engine architecture

**Status**: Proposed
**Related docs**: [ADR-000 Architecture Decision Charter](./ADR-000-architecture-decision-charter.md)

## 1. Context

- **Business/context drivers**: Real-world implementations combine search, commerce, and conversation from a single page with shared UI (e.g., one search box driving both search and commerce endpoints). Today, an engine supports only one execution context.
- **Technical constraints**: Must preserve TypeScript type safety, tree-shaking, and state isolation. Must not preclude future SSR. Endpoint-specific logic must be tree-shakeable.
- **Known assumptions**: headless-future is a POC. No backward compatibility constraint. SSR is aspirational. Conduit types are compatibility constraints, not feature manifests.

## 2. Decision Statement

Introduce per-type `build<UseCase>Conduit` functions (e.g., `buildSearchConduit`, `buildCommerceSearchConduit`) that return strongly typed conduit instances with explicit capabilities. The type is inferred from the function — no generic annotation needed. Capabilities declare endpoint-specific behavior and are tree-shakeable. For multi-conduit use cases, `composeConduits` merges configured conduits into a composite. The engine is fully opaque; conduits are the exclusive public surface.

> **Naming note**: "Conduit" is a working term, still open for debate. Other candidates considered: Interface (TS keyword collision), Hub (Coveo product collision), Channel (slightly one-directional connotation), Scope (odd with "capabilities"), Outlet (React Router collision), Context (React collision).

## 3. Requirements & Considerations Mapping

- **Full use-case support** — Impact: Positive. All known conduit types supported. Composition via `composeConduits` enables cross-conduit controllers.
- **Public API independence** — Impact: None. All public surface is domain-level. Redux, feature slugs, and selectors are internal.
- **First-class SSR** — Impact: None. Orthogonal. Guardrails (optional explicit IDs, serializable state) ensure no blockers.

1. **Tree-shaking efficiency** — Impact: Positive. Three levels: unused conduit types (per-type functions never imported) + unused capabilities (selective `with*` imports) + unused `withAll*` bundles only ship when explicitly used.
2. **Migration simplicity** — Impact: Negative. New concepts, breaking change. Accepted.
3. **External contribution readiness** — Impact: None. Uniform pattern once documented.

## 4. Options Considered

### Option A (Selected): Per-type `build*Conduit` functions + capabilities + `composeConduits`

Per-type functions return fully-typed conduits. Capabilities are always explicit. `composeConduits` handles multi-conduit use cases. No generic annotations needed.

**Simple case:**

```ts
const engine = new Engine({
  /* ... */
});

const commerce = buildCommerceSearchConduit({
  engine,
  capabilities: [withCommerceSearch(), withProductSuggest()],
});

const productList = buildProductListController({conduit: commerce});
const searchBox = buildSearchBoxController({conduit: commerce});
```

**Batteries-included via bundle (consumer opts in):**

```ts
const search = buildSearchConduit({
  engine,
  capabilities: [...withAllSearchCapabilities()],
});
```

**Selective capabilities (tree-shaken):**

```ts
const search = buildSearchConduit({
  engine,
  capabilities: [withSearch(), withQuerySuggest()],
});

const pagination = buildPaginationController({conduit: search});
const searchBoxState = getSearchBoxState({conduit: search});
const facetActions = loadFacetActions({conduit: search});

search.beforeSubmit(() => {
  if (searchBoxState.query === 'test') {
    facetActions.selectValue({facetId: 'category', value: 'electronics'});
  }
});
```

**Multi-conduit composition:**

```ts
const commerce = buildCommerceSearchConduit({
  engine,
  capabilities: [withCommerceSearch(), withProductSuggest()],
});

const search = buildSearchConduit({
  engine,
  capabilities: [withSearch(), withQuerySuggest()],
});

const hybrid = composeConduits({conduits: [commerce, search]});

const searchBox = buildSearchBoxController({conduit: hybrid});
const searchBoxState = getSearchBoxState({conduit: hybrid});

// Type error: pagination doesn't accept composed conduits
// buildPaginationController({ conduit: hybrid }); // TS error
```

**Key details:**

- Per-type functions give full type inference — no generics needed.
- Capabilities always explicit — no defaults. `withAll*` bundles are an opt-in convenience.
- Features self-register on first use (controller, state getter, or action loader).
- Two-tier request selectors: default (static) when feature inactive, operational (live) once registered.
- Only specific controllers accept composed conduits (search box, analytics). Enforced at type level, widenable later.

### Option B: Unified generic `Conduit<T>` class

Single `new Conduit<T>({ engine, capabilities })` constructor. Architecturally pure (one class, no hierarchy) but requires explicit generic annotation from consumers for full type safety. Less discoverable via autocomplete.

### Option C: Generic register function with type parameter

Single `registerConduit<'search'>({ engine, type: 'search' })`. Same generic-annotation problem as Option B, plus poor tree-shaking (all types bundled regardless of usage).

### Option D: Separate engine instances (status quo)

Multiple engines. Cross-cutting controllers impossible. Doesn't solve the problem.

### Option E (Rejected): Engine-pass-through with default conduit

Controllers accept `engine` directly. Forces engine to expose public state/hooks, collapsing boundaries.

### Option F (Rejected): `conduits` array on controllers

Endpoint logic in controllers (non-tree-shakeable). State ownership ambiguous.

### Option G (Rejected): Capabilities declared on controllers

Breaks controller-less access pattern (state getters, action loaders, hooks all scope to a conduit). Scatters configuration across multiple controllers bound to the same conduit, making it impossible to understand a conduit's behavior from a single location.

## 5. Decision Rationale

Option A: per-type functions give full type inference with zero annotation cost and strong discoverability. Capabilities remain explicit for tree-shaking. `composeConduits` handles multi-conduit cleanly. Option B is architecturally elegant but adds generic friction. Options C–G each sacrifice tree-shaking, type safety, or architectural clarity.

## 6. Public API and Contract Impact

- **Changes**: `build*Conduit` functions (per type), `composeConduits`, individual `with*` capability functions, `withAll*` bundle functions, per-feature state getters/action loaders, `conduit` option on controllers.
- **Backward compatibility**: Breaking. All access requires an explicit conduit.
- **Stability**: New conduit types, capabilities, and bundles are additive. Composed-conduit acceptance widenable on controllers.
- **Non-leakage check**: Pass.

## 7. Operational and Runtime Impact

- **Performance**: Negligible. Flat state O(1). Two-tier selector switching at registration time only.
- **Reliability**: Improved. State isolation. Valid requests guaranteed via two-tier selectors.
- **SSR**: Deferred. Optional explicit IDs and serializable state preserve future compatibility.

## 8. Migration and Rollout Plan

- **Impact**: Breaking. Call `build*Conduit` with capabilities, pass to controllers. Multi-conduit uses `composeConduits`.
- **Strategy**: Big-bang with headless-future major.
- **Communication**: Migration guide with before/after examples.
