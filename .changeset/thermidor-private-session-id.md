---
'@coveo/thermidor': minor
---

`createPrivateSession` from `@coveo/thermidor/private` accepts an optional `sessionId`. It must be a UUID. The session sends it as `conversationSessionId` from its first request, whether that is `initialize`, a prompt or an action. The returned `PrivateSession` exposes the id as `sessionId` from creation. Without the option, `sessionId` is `undefined` until the endpoint sends one. If the first request ends before the endpoint sends a token, the session drops the chosen id and the endpoint assigns one. A request can end that way when it fails, is cancelled or the connection drops. A restored session whose id has no token drops it the same way. Passing both `sessionId` and `sessionToRestore` throws. The public `createSession` is unchanged.
