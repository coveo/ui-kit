---
status: Proposed
date: 2026-10-16
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-011-session-serialization.md
  - ./ADR-015-surface-and-route-derivation.md
  - ./ADR-016-inline-state-consumption-remove-remote-controller.md
  - thermidor-schema ADR-020 (session-level initialize action, shell surface, lookup actions)
---

# Session-scoped surfaces, session-level actions and lookup actions

> Part of the unified-endpoint session-client family (core:
> [ADR-010](./ADR-010-unified-endpoint-session-client.md)), governed by the charter
> [ADR-009](./ADR-009-architecture-decision-charter-v2.md). This ADR **supersedes** the
> active-turn state scope of [ADR-011](./ADR-011-session-serialization.md), and **amends**
> [ADR-015](./ADR-015-surface-and-route-derivation.md) and
> [ADR-016](./ADR-016-inline-state-consumption-remove-remote-controller.md).

## Context and Problem Statement

`thermidor-schema` ADR-020 decides how query suggestions work. Three parts of that decision fall on
this package:

- a session-level `initialize` action opens the session and creates a session-wide shell surface;
- the shell surface hosts a `QuerySuggestions` component;
- `fetchSuggestions` is a _lookup_: it runs without waiting in line, and a newer one replaces an
  older one.

The session cannot support any of this today, because everything it knows about surfaces is scoped
to a turn:

- **Storage.** A turn's surfaces and state are derived from that turn's own `activities`. Nothing
  holds a surface across turns. When two turns emit the same surface id, they hold two independent
  copies, which the sample tells apart with turn-prefixed render ids.
- **Dispatch.** `dispatchAction` resolves the source component only in the active turn. It drops
  the action when there is no active turn, or when the component lives on an earlier turn's surface
  (ADR-016).
- **Results.** An action's run folds into the active turn. An update for a surface that this turn
  did not create is dropped from its state.
- **Serialization.** `response.state` is serialized for the active turn only (ADR-011).
- **Concurrency.** The session has one in-flight stream. Actions run one after another, are held
  back while a prompt streams, and are cancelled when a new prompt starts.

The producer and A2-UI disagree with that scoping. The gateway keeps every surface for the whole
session, and accepts actions on surfaces created in earlier turns. In A2-UI, a surface lives from
`createSurface` until `deleteSurface`, and recreating a live surface id is an error.

The turn-scoped model is this package's own choice, and the shell surface cannot live inside it. A
shell surface created by `initialize` would stop accepting actions as soon as the first prompt opens
turn 1.

## Decision Drivers

- **Faithful transmission and rendering (charter MUST).** Surfaces live as long as the producer and
  A2-UI say they do, not as long as the turn that created them.
- **Pre-prompt interaction.** A surface created before any prompt accepts actions.
- **Lookups.** A lookup never waits for, blocks or fails another action or turn. A newer lookup from
  the same component replaces the previous one.
- **Best-in-class DX (charter MUST).** Typed component state and typed actions are preserved.
- **Breaking changes are acceptable.** The package is private, and the only consumers are the
  in-repo samples.

## Considered Options

### Option A: keep surfaces per turn, and special-case the shell

- **Summary:** pin the `initialize` turn's surfaces so they stay addressable. Dispatch looks in the
  active turn first, then in the pinned turn.
- **Pros:** the smallest change.
- **Cons:**
  - It leaves two lifetime models side by side.
  - It still disagrees with A2-UI and with the producer for every other surface.
  - It hard-codes the shell as a special case.

### Option B (selected): session-scoped surfaces

- **Summary:**
  - The session holds its live surfaces, keyed by surface id, from `createSurface` until
    `deleteSurface`, whichever run carried those messages.
  - Turns keep the transcript and record which surfaces each one created or updated.
  - Dispatch resolves the source component across the session's live surfaces.
  - Action results apply to the surfaces they target.
- **Pros:**
  - It matches A2-UI and the producer.
  - The shell surface needs no special case.
  - Earlier turns' surfaces become actionable again. Whether to grey them out becomes a renderer
    choice.
- **Cons:**
  - It is a broad internal change that touches the store, the fold, dispatch, serialization and the
    v0.9 renderer projection.
  - It breaks the public `Turn` and `TurnResponse` shapes.

### Option C: a separate session for the shell

- **Summary:** the application opens a second session for its shell surface.
- **Pros:** it needs no change to surface scoping.
- **Cons:** it splits the conversation's state across two sessions, which `thermidor-schema`
  ADR-020 rejects for the contract.

## Decision Outcome

Adopt **Option B**.

### Surfaces

- The session exposes its live surfaces as session-level data. Each surface carries its id, its
  root component type (ADR-015's typed projection) and its state.
- A surface is added by `createSurface` and removed by `deleteSurface`. `updateComponents` and
  `updateDataModel` apply to the live surface with that id, whichever run, prompt or action, carried
  them.
- Each turn records the ids of the surfaces it created and updated, so a renderer can draw a surface
  inline where it first appeared.
- A turn's `activities` stay the transcript source.

### Dispatch and results

- `dispatchAction` resolves the source component among the session's live surfaces. It needs no
  active turn.
- An action's run applies its messages to the session's surfaces. It no longer folds into the active
  turn.

### Session-level actions

- `dispatchAction` accepts the schema's session-level actions, starting with `initialize`.
- `initialize` opens the session. Its run captures the session id and token, and creates the shell
  surface.
- The consumer dispatches it explicitly, typically at page load. The session does not send it on its
  own.
- Whether `submitPrompt` joins the schema's session-level actions is left to the prompt-submission
  ADR.

### Request lanes

| Lane     | Members                                       | Behavior                                                                                                                                                 |
| -------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prompts  | `submitPrompt`                                | One at a time. A prompt opens a turn and preempts any in-flight gesture.                                                                                 |
| Gestures | component actions that are not lookups        | Run in dispatch order. They are held back while a prompt streams.                                                                                        |
| Lookups  | component actions the schema marks as lookups | Sent at once, alongside any prompt or gesture. A new lookup from the same source component aborts the previous one. A lookup's error never fails a turn. |
| Session  | `initialize`                                  | Sent at once. It is expected before any other request.                                                                                                   |

The schema's lookup marker decides which lane a component action takes. Nothing in this package
hard-codes action names.

The split between lookups and everything else is permanent. The prompt and gesture behaviors are
not. They mirror the producer's current concurrency rule: one request at a time per session, with
a second request refused as `409 ACTION_IN_FLIGHT`. The producer may later queue prompts, and
possibly gestures, and resolve the queue itself. When it does:

- the session sends prompts and gestures at once, each with its per-session action sequence
  number, instead of holding them back or chaining them;
- a prompt stops preempting in-flight gestures. A gesture the producer has accepted is applied
  whether or not the client still listens, so aborting its stream only loses the result;
- each response still applies to the surfaces it targets, whenever it arrives, which session-scoped
  surfaces already guarantee.

Lookups need no change: they stay outside the turn slot, outside any queue, and take no sequence
number.

### Serialization

`serialize` persists the session's live surfaces and their state, replacing the active-turn-only
`response.state` of ADR-011. Restoring a session from the producer through `initialize` is a
follow-up decision in `thermidor-schema` ADR-020. When it lands, it may make this persisted state
unnecessary.

### Rationale

Option A keeps the mismatch with the producer and with A2-UI, and pays for it with a special case
that every later session-wide surface would extend. Option B removes the mismatch at its root. The
package's state then mirrors what the producer already holds, and the pieces that ADR-020 needs
(session-level actions, lookups) fit without exceptions. Option C is ruled out by the contract
decision.

## Impact on the Charter

- **Faithful transmission and rendering (MUST):** improved. Surface lifetime follows the producer
  and A2-UI, instead of being reinterpreted per turn.
- **Public API independence (MUST):** unchanged. Session surfaces are exposed as typed domain data,
  not as raw A2-UI messages.
- **Best-in-class DX (MUST):** preserved. Component state and action typing still derive from the
  injected contracts. Session-level actions are typed the same way.
- **Consumer-owned inputs (MUST):** unchanged.
- **Conditional SSR (SHOULD):** helped. `initialize` takes the deterministic path, with no agent, so
  a server can run it and hand the session to the client.
- **Simplicity (SHOULD):** mixed. The fold and the store grow a session-level layer. The sample loses
  its turn-prefixed render ids and its "only the active turn is interactive" rule.

## Consequences

- **Positive:**
  - Surfaces created before the first prompt, or in earlier turns, accept actions.
  - Lookups no longer contend with prompts or gestures.
  - The client model matches the producer's.
- **Negative:**
  - Breaking changes to `Turn`, `TurnResponse`, `serialize` and the sample's surface stream.
  - The mock converse service sends `createSurface` with the same search surface id every time a
    prompt hits its search template, and never deletes the earlier surface. That is invalid in A2-UI,
    where a live surface id cannot be created again. Today only per-turn scoping hides it, because
    each turn keeps its own copy. Session-scoped surfaces make the second `createSurface` collide
    with the first, so the mock must mint a new surface id per prompt, as the gateway does.
  - The session holds every live surface until it is deleted, and the producer does not delete
    search surfaces today. Memory grows with long sessions.
- **Neutral:** ADR-015's typed `surfaces` projection moves from the turn to the session. Its
  retirement condition (server-surfaced typing) is unchanged.

## Implementation and Follow-up

- **Overlapping runs.** A lookup's run can overlap a prompt's run on the same thread. AG-UI validates
  event order per stream, and this package parses each stream on its own. Confirm that the producer
  and AG-UI tooling accept the overlap.
- **Surface retention.** Decide with the producer whether superseded search surfaces are deleted, or
  capped, as a session grows.
- **Rendering earlier turns.** With every surface actionable, decide in the sample whether earlier
  results stay interactive or are greyed out.
- **Restore through `initialize`.** See `thermidor-schema` ADR-020's follow-up decisions.
