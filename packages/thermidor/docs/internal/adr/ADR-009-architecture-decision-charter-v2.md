---
status: Accepted
date: 2026-09-15
related:
  - ./ADR-000-architecture-decision-charter.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-011-session-serialization.md
  - ./ADR-012-client-owned-context.md
  - ./ADR-013-remote-controller-vending.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
  - ./ADR-015-surface-and-route-derivation.md
---

# Architecture Decision Charter (v2) — unified-endpoint session client

## 1. Purpose

This charter defines the criteria used to evaluate architecture and design
decisions for thermidor. It **supersedes ADR-000**.

ADR-000 assumed thermidor was a unified interaction _engine_ — one engine, N
interfaces, many feature controllers, a state library isolated behind an
abstraction. That assumption no longer holds (see ADR-010). Thermidor is now a
thin client for a **single, stateful, intent-routing unified endpoint**; UI is
defined by server-streamed, schema-described A2UI components, not by client-side
feature controllers. Most of ADR-000's requirements are therefore obsolete,
relocated to other parts of the system, or satisfied by construction. This
charter restates the criteria that actually govern decisions under the new
reality.

A decision is acceptable only if it satisfies all **MUST** requirements and
clearly addresses **SHOULD** requirements (RFC 2119).

## 2. Scope

Applies to:

1. Public API design of `@coveo/thermidor`.
2. Internal architecture and abstraction boundaries.
3. Runtime behavior against the unified endpoint (streaming, cancellation,
   session continuity, error handling).
4. SSR behavior and lifecycle, to the extent it is applicable (see §4).
5. Multi-deployment support (public endpoint + schema; internal endpoint +
   private-registry schema; proxied endpoint).

Explicitly **out of scope** (owned elsewhere): use-case coverage, component
catalogs and their contracts, and intent routing. These belong to the **unified
endpoint** and the **schemas**, not to thermidor.

## 3. Canonical Definitions

- **Public API surface**: all exported runtime behavior, types, options, and
  guarantees visible to consumers of `@coveo/thermidor`.
- **Session**: the client-side handle for one continuous interaction with the
  unified endpoint (see ADR-010).
- **Turn**: one input paired with the server's streamed result.
- **Component / contract**: a server-streamed A2UI renderable unit and its
  schema-declared state + actions. Owned by the schema, not thermidor.

## 4. Decision Requirements

### MUST

- **Faithful transmission and rendering**
  Thermidor **MUST** faithfully transmit consumer input (prompt, actions,
  context) to the endpoint and faithfully expose the server's streamed result for
  rendering. It **MUST NOT** attempt to own or reinterpret use-case behavior —
  full use-case support is _inherited_ from the endpoint and schemas, not provided
  by thermidor.

- **Public API independence**
  The public API **MUST NOT** leak implementation or transport concepts (state
  libraries, HTTP/SSE DTOs, backend request/response shapes). Under the new design
  this is largely satisfied by construction (no state library, no engine), but it
  remains a hard requirement: new code must not reintroduce leakage.

- **Best-in-class consumer DX**
  The public API **MUST** provide strong TypeScript intellisense: autocomplete and
  compile-time checking for component types, action names, and action payloads,
  plus typed component state — derived from the consumer-supplied schema. This is a
  primary driver (it was not a concern under ADR-000) and is a first-class
  acceptance criterion. See ADR-014 for the verified mechanism and the design rule
  that preserves it.

- **Consumer-owned inputs**
  Client-owned inputs (endpoint URL, contracts schema, navigator/commerce context)
  **MUST** be supplied by the consumer, not baked into the package. A single
  `@coveo/thermidor` **MUST** serve public, internal (private-registry), and
  proxied deployments without forking. See ADR-012 (context) and ADR-014 (endpoint
  and schema).

### SHOULD

1. **Conditional SSR**
   Where the endpoint routes to a **deterministic** (non-agentic) path, thermidor
   **SHOULD** support SSR. Where it routes to an **agentic** path, SSR is
   inappropriate (awaiting a full streamed agent response server-side is too slow)
   and **SHOULD** degrade to client-side rendering. **Open question**: how the
   client decides or is told which path a request will take early enough to make
   this determination. This is unresolved and expected to be settled in a dedicated
   ADR; it must not be assumed solved. Note this is a **long-standing** open item,
   not a new gap: SSR was already unresolved under ADR-000 (aspirational in ADR-002;
   the SSR snapshot proposal ADR-007 never advanced past `Proposed`). The v2 design
   preserves deterministic-route feasibility rather than regressing prior behavior.

2. **Simplicity and legibility**
   The package **SHOULD** stay small and obvious enough that correctness is easy to
   verify. Given the collapsed surface, this largely replaces the former
   "contribution readiness" and "migration simplicity" SHOULDs (see §7).

## 5. Non-Leakage Policy (Public API)

Unchanged in intent from ADR-000, and now enforced structurally.

**Prohibited public exposure**: state-library concepts/types; raw backend/transport
DTOs; public type identities that depend on internal plumbing.

**Required public exposure**: domain-level concepts (session, turn, component
state/actions); implementation-neutral contracts; stable behavior guarantees.

## 6. Acceptance Gates

A major decision is approved only if all applicable gates pass.

- **API gate** — No unintended public API changes; intentional ones reviewed and
  documented.
- **Leakage gate** — No prohibited implementation/transport concepts in the public
  contract.
- **DX gate** — Intellisense for component types, action names, payloads, and state
  is preserved end-to-end from the consumer-supplied schema (see ADR-014's design
  rule and failure mode).
- **Multi-deployment gate** — Public, internal, and proxied deployments remain
  supported by a single package (endpoint override + injected schema).
- **SSR gate** — For deterministic-route SSR claims, server-to-client lifecycle is
  documented and deterministic; agentic-route behavior degrades to client-side as
  specified.
- **Tradeoff gate** — If a SHOULD is not met, rationale and mitigation are recorded.

## 7. Requirements retired from ADR-000

Recorded explicitly so their absence is a decision, not an oversight:

- **Full use-case support (was MUST)** — Relocated, not dropped. Now owned by the
  endpoint + schemas; thermidor inherits it via faithful transmission/rendering.
- **Tree-shaking efficiency (was top SHOULD)** — Retired. The package is small
  enough that there is effectively nothing to shake; every realistic consumer uses
  essentially all of it. (Per-contract tree-shaking, where relevant, lives in the
  consumer's schema package, not thermidor.)
- **Migration simplicity (was SHOULD)** — Retired as a design driver. The concepts
  differ too fundamentally from current headless for the _design_ to ease
  migration; a clean break plus migration guides carries this instead.
- **External contribution readiness (was SHOULD)** — Retired. Triviality of the
  package makes it moot, and the substantive contribution surface has moved to the
  schemas and the backend.

## 8. Decision Priority Order

When requirements conflict, resolve in this order:

1. All **MUST** requirements (faithful transmission/rendering, public API
   independence, consumer DX, consumer-owned inputs).
2. Conditional SSR.
3. Simplicity and legibility.

## 9. Decision Record Template

Each major decision must include:

1. Decision statement
2. Context and constraints
3. Options considered
4. Chosen option and rationale
5. Impact on **MUST** requirements
6. Impact on **SHOULD** requirements
7. Risks and mitigations
8. Rollout and migration impact

## 10. Exit Criteria for Any Proposal

A proposal is ready to implement when:

1. All **MUST** requirements are satisfied.
2. Acceptance gates are defined and testable.
3. Known **SHOULD** gaps (notably conditional SSR) are documented with mitigation.
4. Decision record is complete and approved.

## Governed decisions

The unified-endpoint session-client family, all governed by this charter:

- [ADR-010](./ADR-010-unified-endpoint-session-client.md) — Collapse to a lean
  unified-endpoint session client (core: vision, options, trade-offs; the typed
  model and rationale are in its [model annex](./ADR-010-annex-model.md), and an
  illustrative current → target package structure in its
  [structure annex](./ADR-010-annex-structure.md)).
- [ADR-011](./ADR-011-session-serialization.md) — Session serialization &
  restoration.
- [ADR-012](./ADR-012-client-owned-context.md) — Client-owned context via
  providers.
- [ADR-013](./ADR-013-remote-controller-vending.md) — Remote controller vended
  from the session.
- [ADR-014](./ADR-014-consumer-supplied-endpoint-and-schema.md) — Consumer-supplied
  endpoint & injected schema (+ typing annex).
- [ADR-015](./ADR-015-surface-and-route-derivation.md) — Surface & route derivation
  (interim client-side; target server-surfaced).
