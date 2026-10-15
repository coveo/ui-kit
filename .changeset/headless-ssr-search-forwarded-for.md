---
'@coveo/headless': patch
---

Fix `@coveo/headless/ssr` sending the first request's `x-forwarded-for` header on every later request. `fetchStaticState()` stored its forwarded-for wrapper on the shared engine definition, and that wrapper kept reading the navigator context of the request that created it, so later `setNavigatorContextProvider()` calls no longer changed the header. Each engine now gets its own wrapper, on a copy of the definition options, so each request forwards its own address.
