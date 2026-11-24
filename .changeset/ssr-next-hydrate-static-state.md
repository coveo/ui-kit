---
'@coveo/headless': minor
---

In the experimental SSR sub-packages, `hydrateStaticState()` takes exactly what `fetchStaticState()` returns: pass the static state as is. An object built by hand, such as `{searchActions, navigatorContext, context}`, no longer compiles.
