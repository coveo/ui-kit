---
status: Proposed
date: 2026-08-24
related:
  - https://coveord.atlassian.net/browse/KIT-4735
  - https://coveord.atlassian.net/browse/KIT-5980
  - https://coveord.atlassian.net/browse/KIT-5982
  - https://coveord.atlassian.net/browse/KIT-5983
  - docs/adr/0005-peer-dependency-compatibility-catalog.md
  - packages/atomic-angular/projects/atomic-angular/package.json
  - packages/headless/source_docs/product-lifecycle.md
---

# Separate the Angular technical compatibility range from the Angular support policy

## Context and Problem Statement

`@coveo/atomic-angular` declares `@angular/common` and `@angular/core` peer ranges of `14 - 21`. That range is wrong at both ends.

At the low end it advertises versions that cannot resolve. `@coveo/atomic` and `@coveo/headless` both declare a `typescript: '>=5.0.0'` peer, and `@coveo/atomic-angular` re-exports from both. Angular's own `@angular/compiler-cli` caps TypeScript at `<4.9` for v14 and `<5.0` for v15, so those ranges are disjoint from ours. No consumer on Angular 14 or 15 can have a coherent install. Angular 16 (`>=4.9.3 <5.2`) is the oldest major that overlaps at all, at TypeScript 5.0 or 5.1.

At the high end the range excludes `@angular/core@22`, which is the current `latest` on npm. Angular 22 consumers get a peer warning for a combination that is expected to work.

Nothing validates the breadth of the range. A consumer sample exists at `samples/atomic/search-commerce-angular` and is built in CI through the Turbo affected graph, but it resolves `@angular/*` from `catalog:`, so it exercises exactly one Angular version — the pinned 21.2.20. Neither end of the declared range is tested, which is how it drifted in both directions without any signal.

The published artifact itself is not the constraint. `@coveo/atomic-angular@3.11.22` is built with Angular 21.2.18 partial compilation, and its emitted declarations carry `minVersion` values of only `12.0.0` and `14.0.0`, so the Angular linker tolerates old majors. The binding constraint is the TypeScript floor, plus the fact that the package ships `fesm2022` only with an `exports`-only manifest and no root `main`/`module`/`types` fields.

A decision is needed because the epic asks to both narrow the range and reduce our support exposure, and those two goals conflict if treated as one number: the versions we are willing to *support* are newer than the versions that technically *work*.

## Decision Drivers

- Never advertise a peer range that cannot produce a working install.
- Never break an install that works today without a major version.
- Reduce the number of Angular majors we commit to fixing bugs against.
- Avoid a release chore every time Angular ships a major.
- Keep the published range consistent with what CI actually exercises.
- Follow the catalog-first policy so the range does not bypass the catalog.

## Considered Options

### Option A: One number — narrow `peerDependencies` to the support policy

- **Summary:** Set the peer range to the intersection of Angular's actively supported versions and our own, currently `20 - 22`, and re-narrow it every six months.
- **Pros:** Peer range and support commitment cannot diverge. Maximum reduction in exposure. Install-time warning for unsupported majors.
- **Cons:** Hard-fails installs on Angular 16 through 19, which are likely to work, making this a breaking change that must wait for v4. Requires a patch release every Angular cycle purely to move the bounds. Conflates "we will not fix bugs here" with "this cannot work".

### Option B: Two numbers — technical floor in `peerDependencies`, support policy in docs

- **Summary:** Set the peer range to the technical compatibility floor with an open upper bound (`>=16`), and document the support commitment separately as the intersection of Angular's actively supported versions and our peer range.
- **Pros:** Drops only the majors that provably cannot work, so it ships as a bug fix with no v4 dependency. Reduces documented exposure to three majors, which is what the epic asks for. No recurring release chore. Never warns on a working combination.
- **Cons:** Two artifacts to keep in sync. No install-time signal when a consumer is on a working-but-unsupported major.

### Option C: Status quo — document the policy, leave `14 - 21` in place

- **Summary:** Publish the support policy and leave the manifest untouched.
- **Pros:** No release required.
- **Cons:** Leaves a knowingly false peer range published, and still misses Angular 22.

## Decision Outcome

Option B — express technical compatibility in `peerDependencies` and the support commitment in documentation.

The peer range becomes `>=16` for `@angular/common` and `@angular/core`, managed through the shared `peer-compatibility` catalog established by ADR-0005 so it does not bypass the default catalog.

The documented policy is that at any given time Coveo supports the Angular versions in the intersection of the versions receiving active support from the Angular team (six months active plus twelve months LTS) and the versions covered by the `@coveo/atomic-angular` peer range. As of this ADR, Angular 19's LTS window has lapsed, so that intersection is Angular 20, 21, and 22.

This classifies the range change as a **bug fix**, not a breaking change. Consequently this epic does not need to move under the UI-KIT v4 Feature (KIT-5934).

### Rationale

`peerDependencies` and a support policy answer different questions. A peer range is a machine-checked resolvability constraint; a support policy is a human commitment about where we invest. Option A forces one number to answer both, and the cost is real: it breaks Angular 16-19 consumers who have working installs, which buys a v4 dependency for no technical benefit. Option B gets the epic's actual goal — a smaller set of majors we commit to — without that breakage, and lands as a patch.

The open upper bound is chosen over an enumerated ceiling because a ceiling is a standing lie with a six-month refresh cycle. `14 - 21` is already stale against Angular 22 for exactly this reason. The CI matrix from KIT-5983 is a better instrument for catching a genuinely incompatible new major than a peer warning that fires on every release regardless of whether anything broke.

Option C is rejected because a published range that cannot resolve is a correctness bug, not a documentation gap.

## Consequences

- **Positive:** No consumer can install a combination that cannot work. Angular 22 consumers stop seeing a spurious warning. The supported surface drops from eight majors to three. Angular majors no longer trigger maintenance releases.
- **Negative:** The policy doc and the manifest must be kept in sync by review discipline rather than by tooling. A consumer on Angular 16 will install cleanly while being outside the support window, and will only discover that from the docs.
- **Neutral:** The floor will rise over time as the TypeScript floor in `@coveo/atomic` and `@coveo/headless` rises. Each increase is a separate decision and, once it excludes a major that previously resolved, a breaking one.

## Implementation and Follow-up

The `>=16` floor is provisional. It is derived from the TypeScript range overlap alone, and one further constraint is untested: the package is `exports`-only with no root `main`, and `moduleResolution: bundler` did not become the Angular CLI default until v17. If a v16 consumer cannot resolve the package, the floor is 17.

Ordering therefore matters, and it is the reverse of what the Jira tickets state:

1. **KIT-5983** — add the CI matrix covering the floor and the newest Angular major. The existing `search-commerce-angular` sample cannot vary its Angular version, because the default catalog holds a single pinned value for the whole workspace. The matrix should instead pack the library and install the tarball into a throwaway application outside the pnpm workspace, one per Angular major under test. This produces the evidence for the floor and must land before the range is published.
2. Confirm or raise the floor in this ADR based on that matrix, then move it to `Accepted`.
3. **KIT-5982** — add `@angular/common` and `@angular/core` to `catalogs.peer-compatibility` in `pnpm-workspace.yaml`, reference `catalog:peer-compatibility` from the library manifest, and verify the packed manifest publishes the concrete range.
4. **KIT-5981** — record the policy in the "3rd-party support" section of `packages/headless/source_docs/product-lifecycle.md`, alongside the existing TypeScript and Node entries.
5. **KIT-5984** — the changeset accompanying step 3 serves as the CHANGELOG note. No `MIGRATION.md` entry is needed, since the change is not breaking.

Steps 3 and 4 should ship in the same pull request so the published range and the documented policy cannot disagree on arrival.

This ADR should be revisited when the TypeScript floor in `@coveo/atomic` or `@coveo/headless` rises, or when a new Angular major fails the CI matrix.
