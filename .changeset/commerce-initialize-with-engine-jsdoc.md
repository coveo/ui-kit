---
'@coveo/atomic': patch
---

Fix the `initializeWithEngine` description of `atomic-commerce-interface`: it no longer claims that the `language` property is bypassed. The engine's own configuration is used, so properties that configure the engine, such as `disableAnalytics`, are bypassed.
