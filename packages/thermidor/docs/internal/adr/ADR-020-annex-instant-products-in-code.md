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
  const cached = policy && actionCache.get(key);
  if (cached) {
    lanes.abort(recovered); // a late answer must not replace the cached one
    applyUnrecorded(cached);
    return Promise.resolve();
  }
  return lanes.send(recovered, async (signal) => {
    const messages = await streamUnrecorded(buildActionRequest(toA2uiAction(recovered)), signal);
    if (messages && policy) {
      actionCache.set(key, messages, policy.ttlMs);
    }
  });
}
```

## 4. The concurrent lane

One abort controller per `(surfaceId, sourceComponentId, name)`. A newer dispatch aborts the older
one; `session.request` is never touched.

```ts
function createLanes() {
  const inFlight = new Map<string, AbortController>();
  const laneKey = (source: ActionSource) =>
    JSON.stringify([source.surfaceId, source.sourceComponentId, source.name]);

  return {
    abort(source: ActionSource) {
      inFlight.get(laneKey(source))?.abort();
      inFlight.delete(laneKey(source));
    },
    async send(source: ActionSource, run: (signal: AbortSignal) => Promise<void>) {
      this.abort(source);
      const controller = new AbortController();
      inFlight.set(laneKey(source), controller);
      try {
        await run(controller.signal);
      } catch (error) {
        if (!controller.signal.aborted) {
          devWarn(`dispatchAction: ${source.name} failed: ${getErrorMessage(error)}`);
        }
      } finally {
        if (inFlight.get(laneKey(source)) === controller) {
          inFlight.delete(laneKey(source));
        }
      }
    },
  };
}
```

## 5. Applied, not recorded

An unrecorded answer only writes the data model of nodes the recorded runs hold. Its writes go to
the renderer stream and to a layer of their own, never into a run's activities or the recorded
state.

```ts
function applyUnrecorded(messages: readonly unknown[]): void {
  const writes = messages.filter(isUpdateDataModel);
  if (writes.length < messages.length) {
    devWarn(
      'dispatchAction: an unrecorded answer may only update the data model; the rest is dropped.'
    );
  }
  store.setState((current) => ({
    ...current,
    // Validation resolves nodes from recorded runs, so a write to an unknown node is dropped.
    unrecordedState: applyInboundOps(
      current.unrecordedState ?? {},
      sessionActivities(current),
      {messages: writes},
      config.contracts
    ),
    rendererStream: appendToRendererStream(
      current.rendererStream ?? EMPTY_RENDERER_STREAM,
      convertA2uiMessages(writes)
    ),
  }));
}
```

`session.state` reads the recorded `state` with `unrecordedState` on top. A recorded write removes
the layer's value at the same path, and `serializeSession` saves `state` alone, so no product slice
outlives the page.

`streamUnrecorded` reads the response stream as `consumeStream` does, calls `applyUnrecorded` for
each surface snapshot, and returns the snapshots' writes once the stream ends without error.

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
