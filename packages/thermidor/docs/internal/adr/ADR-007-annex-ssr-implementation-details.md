# ADR-007 Annex: SSR Implementation Details

**Parent**: [ADR-007 Per-Interface Snapshot API for SSR](./ADR-007-ssr-snapshot-api.md)

## 1. Proposed Public Types

```ts
export interface SearchInterfaceInitialState {
  query?: string;
  page?: number;
  pageSize?: number;
  facets?: Record<string, string[]>;
  sort?: string;
  pipeline?: string;
  constantQuery?: string;
}

export interface CommerceInterfaceInitialState {
  query?: string;
  page?: number;
  pageSize?: number;
  facets?: Record<string, string[]>;
  sort?: string;
}

export interface InterfaceSnapshot {
  readonly interfaceId: string;
  readonly state: Record<string, unknown>;
  readonly version: number;
}
```

## 2. Interface Builder Options

```ts
export interface BuildSearchInterfaceOptions {
  engine: Engine;
  id?: string;
  initialState?: SearchInterfaceInitialState;
  fromSnapshot?: InterfaceSnapshot;
}

export interface BuildCommerceInterfaceOptions {
  engine: Engine;
  id?: string;
  initialState?: CommerceInterfaceInitialState;
  fromSnapshot?: InterfaceSnapshot;
}

export interface ComposeInterfacesOptions<T extends InterfaceType> {
  interfaces: BaseInterface<T>[];
  id?: string;
  initialState?: { query?: string };
  fromSnapshot?: InterfaceSnapshot;
}
```

## 3. Engine Methods

```ts
class Engine {
  getInterfaceSnapshot(iface: BaseInterface<any> | ComposedInterface<any>): InterfaceSnapshot;
  restoreInterfaceSnapshot(snapshot: InterfaceSnapshot): void;
}
```

## 4. How `initialState` Flows Through the System

```
buildSearchInterface({ engine, id: 'main-search', initialState: { query: 'laptops', page: 2 } })
│
├─ 1. Translates domain params → internal slice shape:
│     { 'main-search/searchBox': { query: 'laptops' },
│       'main-search/pagination': { page: 2, pageSize: 10 } }
│
├─ 2. Calls engine.storeHydrationSnapshot('main-search', translatedState)
│     (stores the full blob — optimistic, cheap)
│
└─ 3. Returns the interface (no slices adopted yet, no controllers exist, no side effects)
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

The request selector reads pagination/facets selectors, gets `initialState` defaults (page 1, no facets) because those slices were never injected.

This is the "non-adopted slices are safe no-ops" principle from ADR-003 working in both directions:
- **Forward**: Non-adopted slices produce safe defaults in request selectors
- **Reverse**: Non-adopted slices don't hydrate from snapshots

The snapshot storage is optimistic (accepts all recognized params). The slice adoption boundary enforces "load only what you use."

## 6. Implementation Sketches

### `getInterfaceSnapshot`

```ts
getInterfaceSnapshot(iface): InterfaceSnapshot {
  const { stateId } = getInterfaceInternals(iface);
  const fullState = this.#_getState();
  const scopedState: Record<string, unknown> = {};

  for (const key of Object.keys(fullState)) {
    if (key.startsWith(`${stateId}/`)) {
      scopedState[key] = fullState[key];
    }
  }

  return { interfaceId: stateId, state: scopedState, version: 1 };
}
```

### `restoreInterfaceSnapshot`

```ts
restoreInterfaceSnapshot(snapshot: InterfaceSnapshot): void {
  this.#storeHydrationSnapshot(snapshot.interfaceId, snapshot.state);
}
```

### `initialState` translation in interface builder

```ts
export function buildSearchInterface(options: BuildSearchInterfaceOptions): SearchInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.fromSnapshot?.interfaceId ?? options.id ?? generateId();

  if (options.fromSnapshot) {
    fullEngine.storeHydrationSnapshot(interfaceId, options.fromSnapshot.state);
  } else if (options.initialState) {
    const translated = translateSearchInitialState(interfaceId, options.initialState);
    fullEngine.storeHydrationSnapshot(interfaceId, translated);
  }

  fullEngine.adoptSlice(getOrCreateSearchParametersSlice(interfaceId));
  return new SearchInterface(fullEngine, interfaceId);
}

function translateSearchInitialState(
  interfaceId: string,
  params: SearchInterfaceInitialState
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
import { Engine, buildSearchInterface, buildSearchBoxController, buildResultListController } from '@coveo/thermidor';

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const params = deserializeSearchParameters(url.searchParams);

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
    initialState: params,
  });

  const searchBox = buildSearchBoxController({ interface: searchInterface });
  await searchBox.submit();

  const snapshot = engine.getInterfaceSnapshot(searchInterface);
  engine.dispose();

  return { snapshot };
}
```

## 8. Full SSR Lifecycle — Client

```ts
import { Engine, buildSearchInterface, buildSearchBoxController, buildResultListController } from '@coveo/thermidor';

export function hydrateSearch(snapshot: InterfaceSnapshot) {
  const engine = new Engine({
    configuration: { organizationId: 'myorg', accessToken: 'xxxx' },
  });

  const searchInterface = buildSearchInterface({ engine, fromSnapshot: snapshot });
  const searchBox = buildSearchBoxController({ interface: searchInterface });
  const resultList = buildResultListController({ interface: searchInterface });

  // No flash. No re-fetch. Controllers reflect server state immediately.
  return { engine, searchBox, resultList };
}
```

## 9. Composed Interface SSR

For pages combining multiple interfaces with shared features:

```ts
// Server
const search = buildSearchInterface({
  engine,
  id: 'search',
  initialState: { page: 2, facets: { brand: ['Apple'] } },
});

const commerce = buildCommerceInterface({
  engine,
  id: 'commerce',
  initialState: { facets: { category: ['Electronics'] } },
});

const composed = composeInterfaces({
  interfaces: [search, commerce],
  id: 'hybrid',
  initialState: { query: 'laptops' },
});

const searchBox = buildSearchBoxController({ interface: composed });
await searchBox.submit();

const searchSnapshot = engine.getInterfaceSnapshot(search);
const commerceSnapshot = engine.getInterfaceSnapshot(commerce);
const composedSnapshot = engine.getInterfaceSnapshot(composed);

return { searchSnapshot, commerceSnapshot, composedSnapshot };
```

```ts
// Client
const search = buildSearchInterface({ engine, fromSnapshot: searchSnapshot });
const commerce = buildCommerceInterface({ engine, fromSnapshot: commerceSnapshot });
const composed = composeInterfaces({ interfaces: [search, commerce], fromSnapshot: composedSnapshot });
```

The split reflects the architecture:
- **Shared features** (query) → `initialState` on the composed interface, scoped to the composed ID
- **Per-interface features** (pagination, facets) → `initialState` on sub-interfaces, scoped to their IDs

## 10. Explicit Execution vs. Automatic First-Search

### Approach A (Recommended): Explicit execution

The consumer calls `submit()` manually on the server.

**Why we favor this:**
- Predictable: no hidden network calls
- Composable: supports scenarios where the server pre-populates state without executing
- Debuggable: if something fails, the call site is obvious
- No unwanted side effects (e.g., query suggestions)
- Aligned with thermidor's imperative philosophy

### Approach B: Automatic execution via a helper

A higher-level helper could be provided in a framework adapter:

```ts
const snapshot = await prepareInterfaceSnapshot(searchInterface, {
  initialState: params,
  execute: (controllers) => controllers.searchBox.submit(),
});
```

**Why not at the core level:**
- Assumes the library knows which API call to execute
- Obscures control flow
- Can always be built as sugar on top of Approach A

## 11. React Adapter DX Example

A `@coveo/thermidor-react` package would build on top of the core primitives. The only truly necessary addition is a `useController` hook wrapping `useSyncExternalStore`:

```ts
// thermidor-react/src/use-controller.ts
function useController<T extends Controller<any>>(controller: T) {
  const state = useSyncExternalStore(
    (cb) => controller.subscribe(cb),
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
import { Engine, buildSearchInterface, buildSearchBoxController, buildResultListController, deserializeSearchParameters } from '@coveo/thermidor';

export default async function SearchPage({ searchParams }) {
  const params = deserializeSearchParameters(searchParams);
  const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
  const searchInterface = buildSearchInterface({ engine, id: 'main-search', initialState: params });
  const searchBox = buildSearchBoxController({ interface: searchInterface });

  await searchBox.submit();

  const snapshot = engine.getInterfaceSnapshot(searchInterface);
  engine.dispose();

  return <SearchClientPage snapshot={snapshot} />;
}
```

```tsx
// app/search/client-page.tsx (Client Component)
'use client';
import { Engine, buildSearchInterface, buildSearchBoxController, buildResultListController } from '@coveo/thermidor';
import { useController } from '@coveo/thermidor-react';
import { useRef } from 'react';

export function SearchClientPage({ snapshot }: { snapshot: InterfaceSnapshot }) {
  const { searchBox, resultList } = useHydratedControllers(snapshot);

  return (
    <>
      <SearchBox controller={searchBox} />
      <ResultList controller={resultList} />
    </>
  );
}

function useHydratedControllers(snapshot: InterfaceSnapshot) {
  const ref = useRef<{ searchBox: SearchBoxController; resultList: ResultListController }>();
  if (!ref.current) {
    const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
    const searchInterface = buildSearchInterface({ engine, fromSnapshot: snapshot });
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
| State seeding (`initialState`) | Core | `buildSearchInterface({ initialState })` |
| Request execution | Core | `searchBox.submit()` |
| Snapshot extraction | Core | `engine.getInterfaceSnapshot(iface)` |
| Snapshot restoration | Core | `engine.restoreInterfaceSnapshot(snapshot)` or `fromSnapshot` |
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
   - `buildSearchInterface({ engine, fromSnapshot: snapshot })` — sync (storeHydrationSnapshot + adoptSlice + hydrate)
   - `buildSearchBoxController({ interface })` — sync (adopt slice, create selector)
4. Controllers are live immediately. No async step.

### Comparison

| Phase | Current headless | Thermidor |
|-------|-----------------|-----------|
| First paint (HTML visible) | Same | Same |
| React hydration (DOM attached) | Same | Same |
| Controllers live | After async `hydrateStaticState()` resolves | Immediately on mount (sync) |
| TTI gap after hydration | Nonzero (async engine rebuild) | Zero |

### Why the difference exists

Current headless's `hydrateStaticState` reconstructs the full engine from scratch — middleware setup, analytics initialization, controller re-registration — some of which involves async operations.

Thermidor avoids this because:
- `restoreInterfaceSnapshot` / `fromSnapshot` is a single Map write (snapshot stored for lazy consumption)
- `adoptSlice` is sync: inject reducer into `combineSlices`, dispatch `hydrateFromSnapshot`
- No middleware ceremony or analytics bootstrap during hydration
- The engine is fully operational immediately after construction

The result: **zero async gap between React hydration and controller interactivity.**

## 13. Generative Interfaces and SSR

Generative interfaces (`buildGenerativeInterface`) handle real-time conversational interactions. **SSR does not apply to the conversation itself.**

However, when a generative turn routes to a sub-interface (e.g., the agent surfaces search results), that routed interface is a standard `SearchInterface` or `CommerceInterface` and is fully SSR-able.

**Excluded from `initialState`/snapshot:**
- `buildGenerativeInterface` does NOT accept `initialState`
- `getInterfaceSnapshot` on a generative interface is not meaningful
- Routed sub-interfaces are the SSR boundary for generative use cases

### SSR Example: Server-Rendering a Routed Sub-Interface

Scenario: a page needs to render products that were produced by a generative turn. The server has access to the turn's routed content (persisted in a session, database, or returned by a server-side API call).

```ts
// === Server ===
// 1. Obtain the turn's routed content (however it was persisted/produced)
const turnContent = await fetchTurnContent('abc123');
// turnContent = { products: [...], totalCount: 42, facets: [...] }

// 2. Build the routed sub-interface and restore its state from the turn content
const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });
const commerceInterface = buildCommerceInterface({ engine, id: 'routed-products' });

// Use restoreInterfaceSnapshot with a manually constructed snapshot
// (the turn content IS the state — no API call needed)
engine.restoreInterfaceSnapshot({
  interfaceId: 'routed-products',
  state: turnContent,
  version: 1,
});

// 3. Build controllers — they hydrate from the restored snapshot
const productList = buildProductListController({ interface: commerceInterface });
// productList.state.products is already populated — no submit() needed

// 4. Snapshot for client hydration
const snapshot = engine.getInterfaceSnapshot(commerceInterface);
engine.dispose();

return { snapshot };
```

```ts
// === Client ===
const engine = new Engine({ configuration: { organizationId: '...', accessToken: '...' } });

// Restore routed sub-interface (products render immediately)
const commerceInterface = buildCommerceInterface({ engine, fromSnapshot: snapshot });
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
