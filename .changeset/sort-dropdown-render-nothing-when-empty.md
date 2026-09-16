---
"@coveo/atomic": patch
---

Fix `atomic-sort-dropdown` to render nothing when all `atomic-sort-expression` children are filtered out by tab conditions, instead of rendering an empty `select`. The misconfiguration case (no `atomic-sort-expression` children at all) still renders an `atomic-error` and logs the error.
