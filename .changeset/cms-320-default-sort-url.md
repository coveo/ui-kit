---
'@coveo/headless': patch
---

Fix default commerce sort being appended to the URL on page load.

The `getSortCriteria` selector was using reference equality (`!==`) to compare the current sort against the initial state. Because commerce sort criteria are objects, two equal-valued instances were never `===`, causing `sortCriteria=relevance` to always be serialized into the URL fragment even when the user had not changed the sort. The fix uses deep equality so the default sort is correctly omitted from the URL.
