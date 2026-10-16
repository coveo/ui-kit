---
'@coveo/headless': patch
'@coveo/headless-react': patch
---

Correct three deprecation notices on the SSR commerce sub-packages. `FetchStaticStateOptions` on `@coveo/headless/ssr-commerce` pointed to `BuildConfig`, which only `@coveo/headless/ssr-commerce-next` exports; it now says that its `accessToken` and `navigatorContext` options stay supported. The `defineCart` notice now names the cart controller instead of the context controller. The `navigatorContext` prop of the `@coveo/headless-react/ssr-commerce` providers said to set the navigator context when fetching the static state, which doesn't reach the hydrated engine on that sub-package; it now says to keep passing it until the next major version.
