---
"@coveo/headless": patch
---

Fix an issue in commerce where a manually set numeric facet range persisted and was still sent in subsequent queries after clearing filters (e.g. via a search box submission), even though it had been removed from the URL parameters.
