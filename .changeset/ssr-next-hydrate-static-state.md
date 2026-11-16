---
'@coveo/headless': minor
---

In the experimental SSR sub-packages, `hydrateStaticState()` takes exactly what `fetchStaticState()` returns, even when a controller requires props: pass the static state as is. An object built by hand, such as `{searchActions, navigatorContext, context}`, no longer compiles. The static state carries the controller props under `controllerProps`, so the search definitions and the commerce recommendation definition now keep them through hydration, as the other commerce definitions already did. Hydration builds each controller with the props it was fetched with, and with none when the fetch passed none. The props travel to the browser in the static state, so they must be serializable and must not hold secrets.
