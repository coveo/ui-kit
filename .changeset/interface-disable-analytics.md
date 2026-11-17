---
'@coveo/atomic': minor
---

Add the `disable-analytics` attribute to `atomic-search-interface`, `atomic-commerce-interface`, `atomic-commerce-recommendation-interface`, `atomic-insight-interface`, and `atomic-recs-interface`. It follows the HTML boolean attribute rules: it defaults to `false`, and setting it has the same effect as `analytics="false"`. The `analytics` attribute is deprecated and will be removed in the next major version of Atomic (v4): replace `analytics="false"` with `disable-analytics`, or set the `disableAnalytics` property to `true` instead of setting `analytics` to `false`. Until then, analytics are off when either attribute turns them off.
