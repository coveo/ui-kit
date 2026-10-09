---
'@coveo/atomic': patch
---

Restore the `if-defined` and `if-not-defined` attributes of `atomic-insight-result-template`, which have been ignored since the component moved to Lit, so an Insight result template can again apply only to results that have, or lack, specific fields (for example, `<atomic-insight-result-template if-defined="author">`). `atomic-insight-result-children-template` now evaluates these attributes the same way and no longer adds them to its `conditions` property.
