---
'@coveo/headless': patch
---

Deprecate `getAccessToken()` and `setAccessToken()` on the `@coveo/headless/ssr` engine definition, as on `@coveo/headless/ssr-commerce`; `@coveo/headless/ssr-next` no longer has them. `setAccessToken()` mutates the shared definition, which is unsafe on a server handling concurrent requests. To rotate a token, configure `renewAccessToken` on the engine configuration; to use a different token per request, use `@coveo/headless/ssr-next`, whose `fetchStaticState()` and `hydrateStaticState()` take an `accessToken`.
