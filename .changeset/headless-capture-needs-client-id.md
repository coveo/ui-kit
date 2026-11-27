---
'@coveo/headless': patch
---

Commerce requests no longer send `context.capture: true` without a client ID. A navigator context that returned `capture: true` with an empty `clientId`, or with analytics disabled, made the Commerce API reject every request with `CLIENT_ID_REQUIRED`. Headless now sends `capture: false` in those cases.
