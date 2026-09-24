---
status: Accepted
date: 2026-09-23
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-011-session-serialization.md
  - ./ADR-013-remote-controller-vending.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
  - ./ADR-015-surface-and-route-derivation.md
---

# Inline component-state consumption; remove the remote controller

> Part of the unified-endpoint session-client family (core:
> [ADR-010](./ADR-010-unified-endpoint-session-client.md)), governed by the charter
> [ADR-009](./ADR-009-architecture-decision-charter-v2.md). This ADR **supersedes**
> [ADR-013](./ADR-013-remote-controller-vending.md) (remote controller vending).

## Context and Problem Statement

[ADR-013](./ADR-013-remote-controller-vending.md) decided that a component reaches its
server-owned state and dispatches its actions through a session-vended _remote controller_
(`session.remoteController(id, type)`). The controller read the component's slice of the active
turn's `response.state` — an AG-UI `STATE_SNAPSHOT` / `STATE_DELTA` projection — indexed by
`componentId`, and exposed a per-node typed `dispatch`.

The KIT-6179 spike (recorded in Confluence) evaluated moving component state onto the A2-UI standard
and returned GO. On the contract side, the schema package now carries state inline through the A2-UI
data model (`thermidor-schema` ADR-011) and conforms the node to the flat adjacency-list shape
(`thermidor-schema` ADR-012). The client-side consequence is that the remote-controller model
ADR-013 describes no longer matches the code:

- State no longer arrives as an AG-UI snapshot the client indexes by `componentId`. It arrives via
  A2-UI `updateDataModel` operations under `/state/<id>` and reaches the renderer already resolved
  through `{ path }` bindings. There is no per-node state accessor to vend.
- Dispatch is no longer a per-node controller method. It is a single session entry point,
  `Session.dispatchAction`, wired to the renderer's action binding.

ADR-013 is therefore stale: it is an **Accepted** record describing a mechanism the package no longer
has. A decision record is needed both to document the new consumption model and to retire ADR-013
rather than let an accepted decision silently drift from the code (charter, ADR-009).

## Decision Drivers

- **Do not let an Accepted ADR misrepresent the code (charter MUST):** ADR-013's subject
  (`session.remoteController`, `buildRemoteController`, `RemoteControllerSource`) was removed; the
  record must be superseded, not left standing.
- **Standard alignment:** component data now travels through the A2-UI data model, so the client
  reads it the standard way rather than through an ad-hoc AG-UI snapshot bridge.
- **Public API independence / non-leakage (charter MUST):** the core stays framework-neutral and
  free of any concrete schema dependency; contracts are injected.
- **Best-in-class DX (charter MUST):** removing a per-node indirection should simplify the consumer,
  not shift new wiring onto it.

## Considered Options

### Option A: Keep the remote controller, adapt it to read the A2-UI data model

- **Summary:** Retain `session.remoteController(id, type)` but re-point it from the AG-UI snapshot to
  the A2-UI `/state/<id>` data model.
- **Pros:** No public-API removal; ADR-013 stays roughly valid.
- **Cons:** Preserves the exact indirection the new transport makes unnecessary — the renderer
  already receives resolved state through its `{ path }` bindings, so a per-node accessor is dead
  weight. Keeps duplicated identity (`componentId` + `componentType`) as props purely to drive a
  lookup that no longer exists. Contradicts the transport it wraps.

### Option B (selected): Remove the remote controller; consume resolved state + a single dispatch entry point

- **Summary:** Delete the public `RemoteController` API and its internal join. State arrives resolved
  in the renderer's `props` via `{ path }` bindings; actions go through one framework-neutral
  `Session.dispatchAction`. Contract validation is relocated (not removed): inbound `updateDataModel`
  ops are validated on the fold; outbound action payloads are validated in the private dispatch path.
- **Pros:** Removes a whole layer; no duplicated identity in props; a single dispatch seam the
  consumer wires with the one action binding its framework already provides; the core keeps no
  concrete schema dependency (contracts injected). Matches the transport (ADR-011/012 in the schema
  repo).
- **Cons:** Breaking change for any consumer using `session.remoteController`. Per-node action typing
  is no longer _enforced_ at the boundary (the renderer hands a `dispatch` typed loosely); the
  consumer applies the generated `XxxAction` types voluntarily (option C of the spike).

## Decision Outcome

Adopt **Option B**. Remove the remote controller from the public surface and consume component state
inline.

- **Removed (public + internal):** `session.remoteController`, `buildRemoteController`, the
  `RemoteControllerSource` type, and `selectRemoteControllerState`. The removal is guarded by an
  import-boundary test so the symbols cannot silently reappear.
- **State:** delivered to the renderer already resolved via A2-UI `{ path }` bindings against the
  data model that `updateDataModel` populates; no per-node accessor, no `useRemoteController`.
- **Actions:** dispatched through the single `Session.dispatchAction`, which unwraps the standard
  A2-UI client message, resolves the component discriminant from the active turn's surfaces, validates
  the payload against the injected Zod contract, and POSTs. It is fire-and-forget.
- **Validation relocated, not dropped:** inbound `updateDataModel` validation lives on the event fold;
  outbound action-payload validation lives in the private dispatch path.
- **Typing preserved:** per-component `XxxState` / `XxxAction` remain (contracts injected via
  `createSession({ contracts })`); the change moves validation and removes duplicated identity, it
  does not weaken the generated types.

This **supersedes [ADR-013](./ADR-013-remote-controller-vending.md)**; ADR-013 is marked Deprecated
and points here.

### Rationale

Option A would keep the indirection that the inline transport specifically eliminates: once the
renderer receives resolved state through its bindings, a session-vended per-node controller has
nothing left to do, and its `componentId` / `componentType` props are duplicated identity that only
existed to drive the old lookup. Option B aligns the client with the standard transport, removes a
layer rather than re-pointing it, and keeps the core injectable and framework-neutral. The cost —
voluntary action typing at the boundary — is the accepted trade-off of the spike's option C and is
recoverable later if the package owns resolution (spike option A, a separate future effort).

## Consequences

- **Positive:** One fewer layer; no duplicated identity in props; a single, framework-neutral dispatch
  seam wired with the consumer's existing action binding; the core imports no concrete schema.
- **Negative:** Breaking change for `session.remoteController` consumers. Action-payload typing at the
  renderer boundary is applied by convention (the consumer opts into `XxxAction`), not enforced.
- **Neutral:** State/action _transport_ shape is owned by the contract (`thermidor-schema` ADR-011 /
  ADR-012); this ADR concerns the client consumption model only.

## Implementation and Follow-up

- **Serialization invariant (ADR-011 / formerly cited via ADR-013):** persisting `response.state` for
  the active turn only remains correct — it now backs binding resolution for the active turn rather
  than a vended controller. The reserved historical-turn selector stays coupled to that invariant;
  references that previously pointed at ADR-013 for this coupling now point here.
- **Follow-up (spike option A):** having the package own binding resolution and expose a resolved view
  tree would let action typing be enforced again (an agnostic typed dispatch) and dissolve the frozen
  renderer's Zod shim. Scoped as its own spike; out of scope for this ADR.
