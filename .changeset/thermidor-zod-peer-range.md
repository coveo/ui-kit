---
'@coveo/thermidor': minor
---

Widen the `zod` peerDependency to `^3.25 || ^4`. The injected-contract seam reads only Zod's stable public API (`.options`, `.shape`, `.value`, `.unwrap()`, `.safeParse`), which behaves identically across both majors, so a consumer may now inject a contract built from either a Zod 3 or a Zod 4 schema build without a shim.
