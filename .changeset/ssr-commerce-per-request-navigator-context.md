---
'@coveo/headless': minor
---

feat(headless): support a per-request navigator context in SSR commerce `fetchStaticState()` and `hydrateStaticState()`

The `@coveo/headless/ssr-commerce` engine definition now accepts an optional `navigatorContext` when
fetching the static state, hydrating it, or calling `build()`. It is applied to that call only,
without mutating the shared definition. When omitted, the provider set with
`setNavigatorContextProvider` is used.

This also removes the shared-options mutation on the static-state path, which caused a more serious
problem than a race. `fetchStaticState()` used to assign the forwarded-for wrapper onto the shared
`configuration.preprocessRequest`, and that wrapper resolves its navigator context from the options
object it captured. Because the augmentation short-circuits on an already-wrapped function, the
wrapper created by the first request was reused for the lifetime of the process — so every subsequent
request sent the **first** request's `x-forwarded-for` value, regardless of any later
`setNavigatorContextProvider()` call. The augmentation now happens per request, on a copy, so each
request forwards its own address.
