---
'@coveo/headless-react': patch
---

In the experimental commerce SSR sub-package, the provider built by `buildProviderWithDefinition()` now throws a failed hydration during render, so the nearest error boundary reports it instead of an unhandled promise rejection leaving the page non-interactive. It also ignores the result of a hydration that a newer static state superseded.
