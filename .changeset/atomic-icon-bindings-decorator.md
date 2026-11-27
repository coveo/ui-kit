---
'@coveo/atomic': patch
---

`atomic-icon` now gets its bindings through the same mechanism as every other Atomic component. When an `atomic-icon` is placed outside an Atomic interface, it still logs the missing interface error in the console, but it no longer renders an error message in place of the icon.
