---
'@coveo/headless-react': minor
---

In the experimental commerce SSR sub-package, `defineCommerceEngine()` returns three engine definitions, `listingEngineDefinition`, `searchEngineDefinition` and `standaloneEngineDefinition`; `recommendationEngineDefinition` is removed. Recommendation slots are requested through the `recommendations` option of any `fetchStaticState()` call, and their hooks work inside any provider, so a page and its recommendations share one provider.
