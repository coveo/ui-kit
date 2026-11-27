---
'@coveo/headless': patch
---

Fix a stale `clientId` in requests when a custom `navigatorContextProvider` returns a new value after the engine starts. Commerce requests could send an empty `clientId` with `capture: true`, which the Commerce API rejects with `CLIENT_ID_REQUIRED`.
