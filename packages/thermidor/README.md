# Coveo Thermidor

`@coveo/thermidor` is an experimental, framework-agnostic client for a single, stateful, intent-routing **unified converse endpoint**. It exposes one factory — `createSession(config)` — that returns a `Session`: a plain observable list of `Turn`s folded from a server-sent-event (SSE) stream, plus a single action-dispatch entry point wired straight to the renderer.

The package is private, experimental, and consumed only inside this monorepo (by `samples/thermidor/demo-schema-react`).

> There is **no engine, no interface layer, no Redux/RTK, and no per-endpoint facades**. References to those layers in older revisions are obsolete.

## The idea

The server streams schema-defined [A2UI](https://github.com/google/A2UI) components; the client renders what the server sends. Thermidor's job is to transmit consumer input to the endpoint and fold the streamed result into an observable list of turns — it derives no use-case behavior beyond that fold. The contracts schema, the endpoint URL, and the ambient context are all consumer-injected, so a single package build serves public, internal (private-registry schema), and proxied deployments.

Component state travels **inline** through the A2-UI data model: the server sends `updateDataModel` operations under `/state/<id>`, and the renderer resolves each prop through an A2-UI Data_Binding (`{ "@path": <JSON Pointer> }`) against that data model. Renderers are "dumb": they receive resolved state in their `props` and never hydrate a controller or join a snapshot themselves. A2-UI is the only supported state source. This inline model superseded the earlier remote-controller / AG-UI `StateSnapshot` design.

## Public surface

```typescript
import {createSession} from '@coveo/thermidor';
import {ComponentContractsSchema} from '@coveo/thermidor-schema';

const session = createSession({
  organizationId: 'my-org',
  accessToken: 'xx-token',
  agentConfigurationId: '00000000-0000-0000-0000-000000000000', // the configured agent that answers the session
  trackingId: 'my-tracking-id',
  contracts: ComponentContractsSchema, // injected Zod discriminated union (Zod 3 or 4)
  navigatorContextProvider: () => getNavigatorContext(), // required; includes language, country, currency
  commerceContextProvider: () => ({cart: getCart()}),
});

session.subscribe(() => render(session.getSnapshot()));

await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'show me running shoes'}});
```

`createSession(config)` returns a `Session` exposing exactly:

| Member                    | Purpose                                                                                                                                                                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contracts`               | The injected contracts schema this session validates against (readonly).                                                                                                                                                                                               |
| `turns`                   | Readonly observable list of `Turn`s folded from the stream (empty initially).                                                                                                                                                                                          |
| `initialization`          | The run of the `initialize` action that opened the session, or `undefined`. See [Opening the session](#opening-the-session).                                                                                                                                           |
| `surfaces`                | Every live surface of the session, in creation order, whichever run created it.                                                                                                                                                                                        |
| `a2uiMessages`            | The session's whole renderer stream: Agent Gateway's A2-UI v1.0 messages, unchanged. It only grows: feed each new message to one renderer once.                                                                                                                        |
| `state`                   | The validated data model of every live surface, keyed by surface id.                                                                                                                                                                                                   |
| `actionError`             | The last component action that failed, unless it is concurrent or only failed the turn it opened (`ActionError`: `message`, `errorCode?`, `component`, `name`, `surfaceId`, `sourceComponentId`), or `undefined`. See [Concurrency conflicts](#concurrency-conflicts). |
| `request`                 | The request being sent, or `undefined` when idle. See [One request at a time](#one-request-at-a-time).                                                                                                                                                                 |
| `subscribe(listener)`     | Registers a listener called once per change to the session, such as to the turn list, the initialization, `state`, `actionError` or `request`, the answers to concurrent actions included.                                                                             |
| `getSnapshot()`           | `turns`, `initialization`, `surfaces`, `a2uiMessages`, `state`, `request` and `actionError` as one immutable `SessionSnapshot`, replaced on change.                                                                                                                    |
| `dispatchAction(message)` | The single entry point for prompts (`submitPrompt`) and component actions, wired directly as the renderer's action handler.                                                                                                                                            |
| `cancel()`                | Stops the request in flight, but no concurrent action.                                                                                                                                                                                                                 |
| `retry(turnId)`           | Re-submits the last turn's input when it errored: its prompt, or the action that opened it. Withheld while a request is in flight.                                                                                                                                     |
| `retryInitialization()`   | Sends `initialize` again when `initialization.status` is `'error'`. See [Opening the session](#opening-the-session).                                                                                                                                                   |
| `serialize()`             | Serializes the transcript into a versioned `SerializedSession`.                                                                                                                                                                                                        |

`subscribe` and `getSnapshot` do not rely on `this`, so they can be handed by reference to any store that compares snapshots by reference, such as React's `useSyncExternalStore(session.subscribe, session.getSnapshot)`. The package itself depends on no framework.

The concrete `contracts` type pinned at the `createSession` call site threads unbroken through `Session`, so component types, action names, and payloads stay fully typed at the call site (no `string`, no `never`, no `unknown`).

## Opening the session

The session opens itself: `createSession` sends an `initialize` action a microtask after it returns, so a listener subscribed in the same task sees it start. It carries no surface or source component, since no component exists yet. While it is in flight, `session.request` is `{kind: 'initialize'}`. It goes through the [one-request rule](#one-request-at-a-time) and the conflict retry, and adopts the session id and token from its run, like a prompt. The producer answers with the session's shell, such as its search box, as an ordinary surface.

Its run is recorded as `session.initialization` (`activities`, `status`, `error`), never as a turn. When the endpoint rejects it with a network error, a `429`, `502`, `503` or `504`, the session retries it, up to 3 attempts within 5 seconds, the attempts included, so a failure that takes several seconds to arrive, such as a proxy timeout, isn't retried. `request` stays `{kind: 'initialize'}` meanwhile, and a dispatch is withheld as during any request. Once it has failed, `initialization.status` is `'error'`, the first prompt still opens the session, and `retryInitialization()` sends it again, a restored session's included, while the session has no token. `cancel()` stops it like any request. A restored session never sends it by itself, and neither does a session created with `initialize: false`, for tests or for a server that creates a session while rendering.

## Dispatching actions

`session.dispatchAction` is the single consumer-facing action entry point. It accepts two kinds of message.

### Submitting a prompt

A prompt typed outside A2-UI composition, such as in the integrator's search box, is a `SubmitPromptAction`:

```typescript
session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'show me running shoes'}});
```

It opens a new streaming turn, records the prompt as the turn's `input.prompt`, and POSTs it to the converse endpoint. It needs no rendered component or active turn, so it also opens the first turn of a session. Sent while another request is in flight, it is withheld, as any dispatch but a concurrent action is (see [One request at a time](#one-request-at-a-time)), and `retry(turnId)` re-drives a turn it opened.

### Component actions

A component action is the action an A2-UI v1.0 renderer reports (`A2uiRendererAction`: `name`, `surfaceId`, `sourceComponentId`, `context`). It is the payload that `@a2ui/web_core`'s `MessageProcessor`, which `@a2ui/react` renders from, passes to its action handler, so it wires with no adapter:

```typescript
const processor = new MessageProcessor(catalogs, session.dispatchAction, {version: '1.0'});
```

Given an action, `dispatchAction` recovers the dispatching component's discriminant from the session's live surfaces, whichever run created them, validates the action payload against the component's injected contract internally, and — on success — POSTs the action to the converse endpoint.

An action the producer announces as opening a turn, such as a follow-up chip or a search option, is answered as a new turn of the conversation, as a prompt is. The producer announces it with the surface, in the AG-UI `metadata` of its snapshot (`metadata.turnOpeningActions`, by surface id), so the consumer declares nothing and the turn opens as soon as the shopper picks the action. Such an action opens a new streaming turn whose `input.action` records it (component, action name, surface id, source node and payload), and that turn becomes the active turn. The surfaces of the turn it was sent from keep accepting actions. It needs no active turn, so a turn-opening action on the shell opens the first turn of a session. Any other action only updates the surfaces: its surface snapshots are recorded with the active turn, or with `session.initialization` before the first turn.

Whether an action opens a turn, is [concurrent](#concurrent-and-cached-actions), or neither comes from the producer's announcements, never from the integrator. An action announced as both is sent as concurrent, with a dev-only warning.

It is **fire-and-forget**: the returned Promise always resolves and never rejects, so the consumer needs no `.catch`. An action with no `sourceComponentId`, a node that resolves to no component, or an internal validation failure is dropped with a dev-only warning and nothing is sent.

### One request at a time

Thermidor sends one request at a time per session, `initialize`, prompts, component actions and retries alike, except the [concurrent actions](#concurrent-and-cached-actions) the producer announces. The Gateway runs one turn per session and refuses a request that arrives meanwhile (see [Concurrency conflicts](#concurrency-conflicts)). A dispatch made while a request is in flight is withheld: nothing is sent, nothing is queued, and its promise resolves at once with a dev-only warning. To send it, dispatch it again once the session is free. Each `dispatchAction` promise resolves once its own request ends.

- `session.request` is the request being sent (`{kind: 'initialize'}`, `{kind: 'prompt', turnId}` or `{kind: 'action', component, name, surfaceId, sourceComponentId, turnId?}`, with no `turnId` before the first turn), or `undefined` when idle. An action's run counts, a follow-up included. Read it synchronously, or through `subscribe`, to know when a dispatch would be withheld: disable or dim the controls that would send one, or keep the shopper's latest intent and dispatch it once `request` is `undefined`. Concurrent actions are never withheld for it. `component` is the dispatching node's discriminant, so a consumer can key its own action lists, such as the actions that keep its surfaces usable, by component and action name, typed by the contracts with `ComponentActionNames`.
- `cancel()` stops the request in flight, but `session.request` stays set until it has unwound, a few microtasks later, so a dispatch made right after `cancel()` is withheld. Wait for `request` to become `undefined`, through `subscribe`, before sending the next one. A cancelled action sets no `session.actionError`.
- The Gateway can't stop an agent run yet, so a cancelled prompt's run may keep the session busy there. The next request then waits in conflict retries, with `session.request` set, until the run ends, and fails if it is still refused once the 30-second conflict budget has run out.
- A search box that dispatches `fetchSuggestions`, an ordinary action unless the producer announces it as concurrent, debounces it, keeps only the latest query while the session is busy, and dispatches it once `request` is `undefined`, unless it is the query last sent. To submit while a `fetchSuggestions` is in flight, it calls `cancel()`, waits for `request` to become `undefined`, then dispatches `submitPrompt`. The cancelled request may still hold the Gateway's turn slot, so the prompt may wait in conflict retries.

### Concurrent and cached actions

The producer can answer some actions beside the turn, such as instant products for the highlighted suggestion. It announces them with the surface, in the AG-UI `metadata` of its snapshot, by surface id, as it announces turn-opening actions:

```json
"metadata": {
  "concurrentActions": {"<surfaceId>": {"fetchInstantProducts": {"cache": {"ttlMs": 60000}}}}
}
```

Each concurrent action can carry a `cache` policy, the lifetime of its answers; without one, its answers are not reused. The latest announcement for a surface wins, and an empty entry revokes it. If any action in a surface's entry doesn't have this shape, such as a `cache` without a positive `ttlMs`, the whole entry is ignored without a warning, and the surface's previous announcement still applies. A renderer only dispatches: it holds no cache, no retry and no wait for a free session.

- A concurrent action is sent at once, whatever request is in flight, and never sets `session.request`. A prompt or `cancel()` does not stop it. Dispatched before the session has its token, it is withheld: nothing is sent, now or later. Its payload is validated as any action's.
- Only the latest dispatch of an action from a node is applied: each node and action name is its own lane. An older request of the lane still in flight is aborted, unless the action is cached: then it runs to the end, so its answer is cached, and a dispatch with the same cache key joins it instead of sending another.
- A cached action dispatched again with the same cache key, while its answer is younger than the lifetime the producer announces now, is answered from the session's cache and sends nothing. The key is the surface, the node, the action name, the request's `language`, `country` and `currency`, and the payload. The rest of the context isn't in it, so a change of page URL or cart reaches a cached answer only once it expires. Only an answer whose stream completes without an error is cached. The cache holds the 100 most recently used answers, lives in memory and is never serialized.
- Its answer may only update the data model of nodes the session already holds; anything else, such as a new surface or component, is dropped with a dev-only warning, and the answer's `metadata` is not read. Its writes reach `session.a2uiMessages` and `session.state`, but no run records them: a later recorded write to the same path replaces them, `session.serialize()` leaves them out, and a restored session shows the state the last recorded run left, so the renderer asks again.
- It is sent once and never retried, a `409` included. Its failure, including a refused request, is a dev-only warning. It sets no `session.actionError` and changes no run.

### Optimistic values

To show a gesture's expected value until the session has answered it, show that value from the moment the gesture is sent until its dispatch promise resolves, then give way to the producer's value. A renderer that returns its action handler's promise from its own dispatch, as `@a2ui/web_core`'s surfaces do, hands back the `session.dispatchAction` promise, so awaiting the renderer's dispatch is enough. Thermidor doesn't depend on a UI framework, so any state mechanism works. With React's `useOptimistic`, for example, a transition that awaits the dispatch lasts exactly that long:

```tsx
const [values, addOptimisticValues] = useOptimistic(producerValues);

startTransition(async () => {
  addOptimisticValues(values.map((v) => (v.value === 'Nike' ? {...v, state: 'selected'} : v)));
  await renderer.dispatchAction({event: {name: 'toggleSelect', context: {value: 'Nike'}}});
});
```

The optimistic value gives way to the producer's once the gesture is over, whatever the outcome, so a failed or withheld gesture needs no rollback. A withheld gesture's promise resolves at once, so its optimistic value disappears as soon as it shows: while `session.request` is set, disable the controls whose action would be withheld, or hold their latest value back until the session is free (see [One request at a time](#one-request-at-a-time)). Thermidor never computes the expected value: the integrator does.

### Concurrency conflicts

When the Gateway is still busy with another request for the session, it rejects the new one (`409`, `AGENT:ACTION_IN_FLIGHT`); a `409` with another `errorCode` is an ordinary failure. Thermidor sends the request again, rebuilt so the context providers are read again, after a backoff that starts at 250 ms and doubles up to 4 seconds, with jitter, while less than 30 seconds have passed since the first attempt, the attempts included. That budget only decides whether to try again: the last attempt, sent just before it runs out, can still succeed after it. `session.request` stays set meanwhile, and a conflict that recovers shows nothing. `cancel()` stops the retries. [Concurrent actions](#concurrent-and-cached-actions) are never retried. Other rejections, such as a `429` or a `503`, aren't retried either, except for the `initialize` the session sends itself (see [Opening the session](#opening-the-session)).

If it gives up:

- an **action** that does not open a turn ends without changing any turn, which releases its optimistic hold, and `session.actionError` reports it;
- an **action that opens a turn** sets `session.actionError` too, and its turn becomes `error`, retryable with `retry(turnId)` while it is the last turn;
- a **prompt**'s turn becomes `error`, retryable with `retry(turnId)` while it is the last turn.

`session.actionError` stays set until the session sends its next prompt or action, `retry(turnId)` included. A withheld dispatch, a concurrent action and `initialize` leave it as it is.

## The Turn / TurnResponse model

Each turn pairs one `input` with its streamed `response`:

```typescript
interface Turn {
  id: string;
  input: {prompt?: string; action?: TurnAction}; // the prompt, or the action that opened the turn
  response: TurnResponse;
  status: 'streaming' | 'complete' | 'error';
  error?: string; // present iff status === 'error'
  reason?: 'cancelled' | 'failed'; // present iff status === 'error'
  errorCode?: string; // the gateway's RUN_ERROR code, e.g. 'AGENT:UPSTREAM_TIMEOUT', when it sent one
}

interface TurnResponse {
  activities: Activity[]; // raw snapshot log, latest snapshot per messageId, defaults to []
  surfaces: DiscoveredSurface[]; // the live surfaces this turn created
  agent?: {messages: AgentMessage[]; toolCalls: ToolCall[]}; // present only when the router invoked an agent
}
```

`activities` is routing-neutral and always present. `agent` appears only when the router invoked an agent for the turn. Consumers read `turn.input.prompt`, `turn.response.surfaces` (where to draw the turn's blocks) and `turn.response.agent?.messages` / `turn.response.agent?.toolCalls`.

### Stopped and failed turns

An errored turn, and an errored `session.initialization`, says why in `reason`: `'cancelled'` when `session.cancel()` stopped it, `'failed'` otherwise (a `RUN_ERROR`, a rejected or broken request, a stream that ended early, or a run restored while it was streaming). A `RUN_ERROR` also keeps the gateway's `errorCode`, such as `AGENT:INTERNAL_ERROR`, `AGENT:UPSTREAM_TIMEOUT`, `AGENT:RESPONSE_SIZE_EXCEEDED` or `AGENT:INCOMPLETE_AGENT_RESPONSE`. Pick the text from these rather than showing `error`, whose gateway messages end with a documentation URL:

```tsx
function TurnError({turn, session}: {turn: Turn; session: Session}) {
  if (turn.status !== 'error') {
    return null;
  }
  if (turn.reason === 'cancelled') {
    return <p>You stopped the response.</p>;
  }
  return (
    <p>
      Something went wrong.
      {turn.errorCode !== 'AGENT:RESPONSE_SIZE_EXCEEDED' && (
        <button onClick={() => session.retry(turn.id)}>Try again</button>
      )}
    </p>
  );
}
```

`retry` clears `error`, `reason` and `errorCode` along with the turn's response.

### Session-scoped surfaces

Surfaces live in the session, not in the turn that created them. The session derives them from one ordered activity log: the initialization's activities, then each turn's. A surface lives from its `createSurface` until its `deleteSurface`, whichever runs carry them, and a `createSurface` for a live id replaces that surface, so a producer mints a new id for each new surface.

- `session.surfaces` lists every live surface in creation order; a surface the agent deletes leaves it, and one it re-creates moves to the end. Each turn's `response.surfaces` lists the live surfaces that turn created; one a later run creates again under its live id, such as the answer to an action recorded with a later turn, stays with the turn that first created it. Find one no turn created, such as the shell, by its `rootComponentType`. A loading placeholder is listed only while the run that last created it streams: while its turn or the initialization streams, or while the request in flight streams into that run and had not found it already left behind; one the agent left behind (a cancelled run, an error, a restored session) leaves the lists, so a consumer draws a skeleton for every listed surface whose `isLoading` holds.
- `session.a2uiMessages` is the whole session's renderer stream: the A2-UI v1.0 messages of every run, as Agent Gateway sent them, in arrival order. It only grows, so a single renderer, such as one `@a2ui/react` `MessageProcessor`, is fed each new message once. Before a `createSurface` that replaces a live surface, it carries a `deleteSurface` for it, and it leaves out an `updateComponents` or `updateDataModel` for a surface that is not live, since the renderer refuses both. Only messages whose `version` is `"1.0"` enter it.
- `session.state` is the validated data model of every live surface, keyed by surface id, whichever run wrote it, with the answers to concurrent actions on top.
- An action resolves its source component across the session's live surfaces, so the surfaces of earlier runs keep accepting actions. The run of an action that opens no turn only updates the surfaces: its surface snapshots are recorded with the active turn, or with the initialization before the first turn, and it never changes the status of a turn or of the initialization. When it fails, whether the endpoint rejects it, it streams `RUN_ERROR`, its stream ends without a terminal event or its request cannot be built, `session.actionError` identifies the action (`message`, `component`, `name`, `surfaceId`, `sourceComponentId`), so a consumer can show the failure next to the block it came from. An action that opens a turn fails that turn instead, and sets `session.actionError` only when it gives up on a [concurrency conflict](#concurrency-conflicts).

Each `DiscoveredSurface` carries `surfaceId`, `rootComponentType`, and `isLoading`, which is `true` while the surface's data model declares `isLoading: true` (a loading placeholder for `rootComponentType`).

## Validation and displayed values

- **Client-side validation is retained, transparently.** The injected `contracts` schema stays the sole validation source, but the consumer never runs Zod and writes no adapter glue. Inbound `updateDataModel` ops are validated before they are applied to `session.state`, against the components of every live surface; outbound action payloads are validated in the private dispatch path before the POST. Both boundaries live inside the core. `session.a2uiMessages` is derived from the raw stream, so the renderer still receives an op that validation drops from `session.state`, and the component state seeded by `createSurface.dataModel`, which is never validated.
- **Displayed-value formatting is agent-produced.** The renderer shows the state it receives through its `{ "@path" }` bindings; Thermidor does not reformat displayed values.

## Injected schema, endpoint, and context

- **Contracts schema** — a consumer-injected Zod discriminated union (`contracts`) is the sole source for component-state and action-payload validation. Thermidor accepts it through a structural typing seam (`ContractsSchema` / `ComponentContractSchema` / `ParsableSchema`) that reads only public Zod API, so it declares no dependency on any specific schema package. It declares `zod` as a peer dependency spanning both majors (`3.25.76 || ^4`), so validation runs through the single shared `zod` instance resolved by the injected schema. A consumer whose renderer is built on Zod 3 injects a Zod 3 schema, such as `@coveo/thermidor-schema/zod3`.
- **Endpoint** — when `endpoint` is provided, the client POSTs to it verbatim. When absent, it resolves `https://{orgId}.org.coveo.com` and appends the fixed converse path `/api/preview/organizations/{orgId}/agents/commerce/agui/converse`.
- **Context providers** — `navigatorContextProvider` (required) and `commerceContextProvider` are synchronous functions read fresh per request. The navigator context carries the request's `language`, `country` and `currency`. Context is never stored on the session and never serialized.

## Serialization

`session.serialize()` produces a versioned `SerializedSession` (integer `version >= 1`), distinct from the runtime `Turn` type. Pass it back as `sessionToRestore` in `createSession` to continue a conversation. The initialization, the turns and the session's recorded `state` are persisted, without the answers to concurrent actions; `request`, `actionError` and the cache of concurrent answers are not, so a restored session starts idle; the surfaces and the renderer stream are never persisted (they are re-derived from the initialization's and the turns' `activities` on restore); a turn or initialization persisted mid-stream is downgraded to `error` with `'Stream was interrupted'` and `reason: 'failed'`, preserving what it holds. A session serialized while an action that opens no turn is in flight keeps the part of its answer that had arrived, with nothing to mark it unfinished, so serialize while `session.request` is `undefined`.

## Recorded interim debt and out-of-scope items

The following are intentionally **not yet implemented** and are recorded as debt or deferred work:

- **Interim surface derivation** — `surfaces` is a typed projection derived from `activities`, annotated as interim; the core interprets no `rootComponentType`; consumers read it. It is retired once the server sends typed routing.
- **Renderer stream bypasses validation** — inbound ops that in-transit validation drops from `session.state` still reach the renderer through `session.a2uiMessages`, and so does the component state seeded by `createSurface.dataModel`, which is never validated. A fix must cover both paths.
- **Enforced action-payload typing at the renderer boundary** — the renderer hands `dispatchAction` a loosely typed action message, so per-component action typing is applied by convention (the consumer opts into the generated `XxxAction` types) rather than enforced at the boundary. Recoverable later if the package owns binding resolution.
- **Package rename** — deferred as low-stakes; the package remains `@coveo/thermidor`.

## Development

```bash
pnpm --filter @coveo/thermidor build      # build project
pnpm --filter @coveo/thermidor test       # run unit + property tests
pnpm --filter @coveo/thermidor test:dts   # validate public API surface (incl. DX type test)
```

The API report lives in `api-report/`. When the public API changes, run `pnpm turbo run test:dts --filter=@coveo/thermidor` and commit the updated reports; CI fails otherwise.

## Architecture

See the [Architecture Guide](./docs/architecture.md) for the internal structure, and the accepted decisions of record in [`docs/internal/adr`](./docs/internal/adr).
