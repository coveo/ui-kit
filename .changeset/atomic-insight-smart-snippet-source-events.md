---
'@coveo/atomic': patch
---

Make `atomic-insight-smart-snippet` listen to the `select-source`, `begin-delayed-select-source` and `cancel-pending-select-source` events of `atomic-smart-snippet-source`, instead of setting its deprecated callback properties. Selecting the source still logs the same analytics, once.
