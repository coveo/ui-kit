---
'@coveo/quantic': major
---

`QuanticDidYouMean` now uses `next` as the default `queryCorrectionMode` instead of `legacy`. The `next` system computes query corrections with machine learning and needs a Query Suggestion model in your Coveo organization. To keep the previous behavior, set `query-correction-mode="legacy"` on `c-quantic-did-you-mean`.
