---
'@coveo/headless': patch
---

In the experimental commerce SSR sub-package, an alias of the static state, such as `type ListingStaticState = InferStaticState<typeof listingEngineDefinition>`, now shows as `CommerceStaticState<…>` in editor tooltips, like a variable of that type, instead of an intersection of internal types. Its members are unchanged.
