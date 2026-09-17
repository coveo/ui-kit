---
'@coveo/headless': minor
---

feat(headless): support a per-request access token in SSR commerce `fetchStaticState()` and `hydrateStaticState()`

The `@coveo/headless/ssr-commerce` engine definition now accepts an optional `accessToken` when
fetching the static state, hydrating it, or calling `build()`. It overrides the definition's
configured token for that call only, without mutating the shared definition — the supported way to
use per-user search tokens in a multi-tenant server process. When omitted, the definition's
configured token is used.

Pass the same token to `hydrateStaticState()` that was used for `fetchStaticState()` so the hydrated
engine keeps querying with the same permissions. The hydrated engine outlives the call, so it stays
subscribed to `setAccessToken()` updates; the request-scoped engine built by `fetchStaticState()`
does not, which keeps a per-request token safe from concurrent updates on the shared definition.
