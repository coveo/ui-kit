---
'@coveo/atomic': patch
---

Fix a CDN-only issue introduced in v3.55.0 that caused TailwindCSS utility classes containing a period to not apply (e.g. `.p-2.5`)
