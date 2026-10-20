---
'@coveo/headless-react': patch
---

In the experimental commerce SSR sub-package, the `staticState` prop of the provider built by `buildProviderWithDefinition()` is typed as the static state returned by that definition's `fetchStaticState()`, so passing the static state of another engine definition is a compile-time error.
