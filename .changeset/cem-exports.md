---
'@coveo/atomic': patch
---

Stop listing duplicated and unrelated exports (barrel re-exports, overloaded utilities, type aliases) in the custom elements manifest. It now only exports the public custom elements.
