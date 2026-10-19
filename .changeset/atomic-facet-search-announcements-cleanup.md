---
'@coveo/atomic': patch
---

Stop the facet search announcements from keeping removed facets in memory. They now unsubscribe when their facet leaves the DOM, so the facets copied into the refine modal are released once it closes. A facet that comes back to the page, or is copied into the refine modal while a facet search shows results, no longer repeats the announcement.
