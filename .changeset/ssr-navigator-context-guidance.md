---
'@coveo/headless': patch
---

Point the SSR "Missing navigator context" warning to supported options instead of the deprecated `setNavigatorContextProvider`: on `@coveo/headless/ssr-commerce`, pass `navigatorContext` to `fetchStaticState()` and `hydrateStaticState()`; on `@coveo/headless/ssr`, use `@coveo/headless/ssr-next`. The `setNavigatorContextProvider` deprecation notice on `@coveo/headless/ssr` also no longer suggests a `navigatorContext` option that its `fetchStaticState()` doesn't accept.
