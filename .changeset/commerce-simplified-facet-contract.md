---
'@coveo/headless': patch
---

Commerce facet value searches and field suggestions now send the facet `field` along with its `facetId`. When a commerce facet response has no `facetId`, Headless uses the facet `field` as its ID. Show more and show less on commerce regular and category facets now use the initial number of values that the Commerce API returns, when it returns one. These changes keep commerce facets working as the Commerce API moves to a simpler facet contract. No code change is needed.
