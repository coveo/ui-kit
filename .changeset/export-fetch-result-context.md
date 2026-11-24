---
'@coveo/atomic': minor
---

`@coveo/atomic` now exports `fetchResultContext`, from npm and from the CDN `index.esm.js`. It retrieves the result that a custom result template component is rendered for, and replaces the deprecated `resultContext`: it takes the same element and returns the same promise, so you only need to rename the import and the call. `fetchProductContext`, which was already exported, replaces `productContext` the same way. Version 4 removes `resultContext` and `productContext`.
