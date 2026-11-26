---
'@coveo/atomic': patch
---

The published type declarations now use `.js` extensions in their relative imports, so they resolve under TypeScript's `node16` and `nodenext` module resolution. Before, exports such as `Bindings`, `CommerceBindings` and `initializeBindings` resolved to `any` in those modes; projects that use them may now see type errors that were hidden before. The build moved to `@rslib/core` 1.0.
