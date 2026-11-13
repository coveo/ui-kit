---
'@coveo/atomic': patch
---

Respect `analytics="false"` on `atomic-recs-interface` when the options passed to `initialize()` include an `analytics` configuration, such as a `trackingId`. That configuration used to replace the one the interface builds, so analytics stayed on and events lost the Atomic version; it is now merged into it, as in the other interfaces.
