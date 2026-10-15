---
'@coveo/atomic': patch
---

Fix `atomic-facet-manager` not sorting facets wrapped in an `atomic-popover` with the Dynamic Navigation Experience. The popover now moves along with its facet and, because a popover always displays its facet expanded, such a facet is never collapsed. In `atomic-search-layout`, popovers inside a facet manager in the `horizontal-facets` section keep the layout of direct-child popovers: a single row on desktop, hidden on mobile.
