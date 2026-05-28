---
'@coveo/atomic': patch
---

Add localized accessible label to the image carousel region using the product name (e.g., "Image gallery for {productName}"). The `label` prop on `CarouselProps` is now required, ensuring all callers provide a meaningful accessible name.
