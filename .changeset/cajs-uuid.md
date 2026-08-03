---
'coveo.analytics': minor
---

Update `uuid` from 9 to 14, and stop declaring `@types/uuid`, which is redundant now that `uuid` ships its own type declarations.

`uuid` is bundled into the distributed files, so no emitted JavaScript imports it at runtime and behavior is unchanged. The published type declarations are also unchanged. What changes is the installed dependency set: `@types/uuid` is no longer pulled in, and `uuid` resolves to 14.
