---
'@coveo/atomic': minor
---

Add support for Spotlight Content in commerce interfaces. Set the new `enable-spotlight-content` attribute on `atomic-commerce-interface` to request results from the Commerce API; `atomic-commerce-product-list` then displays Spotlight Content alongside products in the grid and list displays. Spotlight Content is rendered with the new `atomic-spotlight-content-template` component and its template components (`atomic-spotlight-content-link`, `atomic-spotlight-content-image` and `atomic-spotlight-content-text`), and can be custom-rendered with the new `setSpotlightContentRenderFunction` method of `atomic-commerce-product-list`.
