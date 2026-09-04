# ADR-007 Annex A — Composition Model Analysis (Adjacency List)

> **Annex to:** [ADR-007 — Adopt the A2-UI v1.0 Adjacency List for Component Composition](./ADR-007-adopt-a2-ui-adjacency-list-composition.md)
>
> **Role:** Supporting analysis (RFC-depth). ADR-007 records the decision; this annex documents the exploration behind it: the composition needs, the candidate schema shapes, how the existing cases generalize, the concrete field-level contract, the alignment with the A2-UI standard, the impact on `@coveo/thermidor` and its consumers, and a phased, sequenced migration path.
>
> _A2-UI standard content below is paraphrased for licensing compliance._

---

## 1. The composition need

The Thermidor contract models a component as `{ componentId, componentType, state, actions }` and the backend pushes state per instance keyed by `componentId` (ADR-006). It has no contract-level way to express that one component **owns an ordered set of other components**. That need shows up repeatedly:

| Case                      | Nature of the composition                                                                 | How it is expressed today                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `BundleDisplay`           | A bundle's tiers each hold slots; each slot points at a product component to render there | `BundleSlot.surfaceRef: string` — an untyped id reference inside state       |
| Facets                    | A facet rail owns an ordered, heterogeneous set of facet components                       | `facet-manager.state.facetIds: string[]` — an ordered id list inside state   |
| Decomposed CommerceSearch | A search surface groups search box, product list, sort, pagination, facets                | No contract expression — the grouping/arrangement lives outside the contract |

All three are the same primitive: **a container component referencing its children by id, in a backend-owned order.** Each is currently handled differently, none is validated by the contract, and one case (the decomposed search surface) has no contract expression at all — its grouping and ordering live outside the contract.

The question this annex explores: what is the right schema structure to express this uniformly, and why the A2-UI adjacency list is that structure.

## 2. Two shapes for hierarchy

There are two ways to represent a component tree in a payload, shown here with a generic example — a card with a title and a button:

**Physical nesting** — child objects live inside their parent:

```json
{
  "componentId": "card",
  "componentType": "card",
  "children": [
    {"componentId": "title", "componentType": "text"},
    {"componentId": "cta", "componentType": "button"}
  ]
}
```

**Adjacency list** — components stay in a flat map; a parent references its children by id:

```json
{
  "rootId": "card",
  "components": {
    "card": {"componentType": "card", "children": ["title", "cta"]},
    "title": {"componentType": "text", "children": []},
    "cta": {"componentType": "button", "children": []}
  }
}
```

A2-UI uses the adjacency list. The reasons it gives (paraphrased): a generating model does not have to emit a perfectly nested tree in one pass, components can be streamed and updated incrementally by id, and structure is cleanly separated from data. This matches Thermidor's existing transport, where state is already indexed per `componentId` and updated by targeted deltas (ADR-002). Physical nesting would break that: a nested component could no longer be addressed and updated on its own without re-sending its parent subtree.

Thermidor is already, in spirit, an adjacency-list system — it just expresses the references ad-hoc (a `surfaceRef` string, a `facetIds` array) instead of through a typed, contract-level `children` field. The proposal is not to introduce id references; it is to make the existing ones uniform and standard.

## 3. How the existing cases generalize (minor rework)

Before the target contract shape, it helps to see how each case from §1 maps onto an adjacency list. The existing components are reused, not rewritten from scratch — each case below is a small, by-extension change rather than a new design.

**`BundleDisplay` — `surfaceRef` → child references.** Today each `BundleSlot` holds `surfaceRef: string` pointing at a product component. Under the adjacency list, those references become `children` (on the bundle, or on a per-slot container component if slots need to carry their `categoryLabel`). The referenced product components are unchanged; only the _way the reference is expressed_ moves from an untyped string in state to a typed `children` entry.

**Facets — `facetIds` → `children`.** The `facet-manager` already holds an ordered `facetIds: string[]` — an adjacency list over the facet subset. Generalizing means that ordered id list _is_ `children` (whether the field keeps a domain name or is renamed is a detail). The facet component schemas (`regular-facet`, `numeric-facet`, `date-facet`, `category-facet`) are unchanged; they become the leaf children.

**Decomposed CommerceSearch — components → children of a root.** The components are already decomposed; what they lack is a contract home for their grouping and ordering. They become the `children` of a `commerce-search` root, so that arrangement lands inside the contract instead of being reconstructed outside it.

The shared insight: **a component that references other components by id** is one primitive with several uses. A bare id array expresses ordering; the same array with per-id roles/labels expresses ordered mapping; a single id field expresses a single-child reference. The facet-manager, the bundle, and the search root are all the same mechanism with different numbers of references.

## 4. Proposed contract shape

With the cases mapped onto the model, this is the concrete shape of the contract.

### 4.1 Base component

Add a single optional field to the base component contract:

```jsonc
{
  "properties": {
    "componentId": {"type": "string"},
    "componentType": {"type": "string"},
    "state": {"type": "object"},
    "actions": {"type": "object"},
    "children": {
      "type": "array",
      "items": {"type": "string"},
      "default": [],
      "description": "Ordered list of child component ids referencing other components in the same flat map. Order is backend-owned and meaningful for container components.",
    },
  },
}
```

Single-child components may use `child: string` instead of `children`, following the A2-UI convention. No recursion is introduced in the schema (the field is `string[]`, not a nested component array), so the generated Zod projection stays flat — no `z.lazy()`.

### 4.2 State snapshot

Putting these cases together, a decomposed commerce search surface consolidates into one snapshot. The snapshot declares an explicit `rootId` and keeps the existing flat component map:

```json
{
  "rootId": "commerce-search-1",
  "components": {
    "commerce-search-1": {
      "componentType": "commerce-search",
      "children": ["search-box-1", "facet-manager-1", "product-list-1", "sort-1", "pagination-1"],
      "state": {},
      "actions": {}
    },
    "facet-manager-1": {
      "componentType": "facet-manager",
      "children": ["brand-facet", "price-facet"],
      "state": {},
      "actions": {}
    },
    "brand-facet": {
      "componentType": "regular-facet",
      "children": [],
      "state": {"field": "brand"},
      "actions": {}
    },
    "price-facet": {
      "componentType": "numeric-facet",
      "children": [],
      "state": {"field": "price"},
      "actions": {}
    },
    "search-box-1": {
      "componentType": "search-box",
      "children": [],
      "state": {"query": "wetsuit"},
      "actions": {}
    },
    "product-list-1": {
      "componentType": "product-list",
      "children": [],
      "state": {"products": []},
      "actions": {}
    },
    "sort-1": {"componentType": "sort", "children": [], "state": {}, "actions": {}},
    "pagination-1": {
      "componentType": "pagination",
      "children": [],
      "state": {"page": 0, "totalPages": 5},
      "actions": {}
    }
  }
}
```

Facet order is simply `facet-manager-1.children`. Reordering, adding, or removing a facet is a delta on that one component's `children`, flowing through the same per-`componentId` update mechanism as any other state change.

### 4.3 `rootId` and the surface root

`rootId` names the top of the tree explicitly rather than relying on a magic id or on position. This aligns with A2-UI v1.0's canonical surface root: the create-surface payload implicitly establishes a root container, and everything else hangs off it by reference. The `componentType` of the root carries the intent that a separate "surface type" concept would otherwise carry — a `commerce-search` root versus a `converse` root — so no parallel surface-type discriminant is needed.

## 5. Alignment with A2-UI v1.0

The adjacency list is the A2-UI model, and v1.0 strengthens it rather than changing it. The points relevant to the schema (paraphrased for licensing):

| A2-UI v1.0 aspect                                         | Effect on this proposal                                                                                                                                                                                     |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adjacency list with id references                         | Exactly the proposed `children: string[]` model.                                                                                                                                                            |
| Canonical surface root                                    | Formalizes the declared `rootId`; the create-surface payload establishes a root container.                                                                                                                  |
| Inline composition in the create-surface payload          | Components and their initial data can arrive together, matching a single server state snapshot.                                                                                                             |
| `allowedParents` / `allowedChildren` at the catalog level | A catalog-level way to constrain what a container may hold (e.g. a `facet-manager` accepts only `*-facet` children), with violations reported as catalog errors — see the note below on whether we need it. |

**On child-type validation and whether we need it.** Because children are referenced by id on a flat map, a JSON Schema cannot enforce "a facet-manager may only contain facets" at parse time. Zod validates each component against its `componentType` (the discriminated union `ComponentContractsSchema`), but that is per-component — it cannot check the parent/child _relationship_, which would require resolving each child id and reading the target's type across the flat map. In our model that relationship check is not necessary: the backend owns composition and is trusted to produce it, exactly as it already owns component state (ADR-006), and the consumer renders what it is given (tolerating an unexpected child rather than validating it). This is why a physically nested tree's parse-time child-type validation — its one real advantage — answers no need here; and if a non-deterministic or third-party producer ever made that trust unwarranted, A2-UI's catalog-level `allowedParents`/`allowedChildren` covers it without nesting.

### 5.1 Component lifecycle (comes with the model)

Adopting the adjacency list is not only a static shape; it is the A2-UI [data-flow lifecycle](https://a2ui.org/concepts/data-flow/) for managing the tree over a surface's life. The backend owns this lifecycle, and every operation is id-based on the flat map — no subtree is ever re-sent:

| Operation          | What the backend sends                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| **Create**         | The surface is created (`rootId` + initial components), optionally inline in the create-surface payload. |
| **Add**            | A new component with a new `componentId`, plus the parent's `children` updated to reference that id.     |
| **Update**         | The same `componentId` re-sent with new `state`/properties — a targeted delta on that one component.     |
| **Remove**         | The parent's `children` updated to drop the id; the component is no longer referenced.                   |
| **Delete surface** | The whole surface is torn down.                                                                          |

This is why ordering, add, and remove are all cheap: reordering facets is a delta on `facet-manager.children`; adding one is a new component plus that same `children` edit; removing one is a `children` edit alone. It is also the reason physical nesting was rejected — nesting cannot express these as targeted per-id operations. The backend must be ready to emit these operations, not just a one-shot tree; that is part of what "adopting the standard" entails.

## 6. Impact on `@coveo/thermidor` and consumers

This section is more concrete about the SDK and consumer side. It describes the _shape_ of the change, not any current UI implementation.

**State resolution is unchanged.** The SDK resolves a component's state by looking it up by `componentId` in the flat map. The adjacency list adds references between components; it does not change how a single component's state is fetched or validated. The per-id lookup and its Zod validation stay as they are.

**Navigation helpers are added on top.** To walk the tree, the SDK exposes small read helpers over the flat map: resolve a component's navigation envelope (`componentType` + `children`), read a component's ordered child ids, read the `rootId`, and find a child of a given type under a parent. These return only the navigation envelope — not raw `state`/`actions` — so a consumer cannot read component state by casting a navigation result; it must go through the typed, contract-validated state accessor. Type discovery (read `componentType`) plus contract-validated state resolution replaces any untyped `as` cast that an id-string reference forces today.

**Dispatch is unchanged.** Actions are addressed by the target component's `componentId`, which is globally unique in the flat map regardless of where the component sits in the tree. Composition does not change the action envelope.

**The message dictates composition; the consumer owns per-component rendering.** The adjacency list expresses the structure — which components exist, what contains what, and in what order — and a consumer that wants the simplified experience renders that tree as given (an A2-UI renderer does this from the flat map automatically). What stays with the consumer is _how each component looks_: its markup, styling, and CSS. This is the point of expressing composition in the message — the consumer no longer hand-builds the arrangement; it only supplies the visual rendering of each component type. A consumer technically remains free to deviate from the tree, but doing so opts out of the simplification this is meant to provide.

## 7. Sequencing

Adopting the adjacency list as the target does not mean changing the base contract on day one. The producer-side cost (emitting `children` + `rootId`, decomposing monolithic surfaces) should be spent when a concrete case justifies it.

1. **Facets — already covered by `facet-manager`.** The `facet-manager`, whose ordered `facetIds` live in its state, fully covers the facet requirement (ordered, heterogeneous, dynamic) and is already an adjacency list over one subset. It needs no base-contract change, and the existing facet component schemas carry over as-is when the model is generalized.
2. **Generalize `children` at the base contract on the second composition case** — giving the already-decomposed CommerceSearch surface a contract home, refactoring `BundleDisplay`, or introducing layout containers — or when broader alignment with A2-UI v1.0 is undertaken. This is where the backend contract change (emit `children` + `rootId`) pays for itself against a real need rather than being paid up front.

`BundleDisplay` (the one pre-existing hierarchical case) migrates to `children` at this step by extension, not rewrite.

## 8. Phased migration

Each phase is additive and non-breaking to the flat-map state format.

**Phase 1 — Schema.**

1. Add `children: string[]` (default `[]`) to the base component contract; add `child: string` for single-child components if needed.
2. Regenerate the Zod projections (a plain array field, no recursion).
3. Add the surface-root component types (e.g. `commerce-search`). The facet component schemas and `facet-manager` already exist and carry over unchanged.
4. _(Optional)_ Declare `allowedParents` / `allowedChildren` at the catalog level (e.g. `facet-manager` accepts only `*-facet` children) — only if composition ever comes from a non-deterministic or third-party producer; not needed while the backend is the trusted owner.

**Phase 2 — SDK.**

1. Keep per-`componentId` state resolution unchanged.
2. Add the navigation helpers (resolve envelope, child ids, root id, find-child-by-type).
3. Support rendering from `rootId` down through `children`.

**Phase 3 — Server payload.**

1. The backend populates `children` on container components.
2. The backend exposes `rootId` in the snapshot.
3. The existing flat map and per-`componentId` state are preserved.

**Phase 4 — Consolidation.**

1. Map `BundleDisplay`'s `surfaceRef` onto `children`.
2. Map the `facet-manager`'s `facetIds` onto `children`.
3. Express decomposed CommerceSearch components as children of a `commerce-search` root.

## 9. Alternatives considered (summary)

The ADR's option table is the authoritative comparison. The nuances worth recording:

- **Physically nested tree.** Its only net advantage over the adjacency list is parse-time validation of the parent/child relationship. That validation is not needed here — the backend is the trusted owner of composition (as it is of state) and the consumer renders what it is given — and if it ever were, A2-UI's catalog-level `allowedParents`/`allowedChildren` provides it without the nesting. So the advantage answers no need, while nesting's costs (breaking snapshot format, subtree re-sends instead of targeted deltas, recursive generation, divergence from A2-UI) remain. Rejected.
- **Ordering via position in the global flat map.** Deriving order from where a component sits in the payload couples order to the whole payload's layout and makes a reorder impossible to express as a minimal delta. Rejected in favor of an explicit ordered id list on a container (which is exactly what `children` is). This is also why the facet design puts ordering on a dedicated `facet-manager` rather than a distributed `position` field.
- **Schema-only `children` (documented but unused at runtime).** Purely cosmetic; provides no real composition capability. Rejected.

## 10. Consequences (detail)

**Positive.** A single uniform composition primitive; backend-owned ordering as a targeted single-component delta; unchanged per-`componentId` state transport; A2-UI v1.0 alignment and portability across cases (bundles, facets, decomposed search, future layout containers); a contract home for the decomposed CommerceSearch surface.

**Negative / risks.**

| Risk                                                                   | Mitigation                                                                                                                                                                                                           |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No parse-time validation of the parent/child relationship              | Not needed while the backend is the trusted owner of composition (as with state, ADR-006); catalog-level `allowedParents`/`allowedChildren` available if a non-deterministic/third-party producer ever changes that. |
| Structure spread across the flat map (less "visual")                   | Accepted A2-UI trade-off; it keeps streaming and targeted per-id deltas simple.                                                                                                                                      |
| Id references must stay consistent                                     | The producer guarantees every id in `children` exists in the map; a consumer tolerates a missing id by rendering nothing for it.                                                                                     |
| Producer coordination (emit `children` + `rootId`, decompose surfaces) | Sequenced (section 7): ship facets via `facet-manager` first; generalize when a second case justifies the backend change.                                                                                            |
