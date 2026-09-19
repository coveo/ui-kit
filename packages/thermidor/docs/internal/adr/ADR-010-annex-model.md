---
status: Proposed
date: 2026-09-15
related:
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-009-architecture-decision-charter-v2.md
---

# ADR-010 — Annex: public model, naming rationale, charter mapping

Supporting detail for [ADR-010](./ADR-010-unified-endpoint-session-client.md).
This annex holds the type/API detail and the per-item rationale that would
otherwise push the decision record to RFC depth. The decision and trade-offs live
in ADR-010; consult this annex for the shape and the "why" behind each choice.

## Public model

```ts
// SessionConfig (auth/org + context providers + injected contracts schema) is
// specified in ADR-012 (context) and ADR-014 (endpoint & schema).
function createSession(config: SessionConfig): Session;

interface Session {
  readonly turns: readonly Turn[];
  subscribe(listener: () => void): () => void;
  submit(input: {prompt?: string}): Promise<void>;
  dispatchAction(action: RemoteAction): Promise<void>;
  cancel(): void;
  retry(turnId: string): void;
  serialize(): SerializedSession; // see ADR-011

  // Vended remote controller (see ADR-013). Binds to the ACTIVE turn's server
  // state snapshot (`response.state.components[componentId]`), schema-validated.
  remoteController<T extends ComponentType>(
    componentId: string,
    componentType: T,
    options?: RemoteControllerOptions // reserved; empty today
  ): RemoteController<T>;
}

interface Turn {
  id: string;
  input: TurnInput;
  response: TurnResponse;
  status: 'streaming' | 'complete' | 'error';
  error?: string; // populated when status === 'error'
}

interface TurnResponse {
  // Server-authoritative UI state snapshot. Always present (defaults to {}).
  // Remote controllers read this. Present for commerce-routed and agent-routed
  // turns alike — it is not agent-specific.
  state: A2uiState;

  // Ordered raw event log for the turn. Always present. Surface discovery and
  // navigation read this. Not agent-specific.
  activities: Activity[];

  // Agent-specific content. Present ONLY when the router invoked an agent.
  agent?: {
    messages: AgentMessage[];
    reasoningSteps: ReasoningStep[];
    surfaces: A2UISurface[];
  };
}
```

## Naming rationale — the contract, not one outcome of it

- `Session` (not "conversation") captures the continuous, token-carrying nature
  of the interaction without implying dialogue. Routing may or may not produce
  agent content; the container should not presuppose it.
- `Turn` is the unit: one input and its streamed result. It is a familiar,
  idiomatic word for this shape. It carries a mild conversational connotation, but
  so does every credible alternative (`exchange`, `interaction`); none buys real
  routing-neutrality, so the most familiar word wins. The turn's shape — an
  explicit `input` paired with a `response` — is what makes it honest, not the
  noun.
- `response` groups the server-sent content and separates it from turn metadata
  (`id`, `input`, `status`, `error`). `status` governs the readiness of a single
  `response` object rather than a set of loose sibling fields.
- `status` is deliberately a three-way union (`streaming | complete | error`).
  Cancellation is not a fourth state: `cancel()` produces a terminal `error`
  turn (message `'Cancelled'`) because a cancelled turn shares every lifecycle
  property with a failed one (terminal, non-streaming, retryable, partial
  `response` retained). A separate `cancelled` status would widen the union
  without any branch acting on it. If a consumer ever needs to distinguish a
  user-initiated stop from a genuine failure, add a structured discriminator
  (e.g. an error `reason`) rather than a new status.
- `state` and `activities` are **routing-neutral** and live at the top of
  `response`. Verified against current usage: remote controllers read
  `state.components`, and navigation/surface-discovery reads `activities`, on both
  commerce-routed and agent-routed turns. Only `messages`, `reasoningSteps`, and
  `surfaces` are genuinely agent-specific, so they move under an optional `agent`
  facet. `agent?` optionality now means exactly "did the router invoke an agent" —
  the real distinction — instead of hiding non-agent state behind an agent-named
  object (the confusion in the pre-collapse `AgentResponse`).
- `state` is non-optional (`>= {}`): the current stream initializes it on the
  first content event and the remote controller already treats a missing snapshot
  as `{}`. Only the existence of a `response` at all is conditional (before the
  first event / after a clear).

## Charter mapping ([ADR-009](./ADR-009-architecture-decision-charter-v2.md))

- **Faithful transmission and rendering (MUST):** The session transmits input and
  exposes the server's streamed result; use-case support is inherited from the
  endpoint + schemas, not owned here. (This is a bet that the collapse to the
  unified endpoint is permanent — recorded as the load-bearing assumption.)
- **Public API independence (MUST):** Strengthened. With no state library and no
  transport DTO in the surface, there is almost nothing to leak; the ADR-001
  anti-corruption boundary becomes near-trivial to hold.
- **Best-in-class consumer DX (MUST):** Met and verified — full intellisense for
  component types, action names, payloads, and state from the injected schema (see
  [ADR-014](./ADR-014-consumer-supplied-endpoint-and-schema.md)).
- **Consumer-owned inputs (MUST):** Endpoint URL, contracts schema, and context are
  supplied by the consumer; one package serves all deployments (ADR-012, ADR-014).
- **Conditional SSR (SHOULD, open):** `createSession` is a plain factory (no
  singletons, no module-level state); `serialize()` + restore cover hydration
  (ADR-011); request building is pure — so deterministic-route SSR is feasible.
  Agentic-route SSR is out of scope (too slow); the route-determination mechanism
  is unresolved and deferred to a dedicated ADR.
- **Simplicity and legibility (SHOULD):** One object, one mental model; adding
  behavior does not require touching an engine or interface.
