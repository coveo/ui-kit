---
'@coveo/create-atomic': patch
---

Make the generated project's `start` and `build` scripts work on Node versions that don't detect ES
module syntax by default.

Stencil transpiles `stencil.config.ts` to a `.js` file inside the generated project, which has no
`"type": "module"` in its `package.json`. Node only treats such ambiguous files as ES modules by
default as of 20.19.0 and 22.7.0, so on older versions the build failed with an ES module error. The
scripts now invoke Stencil through `node --experimental-detect-module` when the project is scaffolded
with one of those versions, and keep calling `stencil` directly otherwise.
