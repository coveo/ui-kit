---
'@coveo/atomic': patch
---

`atomic-product-field-condition` and `atomic-field-condition` now reevaluate their conditions on every update. `atomic-product-field-condition` no longer removes itself from the DOM when its conditions are not met, and `atomic-field-condition` no longer stays hidden once its conditions become true. Both toggle their `hidden` state instead.
