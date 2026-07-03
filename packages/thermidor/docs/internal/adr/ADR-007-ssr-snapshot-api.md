# ADR-007: Per-Interface Snapshot API for Server-Side Rendering

**Status**: `🟡 Proposed`  
**Related docs**: [ADR-000](./ADR-000-architecture-decision-charter.md), [ADR-002](./ADR-002-multi-interface-engine.md), [ADR-003](./ADR-003-facade-request-response.md)  
**Annex**: [Implementation Details](./ADR-007-annex-ssr-implementation-details.md)

## 1. Context

- **Business/context drivers**: SSR is a MUST (ADR-000). Modern frameworks (Next.js, Remix, Nuxt, SvelteKit) require server-side data fetching with client-side hydration without flash or double-fetch.
- **Technical constraints**: State is scoped by interfaceId (`{interfaceId}/{feature}`). The engine already has `storeHydrationSnapshot` for generative sub-interfaces. Controllers are pure derivations — no server vs. client variants needed. Generative interfaces are excluded from SSR; only their routed sub-interfaces (search/commerce) are SSR-able.
- **Known assumptions**: Consumers provide deterministic interface IDs for SSR (already supported via `id` on all `build*Interface`). `initialState` is not SSR-specific — it is the general-purpose mechanism for side-effect-free state seeding (e.g., URL restoration in SPAs). Non-adopted slices are safe no-ops in both directions (ADR-003).

## 2. Decision Statement

Expose three primitives: (1) `initialState` on interface builders for side-effect-free state seeding before controllers exist, (2) `engine.getInterfaceSnapshot(interface)` to extract serializable per-interface state after request execution, and (3) `engine.restoreInterfaceSnapshot(snapshot)` to pre-load state on the client so controllers start hydrated. These are minimal, imperative, and framework-agnostic. Framework adapters may build declarative patterns on top.

## 3. Requirements & Considerations Mapping

- **Requirement**: Full use-case support
  - **Impact**: Positive
  - **How satisfied**: Works for search, commerce, and composed interfaces. Per-interface snapshots. Routed sub-interfaces from generative turns are also supported.

- **Requirement**: Public API independence
  - **Impact**: Positive
  - **How satisfied**: Snapshots are opaque (`Record<string, unknown>`). `initialState` uses domain vocabulary (query, page, facets). No Redux types, slice names, or action types exposed. Translation happens behind the anti-corruption layer.

- **Requirement**: First-class SSR
  - **Impact**: Positive
  - **How satisfied**: This is the SSR mechanism. `initialState` + explicit execution + snapshot extraction + snapshot restoration = complete server→client state transfer.

1. **Consideration**: Tree-shaking efficiency
   - **Impact**: None
   - **How addressed (or why deferred)**: Methods live on existing objects (engine, interface builders). No additional imports required.

2. **Consideration**: Migration simplicity
   - **Impact**: Negative
   - **How addressed (or why deferred)**: Fundamentally different pattern from current headless SSR (`defineSearchEngine` + `fetchStaticState` + `hydrateStaticState`). Consumers must rewrite their SSR setup. Migration guide with before/after examples needed.

3. **Consideration**: External contribution readiness
   - **Impact**: None
   - **How addressed (or why deferred)**: Adding new features/slices requires adding a translation entry in the interface builder's `initialState` mapping. Snapshots automatically capture all slices scoped to the interfaceId.

## 4. Options Considered

### Option A (Selected): Imperative snapshot primitives + `initialState` on builders

- **Summary**: `initialState` seeds state at interface construction (side-effect-free). `getInterfaceSnapshot` extracts per-interface state. `restoreInterfaceSnapshot` pre-loads it on the client. Same `build*` calls on both server and client.
- **Pros**:
  - Minimal API surface (two engine methods, one option per builder)
  - Framework-agnostic — works in any server environment
  - No upfront controller definition map needed
  - `initialState` doubles as general-purpose URL param restoration (not SSR-only)
  - Leverages existing `storeHydrationSnapshot` → `adoptSlice` auto-hydration pipeline
  - Non-adopted slices don't hydrate — enforces "load only what you use"
- **Cons**:
  - Consumer must manually orchestrate server/client split
  - Consumer must remember matching `id` on both sides
- **Risks**:
  - Mismatched IDs between server and client (mitigated: snapshot carries `interfaceId`; `fromSnapshot` shorthand proposed below)

### Option B: Engine definition pattern (like current headless)

- **Summary**: A `defineSearchInterface` function declares controllers upfront, returns `fetchStaticState` / `hydrateStaticState`. Similar to current `@coveo/headless/ssr`.
- **Pros**:
  - Single source of truth for what controllers exist
  - Type inference: `InferStaticState<typeof definition>`
  - Familiar to existing headless consumers
- **Cons**:
  - Rigid: controllers must be declared upfront (no dynamic composition)
  - Reintroduces heavy type gymnastics (`ControllerDefinitionsMap`, inference chains)
  - Conflicts with thermidor's imperative, interface-first philosophy
  - Doesn't compose well with multi-interface / `composeInterfaces`
- **Risks**:
  - Over-engineering for thermidor's simpler architecture

### Option C: Hybrid (core primitives + optional definition sugar in adapters)

- **Summary**: Core exposes Option A. Framework adapters (e.g., `@coveo/thermidor-react`) optionally provide definition-style helpers on top.
- **Pros**:
  - Best of both: lean core, ergonomic adapters
  - Core remains framework-agnostic
- **Cons**:
  - Two mental models (primitive vs. definition) across ecosystem
- **Risks**:
  - Fragmentation in documentation

## 5. Decision Rationale

Option A provides the minimal set of primitives that satisfy SSR requirements without prescribing framework-specific patterns. The existing `storeHydrationSnapshot` → `adoptSlice` mechanism already handles hydration timing — making the implementation thin. `initialState` naturally solves URL param restoration in both SSR and SPA contexts with zero side effects, eliminating the need for workarounds like calling `setQuery` (which may trigger suggestions). Option B reintroduces complexity that thermidor's architecture was designed to avoid. Option C is compatible with Option A as an additive future layer — framework adapters can build it without core changes.

## 6. Public API and Contract Impact

- **Public API changes**: `initialState` option on `buildSearchInterface`, `buildCommerceInterface`, `composeInterfaces`. Two new engine methods. `InterfaceSnapshot` type. `deserializeSearchParameters` utility. `buildGenerativeInterface` explicitly excluded.
- **Backward compatibility impact**: Additive only. No breaking changes.
- **Deprecations required**: None.
- **Type/contract stability notes**: `InterfaceSnapshot.state` is `Record<string, unknown>` (opaque). Internal structure may change; `version` field enables graceful handling.
- **Non-leakage check (implementation details not exposed)**: Pass — no Redux types, slice names, or action types in the public contract.

## 7. Operational and Runtime Impact

- **Performance impact**: Positive. The entire client-side hydration path is synchronous (`restoreInterfaceSnapshot` is a Map write, `adoptSlice` injects a reducer and dispatches synchronously). This eliminates the async TTI gap present in current headless SSR, where `hydrateStaticState()` must resolve before controllers become interactive. First paint is equivalent; time-to-interactive is improved. See [annex §12](./ADR-007-annex-ssr-implementation-details.md) for a detailed comparison.
- **Reliability impact**: Positive — deterministic hydration eliminates flash and double-fetch.
- **Security/privacy impact**: Snapshots contain full interface state; consumers must not inadvertently expose sensitive data.
- **SSR impact (if applicable)**: This is the SSR mechanism.
- **Observability impact (logs/metrics/traces)**: None additional.

## 8. Migration and Rollout Plan

- **Consumer migration impact**: Additive. Non-SSR consumers unaffected. SSR consumers adopt voluntarily.
- **Rollout strategy (flagged, phased, big-bang)**: Ships with thermidor's initial release.
- **Rollback strategy**: Methods can be removed without affecting non-SSR consumers.
- **Communication plan**: SSR guide with framework-specific examples (Next.js App Router, Remix loader, SvelteKit load, Nuxt useAsyncData).

## Appendix: Minimal DX Example

```ts
// Server
const params = deserializeSearchParameters(url.searchParams);
const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
const searchInterface = buildSearchInterface({ engine, id: 'main-search', initialState: params });
const searchBox = buildSearchBoxController({ interface: searchInterface });
await searchBox.submit();
const snapshot = engine.getInterfaceSnapshot(searchInterface);
engine.dispose();

// Client
const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
engine.restoreInterfaceSnapshot(snapshot);
const searchInterface = buildSearchInterface({ engine, id: 'main-search' });
const searchBox = buildSearchBoxController({ interface: searchInterface });
// searchBox.state already reflects server state — no flash, no re-fetch.
```

## Appendix: `fromSnapshot` Shorthand (Proposed)

To eliminate the ID-matching risk, interface builders could accept a `fromSnapshot` option that restores the snapshot and extracts the ID in one step:

```ts
// Instead of:
engine.restoreInterfaceSnapshot(snapshot);
const searchInterface = buildSearchInterface({ engine, id: snapshot.interfaceId });

// Consumer writes:
const searchInterface = buildSearchInterface({ engine, fromSnapshot: snapshot });
// Internally: restores snapshot + uses snapshot.interfaceId as the interface ID
```

The snapshot becomes the single source of truth on the client — no manual ID wiring, no mismatch possible. The explicit `id` + `restoreInterfaceSnapshot` path remains available for advanced cases (e.g., restoring multiple snapshots before building interfaces).
