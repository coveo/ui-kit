---
'@coveo/atomic': patch
---

Load Atomic's regional translations again when the interface `language` has a region, as before 3.61.0: `es-ES`, `pt-BR`, `zh-CN`, and `zh-TW` interfaces no longer fall back to the `es`, `pt`, and `zh` strings. Register customizations for a regional interface under its regional code (for example `pt-BR`), because it takes precedence over the base language. Facet search now also resolves field captions through the same language fallbacks as the displayed captions, so captions registered under `en` apply to an `en-CA` interface.
