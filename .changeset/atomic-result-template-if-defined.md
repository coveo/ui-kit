---
'@coveo/atomic': minor
---

Add the `if-defined` and `if-not-defined` attributes to `atomic-result-template`, `atomic-result-children-template` and `atomic-product-template`, and restore them on `atomic-recs-result-template` and `atomic-insight-result-template`, which have ignored them since moving to Lit. A template can now apply only to items that have, or lack, specific fields (for example, `<atomic-result-template if-defined="author">`), and `atomic-insight-result-children-template` evaluates these attributes the same way without adding them to its `conditions` property.
