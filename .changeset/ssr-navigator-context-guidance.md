---
'@coveo/headless': patch
---

Point the SSR "Missing navigator context" warning to supported options instead of the deprecated `setNavigatorContextProvider`: on `@coveo/headless/ssr-commerce`, pass `navigatorContext` to `fetchStaticState()` and `hydrateStaticState()`; on `@coveo/headless/ssr`, pass a `navigatorContextProvider` to `defineSearchEngine()`, or use `@coveo/headless/ssr-next` for a per-request `navigatorContext`. The `setNavigatorContextProvider` deprecation notice on `@coveo/headless/ssr` now gives the same options, instead of a `navigatorContext` option that its `fetchStaticState()` doesn't accept.
