---
'@coveo/headless-react': patch
---

In the experimental commerce SSR sub-package, the `staticState` prop of the provider built by `buildProviderWithDefinition()` is typed as exactly the static state returned by that definition's `fetchStaticState()`.
