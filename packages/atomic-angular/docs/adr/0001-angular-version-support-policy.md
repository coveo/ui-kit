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
- Only claim compatibility with majors that CI has actually exercised.
- Give consumers an install-time signal when they move outside the validated range.
- Follow the catalog-first policy so the range does not bypass the catalog.

## Considered Options

Two decisions are orthogonal here: where the lower bound sits, and whether there is an upper bound. The options below cover the meaningful combinations.

### Option A: Policy floor, enumerated ceiling

- **Summary:** Set the peer range to the intersection of Angular's actively supported versions and our own, currently `20 - 22`.
- **Pros:** Peer range and support commitment cannot diverge. Maximum reduction in exposure.
- **Cons:** Hard-fails installs on Angular 16 through 19, which are likely to work, making this a breaking change that must wait for v4. Conflates "we will not fix bugs here" with "this cannot work".

### Option B: Technical floor, no ceiling

- **Summary:** Set the peer range to the technical compatibility floor with an open upper bound (`>=16`), and document the support commitment separately.
- **Pros:** Drops only the majors that provably cannot work, so it ships as a bug fix. No edit needed when Angular ships a major.
- **Cons:** Asserts compatibility with every future Angular major, including ones that do not exist yet and cannot have been tested. A consumer on a future incompatible major gets no install-time signal, only a broken build. Leaves the widest possible gap between the published range and the documented policy.

### Option C: Technical floor, enumerated ceiling

- **Summary:** Set the peer range to the technical compatibility floor and cap it at the newest major CI validates, currently `16 - 22`. Document the support commitment separately as the intersection with Angular's actively supported versions.
- **Pros:** Drops only the majors that provably cannot work, so it still ships as a bug fix. The range states exactly what was measured. Consumers moving to an untested major get a self-explanatory peer warning. Keeps the published range close to the documented policy.
- **Cons:** The ceiling needs raising when a new Angular major is validated.

### Option D: Status quo — document the policy, leave `14 - 21` in place

- **Summary:** Publish the support policy and leave the manifest untouched.
- **Pros:** No release required.
- **Cons:** Leaves a knowingly false peer range published, and still misses Angular 22.

## Decision Outcome

Option C — a technical floor in `peerDependencies` with an enumerated ceiling at the newest validated major, and the support commitment in documentation.

The peer range becomes `16 - 22` for `@angular/common` and `@angular/core`, managed through the shared `peer-compatibility` catalog established by ADR-0005 so it does not bypass the default catalog.

The documented policy is that at any given time Coveo supports the Angular versions in the intersection of the versions receiving active support from the Angular team (six months active plus twelve months LTS) and the versions covered by the `@coveo/atomic-angular` peer range. As of this ADR, Angular 19's LTS window has lapsed, so that intersection is Angular 20, 21, and 22.

This classifies the range change as a **bug fix**, not a breaking change. Consequently this epic does not need to move under the UI-KIT v4 Feature (KIT-5934).

### Rationale

`peerDependencies` and a support policy answer different questions. A peer range is a machine-checked resolvability constraint; a support policy is a human commitment about where we invest. Option A forces one number to answer both, and the cost is real: it breaks Angular 16-19 consumers who have working installs, which buys a v4 dependency for no technical benefit.

Between Options B and C, the deciding factor is that the peer range should assert only what has been measured. The CI matrix from KIT-5983 validates specific majors; an open upper bound claims compatibility with majors that do not exist yet. When one of them does break, Option B gives the consumer a broken build with no explanation, while Option C gives an unsupported-peer warning that names the problem. Because pnpm's `strict-peer-dependencies` defaults to false, that warning is advisory rather than an install failure, so the friction is mild.

The maintenance cost of the ceiling is close to zero, which is what makes Option C affordable. ADR-0005 centralizes the range as a single entry in `pnpm-workspace.yaml`, and Renovate already edits that file to bump the Angular catalog. Raising the ceiling is one line in a pull request that was going to happen anyway, and the matrix's newest-major leg is what licenses raising it.

Option C also keeps the published range near the documented policy (`16 - 22` against a policy of 20-22), which limits the main drawback of separating the two numbers. Option B's `>=16` would leave them arbitrarily far apart.

Option D is rejected because a published range that cannot resolve is a correctness bug, not a documentation gap.

## Consequences

- **Positive:** No consumer can install a combination that cannot work. Angular 22 consumers stop seeing a spurious warning. The supported surface drops from eight majors to three. The published range never claims more than CI has verified.
- **Negative:** The policy doc and the manifest must be kept in sync by review discipline rather than by tooling. A consumer on Angular 16 will install cleanly while being outside the support window, and will only discover that from the docs. Each new Angular major needs the ceiling raised, and until that happens its consumers see a peer warning.
- **Neutral:** The floor will rise over time as the TypeScript floor in `@coveo/atomic` and `@coveo/headless` rises. Each increase is a separate decision and, once it excludes a major that previously resolved, a breaking one.

## Implementation and Follow-up

Both bounds are provisional until the matrix runs. The `16` floor is derived from the TypeScript range overlap alone, and one further constraint is untested: the package is `exports`-only with no root `main`, and `moduleResolution: bundler` did not become the Angular CLI default until v17. If a v16 consumer cannot resolve the package, the floor is 17. The `22` ceiling assumes the newest major builds; if it does not, the ceiling stays at 21 and Angular 22 support becomes its own piece of work.

Ordering therefore matters, and it is the reverse of what the Jira tickets state:

1. **KIT-5983** — add the CI matrix covering the candidate floors and the newest Angular major. The existing `search-commerce-angular` sample cannot vary its Angular version, because the default catalog holds a single pinned value for the whole workspace. The matrix should instead pack the library and install the tarball into a throwaway application outside the pnpm workspace, one per Angular major under test. This produces the evidence for both bounds and must land before the range is published.
2. Confirm both bounds in this ADR based on that matrix, then move it to `Accepted`.
3. **KIT-5982** — add `@angular/common` and `@angular/core` to `catalogs.peer-compatibility` in `pnpm-workspace.yaml`, reference `catalog:peer-compatibility` from the library manifest, and verify the packed manifest publishes the concrete range.
4. **KIT-5981** — record the policy in the "3rd-party support" section of `packages/headless/source_docs/product-lifecycle.md`, alongside the existing TypeScript and Node entries.
5. **KIT-5984** — the changeset accompanying step 3 serves as the CHANGELOG note. No `MIGRATION.md` entry is needed, since the change is not breaking.

Steps 3 and 4 should ship in the same pull request so the published range and the documented policy cannot disagree on arrival.

Raising the ceiling is expected maintenance, not an exception. When Renovate bumps the Angular catalog to a new major, the same pull request should raise the `peer-compatibility` ceiling, provided the matrix leg for that major passes.

This ADR should be revisited when the TypeScript floor in `@coveo/atomic` or `@coveo/headless` rises, or when a new Angular major fails the CI matrix.
