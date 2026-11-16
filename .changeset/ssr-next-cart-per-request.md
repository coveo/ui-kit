---
'@coveo/headless': minor
---

In the experimental commerce SSR sub-package, the engine definition configuration no longer accepts a `cart`. A definition is shared by every request, so the cart comes from `fetchStaticState()` only.
