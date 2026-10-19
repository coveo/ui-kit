---
status: Proposed
date: 2026-10-16
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-011-session-serialization.md
  - ./ADR-015-surface-and-route-derivation.md
  - ./ADR-016-inline-state-consumption-remove-remote-controller.md
  - thermidor-schema ADR-020 (session-level initialize action, session-wide surfaces, lookup actions)
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

- a session-level `initialize` action opens the session and creates its session-wide surfaces, one
  per capability the application places on the page;
- the first one is a suggestions surface whose root is the `QuerySuggestions` component;
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

The turn-scoped model is this package's own choice, and session-wide surfaces cannot live inside
it. A surface created by `initialize` would stop accepting actions as soon as the first prompt opens
turn 1.

## Decision Drivers

- **Faithful transmission and rendering (charter MUST).** Surfaces live as long as the producer and
  A2-UI say they do, not as long as the turn that created them.
- **Pre-prompt interaction.** A surface created before any prompt accepts actions.
- **Lookups.** A lookup never waits for, blocks or fails another action or turn. A newer lookup from
  the same component replaces the previous one.
- **Best-in-class DX (charter MUST).** Typed component state and typed actions are preserved.
- **Breaking changes are acceptable.** The package is experimental and published as `0.x`, where a
  minor release may break its API. Its only known consumers are internal: the in-repo samples. Each
  breaking change ships with a changeset that describes the migration.

## Considered Options

### Option A: keep surfaces per turn, and special-case the surfaces `initialize` creates

- **Summary:** pin the `initialize` turn's surfaces so they stay addressable. Dispatch looks in the
  active turn first, then in the pinned turn.
- **Pros:** the smallest change.
- **Cons:**
  - It leaves two lifetime models side by side.
  - It still disagrees with A2-UI and with the producer for every other surface.
  - It hard-codes those surfaces as a special case.

### Option B (selected): session-scoped surfaces

- **Summary:**
  - The session holds its live surfaces, keyed by surface id, from `createSurface` until
    `deleteSurface`, whichever run carried those messages.
  - Turns keep the transcript and record which surfaces each one created or updated.
  - Dispatch resolves the source component across the session's live surfaces.
  - Action results apply to the surfaces they target.
- **Pros:**
  - It matches A2-UI and the producer.
  - The surfaces `initialize` creates need no special case.
  - Earlier turns' surfaces become actionable again. Whether to grey them out becomes a renderer
    choice.
- **Cons:**
  - It is a broad internal change that touches the store, the fold, dispatch, serialization and the
    v0.9 renderer projection.
  - It breaks the public `Turn` and `TurnResponse` shapes.

### Option C: a separate session for the session-wide surfaces

- **Summary:** the application opens a second session for the surfaces around the conversation.
- **Pros:** it needs no change to surface scoping.
- **Cons:** it splits the conversation's state across two sessions, which `thermidor-schema`
  ADR-020 rejects for the contract.

## Decision Outcome

Adopt **Option B**.

### Surfaces

- The session exposes its live surfaces as a read-only collection keyed by surface id. Each entry
  carries its id, its root component type (ADR-015's typed projection, now held by the session) and
  its state.
- An application finds a session-wide surface by its root type: the producer mints surface ids, and
  a session holds at most one session-wide surface per root type (`thermidor-schema` ADR-020). It
  then renders that surface with A2-UI's standard renderer. For example, with names left to the
  implementation:

  ```tsx
  const suggestions = Object.values(session.surfaces).find(
    (surface) => surface.rootComponent === 'QuerySuggestions'
  );
  return suggestions ? <A2UIRenderer surfaceId={suggestions.surfaceId} /> : null;
  ```

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

### Components the application wires to its own UI

Some components work together with UI the application draws itself. The search box is application
UI, drawn at page load and never swapped, while the suggestions popover is the `QuerySuggestions`
component on its own session-wide surface.

- The popover is an ordinary A2-UI component. It gets its state through bindings, and dispatches
  through the normal action path. The session needs no accessor and vends no controller, so ADR-016
  holds.
- The application connects its input to the popover component through its own code, for example a
  React context. The popover component publishes its completions and a `fetchSuggestions`
  dispatcher, and the input uses them for keyboard navigation and to send queries.
- The input holds what is typed, including a query typed before the popover component exists. It
  sends its current value once the component exists, so only the latest query goes out.
- The session holds no pending lookup. Dispatching needs a source component, which does not exist
  yet, and in-progress input belongs on the renderer side anyway.

demo-schema-react implements this wiring as the reference pattern.

### Session-level actions

- `dispatchAction` accepts the schema's session-level actions, starting with `initialize`.
- `initialize` opens the session. Its run captures the session id and token, and creates the
  session's session-wide surfaces.
- The consumer dispatches it explicitly, typically at page load. The session does not send it on its
  own.
- The session enforces its order:
  - `initialize` runs at most once per session. A second dispatch gets the result of the first,
    instead of sending again.
  - While it is in flight, every other request waits until it settles. Otherwise a prompt sent
    before it completes would carry no token, and open a second session.
  - If it fails, the waiting requests proceed, and the first prompt opens the session.
- `initialize` stays optional. An application with no session-wide surfaces never dispatches it,
  and its first prompt opens the session, as it does today.
- A restored session does not dispatch it. The producer refuses an `initialize` that carries a
  session token, and the serialized session already holds its surfaces.
- Whether `submitPrompt` joins the schema's session-level actions is left to the prompt-submission
  ADR.

### Request lanes

| Lane                 | Members                                                    | Behavior                                                                                                                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prompts and gestures | `submitPrompt`, and component actions that are not lookups | One ordered queue. Each request waits for the one dispatched before it, so a prompt waits for in-flight gestures, and a gesture dispatched while a prompt streams waits for it. Nothing in it is aborted, except a prompt's stream by an explicit `cancel()`. |
| Lookups              | component actions the schema marks as lookups              | Sent at once, alongside any prompt or gesture. A new lookup from the same source component aborts the previous one. A lookup's error never fails a turn.                                                                                                      |
| Session              | `initialize`                                               | Sent first, at most once per session. Every other request waits until it settles.                                                                                                                                                                             |

The schema's lookup marker decides which lane a component action takes. Nothing in this package
hard-codes action names.

A prompt no longer preempts gestures. Today a prompt aborts in-flight gestures, because it rebuilds
the state they were refining. That held while earlier turns' surfaces became inert history. With
session-scoped surfaces, they stay live and actionable. A gesture aborted after the producer has
applied it would leave its surface showing stale state: for example, page 1 while the producer is on
page 2. Aborting never spared the producer any work either, since a request it has accepted runs to
its end. Gestures are short, gateway-local turns, so a prompt waits little behind them.

The split between lookups and everything else is permanent. The prompt and gesture behaviors are
not. They mirror the producer's current concurrency rule: one request at a time per session, with
a second request refused as `409 ACTION_IN_FLIGHT`. The producer may later queue prompts, and
possibly gestures, and resolve the queue itself. When it does:

- the session sends prompts and gestures at once, each with its per-session action sequence
  number, instead of queueing them itself;
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
  - Breaking changes to `Turn`, `TurnResponse`, `serialize` and the sample's surface stream. They
    ship in a minor `0.x` release with a changeset. The serialized format gets a new version, and
    a session serialized by an earlier version is migrated or cleanly refused on restore.
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

- **Overlapping runs are allowed.** A lookup's run can overlap a prompt's run on the same thread.
  - AG-UI only requires a run id that is unique within the thread, and validates event order per
    stream.
  - This package parses each stream on its own, so concurrent streams only need the request lanes
    above.
  - A lookup's run applies to the surfaces it targets, and never enters a turn's transcript.
  - The producer echoes the session token unchanged on follow-up requests, so concurrent streams
    never disagree on the session id and token.
  - The producer refuses a lookup that carries no session token. That is no constraint in practice:
    lookups target session-wide surfaces, which only exist once `initialize` has created the session.
- **Surface retention.** Decide with the producer whether superseded search surfaces are deleted, or
  capped, as a session grows.
- **Rendering earlier turns.** With every surface actionable, decide in the sample whether earlier
  results stay interactive or are greyed out.
- **Restore through `initialize`.** See `thermidor-schema` ADR-020's follow-up decisions.
