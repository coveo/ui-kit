---
'@coveo/atomic': minor
---

The Atomic CDN now publishes the loader as `loader.js`, the name of its npm entry `@coveo/atomic/loader`. The CDN file `index.js` is deprecated: it keeps the same exports, and it logs one warning in the browser console on each page that loads it. If your page imports `defineCustomElements` from `index.js`, for example from `https://static.cloud.coveo.com/atomic/v3/index.js`, import it from `loader.js` in the same folder instead. Version 4 removes `index.js` from the CDN. The npm entry `@coveo/atomic/loader` doesn't change.
