---
'@coveo/headless': patch
---

Make `enableAnalytics()` and `disableAnalytics()` work on the commerce engine. Before, they had no effect: the engine kept the analytics state it was built with, so events were still sent after `disableAnalytics()`.
