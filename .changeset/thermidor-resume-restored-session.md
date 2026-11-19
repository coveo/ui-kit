---
'@coveo/thermidor': minor
---

A session restored with a token now resumes through `initialize`, so it sends a request when the page loads: it sends its keys, and the endpoint answers with a new, live shell. The surfaces of the earlier restored turns are read-only snapshots: `DiscoveredSurface.readOnly` is `true` on them, and `dispatchAction` refuses their actions without a request, except `productClick`. The surfaces of the last restored turn that created any stay live. When the endpoint answers with another session instead, the session adopts its keys and drops the restored turns.
