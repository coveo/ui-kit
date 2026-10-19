---
'@coveo/headless': minor
---

Add an optional per-request `navigatorContext` to `fetchStaticState()`, `hydrateStaticState()` and `build()` in `@coveo/headless/ssr`. It applies to that call only, without mutating the shared engine definition, so concurrent requests no longer risk sending each other's client ID, user agent or `x-forwarded-for` address. When it is omitted, the provider set with `setNavigatorContextProvider()` is still used. The "Missing navigator context" warning and the `setNavigatorContextProvider()` deprecation notice now point to this option.
