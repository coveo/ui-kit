# ADR-007 Annex: SSR Implementation Details

**Parent**: [ADR-007 Engine Snapshot API for SSR](./ADR-007-ssr-snapshot-api.md)

## 1. Proposed Public Types

```ts
export interface SearchInterfaceInitialParameters {
  query?: string;
  page?: number;
  pageSize?: number;
  facets?: Record<string, string[]>;
  sort?: string;
  pipeline?: string;
  constantQuery?: string;
}

export interface CommerceInterfaceInitialParameters {
  query?: string;
  page?: number;
  pageSize?: number;
  facets?: Record<string, string[]>;
  sort?: string;
}

/**
 * Opaque serialized snapshot of the engine state.
 * Do not inspect, modify, or depend on its internal format.
 */
export type SSRSnapshot = string & { readonly __brand: 'SSRSnapshot' };
```

## 2. Interface Builder Options

```ts
export interface BuildSearchInterfaceOptions {
  engine: Engine;
  id?: string;
  initialParameters?: SearchInterfaceInitialParameters;
}

export interface BuildCommerceInterfaceOptions {
  engine: Engine;
  id?: string;
  initialParameters?: CommerceInterfaceInitialParameters;
}

export interface ComposeInterfacesOptions<T extends InterfaceType> {
  interfaces: BaseInterface<T>[];
  id?: string;
  initialParameters?: { query?: string };
}
```

## 3. Standalone Functions

```ts
import { getSSRSnapshot, restoreSSRState } from '@coveo/thermidor';

function getSSRSnapshot(options: { engine: Engine }): SSRSnapshot;
function restoreSSRState(options: { engine: Engine; snapshot: SSRSnapshot }): void;
```

The engine class remains opaque — no public methods added.

## 4. How `initialParameters` Flows Through the System

```
buildSearchInterface({ engine, id: 'main-search', initialParameters: { query: 'laptops', page: 2 } })
│
├─ 1. Translates domain params → internal slice shape:
│     { 'main-search/searchBox': { query: 'laptops' },
│       'main-search/pagination': { page: 2, pageSize: 10 } }
│
├─ 2. Calls engine.storeHydrationSnapshot('main-search', translatedState)
│     (stores the full blob — optimistic, cheap)
│
└─ 3. Returns the interface (no controllers exist, no side effects; internal support slices may be adopted)
```

```
buildSearchBoxController({ interface: searchInterface })
│
├─ 4. Calls engine.adoptSlice(searchBoxSlice('main-search/searchBox'))
│
├─ 5. Engine sees snapshot for 'main-search', dispatches hydrateFromSnapshot
│
└─ 6. Slice reducer hydrates: query is now 'laptops'
       Controller's memoized selector reads it immediately.
       No setQuery() call needed. No suggestion side effects triggered.
```

## 5. Non-Adopted Slices Don't Hydrate

If the URL has `?q=laptops&page=2&f[brand]=Apple` but the developer only builds a search box controller:

- searchBox slice adopted → hydrates query ✓
- pagination slice never adopted → `page=2` stays inert in the snapshot map
- facets slice never adopted → `brand=Apple` stays inert

The request selector reads pagination/facets selectors, gets `initialParameters` defaults (page 1, no facets) because those slices were never injected.

This is the "non-adopted slices are safe no-ops" principle from ADR-003 working in both directions:
- **Forward**: Non-adopted slices produce safe defaults in request selectors
- **Reverse**: Non-adopted slices don't hydrate from snapshots

The snapshot storage is optimistic (accepts all recognized params). The slice adoption boundary enforces "load only what you use."

## 6. Implementation Sketches

### `getSSRSnapshot`

```ts
import { getFullEngine } from '@/src/core/interface/engine/engine.js';

export function getSSRSnapshot({ engine }: { engine: Engine }): SSRSnapshot {
  const fullEngine = getFullEngine(engine);
  const fullState = fullEngine.read((state) => state);

  const payload = JSON.stringify({ v: 1, state: fullState });
  return btoa(payload) as SSRSnapshot;
}
```

The snapshot is an opaque string encoding the entire engine state. The internal format (version tag, encoding, potential future compression) is an implementation detail — consumers pass it through without inspection.

### `restoreSSRState`

```ts
import { getFullEngine } from '@/src/core/interface/engine/engine.js';

export function restoreSSRState({ engine, snapshot }: { engine: Engine; snapshot: SSRSnapshot }): void {
  const fullEngine = getFullEngine(engine);
  const { state } = JSON.parse(atob(snapshot));

  // Distribute state by interface ID into per-interface hydration snapshots
  const byInterface = new Map<string, Record<string, unknown>>();

  for (const [key, value] of Object.entries(state)) {
    const separatorIndex = key.lastIndexOf('/');
    if (separatorIndex > 0) {
      const interfaceId = key.substring(0, separatorIndex);
      if (!byInterface.has(interfaceId)) {
        byInterface.set(interfaceId, {});
      }
      byInterface.get(interfaceId)![key] = value;
    }
  }

  for (const [interfaceId, content] of byInterface) {
    fullEngine.storeHydrationSnapshot(interfaceId, content);
  }
}
```

This decodes the opaque snapshot, distributes the engine-wide state into per-interface hydration entries internally. Each subsequent `adoptSlice` call (triggered by `buildSearchInterface` or controller construction) will find its matching hydration data and self-hydrate.

### `initialParameters` translation in interface builder

```ts
export function buildSearchInterface(options: BuildSearchInterfaceOptions): SearchInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  if (options.initialParameters) {
    const translated = translateSearchInitialParameters(interfaceId, options.initialParameters);
    fullEngine.storeHydrationSnapshot(interfaceId, translated);
  }

  fullEngine.adoptSlice(getOrCreateSearchParametersSlice(interfaceId));
  return new SearchInterface(fullEngine, interfaceId);
}

function translateSearchInitialParameters(
  interfaceId: string,
  params: SearchInterfaceInitialParameters
): Record<string, unknown> {
  const state: Record<string, unknown> = {};

  if (params.query !== undefined) {
    state[`${interfaceId}/searchBox`] = { query: params.query };
  }
  if (params.page !== undefined || params.pageSize !== undefined) {
    state[`${interfaceId}/pagination`] = {
      ...(params.page !== undefined && { page: params.page }),
      ...(params.pageSize !== undefined && { pageSize: params.pageSize }),
    };
  }
  if (params.facets !== undefined) {
    state[`${interfaceId}/facets`] = translateFacetParams(params.facets);
  }

  return state;
}
```

## 7. Full SSR Lifecycle — Server

```ts
import {
  Engine,
  buildSearchInterface,
  getSSRSnapshot,
  deserializeSearchParameters,
} from '@coveo/thermidor';

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const params = deserializeSearchParameters({ searchParams: url.searchParams });

  const engine = new Engine({
    configuration: { organizationId: 'myorg', accessToken: 'xxxx' },
    navigatorContextProvider: () => ({
      referrer: request.headers.get('referer') ?? '',
      userAgent: request.headers.get('user-agent') ?? '',
    }),
  });

  const searchInterface = buildSearchInterface({
    engine,
    id: 'main-search',
    initialParameters: params,
  });

  await searchInterface.executeInitialRequest();

  const snapshot = getSSRSnapshot({ engine });
  engine.dispose();

  return { snapshot };
}
```

## 8. Full SSR Lifecycle — Client

```ts
import {
  Engine,
  buildSearchInterface,
  buildSearchBoxController,
  buildResultListController,
  restoreSSRState,
} from '@coveo/thermidor';

export function hydrateSearch(snapshot: SSRSnapshot) {
  const engine = new Engine({
    configuration: { organizationId: 'myorg', accessToken: 'xxxx' },
  });

  restoreSSRState({ engine, snapshot });
  const searchInterface = buildSearchInterface({ engine, id: 'main-search' });
  const searchBox = buildSearchBoxController({ interface: searchInterface });
  const resultList = buildResultListController({ interface: searchInterface });

  // No flash. No re-fetch. Controllers reflect server state immediately.
  return { engine, searchBox, resultList };
}
```

## 9. Multi-Interface SSR

For pages combining multiple interfaces, a single snapshot captures everything:

```ts
// Server — product page with two recommendation carousels
import { Engine, buildCommerceRecommendationInterface, getSSRSnapshot } from '@coveo/thermidor';

const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });

const frequentlyBought = buildCommerceRecommendationInterface({
  engine,
  id: 'frequently-bought',
  slotId: 'frequently-bought-together',
});

const similarProducts = buildCommerceRecommendationInterface({
  engine,
  id: 'similar-products',
  slotId: 'similar-items',
});

await frequentlyBought.executeInitialRequest();
await similarProducts.executeInitialRequest();

const snapshot = getSSRSnapshot({ engine }); // captures all interfaces in one object
engine.dispose();

return { snapshot };
```

```ts
// Client — one restore, every interface self-hydrates by ID
import { Engine, buildCommerceRecommendationInterface, restoreSSRState } from '@coveo/thermidor';

const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
restoreSSRState({ engine, snapshot });

const frequentlyBought = buildCommerceRecommendationInterface({ engine, id: 'frequently-bought', slotId: 'frequently-bought-together' });
const similarProducts = buildCommerceRecommendationInterface({ engine, id: 'similar-products', slotId: 'similar-items' });
// Both recommendation carousels are hydrated. No routing logic needed.
```

The consumer passes a single snapshot object from server to client. Each interface self-serves its state by matching its `id` against the snapshot's keys through the `adoptSlice` pipeline. No per-interface snapshot routing required.

## 10. Initial Request Execution

### `executeInitialRequest()` on interfaces

Each interface (search, commerce, composed) exposes an `executeInitialRequest()` method that triggers the appropriate backend call based on the interface type and its seeded parameters.

```ts
interface SearchInterface {
  executeInitialRequest(): Promise<void>;
  // ...
}

interface CommerceInterface {
  executeInitialRequest(): Promise<void>;
  // ...
}
```

**Semantics:**
- Assembles the request from the interface's scoped slices (query, pagination, facets, sort, etc.)
- Calls the appropriate backend endpoint (search API for search interfaces, commerce API for commerce interfaces)
- Populates response state (results, facets, pagination metadata, etc.) into the interface's slices
- Can only be called **once** per interface instance. Subsequent calls are no-ops (returns immediately).
- Available on both server and client, but primarily designed for the server-side SSR flow

**Why interface-level (not controller-level):**
- The interface owns the request and knows its type — it calls the right endpoint without the consumer specifying it
- Works for all interface types uniformly: search pages, product listing pages, recommendation panels
- No need to instantiate a controller solely to trigger a fetch on the server (e.g., no `buildSearchBoxController` just to call `submit()`)
- Clear separation: controllers handle user interactions, interfaces handle data lifecycle

**Why once-only:**
- Prevents accidental double-fetches on the server
- Safe to call defensively in shared helpers without tracking whether it was already called
- Communicates intent: this is initialization, not a general-purpose "re-fetch"
- On the client, subsequent data fetching happens through controller actions (submit, paginate, etc.) — `executeInitialRequest` is not the mechanism for that

### Example: Product Listing Page (no search box)

```ts
// Server — PLP needs no search box or query, just category parameters
const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
const plp = buildCommerceInterface({
  engine,
  id: 'plp',
  initialParameters: { facets: { category: ['Electronics'] } },
});
await plp.executeInitialRequest(); // calls commerce API
const snapshot = getSSRSnapshot({ engine });
engine.dispose();
```

### Example: Search page

```ts
// Server — search page with query from URL
const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
const search = buildSearchInterface({
  engine,
  id: 'main-search',
  initialParameters: { query: 'laptops', page: 1 },
});
await search.executeInitialRequest(); // calls search API
const snapshot = getSSRSnapshot({ engine });
engine.dispose();
```

## 11. React Adapter DX Example

A `@coveo/thermidor-react` package would build on top of the core primitives. The only truly necessary addition is a `useController` hook wrapping `useSyncExternalStore`:

```ts
// thermidor-react/src/use-controller.ts
function useController<T extends Controller<any>>(controller: T) {
  const state = useSyncExternalStore(
    (cb) => controller.subscribe(cb),
    () => controller.state,
    () => controller.state
  );
  const { state: _, subscribe: __, ...rest } = controller;
  const methods = useMemo(() => mapBindMethods(rest, controller), [controller]);
  return { state, methods };
}
```

### Next.js App Router — Full SSR Example

```tsx
// app/search/page.tsx (Server Component)
import {
  Engine,
  buildSearchInterface,
  getSSRSnapshot,
  deserializeSearchParameters,
} from '@coveo/thermidor';

export default async function SearchPage({ searchParams }) {
  const params = deserializeSearchParameters({ searchParams });
  const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
  const searchInterface = buildSearchInterface({ engine, id: 'main-search', initialParameters: params });

  await searchInterface.executeInitialRequest();

  const snapshot = getSSRSnapshot({ engine });
  engine.dispose();

  return <SearchClientPage snapshot={snapshot} />;
}
```

```tsx
// app/search/client-page.tsx (Client Component)
'use client';
import { Engine, buildSearchInterface, buildSearchBoxController, buildResultListController, restoreSSRState } from '@coveo/thermidor';
import { useController } from '@coveo/thermidor-react';
import { useRef } from 'react';

export function SearchClientPage({ snapshot }: { snapshot: SSRSnapshot }) {
  const { searchBox, resultList } = useHydratedControllers(snapshot);

  return (
    <>
      <SearchBox controller={searchBox} />
      <ResultList controller={resultList} />
    </>
  );
}

function useHydratedControllers(snapshot: SSRSnapshot) {
  const ref = useRef<{ searchBox: SearchBoxController; resultList: ResultListController }>();
  if (!ref.current) {
    const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
    restoreSSRState({ engine, snapshot });
    const searchInterface = buildSearchInterface({ engine, id: 'main-search' });
    ref.current = {
      searchBox: buildSearchBoxController({ interface: searchInterface }),
      resultList: buildResultListController({ interface: searchInterface }),
    };
  }
  return ref.current;
}

function SearchBox({ controller }: { controller: SearchBoxController }) {
  const { state, methods } = useController(controller);
  return (
    <form onSubmit={(e) => { e.preventDefault(); methods.submit(); }}>
      <input value={state.query} onChange={(e) => methods.setQuery({ query: e.target.value })} />
    </form>
  );
}

function ResultList({ controller }: { controller: ResultListController }) {
  const { state } = useController(controller);
  return (
    <ul>
      {state.results.map((r) => <li key={r.uniqueId}>{r.title}</li>)}
    </ul>
  );
}
```

### What the React adapter provides vs. what thermidor core provides

| Concern | Owned by | Surface |
|---------|----------|---------|
| Parameter seeding (`initialParameters`) | Core | `buildSearchInterface({ initialParameters })` |
| Initial request execution | Core | `searchInterface.executeInitialRequest()` |
| Snapshot extraction | Core | `getSSRSnapshot({ engine })` |
| Snapshot restoration | Core | `restoreSSRState({ engine, snapshot })` |
| Reactive state in React | React adapter | `useController(controller)` |
| Context/Provider (optional) | React adapter | `ThermidorProvider` |
| Named hooks (optional sugar) | React adapter | `useSearchBox()`, `useResultList()` |

The core is framework-agnostic. The React adapter is thin — `useController` is ~10 lines. Everything else (providers, named hooks, definition helpers) is optional convenience.

## 12. Performance: Time-to-Interactive Comparison

### Current headless SSR

1. Server renders HTML (first paint) — dominated by API call latency
2. Client: React hydrates the DOM
3. Client: `hydrateStaticState()` called — **async**. Rebuilds engine, middleware, analytics, re-registers all controllers, dispatches state restoration actions
4. Promise resolves → controllers become live

Between steps 2 and 4, the UI is visible but interactions are dead or buffered. The gap depends on engine rebuild cost (middleware init, analytics bootstrap, etc.) — typically small but nonzero and async (at minimum one extra tick).

### Thermidor SSR

1. Server renders HTML (first paint) — same API call latency
2. Client: React hydrates the DOM
3. Client: on first render (synchronous):
   - `new Engine(config)` — sync (configureStore)
   - `restoreSSRState({ engine, snapshot })` — sync (decode + distribute into hydration map)
   - `buildSearchInterface({ engine, id })` — sync (adoptSlice + hydrate)
   - `buildSearchBoxController({ interface })` — sync (adopt slice, create selector)
4. Controllers are live immediately. No async step.

### Comparison
|-------|-----------------|-----------|
| First paint (HTML visible) | Same | Same |
| React hydration (DOM attached) | Same | Same |
| Controllers live | After async `hydrateStaticState()` resolves | Immediately on mount (sync) |
| TTI gap after hydration | Nonzero (async engine rebuild) | Zero |

### Why the difference exists

Current headless's `hydrateStaticState` reconstructs the full engine from scratch — middleware setup, analytics initialization, controller re-registration — some of which involves async operations.

Thermidor avoids this because:
- `restoreSSRState` decodes the snapshot and distributes it into per-interface hydration entries (sync decode + Map writes)
- `adoptSlice` is sync: inject reducer into `combineSlices`, dispatch `hydrateFromSnapshot`
- No middleware ceremony or analytics bootstrap during hydration
- The engine is fully operational immediately after construction

The result: **zero async gap between React hydration and controller interactivity.**

## 13. Generative Interfaces and SSR

Generative interfaces (`buildGenerativeInterface`) handle real-time conversational interactions. **SSR does not apply to the conversation itself.**

However, when a generative turn routes to a sub-interface (e.g., the agent surfaces search results), that routed interface is a standard `SearchInterface` or `CommerceInterface` and is fully SSR-able.

**Excluded from `initialParameters`/snapshot:**
- `buildGenerativeInterface` does NOT accept `initialParameters`
- Generative interface state is not meaningful in SSR snapshots
- Routed sub-interfaces are the SSR boundary for generative use cases

### SSR Example: Server-Rendering a Routed Sub-Interface

Scenario: a page needs to render products that were produced by a generative turn. The server has access to the turn's routed content (persisted in a session, database, or returned by a server-side API call).

```ts
// === Server ===
import { Engine, buildCommerceInterface, buildProductListController, getSSRSnapshot } from '@coveo/thermidor';

// 1. Obtain the turn's routed content (however it was persisted/produced)
const turnContent = await fetchTurnContent('abc123');
// turnContent = { 'routed-products/productList': { products: [...], totalCount: 42 }, ... }

// 2. Build the engine and restore the turn content as initial parameters
const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
const commerceInterface = buildCommerceInterface({ engine, id: 'routed-products', initialParameters: turnContent });

// 3. Build controllers — they hydrate from the restored parameters
const productList = buildProductListController({ interface: commerceInterface });
// productList.state.products is already populated — no submit() needed

// 4. Snapshot for client hydration
const snapshot = getSSRSnapshot({ engine });
engine.dispose();

return { snapshot };
```

```ts
// === Client ===
import { Engine, buildCommerceInterface, buildProductListController, buildGenerativeInterface, buildConverseController, restoreSSRState } from '@coveo/thermidor';

const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
restoreSSRState({ engine, snapshot });

// Restore routed sub-interface (products render immediately)
const commerceInterface = buildCommerceInterface({ engine, id: 'routed-products' });
const productList = buildProductListController({ interface: commerceInterface });

// Optionally, build the generative interface separately for the chat experience
const generativeInterface = buildGenerativeInterface({ engine });
const converse = buildConverseController({ interface: generativeInterface });
// Chat history loads client-side independently of the already-rendered products.
```

### Pragmatic Note

Today, SSR of generative routed sub-interfaces is a niche scenario. Conversations are typically ephemeral and session-bound — the primary SSR benefits (SEO, first-paint performance) rarely apply to chat interfaces directly.

However, the architecture keeps this door open for a potential **unified API** future where all queries route through a generative/conversational endpoint. In that model, a heuristic fast-paths non-ambiguous queries directly to results (no agent invoked, latency comparable to a REST endpoint), but the response still arrives as a routed sub-interface. In that world, SSR of routed sub-interfaces would be the *default* path — not a special case — because the first paint is always tied to the generative endpoint's output.

The snapshot mechanism supports this transparently: routed sub-interfaces are just search/commerce interfaces. No generative-specific SSR code is needed regardless of whether they were produced by a direct API call or by a conversational endpoint's heuristic fast-path.
