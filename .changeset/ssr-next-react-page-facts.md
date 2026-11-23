---
'@coveo/headless-react': minor
---

In the experimental SSR sub-packages, the React wrappers follow the page-facts contract of the engine definitions: `fetchStaticState()` takes no `controllers` option, the static state carries no `controllerProps`, and the wrappers include the hooks of the built-in `parameterManager`, `context` and (commerce) `cart` controllers without the removed `defineCart()`, `defineContext()`, `defineParameterManager()` and `defineSearchParameterManager()` definers.
