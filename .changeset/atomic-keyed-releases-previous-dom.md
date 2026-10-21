---
'@coveo/atomic': patch
---

Stop keeping replaced results, products, facet values and breadcrumbs in memory. The result and product lists in the list and table displays, the facet values and the breadcrumbs re-create their items with Lit's `keyed()` directive, which never released the items it replaced because they contain a `ref()`. A search page kept every page of results it had displayed, about 1 MB per query. These components now release the items they replace.
