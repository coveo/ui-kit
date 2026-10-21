# Coveo Thermidor

`@coveo/thermidor` is an experimental, framework-agnostic client for a single, stateful, intent-routing **unified converse endpoint**. It exposes one factory — `createSession(config)` — that returns a `Session`: a plain observable list of `Turn`s folded from a server-sent-event (SSE) stream, plus a single action-dispatch entry point wired straight to the renderer.

The package is private, experimental, and consumed only inside this monorepo (by `samples/thermidor/demo-schema-react`).

> There is **no engine, no interface layer, no Redux/RTK, and no per-endpoint facades**. The package was collapsed into this lean session client per [ADR-010](./docs/internal/adr/ADR-010-unified-endpoint-session-client.md). References to those layers in older revisions are obsolete.

## The idea

The server streams schema-defined [A2UI](https://github.com/google/A2UI) components; the client renders what the server sends. Thermidor's job is to transmit consumer input to the endpoint and fold the streamed result into an observable list of turns — it derives no use-case behavior beyond that fold. The contracts schema, the endpoint URL, and the ambient context are all consumer-injected, so a single package build serves public, internal (private-registry schema), and proxied deployments.

Component state travels **inline** through the A2-UI data model: the server sends `updateDataModel` operations under `/state/<id>`, and the frozen renderer resolves each prop through an A2-UI Data_Binding (`{ path: <JSON Pointer> }`) against that data model. Renderers are "dumb": they receive resolved state in their `props` and never hydrate a controller or join a snapshot themselves. A2-UI is the only supported state source. This inline model superseded the earlier remote-controller / AG-UI `StateSnapshot` design per [ADR-016](./docs/internal/adr/ADR-016-inline-state-consumption-remove-remote-controller.md).

## Public surface

```typescript
import {createSession} from '@coveo/thermidor';
import {ComponentContractsSchema} from '@coveo/thermidor-schema';

const session = createSession({
  organizationId: 'my-org',
  accessToken: 'xx-token',
  contracts: ComponentContractsSchema, // injected Zod discriminated union (Zod 3 or 4)
  navigatorContextProvider: () => getNavigatorContext(),
  commerceContextProvider: () => ({cart: getCart()}),
});

session.subscribe(() => render(session.turns));

await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'show me running shoes'}});
```

`createSession(config)` returns a `Session` exposing exactly:

| Member                    | Purpose                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `contracts`               | The injected contracts schema this session validates against (readonly).                                                |
| `turns`                   | Readonly observable list of `Turn`s folded from the stream (empty initially).                                           |
| `actionError`             | Why the last component action was dropped after repeated concurrency conflicts, or `undefined`. See below.              |
| `request`                 | The request being sent, or `undefined` when idle. See [One request at a time](#one-request-at-a-time).                  |
| `whenSettled()`           | Resolves once a dispatch made after the call has ended and the session is idle, whatever the outcome.                   |
| `subscribe(listener)`     | Registers a listener called once per change to the turn list, `actionError` or `request`.                               |
| `dispatchAction(message)` | The single entry point for prompts (`submitPrompt`) and component actions, wired directly as the renderer's `onAction`. |
| `cancel()`                | Stops the active stream and withholds the dispatches waiting behind it.                                                 |
| `retry(turnId)`           | Re-submits an errored turn's input.                                                                                     |
| `serialize()`             | Serializes the transcript into a versioned `SerializedSession`.                                                         |

The concrete `contracts` type pinned at the `createSession` call site threads unbroken through `Session`, so component types, action names, and payloads stay fully typed at the call site (no `string`, no `never`, no `unknown`).

## Dispatching actions

`session.dispatchAction` is the single consumer-facing action entry point. It accepts two kinds of message.

### Submitting a prompt

A prompt typed outside A2-UI composition, such as in the integrator's search box, is a `SubmitPromptAction`:

```typescript
session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'show me running shoes'}});
```

It opens a new streaming turn, records the prompt as the turn's `input.prompt`, and POSTs it to the converse endpoint. It needs no rendered component or active turn, so it also opens the first turn of a session. Sent while another request is in flight, it waits for it (see [One request at a time](#one-request-at-a-time)), and `retry(turnId)` re-drives a turn it opened.

### Component actions

A component action is the standard A2-UI client-to-server message (`A2uiClientMessage`) that the frozen renderer hands to its `onAction` handler, so it wires with no adapter:

```typescript
<A2UIProvider catalog={catalog} onAction={session.dispatchAction}>{/* … */}</A2UIProvider>
```

Given a message, `dispatchAction` unwraps its `userAction`, recovers the dispatching component's discriminant from the active turn's surfaces, validates the action payload against the component's injected contract internally, and — on success — POSTs the action to the converse endpoint.

It is **fire-and-forget**: the returned Promise always resolves and never rejects, so the consumer needs no `.catch`. A message with no `userAction`, no `sourceComponentId`, a node that resolves to no component, or an internal validation failure is dropped with a dev-only warning and nothing is sent.

### One request at a time

Thermidor sends one request at a time per session, prompts and component actions alike; later ones wait their turn in dispatch order, so integrators never queue anything themselves. Each `dispatchAction` promise resolves once its own request ends.

- `session.request` is the request being sent (`{kind: 'prompt', turnId}` or `{kind: 'action', name, surfaceId, sourceComponentId, turnId}`), or `undefined` when idle. An action's run counts, a follow-up included. Read it synchronously, or through `subscribe`, to lock or dim the interface; which requests lock is the integrator's call.
- `session.whenSettled()` resolves once a dispatch made after the call has ended and the session is idle, whatever its outcome, a withheld one included.
- An action that waited behind a prompt is dropped if its turn is no longer the active one by the time it would be sent.
- `cancel()` withholds the dispatches waiting behind the stopped request.
- Waiting requests are in memory only: reloading the page drops them.

### Optimistic values

To show a gesture's expected value until the session has answered it, wait on `whenSettled()`, called right before the dispatch. With React's `useOptimistic`, the transition lasts exactly that long:

```tsx
const [values, addOptimisticValues] = useOptimistic(producerValues);

startTransition(async () => {
  addOptimisticValues(values.map((v) => (v.value === 'Nike' ? {...v, state: 'selected'} : v)));
  const answered = session.whenSettled();
  renderer.dispatchAction({event: {name: 'toggleSelect', context: {value: 'Nike'}}});
  await answered;
});
```

The optimistic value gives way to the producer's once the gesture is over, whatever the outcome, so a failed or withheld gesture needs no rollback. Thermidor never computes the expected value: the integrator does.

### Concurrency conflicts

When the Gateway is still busy with another request for the session, it rejects the new one (`409`, `AGENT:ACTION_IN_FLIGHT`). Thermidor retries automatically for up to 30 seconds, and a conflict that recovers shows nothing. If it gives up:

- an **action**'s dispatch ends without changing the turn, which releases its optimistic hold, and `session.actionError` is set until the next action or prompt is sent;
- a **prompt**'s turn becomes `error`, retryable with `retry(turnId)`.

## The Turn / TurnResponse model

Each turn pairs one `input` with its streamed `response`:

```typescript
interface Turn {
  id: string;
  input: {prompt?: string}; // prompt omitted for prompt-less action turns
  response: TurnResponse;
  status: 'streaming' | 'complete' | 'error';
  error?: string; // present iff status === 'error'
}

interface TurnResponse {
  state: A2uiState; // validated component state (/state/<id> ops) per surface, defaults to {}
  activities: Activity[]; // raw snapshot log, latest snapshot per messageId, defaults to []
  surfaces: DiscoveredSurface[]; // typed projection derived from activities
  a2uiMessages: A2uiV09Message[]; // renderer-ready A2-UI v0.9 stream derived from activities
  agent?: {messages: AgentMessage[]; reasoningSteps: ReasoningStep[]}; // present only when the router invoked an agent
}
```

`state` and `activities` are routing-neutral and always present. `agent` appears only when the router invoked an agent for the turn. Consumers feed `turn.response.a2uiMessages` to their renderer, and read `turn.input.prompt`, `turn.response.surfaces`, and `turn.response.agent?.messages` / `turn.response.agent?.reasoningSteps`; `state` and `activities` remain available.

`a2uiMessages` exists because Agent Gateway emits A2-UI v1.0 while every available renderer consumes v0.9: Thermidor downgrades the stream on the consumer's behalf (recorded interim debt, see below).

`surfaces` lists the turn's live surfaces in creation order: a surface the agent deletes (`deleteSurface`) leaves the list, and one it re-creates moves to the end. Each `DiscoveredSurface` carries `surfaceId`, `rootComponentType`, and `isLoading`, which is `true` while the surface's data model declares `isLoading: true` (a loading placeholder for `rootComponentType`).

## Validation and displayed values

- **Client-side validation is retained, transparently.** The injected `contracts` schema stays the sole validation source, but the consumer never runs Zod and writes no adapter glue. Inbound `updateDataModel` ops are validated on the fold before they are applied to `response.state`; outbound action payloads are validated in the private dispatch path before the POST. Both boundaries live inside the core. `response.a2uiMessages` is derived from the raw stream, so the renderer still receives an op that validation drops from `response.state`, and the component state seeded by `createSurface.dataModel`, which is never validated.
- **Displayed-value formatting is agent-produced.** The renderer shows the state it receives through its `{ path }` bindings; Thermidor does not reformat displayed values.

## Injected schema, endpoint, and context

- **Contracts schema** — a consumer-injected Zod discriminated union (`contracts`) is the sole source for component-state and action-payload validation. Thermidor accepts it through a structural typing seam (`ContractsSchema` / `ComponentContractSchema` / `ParsableSchema`) that reads only public Zod API, so it declares no dependency on any specific schema package. It declares `zod` as a peer dependency spanning both majors (`3.25.76 || ^4`), so validation runs through the single shared `zod` instance resolved by the injected schema. A consumer whose renderer is built on Zod 3 injects a Zod 3 schema, such as `@coveo/thermidor-schema/zod3`.
- **Endpoint** — when `endpoint` is provided, the client POSTs to it verbatim. When absent, it resolves `https://{orgId}.org.coveo.com` and appends the fixed converse path `/api/preview/organizations/{orgId}/agents/commerce/agui/converse`.
- **Context providers** — `navigatorContextProvider` and `commerceContextProvider` are synchronous functions read fresh per request. Context is never stored on the session and never serialized.

## Serialization

`session.serialize()` produces a versioned `SerializedSession` (integer `version >= 1`), distinct from the runtime `Turn` type. Pass it back as `sessionToRestore` in `createSession` to continue a conversation. `response.state` is persisted for the active turn only; `response.surfaces` and `response.a2uiMessages` are never persisted (they are re-derived from `activities` on restore); a turn persisted mid-stream is downgraded to `error` with `'Stream was interrupted'`, preserving its partial response.

## Recorded interim debt and out-of-scope items

The following are intentionally **not yet implemented** and are recorded as debt or deferred work:

- **Interim `response.surfaces` derivation** — `surfaces` is a typed projection derived from `activities` in the fold, annotated as interim per [ADR-015](./docs/internal/adr/ADR-015-surface-and-route-derivation.md); the core interprets no `rootComponentType`; consumers read it. It is retired by a future server-surfaced typed-routing ADR (ADR-015 Option C).
- **The A2-UI v0.9 renderer projection** — `response.a2uiMessages` downgrades Agent Gateway's v1.0 stream for today's v0.9 renderers, per the [ADR-015](./docs/internal/adr/ADR-015-surface-and-route-derivation.md) addendum. Removed in a breaking change once a v1.0-capable renderer exists.
- **Renderer stream bypasses validation** — inbound ops that in-transit validation drops from `response.state` still reach the renderer through `response.a2uiMessages`, and so does the component state seeded by `createSurface.dataModel`, which is never validated. A fix must cover both paths.
- **Enforced action-payload typing at the renderer boundary** — the renderer hands `dispatchAction` a loosely typed action message, so per-component action typing is applied by convention (the consumer opts into the generated `XxxAction` types) rather than enforced at the boundary, per [ADR-016](./docs/internal/adr/ADR-016-inline-state-consumption-remove-remote-controller.md). Recoverable later if the package owns binding resolution.
- **Package rename** — deferred as low-stakes; the package remains `@coveo/thermidor`.

## Development

```bash
pnpm --filter @coveo/thermidor build      # build project
pnpm --filter @coveo/thermidor test       # run unit + property tests
pnpm --filter @coveo/thermidor test:dts   # validate public API surface (incl. DX type test)
```

## Architecture

See the [Architecture Guide](./docs/architecture.md) for the internal structure, and the accepted decisions of record in [`docs/internal/adr`](./docs/internal/adr).
