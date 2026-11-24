---
'@coveo/thermidor': minor
---

Report the concurrent actions in flight and their failures (ADR-020). `session.concurrentRequests`, also in `getSnapshot()`, lists the concurrent actions whose latest dispatch from their node awaits its answer, by surface, node and action name. `session.concurrentFailures`, also in `getSnapshot()`, lists those whose latest dispatch from their node failed, with the message and error code, until the node dispatches that action again. `session.actionError` is unchanged: concurrent actions neither set nor clear it. Once a concurrent dispatch resolves, these two lists tell whether its node's latest dispatch failed, is still awaited, or was applied.
