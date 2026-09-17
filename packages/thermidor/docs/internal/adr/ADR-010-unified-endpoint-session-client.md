---
status: Proposed
date: 2026-09-15
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-annex-model.md
  - ./ADR-010-annex-structure.md
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
>
> The full public model (types), the per-field naming rationale, and the per-MUST
> charter mapping live in the [model annex](./ADR-010-annex-model.md) to keep this
> record focused on the decision and trade-offs. An illustrative current → target
> package structure is in the [structure annex](./ADR-010-annex-structure.md).

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
3. **Feature controllers are superseded by schema-defined components.** UI is now
   defined by server-streamed A2UI **components** whose contracts live in the
   schema — not by client-side per-feature controllers (`SearchBoxController`,
   `FacetController`, …). The client needs one generic, schema-validated **remote
   controller** rather than a catalog of per-feature controllers. This is _why_ the
   public surface collapses to a session plus a single generic remote controller.

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
  _inherited_ from the endpoint + schemas, not owned by thermidor; thermidor
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
endpoint, in place (same package). The public surface is a single `createSession`
factory returning a `Session` that owns the interaction lifecycle (submit /
dispatchAction / cancel / retry / serialize / subscribe) and vends a generic,
schema-validated remote controller. Its state is a plain observable list of
`Turn`s, each pairing an `input` with a `response` (`state` + `activities`, plus an
optional `agent` facet present only when the router invoked an agent).

The full typed model, the per-field naming rationale (why `Session`/`Turn`/
`response`, why `agent` is optional and routing-neutral), and the per-MUST charter
mapping are in the [model annex](./ADR-010-annex-model.md).

### Rationale (summary)

The model names the _contract_ (an input, a server-routed result) rather than one
of its outcomes (a "conversation"), which keeps it accurate for the common
commerce-routed case where no agent runs. Dropping the engine/interface/Redux
layers makes non-leakage structural rather than enforced, and the pure-factory
shape keeps deterministic-route SSR feasible. Full per-item rationale and the
charter mapping are in the [model annex](./ADR-010-annex-model.md).

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
  - Rewrite `README.md` and `docs/architecture.md` to describe the session-client
    model (they still describe earlier visions). The former standalone `spec.md` is
    retired rather than rewritten: `docs/architecture.md` plus the ADRs are the
    documentation of record, and the implementation and its property/type tests are
    the executable spec, so a fourth restatement only invited drift.
- **Validation:** `pnpm --filter @coveo/thermidor build` and `test`; Knip is
  already enforced for the package to prevent surface regrowth.
- **Review trigger:** Revisit if the unified endpoint splits into multiple
  client-driven endpoints or if thermidor-owned client controllers are
  reintroduced.
