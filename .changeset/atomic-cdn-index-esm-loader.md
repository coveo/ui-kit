---
'@coveo/atomic': minor
---

The CDN `index.esm.js` now also exports the loader: `defineCustomElements`, `applyPolyfills`, `setNonce`, `atomicVersion` and `headlessVersion`, which the CDN `index.js` exports. A page or a custom component can now import Atomic's helpers and its loader from the same file. The CDN `index.js` and the npm entries don't change.
