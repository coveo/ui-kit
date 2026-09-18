---
'@coveo/headless': minor
---

`@coveo/headless/ssr-next`: added an optional per-request `accessToken` to the search `BuildConfig`,
so `fetchStaticState()` and `hydrateStaticState()` can use a per-user search token without mutating
the shared engine definition. When omitted, the definition's configured token is used.

**BREAKING (open alpha)** removed `getAccessToken()` and `setAccessToken()` from the search engine
definitions, along with the shared access-token manager behind them.

The access token is now configured like `navigatorContext`: per request, through the build config,
with no setter on the shared definition. `setAccessToken()` wrote to the module-level definition that
every request reads, so two overlapping requests could cross tokens and one user could issue requests
under another user's permissions.

Migrate as follows:

- To choose the token for a request, pass `accessToken` to `fetchStaticState()`. It is returned with
  the static state, so passing that static state to `hydrateStaticState()` carries the token to the
  client automatically.
- To rotate an expiring token on an engine that is already running, configure `renewAccessToken` on
  the engine configuration. The engine renews proactively before a request and reactively on an
  unauthorized response.

This brings the search engine definition in line with the commerce one.
