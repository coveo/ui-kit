---
'@coveo/create-atomic-component-project': patch
'@coveo/atomic': patch
---

Remove TODO comments and workarounds whose blocking work is already complete. `ResultTemplateProvider` now imports `atomic-result-link` directly instead of relying on the element being registered elsewhere, and the internal `componentOnReady` readiness fallbacks no longer depend on types from `@stencil/core/internal`.
