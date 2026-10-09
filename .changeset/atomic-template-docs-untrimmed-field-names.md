---
'@coveo/atomic': patch
---

Note in the `atomic-result-template`, `atomic-result-children-template`, `atomic-product-template`, `atomic-insight-result-template` and `atomic-insight-result-children-template` documentation that the field names in `if-defined` and `if-not-defined` are not trimmed, so a space after a comma becomes part of the field name.
