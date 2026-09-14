---
'@coveo/headless': minor
---

feat(headless): support a per-request access token in SSR commerce `fetchStaticState()`

`fetchStaticState()` (and `hydrateStaticState()`) in `/ssr-commerce-next` now accept an optional
`accessToken` in their build config. When provided, it overrides the engine definition's configured
access token for that request only, without mutating the shared definition — the supported way to
use per-user Coveo search tokens in a multi-tenant server process. When omitted, the definition's
configured token is used, so the change is fully backward compatible.
