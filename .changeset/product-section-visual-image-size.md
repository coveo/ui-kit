---
'@coveo/atomic': patch
---

`image-size` on `atomic-product-section-visual` now overrides the `image-size` of the product list for the products that use its template, as `image-size` on `atomic-result-section-visual` does for results. Before, the product list ignored it.
