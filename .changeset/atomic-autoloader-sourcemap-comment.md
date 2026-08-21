---
'@coveo/atomic': patch
---

Remove a stale `sourceMappingURL` comment from the autoloader source.

`src/autoloader/index.ts` ended with `//# sourceMappingURL=index.js.map`, a leftover from an
earlier migration pointing at a file that has never existed alongside it. Production bundles are
unaffected — the comment is stripped during the build — but any tool that consumes Atomic source
directly, such as Storybook or the new playground, reported a source map read error for the module
on every dev server start.
