---
status: Proposed
date: 2026-09-15
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-013-remote-controller-vending.md
  - ./ADR-012-client-owned-context.md
---

# Session serialization & restoration

> Part of the unified-endpoint session-client family (core:
> [ADR-010](./ADR-010-unified-endpoint-session-client.md)), governed by the charter
> [ADR-009](./ADR-009-architecture-decision-charter-v2.md).

## Context and Problem Statement

The lean session model (ADR-010) must support serializing a `Session` and
restoring it later (persistence across reloads, SSR handoff). This ADR decides
what is persisted, at what scope, and why — and confirms that dropping Redux does
not threaten serialization.

## Decision

Serialization never depended on Redux. Today `serialize()` reads plain values and
emits a plain, JSON-serializable object; `restore()` runs a pure transform
(`hydrateFromSerializedState`, including the streaming→error downgrade) and
overwrites state wholesale via a single `hydrateState` reducer that does
`return payload`. In the lean model the reducer and its selectors are replaced by a
direct assignment plus a subscriber notification. The parts that make restoration
work — a plain serializable state shape, the pure hydration transform, and the
server session id/token — are unchanged.

**Continuity vs. reconstruction.** The server session id and token are the
continuity keys: they let a restored session _continue_ the same backend
conversation, and they MUST be persisted. They are not a reconstruction
mechanism — history is not replayed against the server (the endpoint is stateful
and intent-routing; replay is neither guaranteed idempotent nor supported).
Restored transcript content therefore comes entirely from the persisted blob.

**Serialized shape.** Use a distinct, versioned serialized type (not a
`SerializedTurn = Turn` alias, which silently couples the persistence format to
the runtime shape). Persist per the table below. Read scopes were verified against
the `demo-schema-react` sample.

| Field                                       | Persist | Scope                | Why                                                                                                                                                                                         |
| ------------------------------------------- | ------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`, `input`, `status`, `error`            | Yes     | all turns            | Identity/metadata; not derivable                                                                                                                                                            |
| `sessionId`, `sessionToken`, `activeTurnId` | Yes     | session-level        | Continuity keys + active pointer                                                                                                                                                            |
| `response.activities`                       | Yes     | **all turns**        | Transcript rendering source. Verified: `ConversationThread` re-scans every turn's activities for branch selection; `AgentResponseBlock` renders each turn via `getA2UIMessages(activities)` |
| `response.agent.messages`, `reasoningSteps` | Yes     | all turns            | Visible transcript; not derivable                                                                                                                                                           |
| `response.state`                            | Yes     | **active turn only** | Live interactive server snapshot. Verified: `selectRemoteControllerState` reads only `activeTurn.…state`; no historical turn's `state` is read                                              |
| `response.agent.surfaces`                   | No      | —                    | Derivable from `activities`; only reader is streaming-skeleton computation, irrelevant to a restored (non-streaming) turn                                                                   |

**Documented invariant (fragility to encode, not silently assume):** persisting
`response.state` for the active turn only is safe _only while live component state
is read exclusively on the active turn_. The specific trigger that would break this
is adding a historical-turn selector to the vended remote controller
(`remoteController(id, type, { turnId })`, see
[ADR-013](./ADR-013-remote-controller-vending.md)): enabling it requires persisting
`response.state` for the referenced turns. Do not add turn selection without also
widening persisted `state` scope. The conservative default (persist `state` for all
turns) costs only blob size.

**`surfaces` is redundant with `activities`.** The reducer folds a2ui-surface
activities into a stored `surfaces` field, but the render path ignores it and
re-folds from `activities` via `getA2UIMessages`; `surfaces` survives only to feed
streaming-skeleton computation. In the lean model, expose `surfaces` as a derived
getter over `activities` rather than stored state — which also removes it from the
serialization question entirely.

**Round-trip note.** `serialize`/`restore` must agree on the
`{ input, response: { state, activities, agent? } }` turn shape (ADR-010), and the
streaming→error downgrade must set `status: 'error'` while preserving whatever
partial `response` had streamed in.

**Context is not serialized.** Client-owned context (cart, navigator data) is
never part of the serialized session; a restored session reads today's context
from the app's store. See [ADR-012](./ADR-012-client-owned-context.md).

## Consequences

- **Positive:** Serialization is trivial (plain data + pure transform), independent
  of the state substrate; SSR handoff and reload persistence are supported;
  blob size is minimized by scoping `state` to the active turn.
- **Negative / risk:** The active-turn `state` scope is an invariant that couples to
  ADR-013; violating it silently produces a restore-only bug (empty historical
  component state after restore).
- **Neutral:** A versioned serialized type must be maintained separately from the
  runtime `Turn` shape.
