---
'@coveo/headless': patch
---

In the experimental SSR sub-packages, a missing navigator context no longer makes the platform client skip the configured `preprocessRequest`, and the warning about a missing `forwardedFor` names `fetchStaticState()`.
