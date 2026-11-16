---
'@coveo/atomic': patch
---

Removing sunsetted experimental feature: commerce location facets

Following the removal of commerce location facets from `@coveo/headless`, `LocationFacetValue` is removed from the internal breadcrumb value type of `atomic-commerce-breadbox`. This type is not exported from any Atomic entry point, so there is no public Atomic API change and no change in behavior.
