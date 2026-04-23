---
"@coveo/headless": patch
"@coveo/bueno": patch
"@coveo/auth": patch
"@coveo/atomic": patch
"@coveo/atomic-react": patch
"@coveo/atomic-angular": patch
"@coveo/atomic-hosted-page": patch
"@coveo/atomic-legacy": patch
"@coveo/atomic-a11y": patch
"@coveo/headless-react": patch
"@coveo/shopify": patch
"@coveo/create-atomic": patch
"@coveo/create-atomic-component": patch
"@coveo/create-atomic-component-project": patch
"@coveo/create-atomic-result-component": patch
"@coveo/create-atomic-rollup-plugin": patch
---

Migrate build toolchain to TypeScript 7.0 (tsgo native compiler). Build scripts now use `tsgo` instead of `tsc` for ~10x faster type-checking and declaration emit. TypeScript 6 is retained for programmatic API consumers (custom transformers, AST parsing).
