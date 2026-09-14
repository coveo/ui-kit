---
'@coveo/headless': patch
---

fix(headless): stop retaining SSR commerce engines via the access-token registry

On the server, every engine built from a commerce engine definition registered a
token-update callback that retained the whole engine (Redux store and state, loggers,
relay instance, API client) for the lifetime of the process, causing linear memory
growth. The registration is now skipped on the static-state paths (`fetchStaticState` /
`hydrateStaticState`), whose engines are short-lived and never receive a token update, so
they are released as soon as the request completes. The callback is still registered for
the explicit `build()` path in `/ssr-commerce`, which can produce a long-lived engine. No
public API changes.
