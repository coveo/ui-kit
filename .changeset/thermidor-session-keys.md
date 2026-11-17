---
'@coveo/thermidor': minor
---

An application can continue a session from its keys. `createSession` takes an optional `sessionId` (a UUID) and `sessionToken`, sent from the session's first request, `initialize` included, and `Session` exposes both as `sessionId` and `sessionToken`, including the new keys the endpoint answers with when the session expired. A `sessionId` alone opens a new session under that id. The `sessionId` option and reader of `createPrivateSession` moved to `createSession`, which `createPrivateSession` inherits.
