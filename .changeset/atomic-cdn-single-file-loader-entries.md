---
'@coveo/atomic': patch
---

Load the CDN `atomic.esm.js` and `index.js` as single files. Each one used to import a second file, the map of tags to component files, before it could start loading components. The two files no longer export the bundler's internal `__webpack_require__` function.
