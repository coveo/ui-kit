---
'@coveo/headless': minor
---

Headless now logs a warning through the engine logger the first time an engine uses `restoreTab`, the `activeTab` option of the facet, category facet, date facet and numeric facet register actions, `buildFieldSuggestionsGenerator`, or calls the generated answer `logCitationClick` without an `answerId`. Version 4 removes these APIs. Use `loadTabSetActions(engine).updateActiveTab` instead of `restoreTab`, omit the `activeTab` option, use `buildFilterSuggestionsGenerator` instead of `buildFieldSuggestionsGenerator`, and pass the answer ID to `logCitationClick`. Unlike `restoreTab`, `updateActiveTab` also resets pagination and deselects the facets hidden on that tab, so dispatch it before restoring them. The warnings follow the configured log level.
