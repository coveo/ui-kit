---
related:
  - ./ADR-020-cached-and-concurrent-actions.md
---

# ADR-020 annex: instant products in code

This annex shows the effect of [ADR-020](./ADR-020-cached-and-concurrent-actions.md), first inside
the session, then for an application implementing instant products, with demo-schema-react as the
example. The snippets are trimmed for reading and show the intended API, not a final
implementation. Where they and the ADR disagree, the ADR decides.

## 1. Reading the announcements

Next to `turn-opening.ts`, a module reads the two new keys from the session's activity log. The
latest announcement for a surface wins.

```ts
// session/announced-actions.ts
export interface CachePolicy {
  ttlMs: number;
}

export function concurrentActions(
  activities: readonly Activity[],
  surfaceId: string
): ReadonlySet<string> {
  let names: readonly string[] | undefined;
  for (const activity of activities) {
    names = readNames(activity.metadata?.['concurrentActions'], surfaceId) ?? names;
  }
  return new Set(names);
}

export function cachePolicy(
  activities: readonly Activity[],
  surfaceId: string,
  name: string
): CachePolicy | undefined {
  let policies: Record<string, CachePolicy> | undefined;
  for (const activity of activities) {
    policies = readPolicies(activity.metadata?.['cachedActions'], surfaceId) ?? policies;
  }
  return policies?.[name];
}
```

## 2. The cache

A small per-session map, keyed by source and payload, bounded and never serialized.

```ts
// session/action-cache.ts
const MAX_ENTRIES = 100;

export interface ActionCache {
  get(key: string): readonly unknown[] | undefined;
  set(key: string, messages: readonly unknown[], ttlMs: number): void;
}

export function cacheKey(source: ActionSource, payload: unknown): string {
  return JSON.stringify([
    source.surfaceId,
    source.sourceComponentId,
    source.name,
    stableStringify(payload),
  ]);
}

export function createActionCache(now: () => number = Date.now): ActionCache {
  const entries = new Map<string, {messages: readonly unknown[]; expiresAt: number}>();
  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry || entry.expiresAt <= now()) {
        entries.delete(key);
        return undefined;
      }
      entries.delete(key); // re-inserted as the most recently used
      entries.set(key, entry);
      return entry.messages;
    },
    set(key, messages, ttlMs) {
      entries.delete(key);
      entries.set(key, {messages, expiresAt: now() + ttlMs});
      if (entries.size > MAX_ENTRIES) {
        entries.delete(entries.keys().next().value!);
      }
    },
  };
}
```

## 3. Routing a dispatch

`issueAction` checks the announcements before the single request. Nothing changes for an action
the producer did not announce as concurrent, even if it announced it as cached.

```ts
function issueAction(recovered: RecoveredAction): Promise<void> {
  const activities = sessionActivities(store.getState());
  if (!concurrentActions(activities, recovered.surfaceId).has(recovered.name)) {
    return issueOrdinaryAction(recovered); // today's path: validation, turn opening, sendRequest
  }
  // ...payload validation, as today...

  const policy = cachePolicy(activities, recovered.surfaceId, recovered.name);
  const key = cacheKey(recovered, recovered.context);
  lanes.claim(recovered, key);
  const cached = policy && actionCache.get(key);
  if (cached) {
    applyUnrecorded(cached);
    return Promise.resolve();
  }
  return lanes.send(recovered, key, Boolean(policy), async (signal) => {
    const isLatest = () => lanes.isLatest(recovered, key);
    const writes = await streamUnrecorded(
      buildActionRequest(toA2uiAction(recovered)),
      signal,
      isLatest
    );
    if (writes && policy) {
      actionCache.set(key, writes, policy.ttlMs);
    }
  });
}
```

## 4. The concurrent lane

Each `(surfaceId, sourceComponentId, name)` remembers the key of its latest dispatch. A newer
dispatch aborts an uncached request in flight; a cached miss runs to the end, and a dispatch with
its key joins it. `session.request` is never touched.

```ts
function createLanes() {
  const latest = new Map<string, string>();
  const uncached = new Map<string, AbortController>();
  const misses = new Map<string, Promise<void>>();
  const laneKey = (source: ActionSource) =>
    JSON.stringify([source.surfaceId, source.sourceComponentId, source.name]);

  return {
    claim(source: ActionSource, key: string) {
      latest.set(laneKey(source), key);
      uncached.get(laneKey(source))?.abort();
      uncached.delete(laneKey(source));
    },
    isLatest: (source: ActionSource, key: string) => latest.get(laneKey(source)) === key,
    send(
      source: ActionSource,
      key: string,
      cached: boolean,
      run: (signal: AbortSignal) => Promise<void>
    ) {
      if (!cached) {
        const controller = new AbortController();
        uncached.set(laneKey(source), controller);
        return quietly(source, run(controller.signal), controller.signal);
      }
      let miss = misses.get(key);
      if (!miss) {
        miss = quietly(source, run(new AbortController().signal)).finally(() => misses.delete(key));
        misses.set(key, miss);
      }
      return miss;
    },
  };
}

async function quietly(source: ActionSource, work: Promise<void>, signal?: AbortSignal) {
  try {
    await work;
  } catch (error) {
    if (!signal?.aborted) {
      devWarn(`dispatchAction: ${source.name} failed: ${getErrorMessage(error)}`);
    }
  }
}
```

## 5. Applied, not recorded

An unrecorded answer only writes the data model of nodes the recorded runs hold. Its writes go to
the renderer stream and to a layer of their own, never into a run's activities or the recorded
state.

```ts
function applyUnrecorded(messages: readonly unknown[]): void {
  store.setState((current) => {
    const activities = sessionActivities(current);
    // Data-model updates whose node the recorded runs hold, validated once for both projections.
    const writes = acceptedWrites(messages, activities, config.contracts);
    if (writes.length < messages.length) {
      devWarn(
        'dispatchAction: an unrecorded answer may only update known nodes; the rest is dropped.'
      );
    }
    return {
      ...current,
      unrecordedState: applyInboundOps(
        current.unrecordedState ?? {},
        activities,
        {messages: writes},
        config.contracts
      ),
      rendererStream: appendToRendererStream(
        current.rendererStream ?? EMPTY_RENDERER_STREAM,
        convertA2uiMessages(writes)
      ),
    };
  });
}
```

`session.state` reads the recorded `state` with `unrecordedState` on top. A recorded write removes
the layer's value at the same path, and `serializeSession` saves `state` alone, so no product slice
outlives the page.

`streamUnrecorded` reads the response stream as `consumeStream` does. For each surface snapshot,
it calls `applyUnrecorded` only while `isLatest()` holds, checked just before applying, since a
read can resolve after a newer dispatch. It returns the snapshots' writes once the stream ends
without error or abort.

## 6. The search box shares its highlight

**Before:** the highlight is `activeIndex`, local to `PromptInput`, moved only by the keyboard.

**After:** `PromptInput` reports it on hover and with the keyboard, and `SearchBox` gives its
children the highlighted query: the active item's, or the first completion's.

```ts
// SearchBox/search-box-context.ts
export interface SearchBoxQuery {
  query: string;
  submitted: boolean;
  /** The suggestion the shopper highlights, or the first one; empty while there is none. */
  highlightedQuery: string;
  showSuggestions: (sections: SuggestionSection[]) => void;
}
```

```tsx
// SearchBox/SearchBox.tsx
const [activeItem, setActiveItem] = useState<SuggestionItem>();
const highlightedQuery = activeItem?.label ?? firstItem(sections)?.label ?? '';

return (
  <PromptInput
    // ...
    onActiveItemChange={setActiveItem} // hover and arrow keys
  />
);
```

## 7. Implementing `InstantProducts`

This is the whole renderer. It has no cache, no retry, no debounce and no wait for a free session:
it dispatches the highlighted query and draws its props.

```tsx
// InstantProducts/InstantProducts.tsx
export const InstantProducts = createReactComponent(
  {name: 'InstantProducts', schema: InstantProductsPropsSchema},
  ({props, context}) => {
    const {highlightedQuery, submitted} = useSearchBoxQuery();
    const showProducts = useShowProductsPanel(); // false on small screens

    useEffect(() => {
      if (!showProducts || submitted || !highlightedQuery) {
        return;
      }
      const payload: FetchInstantProductsPayload = {query: highlightedQuery};
      context.dispatchAction({event: {name: 'fetchInstantProducts', context: payload}});
    }, [context, highlightedQuery, showProducts, submitted]);

    // A late answer for an earlier highlight is never drawn.
    if (!showProducts || props.query !== highlightedQuery || props.products.length === 0) {
      return null;
    }
    return (
      <InstantProductsPanel>
        {props.products.map((product) => (
          <A2UIProductCard key={product.permanentid} product={product} />
        ))}
      </InstantProductsPanel>
    );
  }
);
```

Moving down from `hiking boots` to `hiking poles` and back produces two dispatches, one request and
one `productSuggest`: the second `hiking boots` is answered from the session's cache.

## 8. What the application no longer writes

Compared with `QuerySuggestions` under ADR-018, the instant-products renderer drops:

- `useLatestWhenFree`: a concurrent action is never withheld;
- an entry in `NON_BLOCKING_ACTIONS`: it never sets `session.request`;
- an entry in `SILENT_FAILURES`: it never sets `actionError`;
- a `submitQuery` case: a prompt does not wait for it, and it does not wait for the prompt;
- a cache of its own.
