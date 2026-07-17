# Introduce multi-interface engine architecture

**Status**: `🟡 Proposed`  
**Related docs**: [ADR-000 Architecture Decision Charter](./ADR-000-architecture-decision-charter.md)

## 1. Context

- **Business/context drivers**: Real-world implementations combine search, commerce, and conversation from a single page with shared UI (e.g., one search box driving both search and commerce endpoints). Today, an engine supports only one execution context.
- **Technical constraints**: Must preserve TypeScript type safety, tree-shaking, and state isolation. Must not preclude future SSR. Must maintain lazy loading of feature state.
- **Known assumptions**: thermidor is a POC. No backward compatibility constraint. SSR is aspirational. Interface types are compatibility constraints, not feature manifests.

## 2. Decision Statement

Introduce per-type `build<UseCase>Interface` functions (e.g., `buildSearchInterface`, `buildCommerceSearchInterface`) that return strongly typed interface instances with built-in API facade code for their use case. The type is inferred from the function — no generic annotation needed. For multi-interface use cases, multiple interfaces share a single engine and controllers accept any interface satisfying their declared facade requirements (enforced via `Supports<F>`), enabling cross-interface patterns with a uniform singular `interface` parameter across the entire API. The engine is fully opaque; interfaces are the exclusive public surface. Feature state is lazy-loaded on first use.

> **Naming note**: "Interface" is the working term. While it collides with the TypeScript keyword, it maps directly to the Coveo platform concept of a "search interface." Other candidates considered: Conduit, Hub, Channel, Scope, Outlet, Context. The name remains open for debate.

## 3. Requirements & Considerations Mapping

- **Full use-case support** — Impact: Positive. All known interface types supported. `Supports<F>` type narrowing enables controllers to accept any interface providing the required facades.
- **Public API independence** — Impact: None. All public surface is domain-level. Redux, feature slugs, and selectors are internal.
- **First-class SSR** — Impact: None. Orthogonal. Guardrails (optional explicit IDs, serializable state) ensure no blockers.

1. **Tree-shaking efficiency** — Impact: Positive. Unused interface types (per-type functions never imported) are eliminated. Within an interface type, facade code is bundled but feature state is lazy-loaded. Granular per-capability tree-shaking deferred as a future additive option.
2. **Migration simplicity** — Impact: Negative. New concepts, breaking change. Accepted.
3. **External contribution readiness** — Impact: None. Uniform pattern once documented.

## 4. Options Considered

### Option A (Selected): Per-type `build*Interface` functions + `Supports<F>` type narrowing

Per-type functions return fully-typed interfaces with built-in facade code. `Supports<F>` type narrowing handles multi-interface use cases by allowing controllers to accept any interface satisfying their facade requirements. Uniform singular `interface` param everywhere.

**Simple case:**

```ts
const engine = new Engine({
  /* ... */
});

const commerce = buildCommerceSearchInterface({engine});

const productList = buildProductListController({interface: commerce});
const searchBox = buildSearchBoxController({interface: commerce});
```

**Multi-interface:**

```ts
const search = buildSearchInterface({engine});
const commerce = buildCommerceSearchInterface({engine});

// Controllers accept any interface satisfying Supports<F>
const searchBox = buildSearchBoxController({interface: search});
const productList = buildProductListController({interface: commerce});
const searchBoxActions = loadSearchBoxActions({interface: search});

// Type error: pagination requires a commerce interface
// buildPaginationController({ interface: search }); // TS error
```

**Key details:**

- Per-type functions give full type inference — no generics needed.
- Each interface type bundles its facade code. Feature state lazy-loads on first use.
- Controllers accept any interface whose type satisfies their declared facade requirements (enforced via `Supports<F>`).
- Two-tier request selectors: default (static) when feature inactive, operational (live) once registered.
- Granular per-capability tree-shaking can be introduced later as an additive, non-breaking option on builders.

### Option B: `interfaces` array on controllers that support multi-interface

Controllers that need multi-interface accept `interfaces: [...]` directly. No composition step.

- Rejected because: inconsistent `interface` vs `interfaces` parameter naming across the API; breaks the action loader pattern (which interface do you pass to `loadSearchBoxActions` when the search box spans two?); widening support to new controllers later requires adding `interfaces` and deprecating `interface` (breaking). The `Supports<F>` approach is more type-safe and extensible.

### Option C: Per-capability tree-shaking via explicit `capabilities` array

Interfaces accept a `capabilities` option declaring which facade behaviors are active (e.g., `[withSearch(), withQuerySuggest()]`). Unused capabilities eliminated.

- Deferred (not rejected). Adds complexity for marginal real-world benefit today. The interface-type-level tree-shaking is sufficient for now. Can be introduced later as an additive option on builders without breaking changes.

### Option D: Unified generic `Interface<T>` class

Single `new Interface<T>({ engine })` constructor. Requires explicit generic annotation. Less discoverable.

### Option E (Rejected): Engine-pass-through with default interface

Collapses engine/interface boundary.

### Option F (Rejected): Capabilities declared on controllers

Breaks controller-less access. Scatters configuration across multiple controllers.

### Option G: Separate engine instances (status quo)

Doesn't solve the problem.

## 5. Decision Rationale

Option A: per-type functions give full type inference and discoverability. `Supports<F>` type narrowing ensures controllers accept any interface satisfying their facade requirements — solving multi-interface dispatch cleanly while maintaining type safety and providing future-proof extensibility. Facade code is bundled per interface type (acceptable trade-off); per-capability granularity deferred as additive future option. Option B creates API inconsistency. Option C adds complexity for marginal current benefit. Options D–G sacrifice type safety, boundaries, or access patterns.

## 6. Public API and Contract Impact

- **Changes**: `build*Interface` functions (per type), per-feature action loaders, `interface` option (always singular) on controllers.
- **Backward compatibility**: Breaking. All access requires an explicit interface.
- **Stability**: New interface types are additive. Per-capability options are additive. Controller facade requirements are widenable via `Supports<F>`.
- **Non-leakage check**: Pass.

## 7. Operational and Runtime Impact

- **Performance**: Negligible. Flat state O(1). Feature state lazy-loaded on first use.
- **Reliability**: Improved. State isolation. Valid requests guaranteed via two-tier selectors.
- **SSR**: Deferred. Optional explicit IDs and serializable state preserve future compatibility.

## 8. Migration and Rollout Plan

- **Impact**: Breaking. Call `build*Interface`, pass to controllers. Multi-interface pages use multiple interfaces on a shared engine, with controllers targeting each one independently.
- **Strategy**: Big-bang with thermidor major.
- **Communication**: Migration guide with before/after examples.
