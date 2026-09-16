---
'@coveo/headless': minor
---

feat(headless): support a per-request access token in SSR commerce `fetchStaticState()`

The `@coveo/headless/ssr-commerce` engine definition now accepts an optional `accessToken` when
fetching the static state (or calling `build()`). It overrides the definition's configured token
for that request only, without mutating the shared definition — the supported way to use per-user
search tokens in a multi-tenant server process. When omitted, the definition's configured token is
used.
