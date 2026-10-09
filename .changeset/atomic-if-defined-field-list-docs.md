---
'@coveo/atomic': patch
---

Correct the documentation of comma-separated field names in `if-defined` and `if-not-defined`: every listed field must be defined for `if-defined`, and none of them for `if-not-defined`, rather than any one of them as the `atomic-field-condition` documentation previously stated. The documentation of `atomic-field-condition`, `atomic-product-field-condition` and the result, product and insight templates now also notes that field names are not trimmed, so a space after a comma becomes part of the field name.
