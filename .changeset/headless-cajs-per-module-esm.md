---
'@coveo/headless': patch
---

Import `HistoryStore` from `coveo.analytics` instead of keeping a vendored copy of the history store (and its supporting helpers), removing a source of drift between the two packages. No public API change.
