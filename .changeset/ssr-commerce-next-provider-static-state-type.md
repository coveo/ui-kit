---
'@coveo/headless-react': patch
---

In the experimental commerce SSR sub-package, the `staticState` prop of the provider built by `buildProviderWithDefinition()` is typed as exactly the static state returned by that definition's `fetchStaticState()`. A static state trimmed or built by hand, such as `{searchActions, controllers}`, no longer compiles: pass the value that `fetchStaticState()` returned, as is.
