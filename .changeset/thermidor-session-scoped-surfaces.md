---
'@coveo/thermidor': minor
---

Scope surfaces to the session, as ADR-018 decides: a surface lives from its `createSurface` until its `deleteSurface`, whichever turn carries them.

- `session.surfaces` lists every live surface, in creation order. Each turn's `response.surfaces` lists the live surfaces it created.
- `session.a2uiMessages` is the whole session's renderer stream, in arrival order. It only grows: feed each new message to a single renderer once. A `deleteSurface` precedes a `createSurface` that replaces a live surface, and an operation on a surface that is not live is left out.
- `session.state` is the validated data model of every live surface, keyed by surface id, whichever turn wrote it. A `createSurface` or `deleteSurface` ends a surface's state, so a re-created surface starts empty and a deleted one is not persisted.
- An action resolves its source component across every live surface, so an earlier turn's surfaces keep accepting actions. An action only updates the surfaces: its run never changes a turn's status or response. When it fails, whether it is rejected, streams `RUN_ERROR`, ends without a terminal event or its request cannot be built, `session.actionError` reports it and every turn is left as it is.
- `retry(turnId)` re-submits only the last turn, when it errored, so its answer never lands before later turns' surfaces.

**Breaking:** `session.actionError` is now an `ActionError` (`message`, `name`, `surfaceId`, `sourceComponentId`) instead of a string, and a failed action no longer fails the active turn. `TurnResponse.a2uiMessages` and `TurnResponse.state` are removed: read `session.a2uiMessages` and `session.state`. A `createSurface` for a surface id that is still live now replaces that surface, so a producer mints a new id for each new surface. The serialized format moves to version 2: it persists the session's `state` in place of the active turn's, and a version 1 session is refused on restore.
