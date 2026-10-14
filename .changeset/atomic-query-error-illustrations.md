---
'@coveo/atomic': patch
---

Load the illustrations of `atomic-query-error`, `atomic-commerce-query-error`, `atomic-insight-query-error` and `atomic-recs-error` only when an error is displayed. They weigh about 80 KB together, and pages that never display an error no longer download them.
