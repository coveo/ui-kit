---
"@coveo/thermidor": patch
---

Trimmed the public surface to the unified conversational + schema-driven experience. Removed the standalone controllers (`buildSearchBoxController`, `buildResultListController`, `buildProductListController`, `buildPaginationController`, `buildSortController`, `buildCartController`), the `public/actions` helpers, and the `buildSearchInterface`/`buildCommerceInterface` builders, along with the now-unused search interface implementation and query-suggest stubs. The remaining public surface is the unified interface (`buildGenerativeUnifiedInterface`), the unified converse controller (`buildUnifiedConverseController`), and the schema-driven remote controller (`buildRemoteController`).
