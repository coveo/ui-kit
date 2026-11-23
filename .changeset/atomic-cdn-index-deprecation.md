---
'@coveo/atomic': minor
---

The CDN `index.js` is deprecated: it logs one warning in the browser console on each page that loads it. Import `defineCustomElements` and the other loader exports from `index.esm.js` in the same folder instead, for example `https://static.cloud.coveo.com/atomic/v3/index.esm.js`, which exports everything `index.js` exports. Version 4 removes `index.js` from the CDN. The npm entry `@coveo/atomic/loader` doesn't change.
