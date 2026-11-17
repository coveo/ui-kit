---
'@coveo/thermidor': minor
---

An application can continue a session from its keys. `createSession` takes an optional `sessionId` (a UUID) and `sessionToken`, sent from the session's first request, `initialize` included, and `Session` exposes both as `sessionId` and `sessionToken`, including the new keys the endpoint answers with when the session expired. A `sessionId` alone opens a new session under that id. `createPrivateSession`'s `sessionId` is now part of `createSession`.

A session restored with a `sessionId` but no `sessionToken` now drops that id when its first request ends before the endpoint sends a token, so the endpoint assigns a new one. Only `createPrivateSession` did this before.
