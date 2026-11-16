---
'@coveo/headless': patch
---

In the experimental commerce SSR sub-package, a recommendation slot listed twice in `fetchStaticState()` is requested once instead of making the call wait forever.
