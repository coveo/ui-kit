---
'@coveo/atomic': minor
---

The CDN `index.esm.js` now also exports the loader: `defineCustomElements`, `applyPolyfills`, `setNonce`, `atomicVersion` and `headlessVersion`. They are the CDN `index.js`'s own exports, so a page gets one loader whichever of the two files it imports. `index.esm.js` also stops waiting for Headless before it runs: on the CDN, `bindLogDocumentOpenOnResult` loads Headless when it is called. The npm entries don't change.
