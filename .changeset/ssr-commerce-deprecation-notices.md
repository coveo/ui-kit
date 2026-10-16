---
'@coveo/headless': patch
'@coveo/headless-react': patch
---

Fix three misleading deprecation notices on the SSR commerce sub-packages. `FetchStaticStateOptions` no longer points to `BuildConfig`, which `@coveo/headless/ssr-commerce` doesn't export. `defineCart` now names the cart controller. The `navigatorContext` prop of the `@coveo/headless-react/ssr-commerce` providers no longer says to set the navigator context when fetching the static state.
