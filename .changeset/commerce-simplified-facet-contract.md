---
'@coveo/headless': patch
---

Commerce facet value searches now send the facet's `field` along with its `facetId`, as the simplified Commerce facet API expects. This keeps facet search and field suggestions working once the API stops reading `facetId` there. No code change is needed.
