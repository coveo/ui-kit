---
'@coveo/atomic': patch
'@coveo/headless': patch
'@coveo/atomic-hosted-page': patch
'@coveo/atomic-react': patch
'@coveo/shopify': patch
---

CDN artifacts now resolve cross-package dependencies using commit-based paths, making each artifact self-contained and independent of version pointer availability.
