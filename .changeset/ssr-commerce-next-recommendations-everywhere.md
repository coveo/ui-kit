---
'@coveo/headless': minor
---

In the experimental commerce SSR sub-package, recommendation slots are requested from any engine definition: `fetchStaticState()` of the listing, search and standalone definitions takes `recommendations` (the names of the slots to request, typed from the definition) and `productId` (the product to seed them with), and the slot requests run alongside the listing or search request with the same engine. A page with recommendations needs one fetch, one engine and one provider instead of a second engine with its own copy of the cart and context. `recommendationEngineDefinition` and the `recommendation` solution type are removed: `standaloneEngineDefinition.fetchStaticState({recommendations})` covers pages that only show recommendations. `RecommendationNames` is exported.
