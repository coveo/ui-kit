---
"@coveo/atomic": patch
---

Optimized validation schema declarations in Lit components by declaring Bueno schemas as private static readonly class properties, reducing memory allocation when multiple instances of the same component are present on a page.
