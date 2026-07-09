---
"@coveo/atomic": patch
---

Replace the broad global `Window` string index-signature augmentation in the environment helper with a scoped local cast, fixing a TypeScript 7 index-signature compatibility error (TS2411) with no change to runtime behavior.
