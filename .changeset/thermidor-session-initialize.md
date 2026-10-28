---
'@coveo/thermidor': minor
---

Open the session with an `initialize` action, so the producer can answer with the session's shell, such as its search box, before the first prompt.

- `createSession` sends `initialize` a microtask after it returns, through the one-request rule and the conflict retry, and adopts the session keys from its run. While it is in flight, `session.request` is `{kind: 'initialize'}` (`InitializeRequest`). A restored session never sends it, and neither does one created with `initialize: false`.
- Its run is recorded as `session.initialization` (`SessionInitialization`: `activities`, `status`, `error`), never as a turn, and `SessionSnapshot` carries it. A failed `initialize` is recorded there and not retried; the first prompt still opens the session. `cancel()` stops it.
- The initialization's activities come first in the session's activity log, so the surfaces it creates are listed in `session.surfaces`, accept actions, and can announce turn-opening actions.
- Only `initialize` changes the initialization's status. An action before the first turn records its surface snapshots with `session.initialization` and reports its failure in `session.actionError`, as any action that opens no turn does; its `session.request` has no `turnId`. A turn-opening action opens the first turn.

**Breaking:** a session sends `initialize` by default; pass `initialize: false` to opt out. `SERIALIZED_SESSION_VERSION` is now 4, since a persisted session carries its `initialization` (`SerializedInitialization`; one persisted mid-stream restores as `error`); an earlier session is refused on restore.
