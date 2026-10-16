---
'@coveo/atomic': patch
---

Stop keeping the previous results, products and facet values in memory. When the key of a rendered item changes, the result, product and recommendation lists, the table layout, the facet values, the breadcrumbs and the pagers now release what they rendered for the previous key. Before, Lit's `keyed()` directive never disconnected the previous content when it contained a `ref()`, so a result list kept every page of results it had displayed, about 1 MB per query on a search page.
