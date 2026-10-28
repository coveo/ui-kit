---
status: Proposed
date: 2026-10-28
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-011-session-serialization.md
  - ./ADR-018-session-scoped-surfaces-and-initialize.md
  - ./ADR-019-turn-opening-actions.md
  - ./ADR-020-annex-instant-products-in-code.md
  - thermidor-schema ADR-022 (instant products)
  - https://coveord.atlassian.net/browse/KIT-6466
---

# Actions the producer announces as cached or concurrent skip the session's single request

This ADR amends [ADR-018](./ADR-018-session-scoped-surfaces-and-initialize.md) (one request at a
time, and no request lane of the session's own) for the actions a producer announces, using the
announcement mechanism of [ADR-019](./ADR-019-turn-opening-actions.md).
[The annex](./ADR-020-annex-instant-products-in-code.md) shows the session's side and a renderer's
side in code.

## Context and Problem Statement

`thermidor-schema` ADR-022 decides how instant products work:

- an `InstantProducts` component, a child of the shell's `SearchBox`, has a
  `fetchInstantProducts { query }` action, asked for the highlighted suggestion;
- the producer answers it beside the turn: it takes no turn slot, and writes the component's whole
  state, `{ query, products }`;
- its answers are cached per session for a lifetime the producer announces, so a revisited query
  costs no `productSuggest`. Each call counts toward the organization's queries per month, and its
  results are per visitor.

The session cannot support this today:

- **One request at a time.** `sendRequest` withholds any dispatch made while a request is in flight.
  A highlight change during an agent answer, a `fetchSuggestions` or another highlight is dropped,
  and a renderer must hold it back and resend it, as `fetchSuggestions` does under ADR-018.
- **No reuse of an answer.** Every dispatch is sent. Moving back and forth between two suggestions
  would call `productSuggest` every time, unless each renderer kept its own cache.
- **Every answer is recorded.** An action's surface snapshots are folded into the active turn's
  activities, which are serialized and replayed on restore. A product slice written on every
  highlight would grow every persisted session.

## Decision Drivers

- **No cache in the renderer.** A renderer of `InstantProducts` dispatches the highlighted query;
  caching is the session's.
- **The fact belongs to whoever answers the action.** As in ADR-019, the package names no action and
  imports no schema; the producer says which actions can be reused or sent concurrently, and for how
  long.
- **Faithful rendering (charter MUST).** A cached answer reaches the renderer exactly as the
  producer sent it.
- **A newer highlight wins.** An older answer never replaces a newer one's, and a request no one
  waits for is aborted.
- **Bounded and ephemeral.** Neither the cache nor the answers it holds outlive the page, grow
  without bound or enter a serialized session.
- **Prompts and other actions are unaffected.** Their single-request rule, turn recording and
  failure reporting stay as they are.

## Considered Options

### Option A: the renderer caches and sends when free

- **Summary:** what ADR-018 asks of `fetchSuggestions`: each renderer holds back its latest query
  until the session is free, and keeps its own per-query cache.
- **Pros:** no change to the package.
- **Cons:** every integrator writes the same cache and the same retry. Highlights wait behind every
  answer and every suggestions request, and a slow `productSuggest` delays the next keystroke's
  suggestions and the shopper's submit.

### Option B: a cache in the package, on the single request

- **Summary:** the session caches announced actions, but sends misses through the single request.
- **Pros:** one new concept. Revisits are instant and free.
- **Cons:** misses still wait and block as in Option A, and renderers still hold their query back
  until the session is free.

### Option C: a cache and a concurrent lane, announced by the producer

- **Summary:** the producer announces, in surface metadata, which actions are cached and for how
  long, and which are sent concurrently. A cached action's answer is reused within that lifetime. A
  concurrent action is sent in a lane of its own, latest wins per source node, and its answer is
  applied to the surfaces without being recorded in a run.
- **Pros:** meets every driver. A renderer only dispatches.
- **Cons:** a second request path in the session, and two metadata keys the producer must keep
  consistent with how it answers.

### Option D: a lookup lane declared by the schema

- **Summary:** ADR-017's lookups (withdrawn): the contract marks actions as lookups, and the session
  sends them in a second lane.
- **Pros:** the fact is visible in the contract.
- **Cons:** the package cannot read the schema (ADR-019, Option B). Whether an action can run beside
  a turn depends on how the producer answers it, not on the component.

## Decision Outcome

Option C.

### Announcements

The producer announces both facts with the `ACTIVITY_SNAPSHOT` that creates or updates a surface,
under two `metadata` keys keyed by surface id, as `turnOpeningActions` is:

```json
"metadata": {
  "concurrentActions": {"<surfaceId>": ["fetchInstantProducts"]},
  "cachedActions": {"<surfaceId>": {"fetchInstantProducts": {"ttlMs": 60000}}}
}
```

The latest announcement for a surface wins, an empty entry revokes it, and an announcement with
another shape is ignored. An action announced as cached but not concurrent is cached, and its
misses are sent like any action.

### The concurrent lane

A concurrent action is sent at once, whatever request is in flight.

- **Latest wins per source node.** A newer dispatch of the same action from the same node aborts the
  older one in flight.
- **Not a request of the session.** `session.request` does not change, so a renderer waiting for the
  session to be free, and the single request of prompts and other actions, ignore it. A prompt or
  `cancel()` does not abort it.
- **Applied, not recorded.** Its surface snapshots are applied to `session.state` and the renderer
  stream, as any answer's are, but folded into no run's activities. A restored session holds the
  component's state as the last recorded run left it, and the renderer asks again.
- **Failures are quiet.** A failed request, including a refusal, is a development warning. It sets
  no `actionError` and changes no run.
- **It needs a session.** Before the session has a token, a concurrent action is withheld.

### The cache

A cached action's answer is reused within its announced lifetime.

- **Keyed** by surface id, source node, action name and payload, with the payload serialized with
  sorted keys.
- **A hit sends nothing.** The session applies the cached snapshots as it applies a concurrent
  answer, and aborts the action's request in flight from that node, so a late answer cannot replace
  it.
- **A miss is sent**, in the concurrent lane if the action is announced there. The answer's surface
  snapshots are cached when the stream completes without error.
- **Bounded:** a fixed number of entries per session, least recently used first out, and entries
  expire with their lifetime. The cache lives in memory, is never serialized, and is dropped with
  the session.

### Out of scope

Debouncing a highlight, hiding instant products on small screens and showing products only while
their `query` is highlighted are the renderer's.

## Consequences

- **Positive:** a renderer of instant products dispatches its highlighted query and draws its props;
  it holds no cache, no retry and no session-free wait. Revisits cost no request. Highlights neither
  wait for nor block an answer, suggestions or a submit.
- **Positive:** the mechanism names no action. `fetchSuggestions` can join the concurrent lane once
  the producer announces it.
- **Negative:** a second request path, with its own abort and failure rules, beside ADR-018's.
- **Negative:** the renderer stream keeps every applied answer, cached or not, for the session's
  lifetime, as it keeps every write.
- **Neutral:** a producer that announces nothing gets today's behavior.

## Implementation and Follow-up

- The session reads both announcements from the activity log, as `isTurnOpeningAction` does.
- `dispatchAction` routes an announced action before `sendRequest`; `cancel()`, `submitPrompt` and
  `session.request` are unchanged.
- demo-schema-react: `SearchBox` exposes the highlighted query to its children, and an
  `InstantProducts` renderer dispatches it. `QuerySuggestions` keeps `useLatestWhenFree` until the
  producer announces `fetchSuggestions` as concurrent.
- The mock converse service announces both keys on the shell, and answers `fetchInstantProducts`
  without taking its turn slot.
