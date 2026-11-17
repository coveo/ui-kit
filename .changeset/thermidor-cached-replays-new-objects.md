---
'@coveo/thermidor': patch
---

A concurrent action's answer taken from the cache, or applied again, now reaches the renderer stream as new objects instead of the ones it first delivered. A renderer that resets local state, such as a picked product child, when a value's identity changes now resets on every write.
