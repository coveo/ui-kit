---
'@coveo/headless-react': patch
---

Pass the `navigatorContext` prop of the `@coveo/headless-react/ssr-commerce` providers to `hydrateStaticState()` instead of setting it on the shared engine definition. Rendering a provider on the server no longer leaves that request's navigator context on the definition for later requests.
