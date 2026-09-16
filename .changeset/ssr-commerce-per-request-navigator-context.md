---
'@coveo/headless': minor
---

feat(headless): support a per-request navigator context in SSR commerce `fetchStaticState()`

The `@coveo/headless/ssr-commerce` engine definition now accepts an optional `navigatorContext` when
fetching the static state (or calling `build()`), applied to that request only without mutating the
shared definition. This prevents concurrent server requests from reading each other's client ID,
user agent, or forwarded-for values. When omitted, the provider set with
`setNavigatorContextProvider` is used. The previous shared-options mutation on the static-state path
is removed.
