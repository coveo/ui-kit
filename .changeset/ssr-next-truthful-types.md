---
'@coveo/headless': minor
---

In the experimental SSR sub-packages, the types match what the engine builds: the static state types every controller, the baked-in ones included, as a `{state, initialState?}` snapshot rather than a live controller, and the hydrated controllers list exactly the controllers built for the solution type, so search includes `parameterManager` and the commerce standalone definition does not. The engine definition options no longer accept a `navigatorContextProvider`, which was ignored: pass the `navigatorContext` to `fetchStaticState()`. The commerce `searchParams` option is optional, as it already was at runtime.
