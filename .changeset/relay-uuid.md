---
'@coveo/relay': patch
---

Update `uuid` from 13 to 14. The npm entry points import `uuid` at runtime rather than bundling it, so consumers will resolve version 14. Only `v4` and `validate` are used, and both are unchanged between the two versions.
