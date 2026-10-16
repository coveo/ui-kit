---
'@coveo/headless': patch
---

Deprecate `getAccessToken()` and `setAccessToken()` on the `@coveo/headless/ssr` engine definition, as on `@coveo/headless/ssr-commerce`. To renew an expiring token, configure `renewAccessToken`; to change the token of an engine you already have, dispatch `updateBasicConfiguration({accessToken})` from `loadConfigurationActions(engine)`.
