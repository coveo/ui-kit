# KIT-6490: JavaScript target and runtime baseline spike

**Status:** Proposed decision for UI-Kit v4; this PR is a spike, not a production-ready compatibility change.

**Evidence:** builds compared with main at `593ab276f`; measurements and scripts are retained under [`spike/KIT-6490`](spike/KIT-6490/).

## Recommendation

For v4, standardize Headless and Atomic output on **ES2022** and adopt the accepted Coveo browser conformance policy rather than publishing fixed browser version minimums:

- Desktop Chrome: latest released major and extended stable.
- Desktop Edge: latest released major.
- Desktop Safari: latest released major and latest minor.
- Desktop Firefox: latest released version and ESR.
- Older supported versions remain supported until one year after release.
- Mobile Chrome, Safari, and Firefox follow the latest-major policy; Edge is included for completeness.

The Chrome 107 / Edge 107 / Firefox 104 / Safari 16 versions used during the prototype are measurement snapshots, not the v4 support promise. Fixed versions would conflict with the accepted policy and would require an outdated manual table update.

This is a runtime contract, not just a compiler setting. The spike found that current Atomic code uses `Promise.withResolvers`, which in the tested feature inventory sets a higher implementation floor: Chrome/Edge 119, Firefox 121, Safari 17.4. Before release, the v4 implementation must remove/replace that use (or otherwise make the affected public entry points work), then test against the exact desktop and mobile lines in the conformance policy. If that cannot be done, revise the effective support floor and document the reason. Unsupported browser issues follow the support stance in the policy: defects on supported browsers, possible R&D review for unsupported versions, and no build-level compatibility fix when not supported.

The main evidence does **not** show a meaningful size or parse-time win from raising the target. Treat ES2022 as consistency and an explicit v4 contract—not as a bundle-optimization project.

## Answers and findings

### Output targets and measured size effects

The full per-output raw and gzip deltas are in [`spike/KIT-6490/results/tables.md`](spike/KIT-6490/results/tables.md). Sizes are kB; deltas compare each prototype with the baseline.

| Output                                                          |                     ES2022 change | Interpretation                                             |
| --------------------------------------------------------------- | --------------------------------: | ---------------------------------------------------------- |
| Headless CDN entries                                            | about −0.19 to −0.31 kB gzip each | Negligible per bundle                                      |
| Headless CJS entries                                            | about −0.18 to −0.24 kB gzip each | Negligible; npm ESM is unchanged                           |
| Headless Quantic entries, keeping ponyfills                     | about −0.17 to −0.27 kB gzip each | Negligible                                                 |
| Headless Quantic entries, experimental removal of all ponyfills | about −5.86 to −6.35 kB gzip each | Larger, but not a safe target-only optimization; see below |
| Atomic CDN                                                      |                         0 kB gzip | No measured change                                         |
| Atomic npm ESM, all JS                                          |                     −0.96 kB gzip | Under 1 kB total                                           |
| Atomic npm CJS, all JS                                          |                     −0.88 kB gzip | Under 1 kB total                                           |
| Atomic size-limit “all lazy”                                    |                617.93 → 617.10 kB | −0.83 kB                                                   |
| V8 parse/compile benchmark                                      |                    6.32 → 6.35 ms | No improvement                                             |

Headless es2023, es2024, and esnext output was byte-identical to es2022. Atomic es2022 and es2023 CDN outputs were byte-identical. The npm ESM output from TypeScript was already ES2022, so changing the Headless bundler target did not change it.

### Browser/runtime baseline

- The recommendation is ES2022 under the accepted Coveo rolling browser conformance policy.
- Headless's observed built-in use alone has a lower feature floor (Chrome/Edge 97, Firefox 104, Safari 15.4), but Atomic's `Promise.withResolvers` use currently sets a much higher observed floor (Chrome/Edge 119, Firefox 121, Safari 17.4).
- Atomic already depends on `Promise.withResolvers`; changing `tsconfig` alone cannot lower that runtime requirement. This is a material gap and a release gate for the proposed contract.
- No repository-wide browser support declaration or browserslist was found. The v4 story should add a pinned release-test matrix derived from the accepted policy rather than freezing a single unsupported version set.

### Ponyfills: keep this separate from the target decision

The three injected ponyfills and `navigator.sendBeacon` support were added for Salesforce Lightning Locker behavior. Quantic still supports Locker, and its UMD output is the only in-repository consumer of `dist/quantic/**`. Removing all four in an experiment saved approximately 5.9–6.4 kB gzip per Quantic bundle, but risks breaking Locker customers.

Recommendation: keep the Locker shims isolated to the Quantic compatibility bundle; do not remove them as part of raising the general Headless/Atomic target. Research recommends dropping only the `navigator.sendBeacon` shim, but that should be its own Quantic compatibility decision and test. Revisit the remaining shims if/when Quantic drops Locker support. The current prototype intentionally leaves ponyfills unchanged.

### TypeScript floor

- Recommend v4 TypeScript peer floor **`>=5.9.0`**, retaining the open upper bound from ADR-0007.
- `export type *` in published Atomic declarations requires TypeScript 5.0, but dependency/framework constraints are higher. The measured technical floor from dependency declarations is 5.4 (RTK); the v4 Angular floor is expected to bind at TypeScript 5.9.
- Type-checking emitted declarations with `skipLibCheck: false` exposed independent declaration problems, including a `lib.dom` issue and a CommonJS/ESM import problem. A real consumer verification at the floor is needed; the reported floor is not fully validated until those are addressed.
- Add a CI consumer type-check using the floor version with `skipLibCheck: false`, plus the repository TypeScript version.

### Node.js floor and separate CommonJS finding

- Recommend using **`^22.12.0 || ^24.11.0 || ^26.0.0`** as the v4 public-package Node range input to KIT-6387. Node 20 reached end of life in April 2026; 22.12 is the first Node 22 release with unflagged `require(esm)`. Consider 22.13 instead to avoid the experimental warning observed on 22.12.
- This recommendation is an input for the v4 Node-floor decision, not a change made by this spike. If CommonJS output remains, set its esbuild target to `node22.12` (or later); if npm Headless becomes ESM-only, the CJS target question no longer applies.
- **Independent defect:** `require('@coveo/headless')` from published Headless 3.59.0 failed on Node 20.19, 22.14, and 24 with `StringValue is not a constructor`. The investigated root cause is `@coveo/bueno` declaring `"type": "module"` while its `require` condition points to `dist/bueno.js`, which contains CommonJS output. This is a package export/loader issue, not an ES target or browser-baseline effect. Track and fix it separately; do not infer that merely raising the target fixes it.

### Other package implications

Several packages already target ES2022. `coveo-analytics`, `atomic-legacy`, Quantic, samples, and create-* templates have distinct build/runtime considerations and were not changed as part of this proposal. Audit each package and consumer path in the v4 implementation story before describing ES2022 as a repository-wide target.

## Draft v4 follow-up story

**Title:** `[UI-Kit v4] Standardize the JavaScript target and enforce the runtime contract`

**User story:** As a UI-Kit consumer, I want v4 packages to publish a documented, consistently validated JavaScript and runtime baseline so that I can determine whether my browser and Node.js environments are supported before upgrading.

**Acceptance criteria:**

1. Headless and Atomic publish ES2022 output, with wrappers and package-specific exceptions audited and documented.
2. The v4 browser contract follows the accepted Coveo conformance policy. At release, publish the exact versions exercised by the pinned test matrix and document the support stance.
3. CI exercises the public package entry points on the supported desktop and mobile browser lines and checks that dependencies do not introduce syntax or built-ins above the policy. Atomic's `Promise.withResolvers` requirement is removed or polyfilled, or the effective floor is deliberately documented.
4. TypeScript peer metadata is raised to `>=5.9.0` only after a packed-consumer type-check at 5.9 with `skipLibCheck: false` passes; publish the migration guidance.
5. Node engines are aligned with the approved KIT-6387 decision (recommended input: `^22.12.0 || ^24.11.0 || ^26.0.0`), and the CommonJS `require` defect is tracked independently.
6. Quantic's Lightning Locker ponyfills remain isolated to the Quantic compatibility output and have explicit regression coverage; any removal is separately approved and tested.
7. Release notes/documentation state the new runtime requirements and migration impact.

**Migration note:** Consumers running below the finalized browser or Node floor must remain on the supported v3 line or upgrade their runtime before moving to v4. The v4 release notes must identify the minimum versions and any API/TypeScript changes. This spike's prototype is not a production-ready implementation.

## Validation already recorded

- `pnpm --filter @coveo/headless test`: passed, 456 files / 5,815 tests.
- `pnpm --filter @coveo/atomic test`: passed, 7,275 tests / 81 skipped.
- These are prior spike runs documented in `spike/KIT-6490/STATUS.md`; the current PR will run focused lint/format checks on its final changes.
