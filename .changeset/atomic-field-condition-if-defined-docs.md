---
'@coveo/atomic': patch
---

Correct the `atomic-field-condition` documentation for comma-separated field names. In `if-defined`, every listed field must be defined (logical AND), and in `if-not-defined`, none of the listed fields may be defined, rather than any one of them as the documentation previously stated. The documentation now also notes that field names are not trimmed, so a space after a comma becomes part of the field name.
