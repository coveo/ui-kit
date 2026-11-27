---
'@coveo/quantic': major
---

`c/quanticUtils` no longer exports `RecentQueryUtils` and its `formatRecentQuery` function. The search box suggestions list now formats recent queries itself, so Quantic doesn't need it anymore. If your own components call `RecentQueryUtils.formatRecentQuery`, copy the function into your component.
