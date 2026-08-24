---
'@coveo/ui-kit-sample-headless-ssr-commerce-nextjs': patch
---

Render products from `results` when the product list controller opts into `enableResults`. The sample previously read only `products`, which the Commerce API leaves empty for those requests, so no products appeared on the listing and search pages.
