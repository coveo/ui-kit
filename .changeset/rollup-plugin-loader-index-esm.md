---
'@coveo/create-atomic-rollup-plugin': patch
---

`coveoCdnResolve()` now resolves `@coveo/atomic/loader` to the CDN `index.esm.js`, like `@coveo/atomic`, instead of the deprecated CDN `index.js`. Rebuild your project after you upgrade the plugin to stop the deprecation warning in the browser console.
