---
status: Accepted
date: 2026-09-15
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-011-session-serialization.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
---

# Remote controller vended from the session

> Part of the unified-endpoint session-client family (core:
> [ADR-010](./ADR-010-unified-endpoint-session-client.md)), governed by the charter
> [ADR-009](./ADR-009-architecture-decision-charter-v2.md).

## Context and Problem Statement

A2UI components render from server-owned state and dispatch schema-declared
actions. In the lean model (ADR-010) the client binds a component to its slice of
the active turn's `response.state` via a generic, schema-validated _remote
controller_. This ADR decides how that controller is obtained and what it binds
to.

## Decision

The remote controller is **vended from the session** (`session.remoteController(id,
type)`) rather than built standalone. Rationale: every realistic consumer renders
a2ui components (there is no conversational-only consumer), so the tree-shaking
argument for a separate opt-in import does not apply here. Vending removes the
manual state-source wiring consumers do today (the `StateSourceProvider` /
`useStateSource` / passing a `RemoteControllerSource` everywhere) — the session
_is_ the source.

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
- **Forward-compatible seam (not built now):** binding a controller to a _specific
  historical_ turn is theoretically possible but has no current consumer. Reserve
  an options bag (`remoteController(id, type, { turnId? })`) so the capability can
  be added additively later. Do **not** implement `turnId` now.

**Type ergonomics.** The vended controller preserves full intellisense (component
type, action name, payload, state) as long as the injected contracts type is
threaded unbroken from `createSession`. The mechanism and the failure mode are
specified in [ADR-014](./ADR-014-consumer-supplied-endpoint-and-schema.md).

**Coupling to serialization (must not be missed):** the active-turn default is
consistent with persisting `response.state` for the active turn only (see the
serialization invariant in [ADR-011](./ADR-011-session-serialization.md)). A future
`{ turnId }` selector for historical turns is coupled to that invariant — enabling
it **requires** persisting `response.state` for the referenced turns. Adding turn
selection without revisiting persisted `state` scope would produce a restore-only
bug: historical controllers work on a live session (all turns' state is in memory)
but return empty state on a restored session (only the active turn's state was
persisted).

## Consequences

- **Positive:** Best DX — no manual state-source wiring; single entry point
  (`createSession`); the controller cannot be paired with a mismatched source.
- **Negative:** Binds controller lifetime to the session (acceptable; a remote
  controller is meaningless without one). The active-turn re-pointing is a behavior
  consumers must understand.
- **Neutral:** The `{ turnId }` options seam is reserved but unimplemented; enabling
  it later is additive but coupled to ADR-011.
