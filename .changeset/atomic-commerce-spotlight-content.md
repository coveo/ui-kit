---
'@coveo/atomic': minor
---

Add support for Spotlight Content in commerce interfaces. Set the new `enable-spotlight-content` attribute on `atomic-commerce-interface` to request results from the Commerce API; `atomic-commerce-product-list` then displays Spotlight Content alongside products in the grid and list displays. Spotlight Content is rendered with the new `atomic-spotlight-content-template` component, inside which `atomic-product-link`, `atomic-product-image` and `atomic-product-text` render the fields of the Spotlight Content and log Spotlight Content analytics. It can also be custom-rendered with the new `setSpotlightContentRenderFunction` method of `atomic-commerce-product-list`.
