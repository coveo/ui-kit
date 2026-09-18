---
'@coveo/headless': minor
---

**BREAKING (open alpha)** `@coveo/headless/ssr-commerce-next`: removed `getAccessToken()` and
`setAccessToken()` from the commerce engine definitions, along with the shared access-token manager
behind them.

The access token is now configured the same way as `navigatorContext`: per request, through the build
config, with no setter on the shared definition. This removes a class of concurrency bug — the shared
token manager pushed updates into engines that had already been built with their own per-request
token, so a queued or concurrent `setAccessToken()` could silently replace one request's token.

Migrate as follows:

- To choose the token for a request, pass `accessToken` to `fetchStaticState()`. It is returned with
  the static state, so passing that static state to `hydrateStaticState()` carries the token to the
  client automatically.
- To rotate an expiring token on an engine that is already running, configure `renewAccessToken` on
  the engine configuration. The engine renews proactively before a request and reactively on an
  unauthorized response.

`@coveo/headless/ssr-commerce` is unchanged: `getAccessToken()` and `setAccessToken()` still work
there but are now deprecated, with the same migration path.
