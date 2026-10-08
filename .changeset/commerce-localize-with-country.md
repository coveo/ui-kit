---
'@coveo/atomic': minor
---

Add a `localize-with-country` property to `atomic-commerce-interface` and `atomic-commerce-recommendation-interface`. When set, the interface localizes with the country of the commerce context as well as its language, for example `fr-CA` rather than `fr`, so number, currency, and date formatting follow the country: with `en` and `CA`, a CAD price renders as `$1,000.10` rather than `CA$1,000.10`.
