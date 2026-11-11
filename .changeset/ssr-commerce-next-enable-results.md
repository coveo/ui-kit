---
'@coveo/headless': minor
---

In the experimental commerce SSR sub-package, `enableResults` is set once on the engine definition, as `true` or as `{search, listing}`, and applies to every listing or search request of the matching kind, whichever controller triggers it: product list, pagination, sort, facets, summary, breadcrumbs, parameter manager, search box, recent queries list, did-you-mean and query trigger all build their requests with the flag of the definition, as does the first request of `fetchStaticState()`. The flag leaves `defineProductList()`, `defineSearchBox()`, `defineRecentQueriesList()`, `defineDidYouMean()` and `defineQueryTrigger()`, and `ProductListOptions`, `DidYouMeanOptions` and `QueryTriggerOptions` leave the sub-package. See the upgrade guide, "`enableResults`".
