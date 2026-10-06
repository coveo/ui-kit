---
'@coveo/headless': minor
---

Add `buildSpotlightContentTemplatesManager` and `SpotlightContentTemplatesHelpers` to the commerce entry point, to register and select templates for Spotlight Content, like `buildProductTemplatesManager` and `ProductTemplatesHelpers` do for products. `ProductTemplatesHelpers.getProductProperty` now returns `null` instead of throwing when the item has no `additionalFields`.
