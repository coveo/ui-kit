---
status: Proposed
date: 2026-11-06
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-011-session-serialization.md
  - ./ADR-018-session-scoped-surfaces-and-initialize.md
  - ./ADR-019-turn-opening-actions.md
  - thermidor-schema ADR-024 (recent queries)
  - https://coveord.atlassian.net/browse/KIT-6528
---

# The session sends an initialize payload, and the recent-queries renderer keeps the list across sessions

This ADR amends [ADR-018](./ADR-018-session-scoped-surfaces-and-initialize.md), whose `initialize`
action always has an empty payload.

## Context and Problem Statement

`thermidor-schema` ADR-024 decides how recent queries work:

- a `RecentQueries` component, a child of the shell's `SearchBox`, holds the session's list in its
  state, `{ queries }`, and has a `clearRecentQueries {}` action;
- the producer records each keyword search that returns products, and writes the list with the
  turn that ran it;
- the list outlives the session on the consumer's side: the consumer keeps the latest list it
  received and sends it back in a new session's `initialize` payload, as `recentQueries`.

In Headless and Atomic commerce, the controller takes the list it starts from as an option, and
the `atomic-commerce-search-box-recent-queries` component saves the list to local storage whenever
it changes.

The session cannot carry a list across sessions today:

- **`initialize` has no payload.** The session sends it with an empty `context`, and nothing lets
  the application add one.
- **Nothing keeps the list.** The session persists nothing by itself (ADR-011); only an application
  that serializes a whole session keeps its state.

## Decision Drivers

- **The package names no component** (charter MUST: faithful transmission, no use-case behavior).
  As with ADR-019 and ADR-020, which action or component carries which fact is the producer's and the
  schema's, not the session's.
- **Atomic parity**, persistence across page loads included, for an application that renders
  recent queries.
- **Nothing for an application that renders none:** no storage access, no payload.
- **Typed input** (charter MUST): the application's payload is checked against the consumer-supplied
  schema, like any action payload.

## Considered Options

### Option A: a recent-queries store in the session

- **Summary:** `createSession` takes a `recentQueries` store with `load()` and `save(queries)`. The
  session sends `load()` with `initialize`, finds the `RecentQueries` node by type, and calls `save`
  whenever its state changes.
- **Pros:** one option, and no renderer code to persist.
- **Cons:** the session interprets a component and a payload field by name, which the charter
  reserves for the schema and the producer. Every later component that wants to outlive a session
  would add another option.

### Option B: the application serializes the session

- **Summary:** the application saves `session.serialize()` and restores it on the next page load.
- **Pros:** no change to the package.
- **Cons:** it restores the whole conversation, keys included, not a fresh session with the list.
  Restoring is for continuing a conversation, which ends with its session token.

### Option C: an initialize payload, and persistence in the renderer

- **Summary:** `createSession` accepts the payload to send with `initialize`. The `RecentQueries`
  renderer saves its `queries` prop whenever it changes, and the application reads the saved list
  into the payload of the next session.
- **Pros:** the session stays generic: it carries a typed payload, as for any action. Persistence
  sits where Atomic puts it, in the component that draws the list, and the application chooses the
  storage.
- **Cons:** each renderer of `RecentQueries` writes a few lines to save the list, and each
  application passes it back.

## Decision Outcome

Option C.

### An initialize payload

`createSession` accepts the payload of `initialize`, read when the action is sent, a microtask after
`createSession` returns.

- **Typed and validated** against the `initialize` action of the consumer-supplied schema, as any
  action payload. An invalid payload is withheld with a development warning, and `initialize` is
  sent with an empty payload, so the session still opens.
- **Sent once.** A restored session sends no `initialize`, so it sends no payload; its recorded
  state already holds the list.
- **Recorded as before.** The `initialize` run is folded into `session.initialization`; the payload
  itself is not serialized.

### Persistence in the renderer

A renderer of `RecentQueries`:

- **saves** its `queries` prop whenever it changes, in storage the application chooses;
- **does not edit** the list: recording, normalizing and clearing are the producer's.

The application reads the saved list when it creates the session, and passes it as
`recentQueries` in the `initialize` payload. demo-schema-react saves it in local storage.

### Rendering recent queries as Atomic does

The renderer draws the list in the search box's popover, from the typed text the search box passes
to its children (ADR-018):

- **Matching:** a query is shown when it starts with the typed text, compared case-insensitively.
  At most 3 are shown while typing; all of them on an empty box. The whole popover shows at most 8
  queries, recent ones and completions together.
- **On focus:** focusing the empty search box opens the popover with the recent queries.
- **Order:** recent queries come first, newest first, then the completions. A completion equal to a
  shown recent query, compared case-insensitively, is hidden.
- **Highlighting:** while typing, the part of each query after the typed text is emphasized.
- **Header:** a "Recent searches" header, with a "Clear" control, comes first whenever at least one
  recent query is shown.
- **Accessibility:** each item is announced as `“<query>”, recent query`, and clearing announces
  "Recent searches cleared".
- **Selecting:** a recent query is selected like a completion. Moving to it with the keyboard puts
  it in the box. Selecting it submits it as a prompt, which the producer answers with a search.
- **Clearing:** the text in the box stays. The renderer hides the list at once, keeps the popover
  open, and dispatches `clearRecentQueries` once the session is free, with the "latest when free"
  helper of ADR-018. The empty list the producer answers with is saved like any other.

## Consequences

- **Positive:** the session gains one generic, typed input. It names no component and owns no
  storage.
- **Positive:** a restored session needs no change: the list rides in the recorded state, so
  serialization keeps its version.
- **Negative:** persistence is a renderer convention, not a guarantee of the package. A renderer
  that does not save the list loses it on the next page load.
- **Neutral:** two tabs each keep their own session, and the last list saved wins, as with
  Atomic's local storage.

## Implementation and Follow-up

- `createSession`: the `initialize` payload option, its validation against the schema's
  `initialize` action, and `buildActionRequest` sending it as the action's `context`.
  `docs/architecture.md` describes it.
- The mock converse service seeds the shell's `RecentQueries` from the payload, records its
  searches, and answers `clearRecentQueries`, as the producer does.
- demo-schema-react: a `RecentQueries` renderer that follows the recipe above. Its `SearchBox` merges
  the sections its children show, instead of keeping the last one; it saves the list in local
  storage and passes it to `createSession`.
