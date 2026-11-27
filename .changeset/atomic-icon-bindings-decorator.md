---
'@coveo/atomic': patch
---

`atomic-icon` now gets its bindings through the same mechanism as every other Atomic component. Icons render as before, and an icon placed outside an Atomic interface still logs the missing interface error in the console and renders nothing.
