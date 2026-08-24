# Surface Type: Routing and Layout Strategy

## Problem Statement

In the current implementation, the backend sends an `ACTIVITY_SNAPSHOT` of type `a2ui-surface` containing a monolithic root component (e.g., `"component": "ProductSearchSurface"`). Thermidor uses this root component name as a discriminant to:

1. Determine that the surface requires a **routed interface** (triggering navigation to the search results page)
2. Hydrate the appropriate sub-interface (commerce search vs. product listing)

If we adopt Option B from ADR-006 (removing controllers from the schema and decomposing monolithic components into smaller, specialized ones), we lose this single discriminant. The question becomes: **how does the renderer know which page/layout to display, and where to place each component?**

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

In `unified-surface-processor.ts`, the function `getStatefulCommerceRootKind` checks:

```typescript
const kind = components?.find((c) => c.id === 'root')?.component;
return kind === 'ProductSearchSurface' || kind === 'ProductListingSurface' ? kind : undefined;
```

This determines that the surface is a commerce search interface and triggers `setRoutedInterface`, which causes `use-navigation.ts` to navigate to `SearchResultsPage`.

## Proposed Solution: `surfaceType` as Explicit Discriminant

### Schema Change

Add a `surfaceType` field at the `createSurface` level:

```json
{
  "createSurface": {
    "surfaceId": "ui-d1f17fa6",
    "surfaceType": "commerceSearch",
    "catalogId": "https://agent-gateway.coveo.com/a2ui/commerce/v1/catalog.json",
    "components": [
      {"componentType": "searchBox", "state": {"query": "wetsuits"}},
      {"componentType": "productList", "state": {"products": [...]}},
      {"componentType": "pagination", "state": {"page": 0, "pageSize": 20, "totalEntries": 52}},
      {"componentType": "sort", "state": {"appliedSort": {...}, "availableSorts": [...]}},
      {"componentType": "facetList", "state": {"facets": []}}
    ]
  }
}
```

### Responsibilities Separation

| Concern                        | Provided by                                  | Consumed by                                    |
| ------------------------------ | -------------------------------------------- | ---------------------------------------------- |
| **What data exists**           | `components[].state`                         | Individual component renderers                 |
| **What actions are available** | `components[].actions`                       | Individual component renderers                 |
| **Which page/layout to show**  | `surfaceType`                                | Navigation layer (e.g., `use-navigation.ts`)   |
| **Where each component goes**  | Renderer's layout template per `surfaceType` | Layout component (e.g., `SearchResultsLayout`) |

### Key Insight

The `surfaceType` solves two distinct problems simultaneously:

1. **Routing/Navigation**: Thermidor uses it to determine whether to set a `routedInterface` and navigate away from the conversation page
2. **Layout Selection**: The renderer uses it to select the appropriate layout template that controls component placement

## Renderer Implementation

### Layout Templates by Surface Type

The renderer maintains a mapping of `surfaceType` to layout templates. Each layout template knows exactly where to place each `componentType`:

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

### Example: Commerce Search Layout

```tsx
function CommerceSearchLayout({components}: {components: Component[]}) {
  const searchBox = components.find((c) => c.componentType === 'searchBox');
  const productList = components.find((c) => c.componentType === 'productList');
  const pagination = components.find((c) => c.componentType === 'pagination');
  const facets = components.find((c) => c.componentType === 'facetList');
  const sort = components.find((c) => c.componentType === 'sort');

  return (
    <div className="search-layout">
      <header>
        {searchBox && <SearchBox state={searchBox.state} actions={searchBox.actions} />}
      </header>
      <aside>{facets && <FacetList state={facets.state} actions={facets.actions} />}</aside>
      <main>
        <div className="toolbar">{sort && <Sort state={sort.state} actions={sort.actions} />}</div>
        {productList && <ProductList state={productList.state} actions={productList.actions} />}
        {pagination && <Pagination state={pagination.state} actions={pagination.actions} />}
      </main>
    </div>
  );
}
```

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

### `unified-surface-processor.ts`

The current `getStatefulCommerceRootKind` check on `root.component` would be replaced by a check on `createSurface.surfaceType`:

```typescript
// Before
const kind = components?.find(c => c.id === 'root')?.component;
if (kind === 'ProductSearchSurface' || kind === 'ProductListingSurface') { ... }

// After
if (createSurface.surfaceType === 'commerceSearch' || createSurface.surfaceType === 'productListing') { ... }
```

### `use-navigation.ts` (demo app)

No change needed at the navigation hook level. The `routedInterface` mechanism stays the same — it's just triggered by a different internal check in thermidor.

### `AppShell.tsx` (demo app)

The `SearchResultsPage` component would receive the individual components instead of a monolithic interface, and apply its own layout logic.

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
