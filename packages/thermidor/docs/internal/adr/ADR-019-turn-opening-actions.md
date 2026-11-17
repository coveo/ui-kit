---
status: Accepted
date: 2026-10-26
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-010-annex-model.md
  - ./ADR-011-session-serialization.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
  - ./ADR-018-session-scoped-surfaces-and-initialize.md
  - https://github.com/coveo-platform/agent-gateway/blob/main/docs/adr/adr-008-clickable-agent-answers-search-options.md
  - https://github.com/coveo-platform/agent-gateway/blob/main/docs/commerce-protocol.md
  - https://coveord.atlassian.net/browse/KIT-6433
---

# A component action the producer announces as opening a turn opens one

This ADR complements [ADR-018](./ADR-018-session-scoped-surfaces-and-initialize.md) on a case it
leaves open (which dispatches open a turn), amends its failure rule for that case, and amends the
[model annex](./ADR-010-annex-model.md) of [ADR-010](./ADR-010-unified-endpoint-session-client.md)
(a turn's input is a prompt or the action that opened it), and
[ADR-011](./ADR-011-session-serialization.md) (a persisted turn may carry that action). See
[Relation to earlier ADRs](#relation-to-earlier-adrs).

## Context and Problem Statement

The session opens a turn for each prompt only, and records every component action's run with the
active turn. [ADR-018](./ADR-018-session-scoped-surfaces-and-initialize.md) notes this as the state
of the session (`submitPrompt` "always opens a turn", in its context) and keeps the recording rule,
but its options weigh how to initialize the session, not which dispatches open a turn: that question
is left open. For most actions the rule is right: a facet selection, a sort or a page change updates
the blocks the active turn already shows.

A `NextActionsBar` chip is different. The shopper picks it in the conversation, as they would type
a message, and expects to see what they picked, then its answer:

- a follow-up chip (`selectAction`) asks a new question. Agent Gateway turns its text into the
  shopper's message, as if it were typed;
- a search option (`selectSearchOption`) runs a search the agent prepared. Agent Gateway runs it
  itself, without the agent, and opens a new search block
  ([agent-gateway ADR-008](https://github.com/coveo-platform/agent-gateway/blob/main/docs/adr/adr-008-clickable-agent-answers-search-options.md)).

Recorded with the active turn, either answer makes the session misrepresent the conversation:

- the chip the shopper picked is recorded nowhere, so a consumer cannot show it;
- the turn does not become `streaming` again, so a consumer cannot tell that an answer streams;
- the new answer's messages, reasoning steps and surfaces are appended to the earlier answer's, so a
  consumer that draws them apart has to snapshot counters when it sends the action and slice the
  turn in its own state, which serialization loses;
- a failed follow-up fails the earlier, complete answer, and `retry` then re-sends that answer's
  prompt instead of the follow-up.

Whether an action's answer is a new turn depends on how the producer answers it, not on the
component that sends it: the gateway answers `selectAction` as a message of the shopper, and a
facet's `search` as an update of the block it belongs to. The session cannot tell them apart: an
action name is only meaningful to the component that declares it, and A2-UI has no notion of a turn.
It has to know before the action is sent, to show the chip right away.

A turn of the session and a turn of the gateway's analytics are not the same thing either. For the
analytics, a turn is a request that carries a shopper message (`api.conversational.message`): a
follow-up chip is one, and a search option is not. For the session, a turn is what the transcript
draws: a gesture of the shopper in the conversation and its answer, whoever answers it.

## Decision Drivers

- A consumer should draw a chip and its answer as a turn, with no bookkeeping or configuration of its
  own, and get the same result after serialization.
- Failures, cancellation and retry should apply to the chip's answer, not to the answer it follows.
- The chip should show as soon as the shopper picks it, not when its answer starts.
- The fact belongs to whoever answers the action, and the package names no action and imports no
  schema.
- The change to the public model should be small and additive where possible.

## Decision Outcome

The producer announces, with each surface, the actions of that surface whose answer it gives as a
new turn, and an announced action opens one, recorded in `input.action`. Option E below.

It gives the transcript the turn the shopper sees, with every turn-level behavior (status, failure,
cancellation, serialization) applying to a chip as it does to a prompt, and shows the chip when it is
sent. The fact comes from the producer, which answers the action, so no consumer restates it and it
cannot drift from what the producer does. Option A keeps ADR-018's recording, but at the price of a
parallel structure inside every turn. Option B puts the fact in the schema, which the package cannot
read, with a contract bundle ADR-018 rejected. Option C shows the chip late, and never for a search
option. Option D only covers follow-up chips, by bypassing their contract. Option F works, but asks
every consumer to restate what the producer does.

### Turn-opening actions

- **Announced by the producer.** An AG-UI event may carry `metadata`, a free record, next to its
  content. With the `ACTIVITY_SNAPSHOT` that creates or updates a surface, the producer announces,
  under the `turnOpeningActions` key, the actions of that surface that open a turn:

  ```json
  {
    "type": "ACTIVITY_SNAPSHOT",
    "activityType": "a2ui-surface",
    "content": {"messages": ["…"]},
    "metadata": {
      "turnOpeningActions": {"next-actions-1": ["selectAction", "selectSearchOption"]}
    }
  }
  ```

  The announcement is keyed by surface id, since the producer knows which surface holds the bar and
  the session knows which surface an action is dispatched from. The key sits at the top of
  `metadata`, with no client namespace: whether an answer is a new turn is a fact about how the
  producer answers, true for any client that draws a conversation. The latest announcement for a
  surface wins. Agent Gateway documents the convention in its
  [commerce protocol](https://github.com/coveo-platform/agent-gateway/blob/main/docs/commerce-protocol.md).

- **Kept with the activity.** The session keeps an event's `metadata` on the activity it folds it
  into, so a restored session reads the same announcements. A snapshot that replaces an activity
  merges its `metadata` onto the earlier one by entry, as it merges its payload, so an incremental
  snapshot that does not repeat an announcement keeps it.
- **Opening the turn.** `dispatchAction` opens a new `streaming` turn for an announced action,
  records it in `input.action` (`TurnAction`: component, action name, surface id, source node and
  payload) and streams the answer there. The new turn becomes the active turn. Any other action,
  including one from a producer that announces nothing, only updates the surfaces: its surface
  snapshots are recorded with the active turn, and its run, its text and its failure leave every
  turn as it is (ADR-018, as amended). There is no consumer fallback.
- **Ignoring the rest.** `metadata` is untyped in AG-UI, so the session ignores an announcement that
  does not have this shape, and any other key. An empty list revokes a surface's announcement; a
  malformed one leaves the earlier announcement as it is.
- **Showing the chip.** A consumer shows the chip from the action's payload, such as `text`, which
  both `NextActionsBar` actions carry.

### Failures, cancellation and retry

- A failed or cancelled turn-opening action fails the turn it opened, and leaves the earlier turns as
  they are.
- `retry` re-sends `input.action` from the surface it was dispatched from, without checking the
  announcement again.

### Serialization

A persisted turn may carry `input.action`, so `SERIALIZED_SESSION_VERSION` moves to 3, and an
earlier blob is refused on restore. The announcements persist with the activities that carried them.

### Relation to earlier ADRs

ADR-018:

1. **Opening a turn (complement).** ADR-018 does not decide which dispatches open a turn; it notes
   that only `submitPrompt` does today. This ADR decides it: a prompt, or a component action the
   producer announces as opening one. Why: the shopper picks a chip in the conversation, and
   recording its answer with the active turn misrepresents the transcript (see
   [Context](#context-and-problem-statement)).
2. **Failures (amendment).** ADR-018, as amended: only the request that opened a turn changes its
   status, and a failed action sets `session.actionError` and leaves every turn as it is. A
   turn-opening action opens its turn, so it is such a request. Now: its failure or cancellation
   fails the turn it opened instead of setting `session.actionError`. A concurrency conflict fails
   that turn too, and still sets `session.actionError`, as for any other action. Why: that turn
   exists to hold the action's answer, so its failure is the turn's, and `retry` re-sends the
   action.
3. **Unchanged.** Surfaces stay session-scoped. An action's run is still recorded with the active
   turn: a turn-opening action opens its turn first, so its run is recorded there. Any other
   action, and `initialize`, behave as ADR-018 decides.

ADR-010 model annex: a `Turn` is one input and its streamed result, and that input is either a
prompt (`input.prompt`) or the component action that opened it (`input.action`). An `Activity` keeps
the `metadata` of the event that carried it.

## Impact on the Charter

- **Faithful transmission and rendering (MUST):** improved. The session acts on what the producer
  states about its own answers instead of a rule restated by each consumer, and still sends the
  action and renders its answer as the producer streams it; it only decides which turn records it.
- **Public API independence (MUST):** unchanged. The package names no action and imports no schema.
  It reads one convention on the transport, the `turnOpeningActions` key of AG-UI event
  `metadata`, which any producer can emit.
- **Best-in-class DX (MUST):** improved. A consumer declares nothing, and draws a chip and its
  answer as a turn, with no counters, no slicing and no state of its own.
- **Simplicity (SHOULD):** improved. A turn keeps one level of structure, `createSession` gains no
  option, and the schema gains no annotation.

## Consequences

- **Positive:**
  - A consumer draws a chip and its answer as a turn, and a restored session draws it the same way.
  - `Turn.status` is `streaming` while the answer streams.
  - A failed or cancelled chip fails only its own turn, and `retry` re-sends the action from the
    surface it was dispatched from.
  - When the producer changes which actions open a turn, every consumer follows with no change.
  - demo-schema-react drops `turn-segments.ts` and its follow-up bookkeeping.
- **Negative:**
  - The persisted shape changes, so `SERIALIZED_SESSION_VERSION` moves to 3 and an earlier blob is
    refused on restore.
  - It needs the producer. Until Agent Gateway announces its turn-opening actions, a chip is an
    ordinary action: no turn opens, only the blocks of its answer reach the surfaces, and the text of
    a follow-up's answer is dropped, with no error to signal it. Agent Gateway ships first, so a
    consumer never sees this.
  - The convention lives on an untyped AG-UI field, so neither side's types check it; the session
    tests and the gateway tests each pin it.
  - Analytics counts shopper messages only, so a search option's session turn has no analytics turn,
    and a session turn's position is not an analytics `turnNumber`.
- **Neutral:**
  - An action that does not open a turn only updates the surfaces: the active turn keeps its status
    meanwhile, and `Session.request` tells a consumer the action is in flight.

## Implementation and Follow-up

- **One changeset** (`'@coveo/thermidor': minor`, marked **Breaking:**) covers the announcement,
  `Activity.metadata`, `TurnInput.action` and serialized format version 3.
- **Agent Gateway** announces `selectAction` and `selectSearchOption` for each surface that holds a
  `NextActionsBar`, and documents the convention in its commerce protocol. It ships before the
  consumers rely on it.
- **The mock Converse API** announces them the same way, so the sample runs without the gateway.

## Considered Options

### Option A: exchanges inside a turn

- **Summary:** a turn keeps every answer streamed into it, as a list of exchanges, each with the
  input that asked for it, its own response and its own status.
- **Pros:** the answers to a turn's chips stay grouped under that turn, as ADR-018 records them.
- **Cons:** every projection (`surfaces`, `agent`) has to be derived per exchange, and an activity a
  later exchange replaces in place belongs to two of them. The serialized shape gains a level.
  `retry`, `cancel` and failures need exchange-level variants. Consumers iterate over one more level.

### Option B: an annotation in the schema

- **Summary:** the schema marks the actions that open a turn (`x-thermidor-opens-turn`) and
  projects them with the component union, which the consumer injects as one contract.
- **Pros:** consumers share the list without declaring it.
- **Cons:** the schema describes a component's contract, and whether an answer is a turn is how the
  producer answers it, which the annotation would only restate. The package imports no schema, so it
  needs the contract bundle that ADR-018 rejected for the EAP. A schema release and its pointer
  updates for each change to the list.

### Option C: infer the turn from the answer

- **Summary:** an action's run streams into the active turn until it carries an agent message, which
  opens a new turn, recorded with the action.
- **Pros:** nothing to declare or announce, and it matches the gateway's analytics.
- **Cons:** the chip shows only once the agent starts answering, after its reasoning. A search
  option, which the agent never answers, never opens a turn, so the chip the shopper picked is not
  shown. It infers a fact the session cannot check.

### Option D: send a follow-up chip as a prompt

- **Summary:** the consumer's `NextActionsBar` dispatches `submitPrompt` with the chip's text instead
  of `selectAction`.
- **Pros:** Agent Gateway already turns `selectAction` into the same shopper message, turn kind and
  analytics event as a prompt, and drops the chip's `type`, so the answer is the same. Nothing to
  declare for follow-ups, and the chip shows when it is sent.
- **Cons:** it covers follow-up chips only. A search option cannot be sent as a prompt: its text
  would become an ordinary message, answered by keyword search or by the agent, and the search the
  gateway saved would be lost (agent-gateway ADR-008). The component bypasses its contract, which
  declares `selectAction`.

### Option E (selected): the producer announces which actions open a turn

- **Summary:** with each surface snapshot, the producer announces in the event's `metadata` the
  actions of that surface that open a turn, and an announced action opens a new turn that records
  it.
- **Pros:** the producer, which answers the action, states the fact, and the consumer declares
  nothing. The announcement arrives with the surface, so the chip shows when it is sent. It uses
  AG-UI's own extension point, and leaves the A2-UI messages, the schema and `createSession` as they
  are. The model gains `TurnInput.action` and `Activity.metadata`, both optional.
- **Cons:** a convention on top of AG-UI and A2-UI, untyped on the wire, and a producer change that
  has to ship first. A turn opened by an action has no prompt to re-send, so `retry` re-sends the
  action.

### Option F: the consumer declares the actions that open a turn

- **Summary:** `createSession` takes `turnOpeningActions`, keyed by component discriminant and typed
  by the contracts, and a listed action opens a new turn that records it.
- **Pros:** no producer change. The consumer draws the chips, and `createSession` can refuse an
  unknown component or action.
- **Cons:** the consumer restates how the producer answers its actions, and every consumer restates
  it the same way. The list drifts silently when the producer changes, since nothing checks it
  against the producer.

### Set aside within Option E

- **A dedicated `CUSTOM` event.** The producer could send the announcement as its own AG-UI `CUSTOM`
  event, named for instance `coveo.turnOpeningActions`, just before the snapshot that renders the
  surface. It works end to end: the value is keyed by surface id like the `metadata` entry, and the
  stream keeps the two events in order. It also needs no merge when a snapshot replaces another, and
  reads as a named event in the stream. But the announcement then travels apart from the snapshot it
  describes: each producer path that emits a surface must also emit it, and one that forgets leaves a
  bar whose actions answer in the active turn, with no error to signal it. In `metadata`, it is part
  of the snapshot that renders the surface, so it cannot be missing, and every path that emits a
  snapshot carries it.
- **The snapshot's `content`.** An `a2ui-surface` activity's `content` holds the A2-UI messages the
  renderer reads; a key beside them mixes a fact about the producer's answers into the A2-UI payload.
- **A `thermidor` namespace in `metadata`.** Nesting the key under `metadata.thermidor` would tie a
  fact about the producer's answers to one client, which any client drawing a conversation can use.
  AG-UI reserves only its own `ag-ui` key, and `turnOpeningActions` is specific enough not to clash.
- **A mark in the action or the component state.** A2-UI actions and component properties are
  defined by each component's contract in the schema, so a mark there is either a schema change or
  a property the contract does not declare.
- **A hint in the answer to the action.** The producer could say, at the start of its answer to an
  action, whether that answer is a new turn, for instance in `RUN_STARTED`'s `metadata` or in the
  turn's `user` message. The session would then learn it only after the action is sent: the chip
  would wait a round trip before it shows, the request would belong to no turn until the hint
  arrives, and a failure before the hint, such as a `409` or a network error, would not know which
  turn it fails.
