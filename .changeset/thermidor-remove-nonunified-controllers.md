---
"@coveo/thermidor": patch
---

Removed the non-unified public controllers (`buildConverseController`, `buildSearchBoxController`, `buildResultListController`, `buildProductListController`, `buildPaginationController`, `buildSortController`, `buildCartController`) and the `public/actions` helpers. The supported controllers are now the unified converse controller (`buildUnifiedConverseController`) and the schema-driven remote controller (`buildRemoteController`).
