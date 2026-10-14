---
'@coveo/atomic': patch
---

Build the conditions of `atomic-field-condition` and `atomic-product-field-condition` with a shared helper, so every component that supports `if-defined`, `if-not-defined`, `must-match-*` and `must-not-match-*` combines them the same way. No behavior change.
