---
'@coveo/atomic': patch
---

Item context controllers no longer clear a component error that they didn't set, and `atomic-component-error` logs each error to the console only once.
