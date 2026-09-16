---
status: Proposed
date: 2026-09-15
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-011-session-serialization.md
  - ./ADR-012-client-owned-context.md
  - ./ADR-013-remote-controller-vending.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
  - ./ADR-000-architecture-decision-charter.md
  - ./ADR-001-anti-corruption-layer.md
  - ./ADR-002-multi-interface-engine.md
  - ./ADR-003-facade-request-response.md
  - ./ADR-004-lazy-facade-resolvers.md
  - ./ADR-005-public-facing-abstractions.md
  - ./ADR-008-unified-sort-controller.md
---

# Collapse thermidor to a lean unified-endpoint session client

> This is the **core** decision of the unified-endpoint session-client family,
> governed by the charter [ADR-009](./ADR-009-architecture-decision-charter-v2.md).
> Four concerns that follow from it are recorded in focused sibling ADRs so each
> can be reviewed and revisited independently:
>
> - [ADR-011](./ADR-011-session-serialization.md) — serialization & restoration
> - [ADR-012](./ADR-012-client-owned-context.md) — client-owned context
> - [ADR-013](./ADR-013-remote-controller-vending.md) — remote controller vending
> - [ADR-014](./ADR-014-consumer-supplied-endpoint-and-schema.md) — endpoint &
>   injected schema

## Context and Problem Statement

Thermidor was originally conceived as a unified interaction engine: one engine
supporting N interfaces (search, commerce, generative), each exposing many
controllers, with a state library isolated behind an abstraction and per-endpoint
facades resolved lazily. ADR-002 through ADR-005 and ADR-008 describe that world.

That vision has since changed. Thermidor now talks to a **single unified
endpoint** (`POST .../agents/commerce/agui/converse`). The endpoint performs
**intent routing**: given the request parameters (context, configuration), the
prompt, and backend-stored state, it decides whether a given input is handled as
a commerce request or an agentic request. The endpoint is **stateful** — it owns
conversational continuity via a session id and token that it returns on the
stream and the client echoes on the next request. Thermidor's own state exists
**only for rendering**: it accumulates the server's streamed result so UI
components can read it.

Three consequences follow, and the current code has already begun moving toward
them (see the `thermidor-trim-to-schema-demo` and `thermidor-remove-dead-hydration`
changesets):

1. The multi-interface / multi-facade machinery no longer has a reason to exist.
   There is one interface type and one endpoint. The surviving `Interface`,
   `Supports<F>`, facade resolvers, and facade cache resolve a single noop facade
   that nothing dispatches.
2. Because routing is a server decision, a result is **not inherently
   conversational**. The backend may return A2UI components for a commerce search
   page with no agent involved. Modeling the result as a "conversation" of "agent
   responses" is inaccurate for the common commerce-routed case.
3. **Feature controllers are superseded by schema-defined components.** The old
   vision had thermidor own a controller per feature (`SearchBoxController`,
   `FacetController`, `PaginationController`, …), each encapsulating that feature's
   state and API. That is no longer how UI is defined: the server streams A2UI
   **components** whose contracts (state shape + available actions) live in the
   schema (`@coveo/thermidor-schema` and its internal counterpart). The client no
   longer needs — and should not have — hand-written feature controllers; it needs
   one generic, schema-validated **remote controller** that binds any component to
   its server-owned state and exposes its schema-declared actions. Feature
   controllers were not trimmed for leanness; they were made obsolete by where UI
   definition moved (from client code to server-streamed, schema-described
   components). This is why the public surface collapses to a session plus a single
   generic remote controller rather than a catalog of per-feature controllers.

This ADR records the decision to collapse thermidor to the leanest client that
satisfies the charter for this single-endpoint reality, and defines the public
model that replaces the Engine → Interface → Controller → Action taxonomy. The
charter itself was rewritten in light of this collapse — see
[ADR-009](./ADR-009-architecture-decision-charter-v2.md), which supersedes ADR-000
and governs this decision.

## Decision Drivers

> This ADR is governed by **[ADR-009](./ADR-009-architecture-decision-charter-v2.md)**,
> the current charter, which supersedes ADR-000. The drivers below reflect ADR-009,
> not the obsolete ADR-000 requirements (multi-interface, tree-shaking, migration
> simplicity, contribution readiness).

- **Faithful transmission and rendering (charter MUST).** Full use-case support is
  *inherited* from the endpoint + schemas, not owned by thermidor; thermidor
  transmits input and exposes the server's streamed result for rendering.
- **Public API independence (charter MUST).** No state-library or transport DTO
  leakage — now satisfied largely by construction, but still a hard requirement.
- **Best-in-class consumer DX (charter MUST).** Intellisense for component types,
  action names, payloads, and typed state, derived from the consumer-supplied
  schema. A primary driver of this design (verified — see [ADR-014](./ADR-014-consumer-supplied-endpoint-and-schema.md)).
- **Consumer-owned inputs (charter MUST).** Endpoint URL, contracts schema, and
  context are supplied by the consumer; one package serves public, internal, and
  proxied deployments without forking (see [ADR-012](./ADR-012-client-owned-context.md)
  and [ADR-014](./ADR-014-consumer-supplied-endpoint-and-schema.md)).
- **Conditional SSR (charter SHOULD, open — but not a regression).** SSR is viable
  for deterministic routes and inappropriate for agentic routes; how the client
  determines the route early enough is unresolved (deferred to a dedicated ADR).
  This is **not a problem this design introduces**: SSR was already unresolved in
  the previous architecture — ADR-002 called it "aspirational / deferred" and the
  SSR snapshot proposal (ADR-007) never advanced past `Proposed`. This design keeps
  SSR feasible for the deterministic path (pure factory, serializable state, no
  singletons) and defers the routing-determination question, rather than
  regressing anything that previously worked.
- **Routing is a server concern.** The client cannot assume a result is agentic;
  agent content is one possible, optional facet of a result.
- **The server is authoritative.** Client state is a render cache of streamed
  results, not a source of truth. Continuity is real and client-visible (a
  scrollable history of turns), carried by a server session id/token.
- **UI is defined by schema components, not client controllers.** Renderable
  units are server-streamed A2UI components whose contracts live in the schema.
  The client's job is to bind components to their state and dispatch their
  declared actions generically — not to ship a controller per feature.
- **The protocol code is the valuable asset.** SSE parsing, buffering, stream
  reading, error handling, and schema-validated remote components are hard-won and
  should be preserved; the state-management scaffolding around them is not.

## Considered Options

### Option A: Keep the layered abstractions, slimmed to one interface

- **Summary:** Retain Engine / Interface / Controller, remove only the dead
  multi-facade parts, keep Redux behind the engine abstraction.
- **Pros:** Lowest churn; hedges for a future return of client-owned controllers.
- **Cons:** Preserves a state-library abstraction, an `Interface` layer, and a
  ~20-method state port to serve a single feature whose state is small and
  server-owned. Keeps the non-leakage burden that RTK imposes. The abstractions
  earn their keep only in a multi-interface world that no longer exists.

### Option B: Lean session client (selected)

- **Summary:** A single public `Session` object over the unified endpoint. No
  engine, no interface, no facades, no Redux. State is a plain observable list of
  turns folded from the SSE stream. A turn pairs the input that triggered it with
  the server's streamed response. Agent content is an optional facet of the
  response. Schema-validated remote controllers read the server state snapshot.
- **Pros:** No state-library or transport types can leak (non-leakage becomes
  trivial). Smallest surface, pure factories for SSR. The model matches the actual
  contract: input in, server-routed result out.
- **Cons:** Optimizes hard for "the unified endpoint is the world." If Coveo
  re-introduces client-driven, thermidor-owned controllers, this model would need
  to grow a new layer. Introduces less-familiar domain vocabulary that must be
  documented.

### Option C: A brand-new package with a new charter

- **Summary:** Leave thermidor as-is and build a fresh package.
- **Pros:** None that Option B lacks. (A "clean slate / no legacy naming" pro does
  **not** favor C: the only consumers of `@coveo/thermidor` today are the
  `samples/thermidor/*` projects, which we own, so Option B is equally free to
  rename the package, its exports, and its concepts, and to break at will. Renaming
  is not a reason to fork.)
- **Cons:** No real migration saved (private package, sample-only consumers), throws
  away decision history, and the substrate swap is behind interfaces that already
  exist. A rewrite's "nothing works yet" valley for no proportional benefit.

## Decision Outcome

Adopt **Option B**: collapse thermidor to a lean session client for the unified
endpoint, in place (same package).

The public model is:

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

### Rationale

**Naming reflects the contract, not one outcome of it.**

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

**Charter mapping ([ADR-009](./ADR-009-architecture-decision-charter-v2.md)):**

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

Option A was rejected because its abstractions are justified only by a
multi-interface future that no longer exists; keeping Redux retains the exact
leakage burden the charter fights. Option C was rejected because it saves no real
migration, discards decision history, and swaps a substrate behind interfaces that
already exist without proportional benefit.

## Consequences

- **Positive:** Dramatically smaller surface and internals; non-leakage becomes
  structural rather than enforced; the model matches the endpoint's actual
  behavior; protocol and schema-validation code is preserved. A single
  schema-agnostic package serves public, internal (private-registry), and proxy
  consumers (see [ADR-014](./ADR-014-consumer-supplied-endpoint-and-schema.md)).
- **Negative:** Bets on the permanence of the single-endpoint model; a future
  return of client-owned controllers would require re-introducing a layer.
  Introduces domain vocabulary (`Session`, `Turn`, routing-neutral `response`)
  that must be documented.
- **Neutral:** This is an in-place collapse, not a new package. The package name is
  kept for now, but renaming is a deferred non-issue — the only consumers are the
  `samples/thermidor/*` projects we own, so a rename (to reflect "session client"
  rather than "engine") can happen at leisure and is orthogonal to this decision.

## Implementation and Follow-up

- **Supersedes / deprecates:** This ADR supersedes the multi-interface direction.
  **ADR-002 (multi-interface engine)**, **ADR-003 (facade request/response)**, and
  **ADR-004 (lazy facade resolvers)** are `Superseded`, and the multi-interface
  portions of **ADR-005 (public-facing abstractions)** and **ADR-008 (unified sort
  controller)** are partially superseded by this record. The charter itself
  changed: **ADR-000 is `Deprecated`, superseded by
  [ADR-009](./ADR-009-architecture-decision-charter-v2.md)** (this ADR is governed
  by ADR-009). **ADR-001 (anti-corruption)** remains in force (and is now largely
  satisfied by construction).
- **Removed machinery:** Engine (RTK store, slice adoption), Interface +
  `Supports<F>` + facade resolvers + facade cache, the generative state port and
  its slice/actions/selectors, memoized selector factories.
- **Preserved:** SSE/stream/buffer/error-handling protocol code, the event-fold
  reducer logic (currently in the unified event dispatcher), schema-validated
  remote controllers reading `response.state` (see ADR-013 and ADR-014),
  serialize/restore (see ADR-011).
- **Downstream decisions:** serialization ([ADR-011](./ADR-011-session-serialization.md)),
  client-owned context ([ADR-012](./ADR-012-client-owned-context.md)), remote
  controller vending ([ADR-013](./ADR-013-remote-controller-vending.md)), and
  consumer-supplied endpoint & schema ([ADR-014](./ADR-014-consumer-supplied-endpoint-and-schema.md)).
- **Open follow-ups:**
  - Surface & route derivation: today the duplicated `deriveCommerceSurfaceId` /
    sample `findSurface` helpers reverse-engineer surface identity and route type by
    re-parsing raw `activities`. This is a protocol-gap workaround, not a permanent
    client responsibility — see [ADR-015](./ADR-015-surface-and-route-derivation.md)
    (interim: derive once in the fold and expose a typed `response.surfaces`; target:
    server-surfaced typed routing, coupled to the SSR route-determination ADR).
  - Rewrite `spec.md`, `README.md`, and `docs/architecture.md` to describe the
    session-client model (they still describe earlier visions).
- **Validation:** `pnpm --filter @coveo/thermidor build` and `test`; Knip is
  already enforced for the package to prevent surface regrowth.
- **Review trigger:** Revisit if the unified endpoint splits into multiple
  client-driven endpoints or if thermidor-owned client controllers are
  reintroduced.
