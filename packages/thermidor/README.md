# Coveo Thermidor

`@coveo/thermidor` is an experimental, framework-agnostic client for a single, stateful, intent-routing **unified converse endpoint**. It exposes one factory — `createSession(config)` — that returns a `Session`: a plain observable list of `Turn`s folded from a server-sent-event (SSE) stream, plus a generic, schema-validated remote controller vended from the session.

The package is private, experimental, and consumed only inside this monorepo (by `samples/thermidor/demo-schema-react`).

> There is **no engine, no interface layer, no Redux/RTK, and no per-endpoint facades**. The package was collapsed into this lean session client per [ADR-010](./docs/internal/adr/ADR-010-unified-endpoint-session-client.md). References to those layers in older revisions are obsolete.

## The idea

The server streams schema-defined [A2UI](https://github.com/google/A2UI) components; the client renders what the server sends. Thermidor's job is to transmit consumer input to the endpoint and fold the streamed result into an observable list of turns — it derives no use-case behavior beyond that fold. The contracts schema, the endpoint URL, and the ambient context are all consumer-injected, so a single package build serves public, internal (private-registry schema), and proxied deployments.

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

| Member                                                   | Purpose                                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `turns`                                                  | Readonly observable list of `Turn`s folded from the stream (empty initially).      |
| `subscribe(listener)`                                    | Registers a listener called once per turn-list change; returns an unsubscribe.     |
| `submit({prompt})`                                       | Opens a new streaming turn, POSTs the request, folds the response.                 |
| `dispatchAction(action)`                                 | Dispatches a schema-validated remote action against the active turn.               |
| `cancel()`                                               | Stops consuming the active stream, retains the partial response, marks it `error`. |
| `retry(turnId)`                                          | Re-submits an errored turn's input.                                                |
| `serialize()`                                            | Serializes the transcript into a versioned `SerializedSession`.                    |
| `remoteController(componentId, componentType, options?)` | Vends a generic, schema-validated controller bound to the active turn.             |

The concrete `contracts` type pinned at the `createSession` call site threads unbroken through `Session` into `remoteController`, so component types, action names, payloads, and state are all fully typed at the call site (no `string`, no `never`, no `unknown`).

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

## Remote controller

`session.remoteController(componentId, componentType)` returns a controller bound to the active turn's `response.state.components[componentId]`, validated against the injected contract for `componentType`:

- `state` — the validated component state, or `undefined` when the snapshot is missing or empty.
- `dispatch(action, payload)` — validates the action name and payload against the contract, then forwards to `session.dispatchAction`. Unknown actions and invalid payloads reject before any network call.
- `subscribe(listener)` — re-derives on snapshot change and re-points when the active turn changes.

## Injected schema, endpoint, and context

- **Contracts schema** — a consumer-injected Zod v4 discriminated union (`contracts`) is the sole source for component-state and action-payload validation. Thermidor declares `zod` as a peer dependency so validation runs through the single shared `zod` instance resolved by the injected schema; it declares no dependency on any specific schema package.
- **Endpoint** — when `endpoint` is provided, the client POSTs to it verbatim. When absent, it resolves `https://{orgId}.org.coveo.com` and appends the fixed converse path `/api/preview/organizations/{orgId}/agents/commerce/agui/converse`.
- **Context providers** — `navigatorContextProvider` and `commerceContextProvider` are synchronous functions read fresh per request. Context is never stored on the session and never serialized.

## Serialization

`session.serialize()` produces a versioned `SerializedSession` (integer `version >= 1`), distinct from the runtime `Turn` type. Pass it back as `sessionToRestore` in `createSession` to continue a conversation. `response.state` is persisted for the active turn only; `response.surfaces` is never persisted (it is re-derived from `activities` on restore); a turn persisted mid-stream is downgraded to `error` with `'Stream was interrupted'`, preserving its partial response.

## Recorded interim debt and out-of-scope items

The following are intentionally **not yet implemented** and are recorded as debt or deferred work:

- **Interim `response.surfaces` derivation** — surface derivation still hardcodes the `'commerce-search'` root-component-type literal, confined to a single location in the fold and annotated as interim per [ADR-015](./docs/internal/adr/ADR-015-surface-and-route-derivation.md). It is retired by a future server-surfaced typed-routing ADR (ADR-015 Option C).
- **Reserved `{ turnId }` historical-turn selector** — `remoteController(id, type, {turnId})` accepts the options bag without error but always binds to the active turn; the historical-turn selector is reserved and unimplemented per [ADR-013](./docs/internal/adr/ADR-013-remote-controller-vending.md).
- **Package rename** — deferred as low-stakes; the package remains `@coveo/thermidor`.

## Development

```bash
pnpm --filter @coveo/thermidor build      # build project
pnpm --filter @coveo/thermidor test       # run unit + property tests
pnpm --filter @coveo/thermidor test:dts   # validate public API surface (incl. DX type test)
```

## Architecture

See the [Architecture Guide](./docs/architecture.md) for the internal structure, and the accepted decisions of record in [`docs/internal/adr`](./docs/internal/adr) (ADR-009 charter v2 through ADR-015).
