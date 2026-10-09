---
'@coveo/atomic': patch
---

Restore the `if-defined` and `if-not-defined` attributes of `atomic-recs-result-template`, which have been ignored since the component moved to Lit, so a recommendation template can again apply only to results that have, or lack, specific fields (for example, `<atomic-recs-result-template if-defined="author">`).
