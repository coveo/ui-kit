---
"@coveo/thermidor": patch
---

Removed the non-unified interfaces (`buildGenerativeInterface`, `buildSearchInterface`, `buildCommerceInterface`) and the internal machinery they depended on: the legacy `/converse` generative runtime, the conversation/converse-search API layers, and the standalone search/query-suggest/result-list/search-parameters internals. The shared conversational state types were relocated under `features/generative`. The remaining public surface is the unified interface (`buildGenerativeUnifiedInterface`), the unified converse controller (`buildUnifiedConverseController`), and the schema-driven remote controller (`buildRemoteController`).
