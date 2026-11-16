---
'@coveo/thermidor': minor
---

Tell a stopped turn from a failed one without reading its error message.

- An errored `Turn` and `SessionInitialization` carry `reason`: `'cancelled'` when `session.cancel()` stopped it, `'failed'` otherwise, including a run restored while it was streaming. The new `TurnErrorReason` type names it.
- A `RUN_ERROR` keeps the gateway's `code` as `errorCode` on the turn or initialization it fails, and on `ActionError` when it fails an action.
- `error` keeps its values, `retry` clears `reason` and `errorCode` with it, and both survive `serialize()` and `sessionToRestore`.

**Breaking:** the serialized session is now version 5, so a session serialized by an earlier version is rejected on restore.
