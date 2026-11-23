---
'@coveo/headless': patch
---

Commerce facet value searches now send the facet's `field` along with its `facetId`, as the simplified Commerce facet API expects. This keeps facet search and field suggestions working once the API stops reading `facetId` there. Show more and show less on commerce regular and category facets now use the initial number of values that the Commerce API returns, when it returns one, so show less appears on a page that loads with more values already shown. No code change is needed.
