---
'@coveo/headless': minor
---

In the experimental SSR sub-packages, `hydrateStaticState()` is now typed as taking exactly what `fetchStaticState()` returns, so the static state can be passed as is even when a controller requires props: the static state carries the controller props under `controllerProps` (search included), the controller states are typed as `{state, initialState?}` for the baked-in controllers too, and the hydrated controllers list exactly the controllers that are built for the solution type. The engine definition options no longer accept a `navigatorContextProvider`, which was ignored: pass the `navigatorContext` to `fetchStaticState()`. The commerce `searchParams` option is optional, as it already was at runtime.
