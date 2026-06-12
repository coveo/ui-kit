# Introduce generative interface for conversational and generated experiences

**Status**: Proposed
**Related docs**: [ADR-000 Architecture Decision Charter](./ADR-000-architecture-decision-charter.md), [ADR-002 Multi-Interface Engine](./ADR-002-multi-interface-engine.md)

## 1. Context

- **Business/context drivers**: Coveo is building a Generative Endpoint that interprets user prompts, optionally orchestrates agents, and returns AGUI-compliant SSE streams. A single conversation may produce multiple generated experiences over time — each backed by a different backend. DXUI Headless must provide the orchestration and state management layer.
- **Technical constraints**: Must build on ADR-002. Must preserve TypeScript type safety, tree-shaking, state isolation, and lazy loading. Must not expose AGUI/A2UI in the public API (ADR-001). The Generative Endpoint contract is still evolving.
- **Known assumptions**: headless-future is a POC. Hints in AGUI events identify the originating backend. Direct backend resolutions reuse existing typed interfaces. Agent-based responses may not map to a known backend contract. Generated experiences are isolated — no cross-experience communication.

## 2. Decision Statement

Introduce `buildGenerativeInterface` — a meta-interface that dynamically spawns typed sub-interfaces as AGUI streams resolve. A generic `buildGenerativeMapController({ interface, controllerBuilder })` factory produces reactive maps of controller instances keyed by experience ID (type inferred from `controllerBuilder`). A separate `ConversationController` owns prompt submission, message history, and streaming state. The generative interface manages an ordered list of experience IDs with subscribe and `dispose(id)`. Each sub-interface is a real ADR-002 typed interface for known backends; for agent-composed responses, a UI surface controller handles the rendered state.

## 3. Requirements & Considerations Mapping

- **Full use-case support** — Impact: Positive. Direct backend resolution, agent-orchestrated responses, multiple concurrent experiences, hybrid compositions. Additive: new use cases add new `controllerBuilder` calls.
- **Public API independence** — Impact: Positive. AGUI, A2UI, SSE, hints — all internal. Public surface exposes domain-level concepts only.
- **First-class SSR** — Impact: None. Orthogonal. Serializable state and experience IDs. Streaming is client-side only.

1. **Tree-shaking efficiency** — Impact: Positive. Unused controller builders eliminated. Feature state lazy-loaded per ADR-002.
2. **Migration simplicity** — Impact: Negative. New concept. Mitigated: additive, mirrors existing FacetGenerator pattern.
3. **External contribution readiness** — Impact: Positive. Adding a new controller type requires no library-side changes — consumer passes the builder to the generic factory.

## 4. Options Considered

### Option A (Selected): Generative meta-interface + generic map controller factory

**Basic setup:**

```ts
const engine = new Engine({
  /* ... */
});

const generative = buildGenerativeInterface({engine});

const searchBoxMap = buildGenerativeMapController({
  interface: generative,
  controllerBuilder: buildSearchBoxController,
});
const resultListMap = buildGenerativeMapController({
  interface: generative,
  controllerBuilder: buildResultListController,
});
const productListMap = buildGenerativeMapController({
  interface: generative,
  controllerBuilder: buildProductListController,
});
const facetMap = buildGenerativeMapController({
  interface: generative,
  controllerBuilder: buildFacetGenerator,
});
const surfaceMap = buildGenerativeMapController({
  interface: generative,
  controllerBuilder: buildUISurfaceController,
});

const conversation = buildConversationController({interface: generative});
```

**Consuming generated experiences:**

```ts
generative.subscribe(() => {
  const experienceIds = generative.state; // ['exp-1', 'exp-2', 'exp-3']

  for (const id of experienceIds) {
    const searchBox = searchBoxMap.state.get(id); // SearchBoxController | undefined
    const resultList = resultListMap.state.get(id); // ResultListController | undefined
    const productList = productListMap.state.get(id); // ProductListController | undefined
    const facets = facetMap.state.get(id); // FacetGenerator | undefined
  }
});

generative.dispose({interfaceId: 'exp-1'});
```

**Interaction within a generated experience:**

```ts
const searchBox = searchBoxMap.state.get('exp-2');
searchBox.updateText({query: 'shoes'});
searchBox.submit(); // triggers a request within that sub-interface

const facets = facetMap.state.get('exp-2');
facets.facets[0].toggleSelect(facets.facets[0].state.values[0]);
```

**Key details:**

- Generic factory — type inferred from `controllerBuilder`. No per-feature named builders needed.
- Sub-interfaces are real ADR-002 typed interfaces for known backends. All existing controllers work within a generated experience without modification.
- Map controllers lazily instantiate and memoize controllers per experience ID. Stable identity guaranteed.
- ConversationController submits prompts. AGUI stream interpreted by generative interface, which spawns sub-interfaces based on hints.
- State sync: direct backend resolutions buffered and synced in batch on stream completion. Agent-composed responses synced progressively.
- Disposed controllers become frozen no-ops: `.state` returns last snapshot, methods are silent no-ops, `.subscribe()` never fires again.
- Separate maps per controller shape (e.g., `buildFacetGenerator` vs `buildCommerceFacetGenerator`).

### Option B: Flat controller list per experience (no maps)

`generative.getExperience('exp-1').controllers` → heterogeneous bag.

- Rejected: breaks declarative opt-in; no tree-shaking of unused types; requires runtime type narrowing; doesn't align with ADR-002.

### Option C: Single monolithic generative controller

One controller with deeply nested state for all experiences.

- Rejected: no tree-shaking; violates separation of concerns; all state updates trigger all subscribers.

### Option D: Experience-scoped `composeInterfaces`

Consumer creates composed interfaces on the fly from generative events.

- Rejected: pushes lifecycle management to consumer; AGUI details leak into application code.

### Option E (Rejected): Per-feature named map controller builders

`buildGenerativeSearchBoxMapController`, `buildGenerativeResultListMapController`, etc.

- Rejected: combinatorial explosion. Every new controller requires a library-side generative map variant. Unsustainable.

## 5. Decision Rationale

Option A: generic factory avoids N×M naming explosion while preserving full type inference. Mirrors the proven FacetGenerator pattern (lazy, memoized, per-ID). ConversationController / generative interface split separates "talking to the endpoint" from "managing what comes back." Two-tier sync (batch vs progressive) matches response semantics. Options B–C sacrifice tree-shaking and type safety. Option D leaks transport concerns. Option E creates unsustainable API surface growth.

## 6. Public API and Contract Impact

- **Changes**: `buildGenerativeInterface`, `buildGenerativeMapController`, `buildConversationController`, `GenerativeInterface.state` (ordered IDs), `.subscribe()`, `.dispose(id)`.
- **Backward compatibility**: Additive. Non-generative code unaffected.
- **Stability**: New controller builders are additive. UI surface controller state may evolve.
- **Non-leakage check**: Pass.

## 7. Operational and Runtime Impact

- **Performance**: Negligible. Lazy-loaded state. Memoized selectors. Disposal frees resources.
- **Reliability**: Improved. State isolation per experience.
- **SSR**: Deferred. Not precluded (serializable state).

## 8. Migration and Rollout Plan

- **Impact**: None for non-generative consumers. New generative use cases: import `buildGenerativeInterface`, declare map controllers, wire up ConversationController.
- **Strategy**: Phased. Direct backend resolution first. Agent-composed surfaces follow.
- **Communication**: Usage guide with progressive examples.

## Appendix: Open Questions

1. **Agent-composed experience typing** — Exact state shape of the UI surface controller. To be refined as endpoint contract solidifies.

2. **Hybrid experiences** — Single response combining multiple backends. One experience ID with composed capabilities, or multiple? To be validated.

3. **Experience ordering** — Chronological, append-only. Reordering is consumer-side.

4. **Sub-interface reuse** — Always spawn new (each prompt = new experience). Merging/reuse deferred.

5. **Memory management** — Long-running sessions accumulate state. Consumer-managed `dispose()` for now. Automatic eviction (LRU, cap) can be introduced later as additive option.
