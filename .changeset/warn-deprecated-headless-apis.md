---
'@coveo/headless': minor
---

Headless now logs a warning through the engine logger the first time an engine uses `restoreTab`, the `activeTab` option of the facet, category facet, date facet and numeric facet register actions, or `buildFieldSuggestionsGenerator`. Version 4 removes these APIs. Use `loadTabSetActions(engine).updateActiveTab` instead of `restoreTab`, omit the `activeTab` option, and use `buildFilterSuggestionsGenerator` instead of `buildFieldSuggestionsGenerator`. The warnings follow the configured log level.
