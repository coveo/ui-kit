---
'@coveo/headless': patch
---

Read the custom navigator context provider on every request instead of keeping its first result, so a `clientId` that becomes available after the engine is created is sent along with `capture`. This prevents `412 CLIENT_ID_REQUIRED` errors from the Commerce API.
