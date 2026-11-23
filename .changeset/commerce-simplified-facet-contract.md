---
'@coveo/headless': patch
---

Headless is ready for the simplified Commerce facet API, so commerce facets keep working when the API removes its legacy facet properties in June 2027. Facet value searches and field suggestions send the facet's `field` along with its `facetId`, and a facet response without a `facetId` uses its `field` as ID. Show more and show less on regular and category facets use the initial number of values that the API returns, when it returns one, so show less appears on a page that loads with more values already shown. No code change is needed.
