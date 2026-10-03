---
'@coveo/headless': patch
---

Keep a commerce facet's `preventAutoSelect` flag across search and listing responses so a value the user deselected is no longer auto-selected again on the next request. The flag is now reset only when a new query is submitted (or `updateAutoSelectionForAllCoreFacets({allow: true})` is dispatched) and when the context or view changes.
