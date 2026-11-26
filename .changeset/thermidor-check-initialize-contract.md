---
'@coveo/thermidor': minor
---

`createSession` now throws when the contracts don't declare `SessionShell`'s `initialize` action with a payload that accepts `{}`, unless `initialize` is `false`, and `retryInitialization()` throws in that case too. Before, the session sent `initialize` without checking it against the contracts.
