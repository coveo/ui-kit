---
'@coveo/atomic': patch
---

Load the illustrations of `atomic-query-error`, `atomic-commerce-query-error`, `atomic-insight-query-error` and `atomic-recs-error` only when an error is displayed, so pages that never display an error download about 63 KB less. The illustration for a lost connection still comes with the components, since the network may be down when it shows, and the error still displays if an illustration fails to load.
