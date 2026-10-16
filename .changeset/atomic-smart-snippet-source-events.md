---
'@coveo/atomic': patch
---

Fix the event names in the documentation of `atomic-smart-snippet-source`. The deprecation notices of its `onSelectSource`, `onBeginDelayedSelectSource` and `onCancelPendingSelectSource` callbacks now point to the `select-source`, `begin-delayed-select-source` and `cancel-pending-select-source` events that it dispatches, and the cancel event is no longer documented as `cancel-delayed-select-source`.
