---
'@coveo/thermidor': minor
---

The session sends one request at a time, prompts and actions alike, in dispatch order, and exposes `session.request` (the request being sent) and `session.whenSettled()` (resolves once a dispatch made after the call has been answered), which can end an optimistic update. A prompt dispatched during a gesture now waits for it instead of cancelling it.

Breaking: `Session.actions`, `createDispatchCoordinator`, `createSettledDispatch`, `createDispatchTracker`, `createOptimisticValue`, `createStaleScopes` and their types are removed.
