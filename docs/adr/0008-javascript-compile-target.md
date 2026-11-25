---
status: Proposed
date: 2026-11-25
related:
  - https://coveord.atlassian.net/browse/KIT-6490
  - https://coveord.atlassian.net/browse/KIT-4387
  - https://coveord.atlassian.net/wiki/spaces/DATA/pages/4489085043/Browser+Conformity
  - docs/adr/0007-supported-major-versions-of-peer-frameworks.md
  - FINDINGS.md
---

# Use ES2022 as the v4 compile target

## Context and Problem Statement

Headless and Atomic compile to different JavaScript targets. Headless's esbuild bundles (CDN, CommonJS and the Quantic UMD bundle) target ES2020, while its npm ESM output, compiled by `tsc`, is already ES2022. Atomic's npm output (`rslib`) targets ES2021, and its CDN output follows Rsbuild's default browser list, which already emits ES2022 syntax. The wrappers (`@coveo/atomic-react`, `@coveo/atomic-angular`, `@coveo/headless-react`) already target ES2022.

v4 is the point where the target can change. Browser support is set by Coveo's [Browser Conformity](https://coveord.atlassian.net/wiki/spaces/DATA/pages/4489085043/Browser+Conformity) policy, not by ui-kit, so the target only has to fit that policy.

The KIT-6490 prototype measured the effect of raising the targets. The full numbers are in [`FINDINGS.md`](../../FINDINGS.md):

- Headless ES2020 to ES2022 saves about 0.2 to 0.3 kB gzip per CDN or CommonJS bundle.
- ES2023, ES2024 and esnext output is byte-identical to ES2022 output.
- Atomic's npm output shrinks by under 1 kB gzip in total, and its CDN output doesn't change.
- Compile time doesn't change measurably.

## Decision Drivers

- Output that fits the Coveo Browser Conformity policy at the v4 release.
- One target across Headless, Atomic and the wrappers, so their outputs don't disagree.
- Choose a target for a measured benefit, not an assumed one.
- Keep the Salesforce Lightning Locker compatibility of the Quantic bundle separate from the general target.

## Considered Options

### Option A: Keep per-package targets

- **Summary:** Headless keeps ES2020 in esbuild, and Atomic keeps ES2021 in `rslib` and `tsconfig`.
- **Pros:** No change.
- **Cons:** Headless and Atomic outputs keep disagreeing with each other and with the wrappers. Headless's npm ESM output (ES2022) and its other bundles (ES2020) also keep disagreeing.

### Option B: ES2022 for Headless and Atomic

- **Summary:** Set the esbuild target of Headless and the `rslib` syntax and `tsconfig` target of Atomic to ES2022.
- **Pros:** One target across the core packages and the wrappers. ES2022 syntax fits the Browser Conformity policy. The prototype's Headless and Atomic unit tests pass.
- **Cons:** The size gain is negligible. This is a consistency change, not an optimization.

### Option C: ES2023 or newer

- **Summary:** Set ES2023, ES2024 or esnext.
- **Pros:** Leaves room for newer syntax later.
- **Cons:** The prototype's ES2023, ES2024 and esnext Headless bundles are byte-identical to ES2022, and Atomic's output doesn't change either. There's no measured benefit, and a newer target makes it easier to emit syntax that leaves the policy's window by accident.

## Decision Outcome

**Proposed:** Option B. Headless and Atomic compile to ES2022 in v4. Browser support follows the Coveo [Browser Conformity](https://coveord.atlassian.net/wiki/spaces/DATA/pages/4489085043/Browser+Conformity) policy.

### Rationale

ES2022 is the newest target that changes the output, and it matches what the wrappers and Headless's npm ESM output already use. Option A keeps inconsistent outputs for no benefit. Option C adds nothing measurable. ES2022 syntax and the built-ins that v4 uses fit the policy, as [`FINDINGS.md`](../../FINDINGS.md) shows.

## Consequences

- **Positive:** Headless, Atomic and the wrappers compile to one target.
- **Negative:** Consumers get no meaningful size or performance gain, so the change is a breaking change for consistency only.
- **Neutral:** Built-ins such as `Promise.withResolvers` don't depend on the compile target. Keeping the output within the policy also means checking the built-ins that new code and dependencies use, not only the target.

## Implementation and Follow-up

- The v4 story in [`FINDINGS.md`](../../FINDINGS.md) carries out the change.
- The Quantic UMD bundle keeps its Lightning Locker shims while Quantic supports Locker. The general target change doesn't remove them.
- The TypeScript floor (input to KIT-6127) and the Node.js floor (input to KIT-6387) are recommended in [`FINDINGS.md`](../../FINDINGS.md). Those issues decide them.
