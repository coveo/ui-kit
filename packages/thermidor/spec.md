# Thermidor Session-Client Specification

> **Spec status**: This spec reflects the **shipped** session-client rework of `@coveo/thermidor`. The package was collapsed from an engine/interface/Redux/facade stack into a lean `createSession(config)` client per the accepted ADRs ([ADR-009](./docs/internal/adr/ADR-009-architecture-decision-charter-v2.md) charter v2 through [ADR-015](./docs/internal/adr/ADR-015-surface-and-route-derivation.md)). See the [Architecture Guide](./docs/architecture.md) for the internal structure.

## Overview

`@coveo/thermidor` is a framework-agnostic client for a single, stateful, intent-routing **unified converse endpoint**. The public surface is one factory, `createSession(config)`, returning a `Session` that exposes a plain observable list of `Turn`s folded from a server-sent-event (SSE) stream, plus a generic, schema-validated remote controller vended from the session.

The server streams schema-defined A2UI components; the client renders what the server sends. The contracts schema, the endpoint URL, and the ambient context are all consumer-injected, so one package build serves public, internal (private-registry schema), and proxied deployments.

> There is **no engine, no interface layer, no Redux/RTK, and no facades**. Any reference to those constructs describes what was removed, not the current package.

### Goals

1. **Lean session surface** — a single `createSession(config)` factory; no engine, interface, or state-library object reachable from the returned `Session`.
2. **Honest domain model** — each `Turn` exposes an input/response split with routing-neutral `state` and an optional agent facet, so UI is rendered from server-streamed A2UI without agent-specific assumptions.
3. **End-to-end typing** — the injected contracts schema threads unbroken to full intellisense for component types, action names, payloads, and state.
4. **Consumer-injected inputs** — contracts schema, endpoint URL, and context are supplied by the consumer, not bundled.
5. **Verifiable smallness** — a plain observable store and a pure fold replace the state library, and dead machinery is confirmed removed by Knip.

### Non-goals

- Server-surfaced typed routing / conditional-SSR route determination (deferred; the interim `response.surfaces` derivation and `'commerce-search'` literal are recorded debt retired by a future ADR-015 Option C).
- Implementing the `{ turnId }` historical-turn selector (only the reserved options-bag seam is provided).
- Renaming the package (deferred as low-stakes).

## Public surface

`createSession(config)` returns a `Session<TContracts>` exposing exactly these members (no engine, interface, or state-library object reachable):

| Member                                                   | Behavior                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `turns`                                                  | Readonly observable list of `Turn`s folded from the stream; empty before the first submit. |
| `subscribe(listener)`                                    | Invokes the listener once per turn-list change; returns an unsubscribe function.           |
| `submit({prompt})`                                       | While idle, opens a new `streaming` turn, POSTs a request, folds the response.             |
| `dispatchAction(action)`                                 | Dispatches a schema-validated remote action against the active turn.                       |
| `cancel()`                                               | Stops consuming the active stream, retains the partial response, marks the turn `error`.   |
| `retry(turnId)`                                          | Re-submits an `error` turn's input; no-op for unknown or non-error turns.                  |
| `serialize()`                                            | Serializes the transcript into a versioned `SerializedSession`.                            |
| `remoteController(componentId, componentType, options?)` | Vends a generic, schema-validated controller bound to the active turn.                     |

### Lifecycle rules

- While any turn is `streaming`, `submit` and `dispatchAction` are ignored and leave all turns unchanged.
- `cancel` during an in-flight request stops the stream, retains the partial `response`, and sets the active turn's `status` to `error`; when nothing is in flight it is a no-op.
- `retry(turnId)` re-submits only a turn whose `status` is `error`; any other `turnId` is a no-op.
- The factory creates each `Session` without singletons or module-level mutable state, so two sessions from identical config share nothing mutable.

## Domain model: Turn and TurnResponse

```typescript
interface Turn {
  id: string;
  input: {prompt?: string}; // prompt omitted for a prompt-less action turn
  response: TurnResponse;
  status: 'streaming' | 'complete' | 'error';
  error?: string; // present iff status === 'error'
}

interface TurnResponse {
  state: Record<string, unknown>; // routing-neutral, non-optional, defaults to {}
  activities: Activity[]; // ordered raw event log, defaults to []
  surfaces: DiscoveredSurface[]; // typed projection derived from activities
  agent?: {messages: AgentMessage[]; reasoningSteps: ReasoningStep[]}; // only when the router invoked an agent
}
```

- `turn.input.prompt` carries the submitted prompt; it is omitted for a turn created from a dispatched action with no prompt.
- `turn.response.state` is routing-neutral and always present, defaulting to `{}` and initialized from the first content event.
- `turn.response.activities` is an ordered list of the turn's raw events, preserving arrival order.
- `turn.response.surfaces` is a typed projection; each entry carries a non-empty `surfaceId` and a non-empty `rootComponentType`, and re-deriving it from `activities` yields a deeply-equal list.
- `turn.response.agent` is present only when the router invoked an agent for the turn.

> This replaces the superseded pre-rework shape. There is no `turn.prompt` and no `turn.agentResponse`; agent-specific content lives under the optional `turn.response.agent` facet, and routing-neutral `state` / `activities` live at the top of `response`.

## Observable store and pure fold

Session runtime state lives in a plain observable store holding `{ turns, activeTurnId, sessionId, sessionToken }` with `subscribe(listener) → unsubscribe`, notifying each subscriber exactly once per change. There is no Redux state library.

Each `TurnResponse` is constructed from the stream exclusively through the pure fold `foldActivity(previousTurn, activity) → nextTurn`, which maps each activity into `response.state`, `response.activities`, `response.surfaces`, and `response.agent.{messages,reasoningSteps}`. The fold is a pure reduction: folding the same activity sequence twice produces deeply-equal turns.

## Generic remote controller

`session.remoteController(componentId, componentType, options?)` returns a controller bound to the active turn's `response.state.components[componentId]`, validated against the injected contract for `componentType`:

- `state` is the validated component state, or `undefined` when the snapshot is missing or validates empty.
- It re-derives / re-validates on snapshot change and re-points when the active turn changes.
- `dispatch(action, payload)` validates the action name and payload against the contract, then forwards to `session.dispatchAction`. An unknown action or an invalid payload rejects before any network call.

The concrete `contracts` type threads unbroken from `createSession` through `Session` to `RemoteController`, so `componentType`, `dispatch` action names, `dispatch` payloads, and `state` are all typed at the call site (never `string`, `never`, or `unknown`). A compile-time DX type test pins the real schema and fails CI on any regression. `buildRemoteController`, `RemoteControllerSource`, and `selectRemoteControllerState` are internal and absent from the public exports.

## Consumer-injected inputs

- **Contracts schema** — `config.contracts` (a Zod v4 discriminated union) is the sole validation source for component state and action payloads. The package declares no dependency on any specific schema package and declares `zod` as a peer dependency, so validation runs through the single shared `zod` instance resolved by the injected schema.
- **Endpoint** — when `endpoint` is provided, the client POSTs to it verbatim (nothing appended). When absent, it resolves `https://{orgId}.org.coveo.com` and appends the fixed converse path `/api/preview/organizations/{orgId}/agents/commerce/agui/converse`; a missing/empty org fails before any network call.
- **Context providers** — `navigatorContextProvider` and `commerceContextProvider` are synchronous, read fresh per request. An absent commerce provider sends the structural-empty "absent" encoding; a present-but-empty provider sends `cart: []` distinguishably. Context is never serialized.

## Serialization and restoration

`serialize()` produces a versioned `SerializedSession` (integer `version >= 1`), distinct from the runtime `Turn` type. It persists `id`/`input`/`status`/`error` and `response.activities` for every turn, `response.agent.{messages,reasoningSteps}` for turns that have an agent, `response.state` for the active turn only, and session-level `sessionId`/`sessionToken`/`activeTurnId`. It never persists `response.surfaces`.

On restore (via `sessionToRestore`), `surfaces` is re-derived from persisted `activities`; a turn persisted mid-stream is downgraded to `error` (`'Stream was interrupted'`) preserving its partial response; non-active turns yield an empty `{}` state; an unsupported `version` is rejected without partially populating a session. `sessionId` / `sessionToken` serve only as continuity keys.

**Documented invariant**: persisting `response.state` for the active turn only is coupled to the reserved historical-turn selector. A guard test asserts a restored historical (non-active) turn yields `undefined` component state, so enabling `{ turnId }` without widening the persisted state scope fails that test.

## Recorded interim debt and out-of-scope items (not yet implemented)

- **Interim `response.surfaces` derivation** — surface derivation still hardcodes the `'commerce-search'` root-component-type literal, confined to a single location in the fold and annotated as interim per [ADR-015](./docs/internal/adr/ADR-015-surface-and-route-derivation.md). Retired by a future server-surfaced typed-routing ADR (ADR-015 Option C).
- **Reserved `{ turnId }` historical-turn selector** — `remoteController(id, type, {turnId})` accepts the options bag without error but always binds to the active turn; the historical-turn selector is reserved and unimplemented per [ADR-013](./docs/internal/adr/ADR-013-remote-controller-vending.md).
- **Package rename** — deferred as low-stakes; the package remains `@coveo/thermidor`.

## Verification criteria

The rework is validated when:

1. The package entry exposes exactly the session-client surface (`createSession`, `Session`, `Turn`/`TurnResponse`, `SessionConfig`, `SerializedSession`, `RemoteController`) with no store/slice/selector/thunk/reducer types and no raw transport DTO shapes.
2. Unit and property tests pass — fold determinism, serialize/restore round-trip, streaming→error downgrade, surface derivability, absent-vs-empty context, and the active-turn state-scope guard.
3. The compile-time DX type test passes as the acceptance gate for end-to-end typing.
4. Knip reports zero dead-export and zero unused-dependency findings after the legacy engine/interface/facade/RTK machinery is removed.
5. The sample consumer (`samples/thermidor/demo-schema-react`) is migrated in lockstep and its unit, property, integration, and type-check suites pass with a green build.

## Decisions of record

- [ADR-009](./docs/internal/adr/ADR-009-architecture-decision-charter-v2.md) — Architecture decision charter v2 (the governing charter).
- [ADR-010](./docs/internal/adr/ADR-010-unified-endpoint-session-client.md) — Collapse to a lean unified-endpoint session client (+ model and structure annexes).
- [ADR-011](./docs/internal/adr/ADR-011-session-serialization.md) — Session serialization & restoration.
- [ADR-012](./docs/internal/adr/ADR-012-client-owned-context.md) — Client-owned context via providers.
- [ADR-013](./docs/internal/adr/ADR-013-remote-controller-vending.md) — Remote controller vended from the session.
- [ADR-014](./docs/internal/adr/ADR-014-consumer-supplied-endpoint-and-schema.md) — Consumer-supplied endpoint & injected schema (+ schema-typing annex).
- [ADR-015](./docs/internal/adr/ADR-015-surface-and-route-derivation.md) — Surface & route derivation (interim client-side, target server-surfaced).
