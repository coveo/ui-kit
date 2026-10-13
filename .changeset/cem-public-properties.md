---
'@coveo/atomic': patch
'@coveo/atomic-angular': patch
---

Expose the `results-per-page` attribute of `atomic-insight-interface` and the `error` input of `atomic-component-error` in the custom elements manifest and in their Angular wrappers. The manifest no longer hides a public property because another component binds a controller of the same name.
