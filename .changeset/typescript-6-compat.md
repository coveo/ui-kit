---
"@coveo/bueno": patch
"@coveo/atomic": patch
"@coveo/atomic-legacy": patch
"@coveo/atomic-react": patch
"@coveo/quantic": patch
"@coveo/create-atomic": patch
"@coveo/create-atomic-rollup-plugin": patch
---

fix: TypeScript 6.x compatibility

Adapt build configuration to TypeScript 6.x breaking changes:
- Add explicit `rootDir` where required (TS5011)
- Add explicit `types` arrays since TS6 no longer auto-discovers `@types/*`
- Add `strict: false` to packages that were never strict (TS6 changed default to `true`)
- Add `ignoreDeprecations: "6.0"` for deprecated options like `baseUrl`
- Gate Angular builds on TS version since Angular 20.x requires `<6.0.0`
