---
status: Proposed
date: 2026-08-25
related:
  - https://coveord.atlassian.net/browse/KIT-4735
  - https://coveord.atlassian.net/browse/KIT-5980
  - https://coveord.atlassian.net/browse/KIT-5981
  - docs/adr/0007-supported-major-versions-of-peer-frameworks.md
  - packages/headless/source_docs/product-lifecycle.md
---

# Define and retire framework support commitments

## Context and Problem Statement

ADR-0007 bounds the range declared in `peerDependencies` to the framework majors CI validates. That range answers a machine question: will this install resolve. It deliberately does not answer the human question: which majors will Coveo test against, fix bugs for, and accept support cases on.

Today nothing answers the second question. The closest artifact, `packages/headless/source_docs/product-lifecycle.md`, is scoped to Headless, names no framework version, and is already inconsistent with the repository — it states TypeScript v4.9+ where `catalogs.peer-compatibility` declares `>=5.0.0`. A consumer cannot discover which Angular or React majors are supported, and `@coveo/atomic-angular` publishes Angular CLI scaffolding boilerplate as its npm README, so the most likely place to look contains nothing relevant.

Two further constraints shape the answer.

**Upstream support policies are not uniform.** Angular publishes a dated schedule of roughly six months active support followed by twelve months of long-term support. React publishes no end-of-life dates at all. A commitment phrased purely as "the versions upstream still supports" is unimplementable for React.

**Retiring a major must not require a major release.** Under ADR-0007 rule 6, narrowing the peer range is breaking unless the removed majors could never resolve. `@coveo/atomic-angular` versions along the Atomic major line rather than the Angular one, so it cannot cut a major whenever Angular retires one. If the only way to reduce support were to narrow the range, support would effectively never shrink.

## Decision Drivers

- A consumer must be able to discover what is supported without reading manifests.
- The rule must work for frameworks with and without a published upstream schedule.
- Reducing support must not require a major release.
- The commitment must never contradict the published peer range.
- Loss of upstream support should be detected rather than remembered.

## Considered Options

### Option A: No commitment document

- **Summary:** Publish the bounded peer range from ADR-0007 and nothing else.
- **Pros:** No artifact to maintain.
- **Cons:** Consumers read the range as a support promise, which reinstates the coupling ADR-0007 exists to break. Support can then only shrink at a major.

### Option B: A statement in each published package's README

- **Summary:** Each wrapper documents its own supported majors.
- **Pros:** Lives where consumers look first.
- **Cons:** Duplicates the policy per package and invites drift between them. No single place to review the repository's overall commitment.

### Option C: Extend the Headless product lifecycle document

- **Summary:** Add framework versions to `packages/headless/source_docs/product-lifecycle.md`.
- **Pros:** Reuses an existing, published page.
- **Cons:** That document is scoped to Headless and its version lifecycle. Angular and React support belongs to the wrappers, so hosting it there misfiles the information and implies Headless-only relevance.

### Option D: One monorepo-level document, linked from every published README

- **Summary:** A single support matrix covering every published package, with each README linking to it.
- **Pros:** One place to review and revise. Consumers reach it from where they already are. No per-package duplication.
- **Cons:** Requires a new document and a link in each README, and one package needs a usable README first.

## Decision Outcome

Option D. Concretely:

1. **A single monorepo-level document records the supported majors** for every published package's framework peers, and every published package's README links to it.
2. **Where upstream publishes a support schedule, the commitment is the intersection of that schedule with our peer range.** Where upstream publishes none, the commitment is the two most recent majors.
3. **The commitment is always a subset of the peer range** from ADR-0007. A major outside the range cannot be committed to, regardless of upstream status.
4. **Removing a major from the commitment is not a semver event.** It ships in any release.
5. **The document states the depth of verification per major**, distinguishing majors that are build-verified only from those with runtime coverage.
6. **Loss of upstream support is detected on a schedule**, from published data.

### Rationale

Option A is the status quo dressed up: without a stated commitment, consumers reasonably treat the peer range as one, and the two numbers collapse back into one. That reintroduces exactly the problem where reducing support requires a breaking release.

Option D is preferred over B because a single document can be reviewed as a whole. The repository's support surface spans Angular, React and TypeScript across five published packages; scattering it across five READMEs guarantees they disagree. Linking from each README recovers B's discoverability without its duplication.

Option C is rejected on scope rather than convenience. `product-lifecycle.md` describes the lifecycle of Headless versions. Angular support is a property of `@coveo/atomic-angular`, and filing it under Headless would imply a relevance it does not have. That document should still be corrected where it is inconsistent, but it is not the home for this.

Rule 2 splits by upstream behaviour because Angular and React genuinely differ, and inventing a uniform rule would misrepresent one of them. Angular's dated windows make an intersection meaningful and self-updating. For React, "the two most recent majors" supplies the bound upstream declines to, and matches the `^18 || ^19` range already published.

Rule 3 exists because the alternative is incoherent. An intersection cannot contain a major the range excludes: committing to a version a consumer cannot install is not a commitment. This constraint is why the Angular commitment is 20 and 21 rather than 20 through 22, even though Angular 22 is still supported upstream.

Rule 4 is what makes the whole two-number design work. Because the commitment carries no resolution semantics, it can shrink in a patch release, so support can track upstream retirement without waiting for a major. This is the lever used routinely; narrowing the range under ADR-0007 rule 6 is the rare event.

Rule 5 prevents the document from overstating what CI shows. Under ADR-0007, majors between the bounds are build-verified only, with runtime coverage on the version the monorepo builds against. Publishing a flat list of supported majors would imply uniform verification.

## Consequences

- **Positive:** Consumers get a discoverable, single-source answer. Support can be reduced without a breaking release. The commitment cannot contradict the published range.
- **Negative:** The document and the catalog must be kept consistent by review discipline. A consumer inside the peer range but outside the commitment installs cleanly and learns of the gap only from the document.
- **Neutral:** The peer range will usually be wider than the commitment. That is the intended behaviour of separating them, not a defect to close.

## Operational Rules

### Detecting the end of upstream support

A monthly scheduled job reads published end-of-life data — `https://endoflife.date/api/angular.json` for Angular — and opens an issue when the document still lists a major that is out of support.

End-of-life dates are read, never derived. A "release plus eighteen months" heuristic matches Angular 19 and 20 exactly but diverges by roughly six weeks for Angular 21 and seven months for Angular 22, whose published end-of-life is later than the heuristic predicts. The heuristic is retained only as a cross-check: disagreement means the upstream schedule changed and warrants review.

For frameworks without a published schedule, the same job compares the document against the two most recent majors on the registry.

The signal targets this document rather than the peer range, because narrowing the range waits for a major.

## Implementation and Follow-up

Angular is the first application, under epic KIT-4735:

- The Angular commitment is majors **20 and 21**. Angular 19 left long-term support in May 2026. Angular 22 is still supported upstream but sits outside the `16 - 21` peer range, so rule 3 excludes it; it enters the commitment when the range ceiling moves.
- Angular 21 carries runtime coverage through the existing Playwright suite. Majors 16 through 20 are build-verified only, and the document must say so.

Remaining work, each its own change:

- Create the document required by rule 1, and correct the inconsistent TypeScript entry in `product-lifecycle.md` in the same change.
- Add the README links required by rule 1. `@coveo/atomic-angular` needs a real README first, since it currently publishes Angular CLI scaffolding boilerplate.
- Record the React commitment under rule 2, which resolves to majors 18 and 19.

Wide support is a legacy position rather than a goal. Across the Angular ecosystem one or two committed majors is the norm, and the intent is to converge toward two as the peer range narrows at the next major of `@coveo/atomic-angular`.

This ADR should be revisited when a published package gains or loses a framework peer, or when an upstream project changes how it publishes support windows.
