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
  contracts: ComponentContractsSchema, // injected Zod v4 discriminated union
  navigatorContextProvider: () => getNavigatorContext(),
  commerceContextProvider: () => ({cart: getCart()}),
});

session.subscribe(() => render(session.turns));

await session.submit({prompt: 'show me running shoes'});
```

`createSession(config)` returns a `Session` exposing exactly:

| Member                    | Purpose                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `contracts`               | The injected contracts schema this session validates against (readonly).           |
| `turns`                   | Readonly observable list of `Turn`s folded from the stream (empty initially).      |
| `subscribe(listener)`     | Registers a listener called once per turn-list change; returns an unsubscribe.     |
| `submit({prompt})`        | Opens a new streaming turn, POSTs the request, folds the response.                 |
| `dispatchAction(message)` | The single action entry point, wired directly as the renderer's `onAction`.        |
| `cancel()`                | Stops consuming the active stream, retains the partial response, marks it `error`. |
| `retry(turnId)`           | Re-submits an errored turn's input.                                                |
| `serialize()`             | Serializes the transcript into a versioned `SerializedSession`.                    |

The concrete `contracts` type pinned at the `createSession` call site threads unbroken through `Session`, so component types, action names, and payloads stay fully typed at the call site (no `string`, no `never`, no `unknown`).

## Dispatching actions

`session.dispatchAction` is the single consumer-facing action entry point. It accepts the standard A2-UI client-to-server message (`A2uiClientMessage`) that the frozen renderer hands to its `onAction` handler, so it wires with no adapter:

```typescript
<A2UIRenderer onAction={session.dispatchAction} /* … */ />
```

Given a message, `dispatchAction` unwraps its `userAction`, recovers the dispatching component's discriminant from the active turn's surfaces, validates the action payload against the component's injected contract internally, and — on success — POSTs the action to the converse endpoint.

It is **fire-and-forget**: the returned Promise always resolves and never rejects, so the consumer needs no `.catch`. A message with no `userAction`, no `sourceComponentId`, a node that resolves to no component, or an internal validation failure is dropped with a dev-only warning and nothing is sent.

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
  state: Record<string, unknown>; // routing-neutral, non-optional, defaults to {}
  activities: Activity[]; // ordered raw event log, defaults to []
  surfaces: DiscoveredSurface[]; // typed projection derived from activities
  agent?: {messages: AgentMessage[]; reasoningSteps: ReasoningStep[]}; // present only when the router invoked an agent
}
```

`state` and `activities` are routing-neutral and always present. `agent` appears only when the router invoked an agent for the turn. Consumers read `turn.input.prompt`, `turn.response.state`, `turn.response.activities`, `turn.response.surfaces`, and `turn.response.agent?.messages` / `turn.response.agent?.reasoningSteps`.

## Validation and displayed values

- **Client-side validation is retained, transparently.** The injected `contracts` schema stays the sole validation source, but the consumer never runs Zod and writes no adapter glue. Inbound `updateDataModel` state is validated on the fold; outbound action payloads are validated in the private dispatch path before the POST. Both boundaries live inside the core.
- **Displayed-value formatting is agent-produced.** The renderer shows the state it receives through its `{ path }` bindings; Thermidor does not reformat displayed values.

## Injected schema, endpoint, and context

- **Contracts schema** — a consumer-injected Zod v4 discriminated union (`contracts`) is the sole source for component-state and action-payload validation. Thermidor accepts it through a structural typing seam (`ContractsSchema` / `ComponentContractSchema` / `ParsableSchema`), so it declares no dependency on any specific schema package. It declares `zod` as a peer dependency so validation runs through the single shared `zod` instance resolved by the injected schema.
- **Endpoint** — when `endpoint` is provided, the client POSTs to it verbatim. When absent, it resolves `https://{orgId}.org.coveo.com` and appends the fixed converse path `/api/preview/organizations/{orgId}/agents/commerce/agui/converse`.
- **Context providers** — `navigatorContextProvider` and `commerceContextProvider` are synchronous functions read fresh per request. Context is never stored on the session and never serialized.

## Serialization

`session.serialize()` produces a versioned `SerializedSession` (integer `version >= 1`), distinct from the runtime `Turn` type. Pass it back as `sessionToRestore` in `createSession` to continue a conversation. `response.state` is persisted for the active turn only; `response.surfaces` is never persisted (it is re-derived from `activities` on restore); a turn persisted mid-stream is downgraded to `error` with `'Stream was interrupted'`, preserving its partial response.

## Recorded interim debt and out-of-scope items

The following are intentionally **not yet implemented** and are recorded as debt or deferred work:

- **Interim `response.surfaces` derivation** — `surfaces` is a typed projection derived from `activities` in the fold, annotated as interim per [ADR-015](./docs/internal/adr/ADR-015-surface-and-route-derivation.md); each entry's `rootComponentType` is compared against the `'CommerceSearch'` literal by consumers/nav rather than by the core. It is retired by a future server-surfaced typed-routing ADR (ADR-015 Option C).
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
