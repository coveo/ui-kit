---
status: Proposed
date: 2026-11-19
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-011-session-serialization.md
  - ./ADR-015-surface-and-route-derivation.md
  - ./ADR-018-session-scoped-surfaces-and-initialize.md
  - ./ADR-020-cached-and-concurrent-actions.md
  - https://a2ui.org/specification/v1_0/json/
  - https://coveord.atlassian.net/browse/KIT-6690
---

# Stream A2-UI 1.0 to the renderer unchanged

> This record predates the rename of Thermidor (`@coveo/thermidor`) to the Converse SDK (`@coveo/converse`), and keeps the names of its time.

> Part of the unified-endpoint session-client family (core:
> [ADR-010](./ADR-010-unified-endpoint-session-client.md)), governed by the charter
> [ADR-009](./ADR-009-architecture-decision-charter-v2.md). Retires the
> [ADR-015 addendum on the v0.9 renderer projection](./ADR-015-surface-and-route-derivation.md#addendum-2026-09-24-the-a2-ui-v09-renderer-projection).

## Context and Problem Statement

Agent Gateway emits A2-UI v1.0, which is now the current specification. Until now every renderer
consumed v0.9, so `session.a2uiMessages` carried a downgraded copy of the stream, produced by
`a2ui-v09-projection.ts`: each `createSurface` was split into `createSurface` + `updateComponents`,
inline data-model keys became `updateDataModel` operations, `value: null` was dropped to mean a
deletion, and every envelope was stamped `version: "v0.9"`. The ADR-015 addendum recorded this as a
charter exception (ADR-009 §4 and §5) with a retirement condition: `@a2ui/web_core` publishes a v1.0
message processor, and the renderer consumers use imports it.

Both now hold. `@a2ui/web_core` 0.15.0 publishes `./v1_0` and a v1.0 path in its `MessageProcessor`,
and the Thermidor samples move from `@copilotkit/a2ui-renderer` to the first-party `@a2ui/react`
0.16.0, which renders from that processor. The open question is what remains of the renderer
stream, and what `dispatchAction` accepts, once nothing needs a downgrade.

## Decision Drivers

- **Faithful rendering (ADR-009 §4, MUST).** The renderer receives the server's stream, not a
  rewrite of it.
- **No transport DTO shapes in the public API (ADR-009 §5).** Whatever Thermidor exposes of the
  renderer's protocol stays minimal.
- **One renderer per session.** A consumer feeds one long-lived `MessageProcessor` for the whole
  session (ADR-018), across runs and concurrent answers (ADR-020).
- **No adapter in the consumer.** The renderer's action callback is `session.dispatchAction`.
- **0.x.** A breaking change to `@coveo/thermidor` is acceptable.

## Considered Options

### Option A: Drop the renderer stream; consumers read `activities`

- **Summary:** the ADR-015 addendum's stated end state: delete the projection and
  `session.a2uiMessages`, and let consumers feed the activities' messages to the renderer.
- **Pros:** the least code in Thermidor.
- **Cons:** the stream is the concatenation of independent runs, which the v1.0 processor does not
  accept as is. It throws `Surface <id> already exists.` on a `createSurface` for a live surface
  (the spec makes re-creation without a delete an error, while ADR-018 makes it a replacement for
  the session), and `Surface not found for message` on an `updateComponents` or `updateDataModel`
  for a surface it does not hold. A throw abandons the rest of the batch. Every consumer would
  re-implement the lifecycle tracking, and the concurrent answers of ADR-020 are in no activity at
  all.

### Option B (selected): Keep a session-wide stream of unchanged v1.0 messages

- **Summary:** `session.a2uiMessages` keeps its name and append-only semantics, but carries the
  gateway's v1.0 messages unchanged, applying only the lifecycle rules the processor still needs.
- **Pros:** meets every driver. The renderer sees the server's messages byte for byte, and the
  consumer's integration stays one line per side.
- **Cons:** Thermidor still adds a `deleteSurface` and leaves out some updates, so the stream is not
  the plain concatenation of the activities.

### Option C: Keep the projection to a v1.0 renderer shape

- **Summary:** keep a module that rewrites messages, in case a renderer needs a variant.
- **Cons:** no renderer needs one; it keeps the charter exception for nothing.

## Decision Outcome

Option B.

- `src/session/a2ui-v09-projection.ts` is deleted. `src/session/renderer-stream.ts` holds the stream
  (`RendererStream`, `appendToRendererStream`), fed from the fold, the concurrent lane and restore.
- `session.a2uiMessages` is `readonly A2uiMessage[]`, where `A2uiMessage` is typed no further than
  its envelope: `{readonly version: '1.0'; readonly [operation: string]: unknown}`. It replaces
  `A2uiV09Message`.
- Only messages whose `version` is `"1.0"` enter the stream, the const the spec and the processor's
  v1.0 schema require, and what Agent Gateway sends. A `"v1.0"` envelope is dropped with a
  development-only warning.
- Two lifecycle rules stay, each because the processor throws without it: a `deleteSurface` is
  inserted before a `createSurface` that re-creates a live surface, and an `updateComponents` or
  `updateDataModel` for a surface that is not live is dropped.
- Two rules go. A `deleteSurface` for a surface that is not live is forwarded, because the processor
  ignores it. An `updateDataModel` with `value: null` is forwarded, because the processor's v1.0
  data model deletes the key.
- `session.dispatchAction` takes `A2uiRendererAction` (`name`, `surfaceId`, `sourceComponentId`,
  `context?`, `timestamp?`), structurally the `ActionPayload` that the processor passes to the
  `actionHandler` of its constructor. `@a2ui/react` has no `onAction` prop: actions reach that
  handler, so `new MessageProcessor(catalogs, session.dispatchAction)` type-checks. It replaces
  `A2uiClientMessage` and its `userAction` wrapper. A `submitPrompt` is told apart by having no
  `surfaceId`.
- A `createSurface` without a `catalogId` is a surface like any other, in `session.surfaces` and in
  the stream: v1.0 makes the default catalog optional. It used to be ignored, as the projection
  dropped it.

### Rationale

Option A is the end state the addendum foresaw, but it was written per turn, before ADR-018 made the
stream session-wide and ADR-020 added answers that no activity records. The lifecycle rules are the
cost of feeding one processor from many runs, which the protocol does not define, so they belong in
the session rather than in every consumer. Option C has no user.

## Consequences

- **Positive:** the charter exception of the ADR-015 addendum ends: the renderer receives the
  server's messages unchanged, and the public API exposes no renderer-specific shape beyond the
  envelope version. Data bindings (`{"@path": …}`) and function calls (`{"@call": …}`) reach the
  renderer untouched.
- **Negative:** breaking for consumers: the message and action types change, and the samples move to
  `@a2ui/react`. `processMessages` is typed against web_core's message unions, so a consumer either
  casts the stream or calls `processMessagesWithErrors`, which takes `unknown`.
- **Neutral:** `a2uiMessages` is still never persisted and is re-derived from the activities on
  restore (ADR-011). The renderer stream still bypasses in-transit validation, as before.

## Implementation and Follow-up

- Agent Gateway and the mock Converse APIs send the envelope `version: "1.0"` and `{"@path": …}`
  bindings. All of them, the samples, and this change ship together, once `@a2ui/react` 0.16.0 is
  published.
- Revisit the lifecycle rules if `@a2ui/web_core`'s processor learns to treat re-creation as
  replacement, or to skip operations on unknown surfaces.
