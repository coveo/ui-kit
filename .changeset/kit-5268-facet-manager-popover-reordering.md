---
'@coveo/atomic': patch
---

Fix `atomic-facet-manager` not sorting facets wrapped in an `atomic-popover` with the Dynamic Navigation Experience. The popover now moves along with its facet, and, because a popover always displays its facet expanded, such a facet is never collapsed.
