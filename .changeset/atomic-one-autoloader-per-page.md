---
'@coveo/atomic': patch
---

A page that runs two Atomic loaders, such as the `atomic.esm.js` script tag plus a `defineCustomElements` call from the CDN `index.js`, now registers each component once. Before, each loader imported its own copy of every component, the second copy failed with "[Atomic] Failed to register" errors, and some components could stay undefined. Now the first loader to run registers the components, and later loader calls hand it the roots they receive.
