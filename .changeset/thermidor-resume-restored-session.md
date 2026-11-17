---
'@coveo/thermidor': minor
---

A session restored with a token now resumes through `initialize`: it sends its keys, and the endpoint answers with a new, live shell. The surfaces of the restored turns are read-only snapshots: `DiscoveredSurface.readOnly` is `true` on them, and `dispatchAction` refuses their actions without a request. When the endpoint answers with another session instead, the session adopts its keys and drops the restored turns.
