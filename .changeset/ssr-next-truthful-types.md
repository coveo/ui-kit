---
'@coveo/headless': minor
---

In the experimental SSR sub-packages, the static state types every controller as a `{state}` snapshot, the ones the definitions add on their own (`parameterManager`, and the commerce `cart` and `context`) included: read `state` from the static state, and call controller methods on the controllers that `hydrateStaticState()` returns. The hydrated controllers of search definitions now include the `parameterManager` they always built, and those of the commerce standalone definition no longer include one, since it never built it: use the listing or search definition on pages that need a parameter manager. The engine definition options no longer accept `navigatorContextProvider`, which was ignored: pass `navigatorContext` to `fetchStaticState()`, and the `SearchEngineOptions` type of the experimental search SSR sub-package leaves it out. The commerce search `searchParams` option is now optional, as it already was at runtime.
