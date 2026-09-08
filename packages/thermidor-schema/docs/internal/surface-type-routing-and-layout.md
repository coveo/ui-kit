# Surface Type: Routing and Layout Strategy

## Problem Statement

Today, the backend sends an `ACTIVITY_SNAPSHOT` of type `a2ui-surface` containing a monolithic root component (e.g., `"component": "ProductSearchSurface"`). Thermidor uses this root component name as a discriminant to:

1. Determine that the surface requires a **routed interface** (triggering navigation to the search results page)
2. Hydrate the appropriate sub-interface (commerce search vs. product listing)

Adopting Option B from ADR-006 (removing controllers from the schema and decomposing monolithic components into smaller, specialized ones) removes that single discriminant. This raises the question: **how would the renderer know which page/layout to display, and where to place each component?**

Removing the monolithic discriminant also invites a second, related question: with the components decomposed, is the `routedInterface` + sub-interface hydration machinery still needed at all? This document proposes an explicit `surfaceType` field as the discriminant, and argues that in the decomposed model the hydration step disappears entirely.

## Current Behavior (Pre-Option B)

The backend sends:

```json
{
  "type": "ACTIVITY_SNAPSHOT",
  "activityType": "a2ui-surface",
  "content": {
    "messages": [{
      "createSurface": {
        "surfaceId": "ui-d1f17fa6",
        "catalogId": "https://agent-gateway.coveo.com/a2ui/commerce/v1/catalog.json",
        "components": [
          {"id": "root", "component": "ProductSearchSurface"}
        ],
        "dataModel": {
          "products": [...],
          "query": "wetsuits",
          "pagination": {...},
          "sort": {...},
          "facets": [...]
        }
      }
    }]
  }
}
```

Thermidor inspects the root component name (via a helper like `getStatefulCommerceRootKind`):

```typescript
const kind = components?.find((c) => c.id === 'root')?.component;
return kind === 'ProductSearchSurface' || kind === 'ProductListingSurface' ? kind : undefined;
```

When the root component is recognized, this determines that the surface is a commerce search interface and triggers `setRoutedInterface`, which hydrates a sub-interface and causes `use-navigation.ts` to navigate to `SearchResultsPage`. This is the behavior we are proposing to change.

## Proposed Solution: surfaceType as Explicit Discriminant

We would add a `surfaceType` field at the `createSurface` level, alongside decomposed components. Each component would carry a `componentType` (and each component instance would be addressed by a `componentId`), with per-component `state`/`actions` forming the contract.

```json
{
  "createSurface": {
    "surfaceId": "ui-d1f17fa6",
    "surfaceType": "commerceSearch",
    "catalogId": "https://agent-gateway.coveo.com/a2ui/commerce/v1/catalog.json",
    "components": [
      {"props": {"componentId": "search-box-1", "componentType": "searchBox"},
       "state": {"query": "wetsuits"}},
      {"props": {"componentId": "product-list-1", "componentType": "productList"},
       "state": {"products": [...]}},
      {"props": {"componentId": "pagination-1", "componentType": "pagination"},
       "state": {"page": 0, "pageSize": 24, "totalEntries": 137, "totalPages": 6}},
      {"props": {"componentId": "sort-1", "componentType": "sort"},
       "state": {"appliedSort": {...}, "availableSorts": [...]}}
    ]
  }
}
```

> **Note:** The inline `state` above is shown for readability. The concrete delivery mechanism for per-component state — inline on each component versus a separate per-turn state snapshot keyed by `componentId` — is an implementation detail to be settled during implementation. What matters for this proposal is that each component's state is server-owned and addressed by `componentId`.

### Eliminating routedInterface and sub-interface hydration

The reviewer pointed out that the monolithic root component currently serves two responsibilities — determining that the surface needs a routed interface, and hydrating the appropriate sub-interface — and that the decomposed model would need neither.

In the decomposed model:

- We would keep a **single** `GenerativeUnifiedInterface` for the whole session, across both the conversation and the commerce-search surface. We would no longer create per-use-case sub-interfaces.
- Because there are no sub-interfaces, there would be nothing to hydrate. The `routedInterface` concept — including `setRoutedInterface`, the registry of interface instances, and the hydration of `commerceSearch` vs. `productListing` sub-interfaces — would no longer be needed for decomposed surfaces.
- The individual `build*Controller` functions (`buildProductListController`, `buildPaginationController`, `buildSortController`, and the like) would no longer be used in the decomposed path. Instead, each decomposed component would read its own server-owned slice of state from the unified interface — addressed by `componentId` — through a generic remote-controller mechanism, and would dispatch actions back through the same unified interface.
- Navigation to the search-results layout would be driven directly by observing `surfaceType` on the incoming surface, rather than by the presence of a hydrated `routedInterface`.

The net effect is a simplification: one interface, one state store, no hydration step, and no registry of non-serializable interface instances.

### Responsibilities Separation

| Concern                       | Provided by                                              | Consumed by                                     |
| ----------------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| **What data exists**          | Per-component server-owned state, keyed by `componentId` | Generic remote controller per component         |
| **Which components exist**    | `createSurface.components`                               | Renderer's layout                               |
| **Which page/layout to show** | `surfaceType`                                            | Navigation / layout layer (`SearchResultsPage`) |
| **Where each component goes** | Renderer's layout for the surface type                   | The layout                                      |

Navigation is driven by observing `surfaceType`; there is no `routedInterface` acting as the layout or navigation driver.

### Key Insight

The `surfaceType` would solve two distinct problems simultaneously:

1. **Routing/Navigation**: Thermidor would use it to decide whether to navigate away from the conversation page to the search results layout.
2. **Layout Selection**: The renderer would use it to select the appropriate layout that controls component placement.

Notably, `surfaceType` would **not** drive any interface hydration — that step disappears entirely in the decomposed model.

## Renderer Implementation

### Layout Templates by Surface Type

The renderer would maintain a mapping of `surfaceType` to layout templates. Each layout template knows exactly where to place each `componentType`:

```tsx
function renderSurface(surface: Surface) {
  switch (surface.surfaceType) {
    case 'commerceSearch':
      return <CommerceSearchLayout components={surface.components} />;
    case 'productListing':
      return <ProductListingLayout components={surface.components} />;
    case 'converse':
      return <ConversationLayout components={surface.components} />;
    default:
      return <GenericLayout components={surface.components} />;
  }
}
```

For a `commerceSearch` surface, the layout would look up components by `componentType` and place them into spatial slots:

```tsx
function CommerceSearchLayout({components}) {
  const searchBox = components.find((c) => c.componentType === 'searchBox');
  const facets = components.find((c) => c.componentType === 'facetList');
  const sort = components.find((c) => c.componentType === 'sort');
  const productList = components.find((c) => c.componentType === 'productList');
  const pagination = components.find((c) => c.componentType === 'pagination');

  return (
    <div className="commerce-search">
      <header>{searchBox && <Component {...searchBox} />}</header>
      <aside>{facets && <Component {...facets} />}</aside>
      <main>
        {sort && <Component {...sort} />}
        {productList && <Component {...productList} />}
        {pagination && <Component {...pagination} />}
      </main>
    </div>
  );
}
```

Components that are absent from the surface would simply render as empty slots without error.

### Why Not Describe Layout in the Schema?

An alternative would be for the backend to send layout information (slots, grid positions, etc.):

```json
{
  "layout": {
    "header": ["searchBox"],
    "sidebar": ["facetList"],
    "main": ["sort", "productList", "pagination"]
  }
}
```

This is **not recommended** because:

- It couples the backend to rendering decisions (violation of separation of concerns)
- The number of surface types is finite and known ahead of time
- Layout is a presentation concern that belongs to the renderer
- It adds schema complexity without meaningful flexibility gain

## Impact on Thermidor Internals

### Routing

A check on `createSurface.surfaceType` would replace the root-component-name check that `getStatefulCommerceRootKind` performs today. When `surfaceType` indicates a routed commerce surface (e.g., `commerceSearch` or `productListing`), Thermidor would signal navigation **without** hydrating a sub-interface — no `routedInterface`, and no `build*Controller`.

Conceptually, before and after:

- **Before:** inspect the root component name → `setRoutedInterface` (hydrates a sub-interface) → `use-navigation.ts` navigates.
- **After:** observe `surfaceType` → signal navigation directly → no sub-interface, no hydration.

The sub-interface hydration path would be removed. The single `GenerativeUnifiedInterface` would remain the only interface for the session.

### Demo App

- `use-navigation.ts` would navigate based on `surfaceType` instead of the presence of a hydrated routed interface.
- `SearchResultsPage` would render the decomposed components through the layout for the surface type, rather than driving `buildProductListController`, `buildPaginationController`, or `buildSortController`. Each component would read its state from the unified interface via the generic remote-controller mechanism.

## Known Surface Types

| `surfaceType`    | Navigation                | Layout                             | Use Case                   |
| ---------------- | ------------------------- | ---------------------------------- | -------------------------- |
| `commerceSearch` | Route to search page      | Product grid + facets + pagination | User searched for products |
| `productListing` | Route to search page      | Product grid + facets (no query)   | Category/listing page      |
| `converse`       | Stay on conversation page | Message thread + input             | Conversational response    |

## State Reusability Across Components

### The Concern

When decomposing a monolithic component (`ProductSearchSurface`) into granular sub-components, multiple components may depend on logically related state. For example, toggling a facet in `facetList` affects the products in `productList` and resets `pagination`. This raises the question: do we need a "shared state slice" concept in the schema to express this coupling?

### Why It Doesn't Apply to the Conversational Use Case

For the converse surface, components are self-contained — their state is fully owned and delivered by the backend per turn. There is no scenario where two components in a converse surface need to share or synchronize a state slice. The concern is specific to the monolith decomposition of commerce surfaces.

### Backend-Stateful Model: Natural Coherence Without Client-Side Coupling

With a backend-stateful model where the backend is the source of truth, cross-component state coherence is handled naturally:

1. User interacts with component A (e.g., toggles a facet)
2. Frontend dispatches an action to the backend
3. Backend recalculates its global state
4. Backend pushes updated state for **all affected components** via the stream
5. Frontend receives independent state updates for each component and re-renders

From the frontend's perspective, each component is independent — it receives its own state and doesn't need to know about siblings. The backend ensures coherence. No shared slice resolution needed client-side.

If two components need the same data (e.g., both `productList` and `productCarousel` display the same products), the backend simply returns the same values in each component's state independently. There is no need for a shared reference or slice — the duplication is intentional and the components remain decoupled. The backend owns the truth; the frontend just renders what it receives.

### Latency and Optimistic UI: Not a Schema Concern

This model requires a round-trip to the backend for every interaction. However, this is fundamentally the same pattern as the current Headless/Atomic model — a facet toggle today already sends a request to the Search API and waits for filtered results. The product list _cannot_ update without the backend response regardless of architecture (filtered products, updated counts, and pagination are computed server-side).

One might argue that optimistic UI (updating locally before the backend responds) would motivate a shared state slice concept. But even with optimistic UI, the value is limited:

- Optimistic updates can only provide immediate feedback on the _control itself_ (e.g., visually checking a facet checkbox)
- The dependent components (product list, pagination, counts) still require the backend response — we cannot "optimistically" display filtered products we don't have
- With or without optimistic UI, the product list shows a loading state while waiting for results
- The gain is marginal (checkbox feedback latency) — not a fundamental architecture difference

A shared state slice would express "these components are coupled and should update together", but since the dependent components _cannot_ update without server data regardless, the shared slice adds coordination overhead without removing the loading state.

### The Real Concern: Network Path Latency

The meaningful question for the monolith decomposition is not about shared state slices or optimistic UI. It's about whether the agent gateway network path introduces unacceptable overhead for bidirectional interactions compared to a direct API call.

If the latency is comparable to today's Search API calls (~200ms), a loading/shimmer on the product list is the standard commerce pattern and works fine. If the agent gateway adds significant overhead (500ms+), the UX degrades — but this is a transport/infrastructure concern, not a schema concern, and optimistic UI would not solve it.

### Recommendation: Separate ADR

The monolith decomposition should be addressed in its own ADR, covering:

- How to split `ProductSearchSurface` / `ProductListingSurface` into sub-components
- `surfaceType` as a routing/layout discriminant (this document)
- Partial state updates and delta protocol
- Network path latency: is the agent gateway overhead acceptable for high-frequency bidirectional interactions?
- Whether optimistic UI provides meaningful UX gains given that dependent components require server data regardless
- Reusability of state contracts across components (via `$ref` in JSON Schema vs. runtime entity)

This keeps ADR-006 focused on its core question (controllers yes/no in the schema), which is orthogonal to component granularity.

## Open Questions

1. Should `surfaceType` be an enum validated by the schema, or a free-form string with conventions?
2. Should there be a fallback behavior when `surfaceType` is unknown (graceful degradation)?
3. Does `surfaceType` fully replace the need for `catalogId` as a discriminant, or do they serve complementary purposes?
4. Is the agent gateway network path latency acceptable for high-frequency bidirectional interactions (facets, sort, pagination), or does the monolith decomposition require a direct API bypass for these?
5. Does dropping `routedInterface` / sub-interface hydration in favor of the single `GenerativeUnifiedInterface` have any downside for the legacy (non-decomposed) surfaces still in flight — and if both models must coexist during migration, how do they coexist cleanly?
