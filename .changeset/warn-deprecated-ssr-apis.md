---
'@coveo/headless': minor
---

The legacy server-side rendering APIs now log a warning the first time a deprecated member is used, once per engine definition so that a server doesn't log it on every request. This covers `build`, `fetchStaticState.fromBuildResult`, `hydrateStaticState.fromBuildResult`, `setNavigatorContextProvider`, `getAccessToken`, `setAccessToken` and the `extend` build option of the search and commerce definitions. It also covers the commerce `defineContext`, `defineCart` and `defineParameterManager` definers, and the `listing` and `search` options of the commerce definers. Each warning says what to use instead, and the warnings follow the configured log level.
