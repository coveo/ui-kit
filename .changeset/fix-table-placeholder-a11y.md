---
'@coveo/atomic': patch
---

Hide the decorative table loading placeholder from assistive technologies. The skeleton `atomic-result-table-placeholder` was exposed as an unlabeled `table` role, so screen readers announced an empty table during loading. It is now marked `aria-hidden`, leaving the actual results/products table as the only exposed table.
