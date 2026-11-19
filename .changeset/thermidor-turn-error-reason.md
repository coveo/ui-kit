---
'@coveo/thermidor': minor
---

Tell a stopped turn from a failed one without reading its error message.

- An errored `Turn` and `SessionInitialization` carry `reason`: `'cancelled'` when `session.cancel()` stopped it, `'failed'` otherwise, including a run restored while it was streaming. The new `TurnErrorReason` type names it.
- A `RUN_ERROR` keeps the gateway's `code` as `errorCode` on the turn or initialization it fails, and on `ActionError` when it fails an action.
- `error` keeps its values, `retry` clears `reason` and `errorCode` with it, and both survive `serialize()` and `sessionToRestore`.
- A connection that drops after the stream's `RUN_FINISHED` or `RUN_ERROR` no longer overwrites the turn's outcome with a network error.

**Breaking:** the serialized session is now version 5, so a session serialized by an earlier version is rejected on restore.
