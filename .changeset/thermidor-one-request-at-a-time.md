---
'@coveo/thermidor': minor
---

The session sends one request at a time, prompts and actions alike, and withholds a dispatch made while a request is in flight. It exposes `session.request` (the request being sent) and `session.sendAndWait(send)` (calls `send` and resolves once the session has answered that dispatch), which can end an optimistic update. A prompt dispatched during a gesture is now withheld instead of cancelling it.

Breaking: `Session.actions`, `createDispatchCoordinator`, `createSettledDispatch`, `createDispatchTracker`, `createOptimisticValue`, `createStaleScopes` and their types are removed.
