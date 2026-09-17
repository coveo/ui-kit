---
'@coveo/headless-react': minor
---

`@coveo/headless-react/ssr-commerce`: the provider returned by `buildProviderWithDefinition` now
accepts an optional `accessToken` prop, forwarded to `hydrateStaticState()`.

Pass the same token you passed to `fetchStaticState()` on the server so the hydrated engine keeps
querying with the same permissions for facets, pagination, and every request issued after hydration.
When omitted, the engine definition's configured access token is used, so this is backward compatible.

Previously the provider built the hydration arguments internally, so React consumers had no way to
supply a per-request token and the client engine silently fell back to the definition's token.

To rotate an expiring token on the running engine, configure `renewAccessToken` on the engine
configuration rather than changing the prop, which would rebuild the engine and lose its interaction
state.

`@coveo/headless-react/ssr-commerce-next` needs no change: its provider forwards the whole static
state, and `fetchStaticState()` returns the per-request token as part of it, so the token already
reaches the hydrated engine automatically. Added tests to keep that path from regressing.
