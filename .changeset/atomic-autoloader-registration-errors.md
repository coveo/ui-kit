---
"@coveo/atomic": patch
---

Surface a console error in the autoloader when a component fails to register (e.g. a lazy-loaded chunk blocked by a network error, CDN issue, content security policy, proxy, or ad blocker) instead of failing silently.
