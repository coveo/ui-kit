---
'@coveo/atomic': patch
---

Remove commerce location facets from the breadbox

`LocationFacetValue` is removed from the internal breadcrumb value union, following the removal of commerce location facets from `@coveo/headless`. This type is not exported from any Atomic entry point, so there is no public Atomic API change.
