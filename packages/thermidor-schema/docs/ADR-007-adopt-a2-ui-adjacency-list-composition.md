# ADR-007: Adopt the A2-UI v1.0 Adjacency List for Component Composition

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Thermidor Stack team  
**Related:** [ADR-001](./ADR-001-thermidor-schema-contract.md), [ADR-002](./ADR-002-agui-controller-state-transport.md), [ADR-006](./ADR-006-remove-controllers-from-public-schema.md), [Annex A](./ADR-007-annex-a-composition-adjacency-list-analysis.md)

---

## Context and Problem Statement

The Thermidor schema models individual components well. Each component has a `componentType`, an observable `state`, and an `actions` map, and the backend pushes state per component instance keyed by `componentId` (ADR-006). What the contract does **not** model is the **relationship between components**: which component contains which others, and in what order.

This gap is not hypothetical. It shows up across three cases already in place, each handling composition a different way (or not at all):

- **`BundleDisplay` (ad-hoc — via a `surfaceRef` string).** Its state carries `tiers[]`, and each tier carries `slots[]` where every `BundleSlot` holds a `surfaceRef: string` — a plain string pointing at another component whose products should render in that slot. This is a containment relationship (one component refers to others) expressed as an untyped string inside state, outside any schema-level notion of "child". Nothing in the contract validates that the referenced component exists or is of an allowed type.

- **Decomposed CommerceSearch (no contract expression — where the gap surfaced).** The commerce search experience, previously a single monolithic surface, has been decomposed into individual components (search box, product list, sort, pagination, and later facets). Doing so surfaced the missing piece directly: there is no contract-level way to express that these components form one search surface, in a given arrangement, with that grouping and ordering owned by the backend. That arrangement currently has to be reconstructed outside the contract.

- **Facets (ad-hoc — via `facetIds` in state).** Facets are implemented as standalone components (`regular-facet`, `numeric-facet`, `date-facet`, `category-facet`) plus a `facet-manager` whose state holds an ordered `facetIds: string[]`. That `facetIds` list is, in practice, a container referencing its children by id — the same composition need, solved ad-hoc for this one case. The backend owns this order and changes it (reorder, add, remove) via state deltas.

Each of these is the same underlying problem — a component that owns an ordered set of references to other components — handled a different, off-contract way (`surfaceRef` string, `facetIds` in state, or no contract expression at all for the decomposed surface). The backend that produces these payloads has no single, uniform way to express composition. And because there is no standard, consumers cannot rely on one predictable pattern: each case has to be learned and integrated on its own terms, with no contract-level guarantee about how components relate.

Thermidor is built on A2-UI, and A2-UI already answers this exact question with a standard model: the [**adjacency list**](https://a2ui.org/concepts/components/). Components stay in a flat map; hierarchy is expressed by having a component reference its children **by id** (`children: string[]`), forming a tree by reference rather than by physical nesting. A2-UI v1.0 formalizes it further (a canonical surface root, and `allowedParents`/`allowedChildren` declared at the catalog level to constrain what may contain what). Choosing a composition model is a durable, contract-level decision, so it is recorded here.

This ADR records the decision. The concrete field-level shape, server payload examples, alignment details with A2-UI v1.0, and a phased migration path are in [Annex A](./ADR-007-annex-a-composition-adjacency-list-analysis.md).

## Decision Drivers

- Composition (containment and ordering) should be expressed **in the contract**, uniformly, rather than through per-case ad-hoc mechanisms (`surfaceRef`, `facetIds`, monolithic surfaces).
- The backend needs one consistent way to declare "this component contains these components, in this order" in the data it returns.
- Ordering owned by the backend should be expressible as a **minimal state delta** on a single component, consistent with the existing per-`componentId` state transport (ADR-002).
- The model should align with the A2-UI v1.0 standard Thermidor already builds on, not a bespoke structure.
- Consistency with ADR-006: per-component `state`/`actions` stay flat; composition is expressed **between** components, not nested inside one.
- The change should be additive and non-breaking to the existing flat-map state format.

## Considered Options

### Option A: A2-UI adjacency list (flat map + child references by id)

- **Summary:** Keep the flat component map. Add a `children: string[]` field (and `child: string` for single-child components) that references other components by their `componentId`, plus an explicit `rootId` declaring the top of the tree. Hierarchy is expressed by reference, exactly as A2-UI. What a container may hold _can_ be constrained at the catalog level via `allowedParents`/`allowedChildren` (A2-UI v1.0) if needed.
- **Pros:**
  - The A2-UI standard model; v1.0 reinforces it (canonical surface root, `allowedChildren`, inline composition in the create-surface payload).
  - One uniform primitive replaces `surfaceRef`, `facetIds`, and monolithic surfaces.
  - Consumers resolve children one standard way for every case — the pattern A2-UI renderers already handle from the flat map — instead of a per-case convention.
  - Backend-owned ordering is the order of ids in `children`, changeable via a single-component delta — consistent with the existing transport.
  - Additive and non-breaking: the flat map and per-`componentId` state indexing are unchanged.
  - Native incremental updates: a deeply nested component is still addressed directly by its `componentId`.
- **Cons:**
  - No parse-time validation of the parent/child _relationship_ (per-component validation via the discriminated union is unchanged). Not needed while the backend is the trusted owner of composition; available at the catalog level (`allowedParents`/`allowedChildren`) if that ever changes.
  - Composition is spread across the flat map rather than being visually nested.
  - The backend must populate `children` and `rootId` in its payloads (and refactor remaining monolithic cases such as `BundleDisplay`) to benefit.

### Option B: Physically nested tree

- **Summary:** Nest child component objects directly inside each parent's `children`, forming a JSON tree in the payload.
- **Pros:**
  - Parse-time validation of child types (a container can constrain its children via a discriminated union).
  - The payload visually mirrors the render hierarchy.
- **Cons:**
  - **Diverges from A2-UI**, which deliberately rejects physical nesting in favor of the adjacency list.
  - State indexing moves from a flat per-`componentId` map to a tree structure; updating a nested component means re-sending its parent subtree instead of a targeted delta.
  - Breaking change to the state snapshot format; recursive schema generation.

### Option C: Per-case ad-hoc references (status quo, generalized)

- **Summary:** Keep solving each case on its own — `surfaceRef` strings for bundles, `facetIds` in state for facets, and a separate mechanism for decomposed search.
- **Pros:**
  - No contract change.
  - Each case is locally simple.
- **Cons:**
  - No uniform composition model; every new composition need reinvents one.
  - References are untyped and not validated.
  - The backend produces several different shapes for the same underlying "container of components" concept.

### Comparison Matrix

| Criterion                            | Option A (Adjacency list)                                    | Option B (Nested tree) | Option C (Ad-hoc) |
| ------------------------------------ | ------------------------------------------------------------ | ---------------------- | ----------------- |
| Expresses containment + ordering     | ++                                                           | ++                     | + (per case)      |
| Uniform across cases                 | ++                                                           | ++                     | --                |
| A2-UI v1.0 alignment                 | ++                                                           | --                     | -                 |
| State transport unchanged (per-id)   | ++                                                           | --                     | ++                |
| Ordering as a single-component delta | ++                                                           | -                      | + (facets only)   |
| Parent/child relationship validation | not needed (trusted backend); catalog-level if ever required | parse-time             | none              |
| Additive / non-breaking              | ++                                                           | --                     | ++                |

## Decision Outcome

We adopt **Option A**: express component composition as an A2-UI v1.0 adjacency list — a flat component map where components reference their children by `componentId`, with an explicit `rootId`.

Container components (a search surface root, a `facet-manager`, a bundle) become ordinary components whose `children` list the ids of the components they own, in order. Consistent with A2-UI, `children` is an **ordered list of what the container owns**, and the order is backend-owned and meaningful for container components (e.g. facet order). Per-component `state`/`actions` are unchanged, preserving ADR-006: composition lives between components, not inside one.

**Adopting this model means adopting the A2-UI component lifecycle that comes with it.** The backend does not just emit a static tree once; it manages the tree over the surface's life using the standard operations (see [A2-UI data flow](https://a2ui.org/concepts/data-flow/)): **add** a component by sending it with a new id and referencing that id from its parent's `children`; **update** a component by re-sending it under the same id; **remove** a component by dropping its id from the parent's `children`. These are id-based operations on the flat map — no subtree re-send — and they are part of the contract, not an optional extra. This is what the phrase "aligned with the standard" concretely commits the backend to.

### Rationale

Option A is the only option that expresses composition **and** aligns with the standard Thermidor already builds on, while leaving the existing per-`componentId` state transport untouched.

Option B's one distinctive advantage is parse-time validation of child _types_ (a container could constrain its children via a discriminated union). But this does not answer a real need here. Zod already validates each component against its `componentType` (via the discriminated union `ComponentContractsSchema`); what it cannot check is the _relationship_ — that a `facet-manager`'s children are all facets — because `children` holds ids and the check would have to resolve them across the flat map. And that relationship check is not necessary in our model: the backend owns the composition and is trusted to produce it, exactly as it already owns component state (ADR-006), and the consumer renders what it is given (tolerating an unexpected child rather than validating it). If a non-deterministic or third-party producer ever made that trust unwarranted (e.g. LLM-generated composition), A2-UI covers it at the catalog level via `allowedParents`/`allowedChildren` — without physical nesting. So Option B's advantage answers no current need and is available through the standard if it ever does, while Option B's costs (breaking snapshot format, subtree re-sends, recursive generation, divergence from A2-UI) remain. Option C keeps the backend producing several shapes for one concept, with no reuse across cases; it does not scale past the first need.

Crucially, the existing designs are not thrown away — they _are_ adjacency lists in disguise, and they generalize by extension:

- `BundleDisplay`'s `surfaceRef` strings become `children` references on the bundle (or its slots).
- The `facet-manager`'s `facetIds: string[]` is already an ordered list of child ids; it becomes (or maps directly to) `children`.
- The decomposed CommerceSearch components become the `children` of a search-surface root.

The main accepted cost is on the producer side: the backend must populate `children` and `rootId` in the payloads it returns (and refactor the remaining monolithic cases, such as `BundleDisplay`, to emit their parts as referenced components) before each case benefits. Annex A recommends sequencing this — the immediate facet need can ship via the `facet-manager` (already an adjacency list over one subset) without a base-contract change, and the base `children` field is generalized when a second composition case (decomposed search, bundle refactor, layout containers) justifies engaging the backend contract more broadly.

## Consequences

### Positive

- The backend gains one uniform way to express composition, replacing `surfaceRef`, `facetIds`, and monolithic surfaces.
- Backend-owned ordering is expressed as the order of ids in `children`, changeable via a targeted single-component delta.
- The flat map and per-`componentId` state indexing (ADR-002/006) are unchanged; the change is additive.
- Aligned with A2-UI v1.0, maximizing portability and reuse across composition cases (bundles, facets, decomposed search, future layout containers).
- Gives the already-decomposed CommerceSearch components a contract home, keeping their grouping and ordering inside the contract instead of reconstructed outside it.
- Simplifies the consumer: the message dictates composition (which components exist, what contains what, in what order), so the consumer renders the tree as given instead of hand-building the arrangement. It still owns per-component rendering (markup, styling); it no longer owns the layout structure.

### Negative

- The parent/child relationship is not validated at parse time. This is acceptable because the backend is the trusted owner of composition (as it is of state, ADR-006) and the consumer renders what it is given; if a non-deterministic or third-party producer ever changes that, A2-UI's catalog-level `allowedParents`/`allowedChildren` covers it. Per-component validation (Zod discriminated union) is unchanged.
- The backend must populate `children` + `rootId` in its payloads (and refactor remaining monolithic cases such as `BundleDisplay`) before each case benefits — a real producer-side cost, addressed by the sequencing in Annex A.
- Composition is spread across the flat map rather than visually nested; accepted as the A2-UI trade-off that keeps state indexing and targeted deltas simple.

### Neutral

- Per-component `state`/`actions` are unaffected; this decision concerns composition between components, consistent with ADR-006.
- ADR-002's transport boundary (AG-UI for state, A2-UI for composition) is unchanged; correlation stays on `componentId`.
- Parts of the A2-UI v1.0 standard unrelated to composition (e.g. its bidirectional RPC mechanism) are out of scope and not adopted by this decision.

## Implementation and Follow-up

This ADR sets direction. The detailed, phased plan and field-level shapes are in [Annex A](./ADR-007-annex-a-composition-adjacency-list-analysis.md). At a high level, once accepted:

1. **Schema** — add `children: string[]` (and `child` where needed) to the base component contract, and add a declared `rootId` to the state snapshot. Regenerate the Zod projections. Catalog-level `allowedParents`/`allowedChildren` is optional — only if composition ever comes from a non-deterministic or third-party producer.
2. **Server payload and lifecycle** — the backend populates `children` on container components and exposes `rootId`, and manages the tree over the surface's life via the A2-UI add/update/remove operations (all id-based on the flat map); the existing flat map and per-`componentId` state are kept.
3. **Generalize existing cases** — map `BundleDisplay`'s `surfaceRef` and the `facet-manager`'s `facetIds` onto `children`; express the decomposed CommerceSearch components as children of a search-surface root.

Review should revisit this decision if composition ever stops being produced by a trusted, deterministic backend (e.g. LLM-generated or third-party composition), since the trade-off against Option B rests on that trust; catalog-level `allowedParents`/`allowedChildren` is the standard answer in that case.

## References

**Companion analysis**

- [Annex A — Composition Adjacency List Analysis](./ADR-007-annex-a-composition-adjacency-list-analysis.md)

**Related ADRs and internal docs**

- [ADR-001: Thermidor Schema — UI Component Contract](./ADR-001-thermidor-schema-contract.md)
- [ADR-002: Use AG-UI Controller State Alongside A2-UI](./ADR-002-agui-controller-state-transport.md)
- [ADR-006: Remove Controllers from the Public Schema Contract](./ADR-006-remove-controllers-from-public-schema.md)

**A2-UI standard**

- [A2-UI — Components & Structure (adjacency list)](https://a2ui.org/concepts/components/)
- [A2-UI — Data Flow (component lifecycle)](https://a2ui.org/concepts/data-flow/)
