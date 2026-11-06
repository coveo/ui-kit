---
'@coveo/thermidor': minor
---

Send the locale with every request, read from the navigator context.

- `NavigatorContext` takes `language`, `country` and `currency`, and every request sends them. The navigator context is read per request, so the locale can change during a session.
- `SessionConfig` requires `navigatorContextProvider`. A session throws at creation when it is missing, and a request fails when its navigator context has a missing or blank `language`, `country` or `currency`.
- `createPrivateSession` (`@coveo/thermidor/private`) follows suit: it requires `navigatorContextProvider`, and its `PrivateSessionConfig` no longer takes `language`, `country` or `currency`.

**Breaking:** `navigatorContextProvider` is now required in `SessionConfig` and `PrivateSessionConfig`, `NavigatorContext` requires `language`, `country` and `currency`, and `PrivateSessionConfig` no longer takes `language`, `country` or `currency`.
