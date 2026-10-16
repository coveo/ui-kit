---
'@coveo/headless': patch
---

Stop the SSR "Missing navigator context" warning from recommending the deprecated `setNavigatorContextProvider`. On `@coveo/headless/ssr-commerce`, it now says to pass `navigatorContext` to `fetchStaticState()` and `hydrateStaticState()`. On `@coveo/headless/ssr`, it says to pass a `navigatorContextProvider` to `defineSearchEngine()`, which the `setNavigatorContextProvider` deprecation notice now recommends too, instead of a `navigatorContext` option that `fetchStaticState()` doesn't accept.
