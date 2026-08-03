---
'coveo.analytics': patch
---

Build the package with `@rollup/plugin-typescript` instead of the unmaintained `rollup-plugin-typescript2`. Emitted bundles are equivalent but not byte-identical, and eight redundant duplicate declaration files under `dist/definitions/src` and `dist/definitions/bundle` are no longer emitted. The `types` entry and every declaration reachable from it are unchanged.
