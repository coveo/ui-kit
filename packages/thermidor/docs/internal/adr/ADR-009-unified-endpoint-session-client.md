---
status: Proposed
date: 2026-09-15
related:
  - ./ADR-010-architecture-decision-charter-v2.md
  - ./ADR-000-architecture-decision-charter.md
  - ./ADR-001-anti-corruption-layer.md
  - ./ADR-002-multi-interface-engine.md
  - ./ADR-003-facade-request-response.md
  - ./ADR-004-lazy-facade-resolvers.md
  - ./ADR-005-public-facing-abstractions.md
  - ./ADR-008-unified-sort-controller.md
---

# Collapse thermidor to a lean unified-endpoint session client

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

Two consequences follow, and the current code has already begun moving toward
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
[ADR-010](./ADR-010-architecture-decision-charter-v2.md), which supersedes ADR-000
and governs this decision.

## Decision Drivers

> This ADR is governed by **[ADR-010](./ADR-010-architecture-decision-charter-v2.md)**,
> the current charter, which supersedes ADR-000. The drivers below reflect ADR-010,
> not the obsolete ADR-000 requirements (multi-interface, tree-shaking, migration
> simplicity, contribution readiness).

- **Faithful transmission and rendering (charter MUST).** Full use-case support is
  *inherited* from the endpoint + schemas, not owned by thermidor; thermidor
  transmits input and exposes the server's streamed result for rendering.
- **Public API independence (charter MUST).** No state-library or transport DTO
  leakage — now satisfied largely by construction, but still a hard requirement.
- **Best-in-class consumer DX (charter MUST).** Intellisense for component types,
  action names, payloads, and typed state, derived from the consumer-supplied
  schema. A primary driver of this design (verified — see "Consumer-supplied
  endpoint and schema").
- **Consumer-owned inputs (charter MUST).** Endpoint URL, contracts schema, and
  context are supplied by the consumer; one package serves public, internal, and
  proxied deployments without forking.
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
  trivial). Smallest surface, best tree-shaking, pure factories for SSR. The model
  matches the actual contract: input in, server-routed result out.
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
endpoint, in place (same package, same `@coveo/thermidor-schema` pairing).

The public model is:

```ts
// SessionConfig (auth/org + context providers) is specified in the
// "Client-owned context" subsection under Implementation and Follow-up.
function createSession(config: SessionConfig): Session;

interface Session {
  readonly turns: readonly Turn[];
  subscribe(listener: () => void): () => void;
  submit(input: {prompt?: string}): Promise<void>;
  dispatchAction(action: RemoteAction): Promise<void>;
  cancel(): void;
  retry(turnId: string): void;
  serialize(): SerializedSession;

  // Vended remote controller. Binds to the ACTIVE turn's server state snapshot
  // (`response.state.components[componentId]`), schema-validated. The optional
  // options bag is a forward-compatible seam (see "Remote controller" below).
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

**Charter mapping ([ADR-010](./ADR-010-architecture-decision-charter-v2.md)):**

- **Faithful transmission and rendering (MUST):** The session transmits input and
  exposes the server's streamed result; use-case support is inherited from the
  endpoint + schemas, not owned here. (This is a bet that the collapse to the
  unified endpoint is permanent — recorded as the load-bearing assumption.)
- **Public API independence (MUST):** Strengthened. With no state library and no
  transport DTO in the surface, there is almost nothing to leak; the ADR-001
  anti-corruption boundary becomes near-trivial to hold.
- **Best-in-class consumer DX (MUST):** Met and verified — full intellisense for
  component types, action names, payloads, and state from the injected schema (see
  "Consumer-supplied endpoint and schema").
- **Consumer-owned inputs (MUST):** Endpoint URL, contracts schema, and context are
  supplied by the consumer; one package serves all deployments.
- **Conditional SSR (SHOULD, open):** `createSession` is a plain factory (no
  singletons, no module-level state); `serialize()` + restore cover hydration;
  request building is pure — so deterministic-route SSR is feasible. Agentic-route
  SSR is out of scope (too slow); the route-determination mechanism is unresolved
  and deferred to a dedicated ADR.
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
  consumers (see "Consumer-supplied endpoint and schema").
- **Negative:** Bets on the permanence of the single-endpoint model; a future
  return of client-owned controllers would require re-introducing a layer.
  Introduces domain vocabulary (`Session`, `Turn`, routing-neutral `response`)
  that must be documented.
- **Neutral:** This is an in-place collapse, not a new package. The package name is
  kept for now, but renaming is a deferred non-issue — the only consumers are the
  `samples/thermidor/*` projects we own, so a rename (to reflect "session client"
  rather than "engine") can happen at leisure and is orthogonal to this decision.
  The public schema (`@coveo/thermidor-schema`) is no longer a direct dependency but
  remains the schema public consumers pair with (now injected rather than imported).

## Implementation and Follow-up

- **Supersedes / deprecates:** This ADR supersedes the multi-interface direction.
  Mark **ADR-002 (multi-interface engine)**, **ADR-003 (facade request/response)**,
  and **ADR-004 (lazy facade resolvers)** as `Deprecated`, and mark the
  multi-interface portions of **ADR-005 (public-facing abstractions)** and
  **ADR-008 (unified sort controller)** as superseded by this record. The charter
  itself changed: **ADR-000 is `Deprecated`, superseded by
  [ADR-010](./ADR-010-architecture-decision-charter-v2.md)** (this ADR is governed
  by ADR-010). **ADR-001 (anti-corruption)** remains in force (and is now largely
  satisfied by construction).
- **Removed machinery:** Engine (RTK store, slice adoption), Interface +
  `Supports<F>` + facade resolvers + facade cache, the generative state port and
  its slice/actions/selectors, memoized selector factories.
- **Preserved:** SSE/stream/buffer/error-handling protocol code, the event-fold
  reducer logic (currently in the unified event dispatcher), schema-validated
  remote controllers reading `response.state` (now validating against *injected*
  contracts — see "Consumer-supplied endpoint and schema"), serialize/restore.
- **Dependency change:** `@coveo/thermidor` drops its dependency on
  `@coveo/thermidor-schema`; contracts are injected by the consumer. `zod` stays a
  peer dependency shared with whichever schema the consumer supplies.
- **Open follow-ups:**
  - Provide a framework-agnostic surface-discovery utility to replace the
    duplicated `deriveCommerceSurfaceId` / sample `findSurface` helpers.
  - Rewrite `spec.md`, `README.md`, and `docs/architecture.md` to describe the
    session-client model (they still describe earlier visions).
- **Validation:** `pnpm --filter @coveo/thermidor build` and `test`; Knip is
  already enforced for the package to prevent surface regrowth.
- **Review trigger:** Revisit if the unified endpoint splits into multiple
  client-driven endpoints or if thermidor-owned client controllers are
  reintroduced.

### Client-owned context

Each request to the unified endpoint carries context that the endpoint uses for
intent routing: ambient navigator data (`view.url`, `referrer`, `userAgent`,
`clientId`) and app-owned commerce data (`cart`, `pinnedProducts`, `source`,
`custom`). Today the request builder hardcodes these to empty/literal values;
there is no way to supply or update them. Context is the one piece of genuinely
client-owned, mutable input in this model — everything else is either
server-authoritative or a fold of server events.

**Ownership:** the consuming app owns cart and additional context in its own
store. Thermidor holds no context state of its own and never keeps a competing
copy, so there is no "which cart is authoritative" question.

**Mechanism — pull-based providers.** Context is supplied via synchronous
providers on `SessionConfig` and read at request-build time, not captured at
session creation:

```ts
interface SessionConfig<TContracts> {
  organizationId: string;
  accessToken: string;
  endpoint?: string;                                   // full override; see "Consumer-supplied endpoint and schema"
  contracts: TContracts;                               // injected component contracts (see same section)
  navigatorContextProvider?: () => NavigatorContext;  // ambient: view.url, referrer, userAgent, clientId
  commerceContextProvider?: () => CommerceContext;    // app-owned: cart, pinnedProducts, source, custom
}
```

The builder calls both providers per request and composes the payload. Because
context is read fresh on every `submit`/`dispatchAction`, "update context while
interacting with the session" is satisfied structurally — the provider returns
whatever the app's store currently holds; there are no setters and no
thermidor-side context state to keep in sync. `dispatchAction` needs no context
argument for the same reason (a dispatching component need not know cart state).

**Absent vs. empty (do not conflate):** send structural empties (`cart: []`,
etc.) only when a provider is *absent* (a purely conversational / non-commerce
consumer with no cart concept). When a provider is present and returns an empty
cart, send `cart: []` meaningfully — the router's intent decision may distinguish
"no commerce context" from "empty cart".

**Synchronous by design:** providers are sync, matching the existing
`navigatorContextProvider`. An async provider would force `submit` to await
context before starting the request, complicating streaming/cancel for a case
that likely does not exist (app stores are synchronously readable). If a genuine
async or one-off-override need arises, add an optional per-call
`submit({ prompt, context })` override rather than making the common path async.

**Not serialized:** context is never part of the serialized session. It reflects
the app's *current* world; a restored session must read today's context from the
app's store, not a stale snapshot. Using functions as providers excludes context
from the blob by construction (see below).

### Remote controller

The remote controller is **vended from the session** (`session.remoteController(id,
type)`) rather than built standalone. Rationale: every realistic consumer renders
a2ui components (there is no conversational-only consumer), so the tree-shaking
argument for a separate opt-in import does not apply here. Vending removes the
manual state-source wiring consumers do today (the `StateSourceProvider` /
`useStateSource` / passing a `RemoteControllerSource` everywhere) — the session
*is* the source.

- **Internalized:** `buildRemoteController`, the `RemoteControllerSource` type, and
  `selectRemoteControllerState` are no longer public. The vended method delegates
  to an internal `buildRemoteController({ source, ... })` that keeps the narrow
  `source` seam so the controller remains unit-testable against a fake source
  without a live session.
- **Explicit identity:** `componentId` and `componentType` stay required — the
  snapshot is a `components[componentId]` map; there is no inferable "current
  component". Auto-discovery is rejected (it would couple the session to the full
  component catalog and defeat per-contract tree-shaking).
- **Active-turn binding (documented behavior):** a vended controller reads the
  **active** turn's `response.state`, re-deriving and re-validating as the snapshot
  changes. It re-points when the active turn changes — desired for live rendering
  (always show the latest), but call it out in docs, since a controller created
  under turn 3 will reflect turn 5 once turn 5 is active.
- **Forward-compatible seam (not built now):** binding a controller to a *specific
  historical* turn is theoretically possible but has no current consumer. Reserve
  an options bag (`remoteController(id, type, { turnId? })`) so the capability can
  be added additively later. Do **not** implement `turnId` now.

**Coupling to serialization (must not be missed):** the active-turn default is
consistent with persisting `response.state` for the active turn only (see the
Serialization invariant below). A future `{ turnId }` selector for historical
turns is coupled to that invariant — enabling it **requires** persisting
`response.state` for the referenced turns. Adding turn selection without revisiting
persisted `state` scope would produce a restore-only bug: historical controllers
work on a live session (all turns' state is in memory) but return empty state on a
restored session (only the active turn's state was persisted).

### Consumer-supplied endpoint and schema

Thermidor must serve multiple deployments: public consumers on the Coveo unified
endpoint, an internal Command-console team on a different (internal) conversational
endpoint with contracts hosted in a private registry (JFrog), and public consumers
fronting the endpoint with a proxy. Two config inputs cover all of these without
forking the package.

**Endpoint — full override.** `endpoint` is a fully-overridable base/converse URL,
not a host that the client decorates with a fixed commerce path. This serves the
internal endpoint (different URL shape) and proxy consumers at once. (Confirm the
exact contract: "provide the full converse URL" vs. "provide a base"; today
`getOrganizationEndpoint` appends `/api/preview/.../agents/commerce/agui/converse`,
which the internal endpoint will not share.)

**Schema — injected, not imported.** Verified by tracing: only the remote
controller depends on `@coveo/thermidor-schema` (`remote-controller.ts` for
`ComponentContractsSchema` + `ComponentContracts`; its property test for
enumeration). Nothing in the session/streaming/fold/request path touches it. The
controller depends on a *shape*, not specific contracts: a Zod discriminated union
whose members expose `componentType` (discriminant literal), `state` (a schema to
`safeParse`), and `actions.shape[name].payload`.

Therefore **`@coveo/thermidor` drops its dependency on `@coveo/thermidor-schema`**
and accepts the contracts as input:

```ts
createSession({ ...config, endpoint, contracts: ComponentContractsSchema });
```

- `ComponentType` and `RemoteController<T>` become **generic over the injected
  contracts** (inferred via `z.infer` over the supplied discriminated union) rather
  than a hardcoded import. Public consumers and the sample pass
  `@coveo/thermidor-schema` (public npm); the Command team passes its JFrog-hosted
  schema. Each consumer installs its own schema from its own registry — an ordinary
  per-consumer install, no resolver trickery.
- **Structural compatibility confirmed:** the internal schema is produced by the
  same JSON-Schema → Zod-v4 pipeline, so it is structurally a discriminated union
  with the same member shape — injection is a drop-in, no adapter interface needed.
  `zod` is a peer dependency of the schema package, so both schemas share the
  consumer's single `zod` instance (no dual-instance parsing hazard).
- **Charter fit:** this *strengthens* public-API independence (ADR-010 MUST,
  ADR-001) — thermidor no longer bakes a specific contract catalog into its
  published surface — and directly serves the consumer-owned-inputs MUST.

**Rejected alternatives (both solve a coupling that need not exist):**

- *Declare the schema dependency twice, resolving in two registries* — mechanically
  fragile: a package has one dependency graph; registry resolution is an
  install-environment concern (`.npmrc` scope mapping), not something a published
  `package.json` can express two ways. Risks silent wrong-schema resolution and
  lockfile drift. Moot once the dependency is inverted (there is no schema dep to
  declare).
- *Two packages (`thermidor` + `thermidor-internal`) from one source* — duplicate
  publish pipelines, two version streams to keep in lockstep, standing drift risk —
  all to vary which schema is imported. It also does not fully solve the problem:
  the forked package would still import the JFrog schema, reintroducing the
  private-registry question inside the fork. Injection sidesteps it entirely because
  the *consumer* owns that install.

**Type ergonomics — verified.** DX (intellisense) is a top priority here:
consumers must get autocomplete on component types, action names, and payloads to
discover the API. This was prototyped against the real `typeof
ComponentContractsSchema` (beta.3) with `tsc`, and the result is:

- **Full intellisense is achievable and confirmed** when the concrete schema is
  pinned at `createSession(...)`. Verified: `createSession({ contracts:
  ComponentContractsSchema })` → `session.remoteController('cmp', 'next-actions-bar')`
  → `.dispatch('selectAction', { text, type: 'search' })` gives autocomplete on the
  component type, autocomplete on the action name (a real literal union, not
  `string`), a type-checked payload (wrong enum value errors), and typed `state`.

- **Load-bearing design rule:** `createSession` MUST be generic over the contracts
  type and infer it from the `contracts` argument, and that concrete `TContracts`
  MUST be threaded unbroken through `Session<TContracts>` →
  `remoteController<T>()` → `RemoteController<TContracts, T>`. As long as the
  concrete type flows from the argument to the `.dispatch` call site, action typing
  resolves.

- **Failure mode to avoid:** if any internal seam widens `TContracts` back to the
  bare `ContractsSchema` constraint (e.g., storing the schema as the constraint
  type and re-vending controllers from that), `keyof z.infer<…['actions']>`
  collapses to `never` and action-name typing is lost (state typing still survives,
  because it is a direct `z.infer` rather than a `keyof`). Do not erase the concrete
  schema type behind an internal generic boundary.

- **Constraint spelling (Zod v4):** the constraint is
  `z.ZodDiscriminatedUnion<ComponentContractSchema[]>` — a single tuple-of-options
  type argument, with members `z.ZodObject<{ componentType; state; actions }, z.core.$strict>`.
  This is the v4 shape; the v3 `ZodDiscriminatedUnion<'componentType', Options[]>`
  form does not match and must not be used.

### Serialization and restoration

Serialization never depended on Redux. Today `serialize()` reads plain values and
emits a plain, JSON-serializable object; `restore()` runs a pure transform
(`hydrateFromSerializedState`, including the streaming→error downgrade) and
overwrites state wholesale via a single `hydrateState` reducer that does
`return payload`. In the lean model the reducer and its selectors are replaced by a
direct assignment plus a subscriber notification. The parts that make restoration
work — a plain serializable state shape, the pure hydration transform, and the
server session id/token — are unchanged.

**Continuity vs. reconstruction.** The server session id and token are the
continuity keys: they let a restored session *continue* the same backend
conversation, and they MUST be persisted. They are not a reconstruction
mechanism — history is not replayed against the server (the endpoint is stateful
and intent-routing; replay is neither guaranteed idempotent nor supported).
Restored transcript content therefore comes entirely from the persisted blob.

**Serialized shape.** Use a distinct, versioned serialized type (not a
`SerializedTurn = Turn` alias, which silently couples the persistence format to
the runtime shape). Persist per the table below. Read scopes were verified against
the `demo-schema-react` sample.

| Field | Persist | Scope | Why |
| --- | --- | --- | --- |
| `id`, `input`, `status`, `error` | Yes | all turns | Identity/metadata; not derivable |
| `sessionId`, `sessionToken`, `activeTurnId` | Yes | session-level | Continuity keys + active pointer |
| `response.activities` | Yes | **all turns** | Transcript rendering source. Verified: `ConversationThread` re-scans every turn's activities for branch selection; `AgentResponseBlock` renders each turn via `getA2UIMessages(activities)` |
| `response.agent.messages`, `reasoningSteps` | Yes | all turns | Visible transcript; not derivable |
| `response.state` | Yes | **active turn only** | Live interactive server snapshot. Verified: `selectRemoteControllerState` reads only `activeTurn.…state`; no historical turn's `state` is read |
| `response.agent.surfaces` | No | — | Derivable from `activities`; only reader is streaming-skeleton computation, irrelevant to a restored (non-streaming) turn |

**Documented invariant (fragility to encode, not silently assume):** persisting
`response.state` for the active turn only is safe *only while live component state
is read exclusively on the active turn*. The specific trigger that would break this
is adding a historical-turn selector to the vended remote controller
(`remoteController(id, type, { turnId })`, see "Remote controller" above): enabling
it requires persisting `response.state` for the referenced turns. Do not add turn
selection without also widening persisted `state` scope. The conservative default
(persist `state` for all turns) costs only blob size.

**`surfaces` is redundant with `activities`.** The reducer folds a2ui-surface
activities into a stored `surfaces` field, but the render path ignores it and
re-folds from `activities` via `getA2UIMessages`; `surfaces` survives only to feed
streaming-skeleton computation. In the lean model, expose `surfaces` as a derived
getter over `activities` rather than stored state — which also removes it from the
serialization question entirely.

**Round-trip note.** `serialize`/`restore` must agree on the new
`{ input, response: { state, activities, agent? } }` turn shape, and the
streaming→error downgrade must set `status: 'error'` while preserving whatever
partial `response` had streamed in.
