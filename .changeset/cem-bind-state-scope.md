---
'@coveo/atomic': patch
'@coveo/atomic-angular': patch
---

Expose the `results-per-page` attribute of `atomic-insight-interface` in the custom elements manifest and as an input of its Angular wrapper. The manifest no longer hides a public property because another component binds a controller of the same name.
