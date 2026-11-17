---
'@coveo/headless': patch
---

In the experimental commerce SSR sub-package, `hydrateStaticState()` now awaits the replayed actions with `Promise.all()` instead of awaiting an array of promises. The replayed actions already settle while they are dispatched, so the hydration timing does not change.
