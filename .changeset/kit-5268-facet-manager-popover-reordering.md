---
'@coveo/atomic': patch
---

Reorder facets nested inside an `atomic-popover` in `atomic-facet-manager`.

`atomic-facet-manager` only looked at its direct children when collecting facets, so facets slotted
inside an `atomic-popover` were never sorted by the facet manager and Dynamic Navigation Experience
re-ordering had no effect on them. Those facets are now discovered through their popover, and their
popover is the element moved when reordering, so the facet stays slotted inside it. Facets nested in
a popover are excluded from the `collapse-facets-after` logic, since a popover always displays its
facet expanded.
