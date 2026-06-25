# ADR-005: Build Process (ESM-Only) for Thermidor

**Status**: `🟢 Accepted`  
**Related docs**: [Node.js require(esm) Documentation](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require)

## 1. Context

- **Business/context drivers**: The thermidor package (`@coveo/thermidor`) must be distributed on NPM for use in diverse consumer environments (e.g., SSR frameworks, standard frontend bundlers, Node.js backends). Eventually, it may also need to be distributed on a CDN for direct browser consumption.
- **Technical constraints**: The build system must preserve clean tree-shaking, support subpath exports (such as `@coveo/thermidor/interfaces/commerce`), and keep maintenance overhead minimal.
- **Known assumptions**: Modern JavaScript ecosystems are rapidly converging on ESM-only, but historically CJS compatibility was required to prevent blocking non-ESM consumers.

## 2. Decision Statement

We will build and distribute `@coveo/thermidor` **exclusively as a pure ES Module (ESM)**.

We will use the standard TypeScript compiler (`tsc`) to perform multi-file transpilation into `dist/` with ES2022 syntax and ESM imports/exports. We will not ship a CommonJS version to NPM.

## 3. Requirements & Considerations Mapping

### MUST

1. **Requirement**: Full use-case support
   - **Impact**: Positive
   - **How satisfied**: ESM is supported natively in all modern browsers, bundlers (Webpack, Vite, Rollup), and Node.js runtimes.

2. **Requirement**: Public API independence
   - **Impact**: None
   - **How satisfied**: N/A

3. **Requirement**: First-class SSR
   - **Impact**: Positive
   - **How satisfied**: Modern SSR frameworks (Next.js, Remix, Nuxt, SvelteKit) execute code in environments that natively support or prioritize ESM.

### SHOULD

1. **Consideration**: Tree-shaking efficiency
   - **Impact**: Positive
   - **How addressed**: By compiling files individually without bundling (preserving file boundaries) and using pure ESM, client bundlers can easily dead-code-eliminate unused modules and subpath exports.

2. **Consideration**: Migration simplicity
   - **Impact**: Neutral/Negative
   - **How addressed**: Consumers still running older Node.js versions without native ESM support or native `require(esm)` (older than v20.17.0) will have to use dynamic `import()` or upgrade. However, given that Thermidor is a new, experimental library, we can afford to target modern LTS runtimes.

3. **Requirement**: External contribution readiness
   - **Impact**: Positive
   - **How addressed**: Maintaining a single compilation format with standard `tsc` reduces tooling complexity to the absolute minimum, lowering the barrier to entry for external contributors.

## 4. Options Considered

### Option A (Selected): Pure ESM Multi-file Compilation via `tsc`

- **Summary**: Build only ESM outputs in `dist/`. Declare `"type": "module"` in `package.json`.
- **Pros**:
  - **No Dual-Package Hazard**: Avoids the classic issue where both CJS and ESM versions of a library are loaded, leading to duplicate singleton instances and memory overhead.
  - **Simplicity**: No complex bundling tools or dual configurations to maintain.
  - **Modern Alignment**: Fully aligns with the future of the JS ecosystem.
  - **require(esm) compatibility**: Modern Node.js versions can load this module synchronously using `require()`.
- **Cons**:
  - Requires consumers on older Node.js versions to upgrade or use dynamic `import()`.
  - Disallows the use of top-level `await` (since synchronous `require()` will reject it).

### Option B: Dual ESM/CJS compilation

- **Summary**: Emit two separate build targets (`dist/esm` and `dist/cjs`).
- **Pros**:
  - High compatibility with legacy Node.js runtimes.
- **Cons**:
  - Subject to the dual-package hazard.
  - Higher build and package maintenance complexity.

## 5. Decision Rationale

With the introduction of native support for loading ES Modules via `require()` in Node.js (v22.0.0+ and backported to v20.17.0+), the need for dual-packaging has diminished. If a library contains no top-level `await`, it can be imported via both `import` and `require()` seamlessly in modern Node.js environments.

Selecting Option A allows us to keep the build process extremely lean, eliminate the dual-package hazard entirely, and ensure excellent tree-shaking, while still supporting CJS consumers on supported Node.js LTS versions.

## 6. Public API and Contract Impact

- **Public API changes**: None
- **Backward compatibility impact**: Requires Node.js >= 20.17.0 for CJS `require()` consumers.
- **Deprecations required**: None
- **Type/contract stability notes**: Types are compiled to `dist/` alongside `.js` files.
- **Non-leakage check**: Pass
- **Top-Level Await Constraint**: The library's public API and internal implementations must not use top-level `await` in order to preserve compatibility with `require()`.

## 7. Operational and Runtime Impact

- **Performance impact**: None
- **Reliability impact**: Eliminates bugs related to duplicate class instances caused by dual-package loading.
- **Security/privacy impact**: None
- **SSR impact**: Excellent compatibility with modern SSR engines.
- **Observability impact**: None

## 8. Migration and Rollout Plan

- **Consumer migration impact**: Minimal for new projects. Existing legacy projects using older Node versions will need to run Node.js >= 20.17.0 or load `@coveo/thermidor` asynchronously via dynamic `import()`.
- **Rollout strategy**: Release as standard pure-ESM npm package.
