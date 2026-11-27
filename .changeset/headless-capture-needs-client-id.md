---
'@coveo/headless': patch
---

Commerce and search requests no longer send `capture: true` without a client ID. A navigator context that returned `capture: true` with an empty or blank `clientId`, or, for commerce, with analytics disabled, made the Commerce API reject every request with `CLIENT_ID_REQUIRED`. Headless now sends `capture: false` in those cases, and Search API requests that carry analytics parameters follow the same rule.
