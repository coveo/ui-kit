---
related:
  - ./ADR-018-session-scoped-surfaces-and-initialize.md
---

# ADR-018 annex: the session shell in code

This annex shows the effect of
[ADR-018](./ADR-018-session-scoped-surfaces-and-initialize.md) on an application, with
demo-schema-react as the example. The snippets are trimmed for reading and show the intended API,
not a final implementation. Where they and the ADR disagree, the ADR decides.

## 1. Creating a session

Nothing changes in the application's code. It writes nothing for `initialize`, which the session
sends as soon as it exists.

```ts
const session = createSession({
  contracts: ComponentContractsSchema,
  organizationId,
  accessToken,
  // ...
});

session.request; // {kind: 'initialize'}, from the next microtask until the shell arrives
```

A test, or a server rendering the page, opts out:

```ts
const session = createSession({...config, initialize: false}); // sends nothing
```

## 2. Feeding the renderer

**Before:** the demo rebuilds one stream from every turn, re-addresses later turns' operations to
the turn that created each surface, and maps the render ids back on every action.

```tsx
const turns = useSyncExternalStore(subscribe, () => session.turns);
const stream = useMemo(() => buildSurfaceStream(turns), [turns]);

const handleAction = (message) =>
  session.dispatchAction(toServerAction(message, stream.serverSurfaceIds));

<ThermidorA2UIStream messages={stream.messages} onAction={handleAction} />;
```

**After:** the session's stream is already ordered across runs, and surfaces keep their server ids.

```tsx
const messages = useSyncExternalStore(subscribe, () => session.a2uiMessages);

<ThermidorA2UIStream messages={messages} onAction={session.dispatchAction} />;
```

A turn still says which surfaces it created, so the transcript knows where to draw them:

```tsx
{
  turn.response.surfaces.map(({surfaceId}) => (
    <A2UIRenderer key={surfaceId} surfaceId={surfaceId} />
  ));
}
```

## 3. Drawing the shell, disabled until it arrives

The application finds the shell by its root component type, and draws a disabled search box of
the same shape until then:

```tsx
function Shell() {
  const session = useSession();
  const surfaces = useSyncExternalStore(subscribe, () => session.surfaces);
  const shell = surfaces.find(({rootComponentType}) => rootComponentType === 'SessionShell');

  if (shell) {
    return <A2UIRenderer surfaceId={shell.surfaceId} />;
  }
  if (session.initialization?.status === 'error') {
    return <PromptInput />; // no suggestions in this session
  }
  return <PromptInput disabled />;
}
```

The swap from the disabled input to the shell's input remounts it, which is safe: the shopper
cannot have typed, focused or started a composition in a disabled input.

## 4. The `QuerySuggestions` renderer

It debounces, then sends the latest query once the session is free:

```tsx
export const QuerySuggestions = createReactComponent(
  {name: 'QuerySuggestions', schema: QuerySuggestionsPropsSchema},
  ({props, context}) => {
    const query = useSearchBoxQuery(); // provided by the SearchBox renderer
    const debounced = useDebouncedValue(query, 150);

    useLatestWhenFree(debounced, (latest) =>
      context.dispatchAction({name: 'fetchSuggestions', context: {query: latest}})
    );

    return props.query === query ? <Completions items={props.completions} /> : null;
  }
);
```

## 5. The two demo helpers

`useLatestWhenFree` keeps the latest value, and sends it once the session is free, unless it was
already sent. Facet search uses it too, in place of its polling:

```ts
export function useLatestWhenFree<T>(value: T, send: (value: T) => void) {
  const session = useSession();
  const lastSent = useRef<T>();

  useEffect(() => {
    const flush = () => {
      if (session.request === undefined && value && value !== lastSent.current) {
        lastSent.current = value;
        send(value);
      }
    };
    flush();
    return session.subscribe(flush);
  }, [session, value]);
}
```

`submitQuery` never lets a suggestion swallow the shopper's submit:

```ts
export async function submitQuery(session: DemoSession, prompt: string) {
  if (isFetchSuggestions(session.request)) {
    session.cancel();
    await whenFree(session);
  }
  return session.dispatchAction({name: 'submitPrompt', payload: {prompt}});
}
```

The cancelled request may still hold the producer's turn slot when the prompt is sent. The
prompt's `409` is absorbed by the conflict retry.

## 6. Serialized format version 2

```ts
{
  version: 2,
  sessionId: 'abc-123',
  sessionToken: 'tok-456',
  activeTurnId: 'turn-2',
  initialization: {activities: [/* createSurface of the shell */], status: 'complete'},
  turns: [/* as in version 1, without `response.state` */],
  state: {
    'ui-7f3c': {state: {'query-suggestions': {query: 'hik', completions: [/* ... */]}}},
    'ui-91ab': {/* a search surface's state */},
  },
}
```

A restored session has a token, so it does not send `initialize`: the shell comes back from the
persisted activities.
