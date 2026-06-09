---
'@coveo/atomic': patch
---

Fixed incorrect ARIA roles on `atomic-pager`, `atomic-commerce-pager`, and `atomic-insight-pager`. Removed `role="toolbar"` and `role="radiogroup"` wrappers, replaced radio input page buttons with plain buttons using `aria-current="page"` on the active page. The `<nav aria-label="Pagination">` landmark and all `::part()` selectors are preserved.
