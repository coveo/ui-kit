---
'@coveo/headless': minor
---

In the experimental SSR sub-packages, `hydrateStaticState()` is typed as taking exactly what `fetchStaticState()` returns, so the static state can be passed as is, even when a controller requires props: the static state carries the controller props under `controllerProps`, and search now keeps them through hydration as commerce does.
