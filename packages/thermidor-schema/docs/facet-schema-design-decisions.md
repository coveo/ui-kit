# Facet Schema Design Decisions

This document summarizes how the Thermidor facet component schemas diverge from the headless commerce facet controllers and why each change was made. It is intended as a reviewer guide.

## Architectural decisions

### Each facet is its own component (no facet generator or sub-controllers)

**Headless:** A `FacetGenerator` controller owns an ordered list of typed sub-controllers. Each sub-controller wraps a core facet and composes a facet-search sub-controller.

**Thermidor schema:** Each facet type is a standalone component (`regular-facet`, `numeric-facet`, `date-facet`, `category-facet`). There is no generator or sub-controller concept.

**Why:** The Thermidor component model is flat: one component = one `componentType`, one `state`, one `actions` object. The generator's job (ordering and instantiation) is handled differently (see below), and nesting sub-controllers would break the uniform contract every component follows.

### Facet ordering is a dedicated component

**Headless:** The facet generator owns the ordered list of facet IDs internally.

**Thermidor schema:** A `facet-manager` component with `state: { facetIds: string[] }` and an empty actions object (ready to gain cross-facet actions) holds the backend-determined sequence.

**Why:** Ordering is mutable observable state that may change via delta updates (e.g., the backend reorders facets after a query). Making it a component means a reorder is a minimal delta targeting one component's state, flowing through the same update mechanism as everything else. It also avoids bolting ordering onto the catalog envelope or distributing it as a `position` field across facets (which invites collision/gap bugs).

Three alternatives were considered and rejected: relying on the order of the catalog's `components` array, a distributed `position` field on each facet, and a single monolithic facet component. Each is documented in detail — with a comparison table — in [Annex: Facet Ordering Alternatives](./facet-ordering-alternatives.md). In short, the dedicated component is the only option that is simultaneously a single source of truth, expresses a reorder as one delta, stays decoupled from unrelated components, keeps facets independently consumable and contract-validated, and is extensible to cross-facet actions.

#### Future direction

The `facet-manager` component currently holds only the ordered list and has no actions (ordering is backend-owned). However, its role as "the component that knows about all facets collectively" makes it a natural home for cross-facet actions that don't belong on any individual facet:

- **Clear all active values across all facets** (a single "reset filters" action that clears selections on every facet at once, rather than dispatching `clearAllActiveValues` on each one individually).
- **Reorder facets from the frontend** (if the UX ever supports drag-and-drop facet reordering, a `reorder({ facetIds })` action would live here).
- **Collapse/expand all facets** (if facet visibility becomes frontend-controlled state).

When these needs arise, the component can gain actions alongside its state. The current design leaves this door open: the empty `actions` object is ready to accept new actions without structural changes, and the `facetIds` state remains the ordering authority regardless of what actions are added.

### Facet search is flattened into the component

**Headless:** Searchable facets (regular, category) compose a `FacetSearch` sub-controller with its own state and methods (`updateText`, `search`, `select`, `exclude`, `showMoreResults`, `clear`).

**Thermidor schema:** The facet search state lives as a `facetSearch` object inside the facet's `state`, and the search actions (`search`, `showMoreSearchResults`, `clearSearch`) are top-level actions alongside the facet's other actions.

**Why:** The schema has no concept of embedded/nested components. Flattening keeps the contract uniform: one actions map, one state object. The consumer doesn't need to manage a sub-controller lifecycle.

## State changes

### Removed `isLoading` (top-level and facet search)

**Headless:** Exposes `isLoading` on the facet state and `facetSearch.isLoading`.

**Thermidor schema:** Neither exists.

**Why:** The transport currently uses SSE but does not maintain a persistent open connection. Without a persistent channel, the backend cannot push an intermediate "loading" delta before the final response arrives — by the time it responds, the data is ready and `isLoading` would always be `false`. The frontend already knows it's loading (it dispatched the request and is awaiting a response), so the field would be unobservable from the backend's perspective in the current architecture.

If the transport evolves to keep the SSE connection open (enabling push-based intermediate state deltas), `isLoading` becomes genuinely useful backend-owned state: the backend could push `isLoading: true` immediately upon receiving an action, then push the final state with `isLoading: false`. Adding a boolean field to state is a non-breaking, backwards-compatible change, so this can be introduced in a minor release when the transport supports it. Adding it prematurely (when it's always `false`) would train consumers to ignore it.

### Removed `facetId` from state

**Headless:** Each facet state carries a `facetId` field.

**Thermidor schema:** The component's `componentId` (from the base component schema) serves this purpose.

**Why:** Avoids redundant identification. The base component contract already provides a stable identifier for every component instance.

### Added `hasActiveValues` (regular, numeric, date only)

**Headless:** Also exposes this.

**Thermidor schema:** Present on regular, numeric, and date facets. Absent on category (where `selected !== null` is the equivalent check).

**Why:** It's a useful derived flag the backend can provide cheaply, enabling "clear filters" affordances without the consumer scanning all values.

### Added `customRange` state field (numeric, date)

**Headless:** The custom range is mixed into the `values` array or tracked implicitly.

**Thermidor schema:** A separate required nullable `customRange: { start, end, numberOfResults } | null` field on the state, alongside the `values` array.

**Why:** Custom ranges and listed ranges are mutually exclusive and serve different UI purposes (manual input vs. checkboxes). Keeping them separate makes the mutual exclusivity visible in state structure and lets the consumer populate the input field directly from `customRange` without scanning `values`.

### Category facet: flat values structure instead of recursive tree

**Headless:** Category values are a recursive tree (`children: CategoryFacetValue[]`), with `isLeafValue`, `moreValuesAvailable`, and selection state on each node.

**Thermidor schema:** A flat `values` object with three arrays:

- `ancestry: CategoryFacetValue[]` (empty when no selection)
- `selected: CategoryFacetValue | null`
- `children: CategoryFacetValue[]` (top-level categories when no selection, children of the selected category otherwise)

Each `CategoryFacetValue` is just `{ path: string[], value: string, numberOfResults: integer }`.

**Why:** The recursive tree is hard to render. Every category facet UI is visually three sections (breadcrumb, current selection, next-level options). The flat structure maps 1:1 to those sections with zero tree traversal. Selection state is structural (position determines it) rather than a field, eliminating the `idle`/`selected`/`excluded` enum and recursive rendering logic.

### Category facet search results reuse `CategoryFacetValue`

**Headless:** Category search results are a separate type with `displayValue`, `rawValue`, `count`, `path`.

**Thermidor schema:** Facet search results are the same `CategoryFacetValue` shape (`{ path, value, numberOfResults }`).

**Why:** The backend returns what's needed to render and to act. A search result needs a display label (`value`), a result count (`numberOfResults`), and a path to pass to `selectPath`. That's exactly `CategoryFacetValue`. No reason for a separate type.

### Regular facet search results: aligned field names

**Headless:** `{ displayValue, rawValue, count }`.

**Thermidor schema:** `{ value, numberOfResults }`.

**Why:** The `displayValue`/`rawValue` distinction is unnecessary when the backend always returns what should be rendered. One `value` field serves both display and action identification. `count` → `numberOfResults` for consistency with all other value models.

Note that, unlike the category facet (where search results reuse the same `CategoryFacetValue` model as the facet's values), the regular facet's search results are a _separate_ model from `RegularFacetValue`. A regular facet value carries a `state` (`idle`/`selected`/`excluded`), but a search result never needs one: facet search only ever returns idle (unselected) values, so a `state` field would always be `idle` and is omitted. The result is a model with the same field names as `RegularFacetValue` minus `state`. Category values, by contrast, have no `state` field to begin with (selection is structural), so there was nothing to strip and the models could be shared outright.

## Action changes

### Simplified toggle payloads (value-identifying only)

**Headless:** `toggleSelect(selection)` and `toggleExclude(selection)` receive the entire value request object.

**Thermidor schema:** Payloads carry only the identifying fields:

- Regular: `{ value: string }`
- Numeric: `{ start, end, endInclusive }` (numbers)
- Date: `{ start, end, endInclusive }` (strings)
- Category: replaced by `selectPath({ path: string[] })`

**Why:** The backend can look up the full value by its identifier. Sending the whole object is redundant (the backend already has it) and couples the action payload to the state shape.

### `toggleExclude` is regular-facet only

**Headless:** Wires up `toggleExclude` on regular, numeric, and date (though there's a TODO acknowledging this is rough).

**Thermidor schema:** Only the regular facet has `toggleExclude`. Numeric and date facets use `SelectableFacetValueState` (`idle | selected` only).

**Why:** The backend does not support exclusion for numeric, date, or category facets. Modeling unsupported actions would let consumers dispatch actions the backend silently ignores, hiding contract violations.

### `toggleSingleSelect` / `toggleSingleExclude` (single-select facets)

**Headless:** Both are defined on the core commerce facet. Category and location omit `toggleSingleSelect`; category, location, numeric, and date omit `toggleSingleExclude` in various combinations.

**Thermidor schema:**

- `toggleSingleSelect` is available on regular, numeric, and date facets (payload mirrors `toggleSelect`: `{ value }` for regular, `{ start, end }` for numeric/date). It selects a value while deselecting all others.
- `toggleSingleExclude` is available on the regular facet only (payload `{ value }`).
- Category has neither: it is inherently single-select through `selectPath` navigation.

**Why:** Single-select facets (radio-button-style UIs where picking a value replaces the previous selection, rather than checkbox-style multi-select) are a common pattern. Without a dedicated action, a consumer would have to emulate "select this and deselect everything else" by dispatching a deselect-all followed by a select — two round-trips and a flash of intermediate state. `toggleSingleSelect` expresses the intent in one action. `toggleSingleExclude` follows the same exclusion-is-regular-only rule as `toggleExclude`, since the backend supports exclusion only for regular facets.

### No dedicated `selectSearchResult` / `excludeSearchResult` actions

**Headless:** `facetSearch.select(result)` and `facetSearch.exclude(result)` are separate methods.

**Thermidor schema:** Consumers call `toggleSelect` / `toggleExclude` with the search result's identifying value.

**Why:** A facet search result identifies the same underlying value as a list value. The payload is the same (`{ value }` for regular, `{ path }` for category). Selecting a search result is therefore just `toggleSelect` with that value.

The "select and clear search" convenience that headless's `facetSearch.select` bundles is handled by the backend: toggling any facet value should always clear the facet search as a side effect. That way there's no need for the consumer to sequence two actions, and no need for dedicated search-result actions.

This assumes toggling always clears search. If we ever decide that toggling a search result should _not_ clear the search (or that the two behaviors should be independently controllable), then dedicated `selectSearchResult` / `excludeSearchResult` actions would be the right way to distinguish "toggle this value and clear search" from "toggle this value and keep the search open." For now, the simpler always-clear behavior keeps the action surface minimal.

### `setRanges` replaced by `applyCustomRange` (singular)

**Headless:** `setRanges(ranges)` accepts an array of ranges.

**Thermidor schema:** `applyCustomRange({ start, end })` applies a single custom range.

**Why:** The real use case is one user-entered range. Applying a custom range clears selected listed ranges (mutually exclusive). The name "setRanges" (plural) was misleading and the array payload over-permitted. A single range with a clear action name communicates the intent and constraint.

### Category facet: `selectPath` + `clearSelectedPath` instead of `toggleSelect`

**Headless:** `toggleSelect(value)` on a hierarchical value.

**Thermidor schema:** `selectPath({ path })` navigates to a category; `clearSelectedPath()` returns to root.

**Why:** Category facets are single-select, drill-down navigation. "Toggle" implies selecting/deselecting the same value, which is misleading for hierarchical navigation. `selectPath` describes intent (navigate here) and `clearSelectedPath` is the explicit "go back to root" that headless achieves through `deselectAll`.

### Renamed `deselectAll` to `clearAllActiveValues`

**Headless:** `deselectAll()` clears selections and exclusions.

**Thermidor schema:** `clearAllActiveValues()` (on regular, numeric, date).

**Why:** "Deselect" implies it only affects selections, missing exclusions. "Clear all active values" (anything non-idle) is accurate about scope. Not present on category (where `clearSelectedPath` serves the same purpose for single-select navigation).

### Renamed `clearFacetSearch` to `clearSearch`

**Why:** The `search` action is already named without the "facet" prefix. `clearSearch` is consistent.

### Renamed `moreValuesAvailable` to `canShowMoreResults` (on facet search)

**Why:** Aligns with the naming pattern of state flags (`canShowMoreValues`, `canShowLessValues`) and pairs with the `showMoreSearchResults` action.

### Removed `endInclusive` from numeric/date values and payloads

**Headless:** Every range value and range request carries `endInclusive: boolean`.

**Thermidor schema:** Ranges are just `{ start, end }` (plus `numberOfResults` and `state` on values, or just `{ start, end }` on action payloads).

**Why:** `endInclusive` is an API-level detail that consumers almost never need to vary or display. The backend can apply a sensible default (typically `true`). Removing it simplifies the value model, the toggle payload, and the custom-range payload without losing any practical rendering or interaction capability. It can be added back if a real use case emerges.

## Value state type enforcement

**Headless:** All facets share one `FacetValueState` type with three values.

**Thermidor schema:**

- `FacetValueState` = `idle | selected | excluded` (regular facet only)
- `SelectableFacetValueState` = `idle | selected` (numeric, date)
- No value state field (category: position is state)

**Why:** Enforces at the schema level what each facet actually supports. A backend sending `excluded` on a numeric value fails validation, catching contract violations statically rather than at runtime.
