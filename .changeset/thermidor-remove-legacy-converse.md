---
"@coveo/thermidor": patch
---

Removed the legacy `/converse`-based conversational stack (`buildGenerativeInterface`, `buildConverseController`, the generative runtime, and the conversation/converse-search API layers) in favor of the unified conversational surface (`buildGenerativeUnifiedInterface` + `buildUnifiedConverseController`).
