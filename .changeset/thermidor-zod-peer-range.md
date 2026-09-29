---
'@coveo/thermidor': minor
---

Widen the `zod` peerDependency to `3.25.76 || ^4`. The injected-contract seam reads only Zod's stable public API (`.options`, `.shape`, `.value`, `.unwrap()`, `.safeParse`), which behaves identically across both majors, so a consumer may inject a contract built from either a Zod 3 or a Zod 4 schema build without a shim. Zod 4 is accepted as a range; the Zod 3 side is pinned to the exact version the A2-UI renderer's binder resolves, since a Zod 3 consumer must share that single install for its schemas to be assignable.
