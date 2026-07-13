# ADR-007: Engine Snapshot API for Server-Side Rendering

**Status**: `🟡 Proposed`  
**Related docs**: [ADR-000](./ADR-000-architecture-decision-charter.md), [ADR-002](./ADR-002-multi-interface-engine.md), [ADR-003](./ADR-003-facade-request-response.md)  
**Annex**: [Implementation Details](./ADR-007-annex-ssr-implementation-details.md)

## 1. Context

- **Business/context drivers**: SSR is a MUST (ADR-000). Modern frameworks (Next.js, Remix, Nuxt, SvelteKit) require server-side data fetching with client-side hydration without flash or double-fetch.
- **Technical constraints**: State is scoped by interfaceId (`{interfaceId}/{feature}`). The engine already has `storeHydrationSnapshot` for generative sub-interfaces. Controllers are pure derivations — no server vs. client variants needed. Generative interfaces are excluded from SSR; only their routed sub-interfaces (search/commerce) are SSR-able.
- **Known assumptions**: Consumers provide deterministic interface IDs for SSR (already supported via `id` on all `build*Interface`). Non-adopted slices are safe no-ops in both directions (ADR-003).
- **Open question — parameter seeding mechanism**: This ADR uses `initialParameters` on interface builders as a provisional mechanism for side-effect-free parameter seeding (e.g., URL restoration in SPAs). However, the team has not settled on this approach. An alternative under consideration is a dedicated URL parameter controller that would handle parameter seeding through the standard controller adoption path — more consistent with thermidor's "controllers own behavior" model and naturally extensible to bidirectional URL sync. URL parameter management at large (not just for SSR) will be further refined in an upcoming ADR. The snapshot primitives (`getSSRSnapshot` / `restoreSSRSnapshot`) are orthogonal to this choice and remain stable regardless of how parameters are seeded.

## 2. Decision Statement

Expose two standalone functions and an interface method: (1) `getSSRSnapshot({ engine })` to extract a serializable engine-wide snapshot after request execution, (2) `restoreSSRSnapshot({ engine, snapshot })` to pre-load state on the client so controllers start hydrated, and (3) `executeInitialRequest()` on interfaces to trigger the first backend call — it is type-aware (search vs. commerce), can only be called once (subsequent calls are no-ops), and eliminates the need to instantiate a controller solely to trigger a request on the server. The snapshot captures all interface state in one object; on the client, each interface self-hydrates by ID via the existing `adoptSlice` → `hydrateFromSnapshot` pipeline. These are minimal, imperative, and framework-agnostic. Framework adapters may build declarative patterns on top.

Additionally, this ADR provisionally introduces `initialParameters` on interface builders for side-effect-free parameter seeding before controllers exist. **This mechanism is subject to change** — an alternative approach using dedicated URL parameter controllers is under active consideration and will be formalized in a separate ADR covering URL parameter management holistically (SSR seeding, SPA URL restoration, bidirectional sync). The snapshot primitives and `executeInitialRequest()` are not affected by this open question.

## 3. Requirements & Considerations Mapping

- **Requirement**: Full use-case support
  - **Impact**: Positive
  - **How satisfied**: Works for search, commerce, and composed interfaces. A single snapshot captures all interfaces in the engine. Routed sub-interfaces from generative turns are also supported.

- **Requirement**: Public API independence
  - **Impact**: Positive
  - **How satisfied**: Snapshots are opaque strings — no internal structure exposed. Parameter seeding (whether via `initialParameters` or a future URL parameter controller) uses domain vocabulary (query, page, facets). No Redux types, slice names, or action types exposed. Translation happens behind the anti-corruption layer.

- **Requirement**: First-class SSR
  - **Impact**: Positive
  - **How satisfied**: This is the SSR mechanism. Parameter seeding + `executeInitialRequest()` + snapshot extraction + snapshot restoration = complete server→client state transfer. The exact parameter seeding surface is provisional (see §1 Context).

1. **Consideration**: Tree-shaking efficiency
   - **Impact**: Positive
   - **How addressed (or why deferred)**: `getSSRSnapshot` and `restoreSSRSnapshot` are standalone importable functions. Server-only code (`getSSRSnapshot`) is trivially eliminated from client bundles, and vice versa, without relying on bundlers to prove that a method on an imported class is never called.

2. **Consideration**: Migration simplicity
   - **Impact**: Negative
   - **How addressed (or why deferred)**: Fundamentally different pattern from current headless SSR (`defineSearchEngine` + `fetchStaticState` + `hydrateStaticState`). Consumers must rewrite their SSR setup. Migration guide with before/after examples needed.

3. **Consideration**: External contribution readiness
   - **Impact**: None
   - **How addressed (or why deferred)**: Adding new features/slices requires adding a translation entry in the interface builder's `initialParameters` mapping. Snapshots automatically capture all slices in the engine state.

## 4. Options Considered

### Option A (Selected): Standalone snapshot functions + provisional `initialParameters` on builders

- **Summary**: `initialParameters` provisionally seeds search/commerce parameters at interface construction (side-effect-free). `getSSRSnapshot({ engine })` extracts the full engine state as a single serializable snapshot. `restoreSSRSnapshot({ engine, snapshot })` pre-loads that state on the client; each interface then self-hydrates by ID when its slices are adopted. Same `build*` calls on both server and client. Note: the parameter seeding mechanism (`initialParameters` vs. a dedicated URL parameter controller) is under active discussion — see §1 Context.
- **Pros**:
  - Minimal API surface (two standalone functions, one option per builder)
  - Framework-agnostic — works in any server environment
  - No upfront controller definition map needed
  - `initialParameters` doubles as general-purpose URL param restoration (not SSR-only)
  - Leverages existing `storeHydrationSnapshot` → `adoptSlice` auto-hydration pipeline
  - Non-adopted slices don't hydrate — enforces "load only what you use"
  - Single snapshot object eliminates the multi-interface routing problem on the client: the consumer passes one blob, each interface self-serves by `id`
  - Clean import separation: server imports `getSSRSnapshot`, client imports `restoreSSRSnapshot`
  - Engine remains opaque (no public methods) — keeps the mental model simple
  - Reversible: methods can be added to the engine later on top of these functions if desired; the reverse (removing methods) would be a breaking change
- **Cons**:
  - Consumer must manually orchestrate server/client split
  - Consumer must use matching `id` on both sides (same as any SSR approach)
  - `initialParameters` on builders conflates URL interpretation with interface construction — a dedicated controller may be a better separation of concerns (under discussion)
- **Risks**:
  - Mismatched IDs between server and client (mitigated: same `id` option used on both sides, no new concept)

### Option B: Engine methods (per-interface)

- **Summary**: `engine.getInterfaceSnapshot(interface)` extracts per-interface state. `engine.restoreInterfaceSnapshot(snapshot)` pre-loads it on the client. A `fromSnapshot` shorthand on builders eliminates ID matching.
- **Pros**:
  - Granular: extract/restore individual interfaces independently
  - `fromSnapshot` eliminates ID-matching footgun
  - Methods on the engine feel like a natural extension of its hydration role
- **Cons**:
  - Multi-interface pages require routing multiple snapshot objects to the correct builder call sites on the client — reusable components and dynamic layouts make this routing non-trivial
  - Adds public methods to the currently opaque engine — cannot be removed without a breaking change
  - No tree-shaking benefit: methods are always part of the engine class regardless of usage
  - Bundlers must prove method is unused to eliminate SSR code from client bundles (unreliable)
- **Risks**:
  - Snapshot routing complexity in dynamic multi-interface pages

### Option C: Engine definition pattern (like current headless)

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

### Option D: Hybrid (core primitives + optional definition sugar in adapters)

- **Summary**: Core exposes Option A. Framework adapters (e.g., `@coveo/thermidor-react`) optionally provide definition-style helpers on top.
- **Pros**:
  - Best of both: lean core, ergonomic adapters
  - Core remains framework-agnostic
- **Cons**:
  - Two mental models (primitive vs. definition) across ecosystem
- **Risks**:
  - Fragmentation in documentation

## 5. Decision Rationale

Option A provides the minimal set of primitives that satisfy SSR requirements without prescribing framework-specific patterns. The existing `storeHydrationSnapshot` → `adoptSlice` mechanism already handles hydration timing — making the implementation thin.

A single engine-wide snapshot eliminates the client-side routing problem that per-interface snapshots introduce. With per-interface snapshots (Option B), multi-interface pages require the consumer to explicitly route each snapshot object to the correct builder call — a burden that grows with dynamic layouts, reusable components, and pages with varying interface sets. A single snapshot sidesteps this entirely: the consumer restores one object, and each interface self-hydrates by its `id` through the existing `adoptSlice` pipeline.

Standalone functions preserve the engine's opaque public API — currently, consumers create an engine, pass it to builders, and never call methods on it directly. This simplicity is worth preserving. Furthermore, standalone functions are a reversible choice: if demand arises, convenience methods can be added to the engine that delegate to these functions. The reverse (shipping methods first, then trying to remove them) would be a breaking change.

The import-separation benefit is also concrete: `getSSRSnapshot` is server-only code and `restoreSSRSnapshot` is client-only code. Standalone functions make dead-code elimination trivial for any bundler, without relying on class method analysis.

`initialParameters` is used provisionally in this ADR as a convenient mechanism for side-effect-free parameter seeding in both SSR and SPA contexts, eliminating the need for workarounds like calling `setQuery` (which may trigger suggestions). However, an alternative approach — a dedicated URL parameter controller — is under active consideration. Such a controller would handle parameter seeding through the standard controller adoption path, be more consistent with thermidor's "controllers own behavior" model, and naturally extend to bidirectional URL sync. URL parameter management at large will be formalized in a dedicated ADR; the snapshot primitives defined here remain stable regardless of which seeding mechanism is chosen. Option C reintroduces complexity that thermidor's architecture was designed to avoid. Option D is compatible with Option A as an additive future layer — framework adapters can build it without core changes.

## 6. Public API and Contract Impact

- **Public API changes**: `executeInitialRequest()` method on all interfaces (search, commerce, composed). Two new standalone functions (`getSSRSnapshot`, `restoreSSRSnapshot`). `SSRSnapshot` opaque type (branded string). `deserializeSearchParameters` utility. `buildGenerativeInterface` explicitly excluded from `executeInitialRequest`. Provisionally: `initialParameters` option on `buildSearchInterface`, `buildCommerceInterface`, `composeInterfaces` — subject to revision pending a dedicated URL parameter management ADR.
- **Backward compatibility impact**: Additive only. No breaking changes. Engine class unchanged.
- **Deprecations required**: None.
- **Type/contract stability notes**: `SSRSnapshot` is an opaque branded string. Internal encoding may change between versions; consumers must not inspect, parse, or depend on its format.
- **Non-leakage check (implementation details not exposed)**: Pass — no Redux types, slice names, or action types in the public contract.

## 7. Operational and Runtime Impact

- **Performance impact**: Positive. The entire client-side hydration path is synchronous (`restoreSSRSnapshot({ engine, snapshot })` decodes the snapshot and stores per-interface hydration entries; each subsequent `adoptSlice` injects a reducer and dispatches `hydrateFromSnapshot` synchronously). This eliminates the async TTI gap present in current headless SSR, where `hydrateStaticState()` must resolve before controllers become interactive. First paint is equivalent; time-to-interactive is improved. See [annex §12](./ADR-007-annex-ssr-implementation-details.md) for a detailed comparison.
- **Reliability impact**: Positive — deterministic hydration eliminates flash and double-fetch.
- **Security/privacy impact**: Snapshots contain full engine state; consumers must not inadvertently expose sensitive data.
- **SSR impact (if applicable)**: This is the SSR mechanism.
- **Observability impact (logs/metrics/traces)**: None additional.

## 8. Migration and Rollout Plan

- **Consumer migration impact**: Additive. Non-SSR consumers unaffected. SSR consumers adopt voluntarily.
- **Rollout strategy (flagged, phased, big-bang)**: Ships with thermidor's initial release.
- **Rollback strategy**: Functions can be removed without affecting non-SSR consumers.
- **Communication plan**: SSR guide with framework-specific examples (Next.js App Router, Remix loader, SvelteKit load, Nuxt useAsyncData).

## Appendix: Minimal DX Example

```ts
// Server
import {
  Engine,
  buildSearchInterface,
  getSSRSnapshot,
  deserializeSearchParameters,
} from '@coveo/thermidor';

const params = deserializeSearchParameters({searchParams: url.searchParams});
const engine = new Engine({
  configuration: {organizationId: '...', accessToken: '...'},
});
const searchInterface = buildSearchInterface({
  engine,
  id: 'main-search',
  initialParameters: params,
});
await searchInterface.executeInitialRequest();
const snapshot = getSSRSnapshot({engine});
engine.dispose();

// Client
import {
  Engine,
  buildSearchInterface,
  buildSearchBoxController,
  restoreSSRSnapshot,
} from '@coveo/thermidor';

const engine = new Engine({
  configuration: {organizationId: '...', accessToken: '...'},
});
restoreSSRSnapshot({engine, snapshot});
const searchInterface = buildSearchInterface({engine, id: 'main-search'});
const searchBox = buildSearchBoxController({interface: searchInterface});
// searchBox.state already reflects server state — no flash, no re-fetch.
```

## Appendix: Multi-Interface Example

With a single engine snapshot, multi-interface pages require no snapshot routing on the client:

```ts
// Server
const engine = new Engine({
  configuration: {organizationId: '...', accessToken: '...'},
});
const search = buildSearchInterface({
  engine,
  id: 'main-search',
  initialParameters: searchParams,
});
const plp = buildCommerceInterface({
  engine,
  id: 'sidebar-recs',
  initialParameters: recsParams,
});
await search.executeInitialRequest();
await plp.executeInitialRequest();
const snapshot = getSSRSnapshot({engine}); // captures all interfaces
engine.dispose();

// Client — one restore, every interface self-hydrates by ID
const engine = new Engine({
  configuration: {organizationId: '...', accessToken: '...'},
});
restoreSSRSnapshot({engine, snapshot});
const search = buildSearchInterface({engine, id: 'main-search'});
const plp = buildCommerceInterface({engine, id: 'sidebar-recs'});
// Both interfaces are hydrated. No routing logic needed.
```
