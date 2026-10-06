---
'@coveo/atomic': patch
---

Fix `atomic-result-date` when the interface `language` has a region. With `relative-time`, a regional language such as `fr-CA` or `pt-BR` rendered English labels such as `Today at 9:32 AM` and ignored `format`. A lowercase region such as `fr-ca` now also loads its regional date locale instead of falling back to `fr`.
