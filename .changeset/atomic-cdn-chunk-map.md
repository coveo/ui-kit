---
'@coveo/atomic': patch
---

Serve the CDN build from a computed chunk partition instead of a shared-chunk threshold: a typical search page fetches 16 Atomic files instead of 74 and is ready about 0.3 s sooner on a mid-range phone.
