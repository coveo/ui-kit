---
'coveo.analytics': patch
---

Restore first-party sources in the CDN bundles' source maps. Since the migration to `@rollup/plugin-typescript`, `coveoua.js.map`, `coveoua.browser.js.map` and `coveoua.debug.js.map` shipped with `sourcesContent: null` for all 38 `src/*.ts` entries, so debuggers could resolve a stack frame to a file and line but could not display any coveo.analytics source. Enabling `inlineSources` in `tsconfig.json` populates them again. The emitted JavaScript is unchanged.
