---
status: Proposed
date: 2026-11-24
related:
  - https://coveord.atlassian.net/browse/KIT-6490
  - https://coveord.atlassian.net/browse/KIT-4387
  - docs/adr/0007-supported-major-versions-of-peer-frameworks.md
  - FINDINGS.md
---

# Set an ES2022 target and an explicit v4 runtime contract

## Context and Problem Statement

Headless and Atomic emit different JavaScript targets, and the repository does not state a supported browser baseline. This makes the compatibility promise difficult to reason about and validate for v4. A KIT-6490 prototype measured the effect of raising these targets and reviewed the browser, Node.js, TypeScript, and ponyfill constraints. The measurements show that bundle-size savings alone do not justify the change; the durable benefit is a consistent target and an explicit contract.

## Decision Drivers

- Give v4 consumers a clear, testable JavaScript and browser compatibility promise.
- Avoid claiming support for runtimes that current APIs or dependencies cannot serve.
- Keep target changes consistent across Headless and Atomic.
- Keep Salesforce Lightning Locker compatibility isolated from general browser and Node builds.
- Base the decision on measured bundle effects rather than assuming a higher target materially reduces downloads.

## Considered Options

### Option A: Keep package-specific targets and leave browser support implicit

- **Summary:** Keep the existing ES2020/ES2021 configuration and document no common runtime floor.
- **Pros:** No migration work or compatibility change.
- **Cons:** Preserves ambiguity and inconsistent package output.

### Option B: Standardize on ES2022 and document a v4 runtime contract

- **Summary:** Use ES2022 output for Headless and Atomic and propose Chrome 107, Edge 107, Firefox 104, and Safari 16 as the minimum desktop browsers.
- **Pros:** A single modern syntax target; a concrete compatibility promise to test; aligns with targets already used by several packages.
- **Cons:** The measured size improvement is negligible. Atomic currently uses `Promise.withResolvers`, whose observed browser floor is newer than this proposed contract, so v4 must remove or replace that dependency/API use or revise the contract before release.

### Option C: Raise the target to ES2023 or newer

- **Summary:** Emit newer syntax and APIs to seek further size or runtime gains.
- **Pros:** Potentially avoids more transforms when code begins using newer language features.
- **Cons:** The prototype's ES2023, ES2024, and esnext Headless bundles were byte-identical to ES2022; Atomic CDN output also did not change. This adds compatibility risk without a measured benefit.

## Decision Outcome

**Proposed:** Adopt ES2022 as the common output target for Headless and Atomic in v4, with a proposed minimum browser contract of Chrome 107, Edge 107, Firefox 104, and Safari 16. The equivalent desktop query is `chrome >= 107, edge >= 107, firefox >= 104, safari >= 16`.

This ADR does not authorize shipping the prototype configuration as a completed compatibility change. Before v4 release, validate the contract against the actual public entry points and dependencies. In particular, Atomic's current `Promise.withResolvers` use implies a newer floor (Chrome/Edge 119, Firefox 121, Safari 17.4 in the research); either replace/polyfill that use or revise the proposed contract. Keep the compatibility check in the v4 implementation story.

### Rationale

ES2022 is a useful common compiler target and is already used by several packages. The measurements do not support choosing ES2023 or newer for bundle-size reasons. A published runtime contract is still valuable, but it must describe actual behavior, not merely syntax emitted by the compiler; the Atomic API-floor discrepancy is therefore an explicit release gate rather than a hidden assumption.

The TypeScript and Node.js floors, Quantic's Locker ponyfills, and the separate Headless CommonJS `require` failure are recorded in `FINDINGS.md`. They are related v4 decisions/findings, not consequences of the ES target itself.

## Consequences

- **Positive:** Headless and Atomic have a common ES2022 output target and v4 has a concrete browser contract to validate.
- **Negative:** The target change saves less than 1 kB gzip in the measured outputs and does not materially improve performance; validation and any API compatibility work remain necessary.
- **Negative:** The proposed browser contract is not yet true of Atomic's observed `Promise.withResolvers` use.
- **Neutral:** Quantic's Salesforce Locker ponyfills remain a separate compatibility concern and should not be removed from its bundles as a side effect of changing the general target.

## Implementation and Follow-up

Implement the target, runtime checks, TypeScript and Node.js floors, and migration communication through the v4 follow-up story in `FINDINGS.md`. Keep Quantic's compatibility bundle independently targeted and preserve its Locker shims unless Quantic explicitly drops Locker support. Track the unrelated Headless CommonJS `require` defect separately.
