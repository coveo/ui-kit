# Annex: Facet Ordering — Alternatives Considered and Rejected

This annex expands on the [facet ordering design decision](./facet-schema-design-decisions.md#facet-ordering-is-a-dedicated-component). It documents the alternatives that were considered for preserving facet order and why each was rejected in favor of the dedicated `facet-manager` component.

## Alternative 1: Rely on the order of the `components` array in the catalog

The `components` array holds _all_ components (cart, pagination, sort, search box, product list, and facets). Facet order would be an emergent side-effect of where facets happen to sit among unrelated components. To derive it, consumers would filter the array to facet types and rely on relative position — coupling facet rendering order to the layout of the entire catalog payload.

More critically: if the only thing that changed is facet order, expressing that as a delta is impossible without either resending the entire `components` array (defeating delta efficiency for the smallest semantic change) or inventing an array-reorder operation at the transport level, which is just `facetIds` by another name smuggled into the protocol.

Array order also doesn't compose with cross-facet actions. "Clear all facets" or "reorder facets" would need a new mechanism, since there's no component to attach those actions to.

## Alternative 2: A `position` field on each facet component

This distributes ordering across independent components. Each facet carries a `position: integer` in its state. The consumer gathers all facets and sorts by position.

The problem is that ordering becomes a **global invariant spread across independent documents**: "positions are unique and contiguous" is a cross-component constraint that JSON Schema cannot validate. With a centralized list, ordering is total and unambiguous by construction (it's an array, position is index). With distributed `position` fields, you get collisions (two facets claim position 2) and gaps, which need tiebreak/normalization rules. That's a strictly worse failure mode than the "dangling id" check of the centralized approach, because collisions and gaps are ambiguous (what's the right order?) rather than clearly invalid.

Additionally, "the set of facets reordered" is not expressible as a delta to any single component's state, since reordering touches multiple components' `position` fields simultaneously. The `facet-manager` component expresses the same change as one field update on one component.

## Alternative 3: A single monolithic facet component

One component whose `state` is the ordered list of every facet's state, and whose `actions` are the union of all facet actions (`toggleSelect`, `toggleExclude`, `applyCustomRange`, `selectPath`, `search`, `showMoreValues`, ...), each taking a `facetId` in its payload to target a specific facet. Ordering falls out for free because the state is an ordered array.

This was rejected for two reasons:

_Bad DX._ Each state entry would be a tagged union across the four facet types, so the consumer discriminates on a `facetType` field before rendering each one, rather than receiving four cleanly-typed components. The action surface is the union of every facet's actions, so the consumer sees actions that only apply to some entries (e.g. `applyCustomRange` is meaningless for a regular facet, `search` is meaningless for numeric/date). Every action call must thread a `facetId`. The component becomes a catch-all that's harder to consume than four focused components.

_Weaker contract._ This is the more important reason. With separate components, each facet's schema fully validates its own contract: a `date-facet` document is checked against exactly the actions and value shapes that date facets support. In the monolithic model, whether a given action is valid depends on the _runtime type of the facet its `facetId` points at_.

A TypeScript consumer could partly recover safety here with a discriminated union plus a mapped/conditional type (mapping each `facetType` to its allowed actions), so a typed dispatch helper would reject `applyCustomRange` on a regular facet at compile time. But that workaround lives entirely in the TypeScript layer, and this package's contract is JSON Schema (with generated Zod), not TypeScript. The rule "this action is valid iff it matches the runtime `facetType` of the entry its `facetId` targets" is a cross-referential, data-dependent constraint that JSON Schema 2020-12 cannot express and that `Schema.safeParse(document)` therefore cannot enforce against an arbitrary document (e.g. one produced by the backend or a non-TypeScript consumer). A mapped type helps the author writing TypeScript; it does nothing for the validation contract itself, and it only holds if every dispatch is routed through the typed helper.

With separate components, the discriminant _is_ the schema (the `componentType` constant), so the guarantee holds at the contract level for every consumer regardless of language or access pattern. The monolithic component would validate the _shape_ of a payload but not whether that action is legal for its target, pushing that correctness out of the contract and into runtime logic.

The `facet-manager` gets the ordering benefit of a central component _without_ absorbing per-facet state or actions. It holds only the ordered `facetIds`; the facets remain independent, self-validating components. This captures the one genuine advantage of the monolithic approach (native ordering) while avoiding both of its costs.

## Comparison

| Property                             | Catalog array order                         | Distributed `position`                      | Monolithic component                                  | Dedicated `facet-manager`         |
| ------------------------------------ | ------------------------------------------- | ------------------------------------------- | ----------------------------------------------------- | --------------------------------- |
| Single source of truth               | ✅ (array position)                         | ❌ (spread across facets)                   | ✅ (ordered state array)                              | ✅ (one `facetIds` array)         |
| Reorder expressible as one delta     | ❌ (resend whole array or invent array ops) | ❌ (multi-component update)                 | ✅ (ordered state array)                              | ✅ (one state update)             |
| Decoupled from unrelated components  | ❌ (facets mixed with all other components) | ✅                                          | ✅                                                    | ✅                                |
| Extensible to cross-facet actions    | ❌ (no component to attach actions to)      | ❌                                          | ✅                                                    | ✅ (add actions to the component) |
| Facets stay independently consumable | ✅ (separate components)                    | ✅ (separate components)                    | ❌ (tagged-union entries, union of all actions)       | ✅ (separate components)          |
| Action validity enforced by contract | ✅ (per-facet schemas)                      | ✅ (per-facet schemas)                      | ❌ (depends on target's runtime `facetType`)          | ✅ (per-facet schemas)            |
| Consistent with the component model  | ❌ (ordering lives outside components)      | ⚠️ partial (state spread across components) | ⚠️ partial (one component absorbs all facet concerns) | ✅ (uniform state/actions)        |
