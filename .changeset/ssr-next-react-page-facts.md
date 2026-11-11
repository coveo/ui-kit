---
'@coveo/headless-react': minor
---

In the experimental SSR sub-packages, the React wrappers follow the page-facts contract of the engine definitions: `fetchStaticState()` takes no `controllers` option, the static state carries no `controllerProps`, and the baked-in controllers are added through `augmentCommerceControllerDefinitions()` and `augmentSearchControllerDefinitions()` instead of the removed `defineCart()`, `defineContext()`, `defineParameterManager()` and `defineSearchParameterManager()` definers.
