---
'@coveo/atomic': patch
---

Remove a stale `sourceMappingURL` comment from the autoloader source.

`src/autoloader/index.ts` ended with `//# sourceMappingURL=index.js.map`, a fragment of compiled
output pasted into the file when the Lit migration was scaffolded. No source map is emitted for that
module, so the reference never resolved. Production bundles are unaffected — the comment is stripped
during the build — but any tool that consumes Atomic source directly, such as Storybook or the
playground, logged a source map read error for the module on every dev server start.
