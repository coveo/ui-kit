---
'@coveo/atomic': patch
---

Fix a CDN-only issue introduced in v3.55.0 where transitive component imports were wrongfully treeshaked from the CDN output.
