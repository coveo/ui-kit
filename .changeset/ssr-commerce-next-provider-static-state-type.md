---
'@coveo/headless-react': patch
---

In the experimental commerce SSR sub-package, `buildProviderWithDefinition()` takes any engine definition that has a `StateProvider`, and the `staticState` prop of the provider it builds is typed as exactly the static state returned by that definition's `fetchStaticState()`. The `StateProvider` of a definition is typed with the controllers of its page, the baked-in ones included.
