---
status: Accepted
date: 2026-10-23
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-011-session-serialization.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
  - ./ADR-015-surface-and-route-derivation.md
  - ./ADR-016-inline-state-consumption-remove-remote-controller.md
  - ./ADR-018-annex-session-shell-in-code.md
  - thermidor-schema ADR-021 (session shell)
---

# Session-scoped surfaces and automatic initialization

This ADR amends [ADR-015](./ADR-015-surface-and-route-derivation.md) (a surface lives in the
session, not in the turn that created it),
[ADR-016](./ADR-016-inline-state-consumption-remove-remote-controller.md) (dispatch resolves a
component across the session's live surfaces) and
[ADR-011](./ADR-011-session-serialization.md) (live state is persisted per session).
[The annex](./ADR-018-annex-session-shell-in-code.md) shows the effect in code.

## Context and Problem Statement

`thermidor-schema` ADR-021 decides how query suggestions work for the EAP:

- A session opens with an **`initialize`** action. It is declared on the `SessionShell` component
  but sent before any component exists, so it carries no surface id or source component.
- The producer answers with a standard `createSurface`. The surface's root is a `SessionShell`, and
  its first child is a `SearchBox` that holds a `QuerySuggestions` node.
- The surface lives for the whole session. Later turns add or remove its children with
  `updateComponents`, and write its state with `updateDataModel`.
- `fetchSuggestions` is an ordinary action. It goes through the producer's turn slot, which answers
  a concurrent request with `409 ACTION_IN_FLIGHT`.

The session cannot support this today:

- **No session-level dispatch.** `submitPrompt` is the only dispatch that needs no component, and
  it always opens a turn.
- **Surfaces belong to turns.** A turn's surfaces, data model and A2-UI messages are derived from
  its own `activities` (ADR-015). An operation on a surface that an earlier turn created fails
  in-transit validation, because the turn's node registry does not know the surface.
- **Dispatch needs the active turn.** `dispatchAction` resolves the source component only in the
  active turn's surfaces (ADR-016). Once a later prompt opens a turn, an earlier surface's
  components stop accepting actions.
- **Integrations patch around it.** demo-schema-react's `buildSurfaceStream` re-addresses later
  turns' operations to the turn that created the surface, and maps render ids back to server ids
  on every action. That only fixes rendering. Dispatch and validation still fail.

The producer and A2-UI already scope surfaces to the session, from `createSurface` to
`deleteSurface`. The session is the outlier.

## Decision Drivers

- **Faithful transmission and rendering (charter MUST).** Every A2-UI message reaches the renderer
  as the producer sent it, whichever run carried it.
- **No new concepts for the application.** Opening the session and the shell's lifetime are the
  session's business. An application renders surfaces as it does today.
- **The suggestions work everywhere.** The search box is created once, takes actions in every
  turn, and is never re-created by a later run.
- **No client-side queue.** The session keeps sending one request at a time and withholding the
  rest. A renderer that needs its latest intent sent waits for the session to be free.
- **A small public API.** Breaking changes are acceptable: the package is published as `0.x`, and
  each change ships with a changeset that describes the migration.

ADR-017, now withdrawn, aimed higher, and two of its drivers are softened for the EAP:

- **First paint.** The search box no longer exists before the producer answers. The application
  draws a disabled box until the shell arrives. The swap is safe because the shopper cannot have
  typed in a disabled box.
- **Lookups.** Suggestions no longer run alongside other requests: they wait for the request in
  flight, including a prompt's streaming answer.

## Decision Outcome

Adopt session-scoped surfaces, with `initialize` sent by the session itself and held at session
level. Option D below.

### Automatic initialization

- **Sent by `createSession`.** The session sends `initialize` as soon as it is created, deferred by
  a microtask so that a listener subscribed in the same task sees it start. On the wire it is
  `action: {name: 'initialize', context: {}}`: it has an envelope type of its own, without
  `surfaceId` and `sourceComponentId`, which stay required for every other action.
- **At most once by itself.** A session created with its keys (`sessionId` and `sessionToken`)
  sends it carrying them: the Agent Gateway resumes that session and rebuilds its shell, or starts
  a new one with new keys, which the session adopts. For a restored session, see
  [the amendment](#amendment-restoring-a-session-through-initialize).
- **An ordinary request.** It goes through the one-request rule and the conflict retry (both
  amended below), and it
  adopts the session id and token from its run, like a prompt. While it is in flight,
  `session.request` is `{kind: 'initialize'}`, so an application can draw its disabled search box
  from the request it already observes.
- **Held at session level.** Its run is recorded as `session.initialization`, with `activities`,
  `status` and `error`, in the same vocabulary as turns. It is not a turn, so it never appears in
  `session.turns`.
- **Failure.** A failed `initialize` leaves no token and no shell, and the session does not retry
  it beyond the conflict retry (amended below). The first prompt still opens the session. An
  application reads `session.initialization.status` to stop waiting for the shell.
- **Opt-out.** `createSession({initialize: false})` sends nothing, for tests and for a server that
  creates a session while rendering.

### Session-scoped surfaces

The session derives its surfaces from one ordered activity log: the initialization's activities,
then each turn's activities, in order. Since the session sends one request at a time, that order
is the order in which the operations arrived.

- **Lifetime.** A surface lives from its `createSurface` until its `deleteSurface`, whichever runs
  carry them. A `createSurface` for a live id replaces that surface, as in A2-UI. So a producer
  mints a new id for each new surface.
- **Validation.** Inbound `updateDataModel` operations are validated against a node registry that
  spans the session.
- **Dispatch.** `dispatchAction` resolves `(surfaceId, sourceComponentId)` in that session-wide
  registry. An action needs a live source surface, not an active turn.
- **Recording.** An action's run is recorded with the active turn's activities, which form the
  transcript, or with the initialization before the first turn. Either way, its operations apply
  to the session's surfaces.
- **Failures.** A failed action on a surface that the active turn did not create sets
  `session.actionError`, and leaves the turn as it is. A failed suggestion never fails an answer.
  [Amended](#amendment-an-action-never-changes-a-turns-status): this now holds for every action.

### What the session exposes

| Public field                            | Change                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `session.surfaces` (new)                | Every live surface, in creation order, as `DiscoveredSurface`. Includes the shell.            |
| `session.a2uiMessages` (new)            | The session's whole renderer stream, in arrival order. It only grows: feed each new one once. |
| `session.state` (new)                   | The validated data model of every live surface, keyed by surface id.                          |
| `session.initialization` (new)          | The `initialize` run, or `undefined`.                                                         |
| `TurnResponse.surfaces`                 | Narrowed to the live surfaces this turn created, so a transcript knows where to draw them.    |
| `TurnResponse.a2uiMessages` and `state` | Removed: they are now session-wide.                                                           |

An application finds the shell in `session.surfaces` by its root component type, `SessionShell`, as
ADR-015's interim projection already allows, and renders it with
`<A2UIRenderer surfaceId={shell.surfaceId} />`.

### Query suggestions in the renderer

`fetchSuggestions` is an ordinary action, and the session withholds it while a request is in
flight. The renderer that draws the search box makes sure the latest query is sent, and that a
submit is never withheld behind a suggestion:

- **Debounce**, then dispatch `fetchSuggestions`.
- **Latest when free.** If the session is busy, keep only the latest query, and dispatch it once
  `session.request` clears, unless it is the query last sent.
- **Submit.** If the request in flight is a `fetchSuggestions`, call `session.cancel()`, wait for
  `session.request` to clear, then dispatch `submitPrompt`. The cancelled request may still hold
  the producer's turn slot, so the prompt may get a `409`, which the conflict retry absorbs.

demo-schema-react implements both as small helpers. Its facet search reuses the first one in place
of its polling.

What the page shows while `initialize` is in flight, such as a disabled search box, is the
application's choice. demo-schema-react is the reference. The session synthesizes no surface.

### Serialization

The serialized format moves to version 2. It persists the initialization's activities, every
turn's activities and the session-wide `state`, which replaces ADR-011's active-turn-only `state`.
`surfaces` and `a2uiMessages` are still derived on restore. A version-1 blob is rejected, as any
unsupported version already is.

## Impact on the Charter

- **Faithful transmission and rendering (MUST):** improved. Operations on earlier surfaces reach
  the renderer and are validated, rather than being redirected or dropped.
- **Public API independence (MUST):** unchanged. The session exposes the same derived projections,
  at session level.
- **Best-in-class DX (MUST):** improved. The application does not open the session, and feeds one
  renderer stream. Suggestions need a few lines of renderer code to send the latest query.
- **Simplicity (SHOULD):** improved overall. One activity log replaces per-turn projections and
  the integrations' redirects, and the session gains no queue.

## Consequences

- **Positive:**
  - The application renders the shell like any surface; `initialize` needs no code of its own.
  - The shell's search box takes actions in every turn, and earlier turns' surfaces stay
    interactive.
  - demo-schema-react drops `buildSurfaceStream` and `toServerAction`.
- **Negative:**
  - The changes to `TurnResponse` and the serialized format break integrations, which must migrate.
  - Suggestions wait while a prompt streams.
  - The page shows a disabled search box until `initialize` answers.
  - Every created session sends a request, even when the shopper never types.
  - Each renderer that needs its latest intent sent writes the wait itself.
- **Neutral:**
  - A producer that reuses a surface id across prompts now replaces the earlier surface. The mock
    converse service must mint a new id per prompt.

## Implementation and Follow-up

- **One changeset** (`'@coveo/thermidor': minor`, marked **Breaking:**) covers automatic
  initialization, the session-level fields, the narrowed `TurnResponse` and serialized format
  version 2.
- **Restore through `initialize`:** decided in
  [the amendment below](#amendment-restoring-a-session-through-initialize).
- **First paint and concurrent suggestions:** if the EAP shows that the disabled box or the waiting
  suggestions hurt, revisit Option A or a queue in the producer.
- **Surface retention:** a long session accumulates live surfaces until the producer deletes them.
  How many to keep is a separate decision.

## Amendment: an action never changes a turn's status

Accepted on 2026-10-26, in review of its implementation (KIT-6430).

The failure rule above left an action on a surface of the active turn to fail that turn, and its
run to set the turn's status. A turn that failed after its blocks arrived then flipped back to
`complete` on the next page change, losing its error and its retry, and a failed page change
replaced the turn's own error.

- **Rule.** Only the request that opened a turn changes its status: a prompt, or `retry`. Any
  other action folds only its surface snapshots into the active turn, never its lifecycle events or
  its text, whichever turn created its surface.
- **Failures.** A failed action, rejected, ending in `RUN_ERROR` or without a terminal event, or
  whose request cannot be built, sets `session.actionError` and leaves every turn as it is.
- **`actionError`.** It identifies the action (`ActionError`: `message`, `component`, `name`,
  `surfaceId`, `sourceComponentId`), so a consumer shows the failure next to the block it came from, and tells a
  failed suggestion from a failed page change.

## Amendment: restoring a session through `initialize`

Accepted on 2026-11-17 (KIT-6651). A restored session never sent `initialize`, so it had no live
shell and its search box stayed disabled. The Agent Gateway now resumes a session from its keys on
`initialize`, with a new shell, or starts a new session when the keys name none.

- **Resume.** A session restored with a `sessionToken` sends `initialize` with its keys, at most
  once, unless created with `initialize: false`. Without a token there is no session to resume,
  and it sends none, as before.
- **The new shell replaces the old.** The resume answers with a new shell id, as the Agent Gateway
  and the mock converse service do: the session's activity log puts the initialization first, so a
  reused id would let the restored turns' operations win. The restored shell stays until the
  resume's first activity, so a resume that fails or is cancelled before it leaves the old shell in
  place. Then the run's activities replace the restored initialization's, and the old shell's state
  is dropped and a `deleteSurface` for it reaches `a2uiMessages`.
- **Earlier restored turns are read-only.** The transcript is redrawn from the serialized
  activities, but the earlier turns' surfaces are snapshots of an earlier page. A surface whose
  latest `createSurface` came from a restored turn before the last one that created a surface is
  listed with `readOnly: true`, and `dispatchAction` and `retry` refuse its actions without a
  request, except `productClick`: the gateway still counts a click on an evicted surface. The
  surfaces of the last restored turn that created any stay live, whatever kind of turn it is and
  however it ended, because the gateway keeps the session's latest search state and a text-only
  answer replaces nothing, so the shopper keeps paginating or faceting from the last results. The restored initialization's surfaces stay live too: without a resume, they
  are still the session's shell.
- **Fallback.** When the resuming `initialize` answers with another `conversationSessionId`, the
  session adopts the new keys and drops the restored turns and shell, their state and
  `actionError`, in one change that subscribers see, and `a2uiMessages` gets a `deleteSurface` for
  each dropped surface. The new shell stays.

## Amendment: retrying a failed initialize

Accepted on 2026-11-17 (KIT-6641).

Nobody sees the automatic `initialize` fail, so a brief outage on page load left the shopper on an
empty start page for good. The failure rule above kept the EAP simple; it was not a decision
against retries.

- **Automatic retries.** A network error, `429`, `502`, `503` or `504` rejecting the automatic
  `initialize` is retried: up to 3 attempts within 5 s, attempts included, with a doubling backoff
  that starts at 1 s for a `429`, since browsers can't read its `Retry-After`. Any other rejection
  fails it at once, and so does one that arrives too late to fit a retry in the budget. Before a
  retry, the session drops a client-chosen session id the failed attempt may have reserved.
- **Before streaming only.** Once the endpoint answers with a stream, the producer may have started
  the session and its shell, so a retry could duplicate the opening state.
- **Still one request at a time.** The retrying `initialize` stays the request in flight, so a
  dispatch is withheld meanwhile, as during any request. Applications already hold dispatches back
  while `request` is set.
- **`retryInitialization()`.** Re-sends `initialize` when the initialization is `'error'`, a
  restored session's included, unless a request is in flight. It carries the session's keys when
  it has them, so the Agent Gateway resumes that session. It does not retry by itself.

## Considered Options

### Option A: surface templates and lookup actions (ADR-017)

- **Summary:** the application creates the search box from a template the contract declares, and
  lookups bypass the one-request rule and the producer's turn slot.
- **Pros:** the search box exists on first paint, and suggestions never wait.
- **Cons:** it adds two contract concepts, a contract bundle, a second request lane, and a
  convention on top of A2-UI. Too much for the EAP. It remains a possible later step.

### Option B: initialize as a synthetic first turn, surfaces still per turn

- **Summary:** `initialize` opens a turn with no prompt. Its surfaces stay in that turn.
- **Pros:** no change to the session's model.
- **Cons:** a turn with no prompt appears in the transcript, and the first prompt opens turn 1, so
  the shell stops accepting actions.

### Option C: keep per-turn surfaces, and redirect operations across turns in the core

- **Summary:** move the demo's `buildSurfaceStream` into the session, and extend the redirect to
  validation and dispatch.
- **Pros:** the per-turn projections stay.
- **Cons:** it keeps a render-id indirection that every integration must reverse on actions, and
  has nowhere to put a surface that no turn created.

### Option D (selected): session-scoped surfaces and automatic initialization

- **Summary:** the session holds its live surfaces across runs, as A2-UI does, sends `initialize`
  itself.
- **Pros:** it aligns the session with the producer and A2-UI, hides `initialize`, and removes the
  demo's workarounds.
- **Cons:** breaking changes to `TurnResponse` and to the serialized format.

### Set aside within Option D

- **The application dispatches `initialize`.** It would be one more concept for every
  application, and an application that forgot it would never get a shell.
- **A latest-wins slot in the session.** The application would name, in its session config, the
  actions whose latest dispatch is kept while a request is in flight and sent once the session is
  free, with a prompt cancelling such an action in flight. It would spare renderers a few lines,
  but:
  - it brings back client-side queueing, which the session removed when it moved to one request at
    a time, and its ordering around cancellation is where that earlier code had bugs;
  - it adds a config concept to every application;
  - it becomes obsolete once the producer answers suggestions concurrently or queues requests.

  A per-dispatch option was not possible either: renderers dispatch through the A2-UI renderer's
  `dispatchAction(action)`, which carries no options.

- **Keep per-turn messages and add a session stream beside them.** Two sources that disagree as
  soon as a turn updates an earlier surface.
- **A dedicated `session.shell` accessor.** It names one component in the core, which is the
  per-feature accessor that ADR-016 removed.
