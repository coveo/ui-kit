---
status: Proposed
date: 2026-08-14
related:
  - https://coveord.atlassian.net/browse/KIT-5996
  - packages/atomic/package.json
  - packages/atomic-react/package.json
  - packages/headless/package.json
  - packages/headless-react/package.json
  - pnpm-workspace.yaml
  - docs/adr/0003-catalog-first-dependency-management-with-automated-reporting.md
---

# Centralize peer dependency ranges in a compatibility catalog

## Context and Problem Statement

The default pnpm catalog pins exact dependency versions used to build and test the monorepo. Published packages instead need wider peer dependency ranges that express compatibility for consumers. For example, `@coveo/atomic` and `@coveo/headless` support TypeScript `>=5.0.0` while the monorepo uses one exact TypeScript version internally.

Hardcoding peer ranges in package manifests duplicates shared compatibility contracts and is reported as bypassing the default catalog. Creating one named catalog per dependency would avoid duplication but would make the supported peer dependency policy harder to view and manage as more ranges are added.

## Decision Drivers

- Preserve each published peer dependency compatibility contract.
- Keep exact internal toolchain versions independent from consumer compatibility ranges.
- Make all centrally managed peer ranges easy to discover and review together.
- Prevent compatible packages from declaring divergent ranges.
- Follow the catalog-first policy without adding reporting exceptions.

## Considered Options

### Option A: Use the default catalog

- **Summary:** Reference `catalog:` from peer dependencies.
- **Pros:** Uses the existing catalog entries.
- **Cons:** Publishes exact internal versions instead of the wider ranges supported by consumers.

### Option B: Create one named catalog per dependency

- **Summary:** Create a separate named catalog for each dependency needing a wide peer range (e.g., one for TypeScript, one for React).
- **Pros:** Centralizes each dependency's range and preserves published behavior.
- **Cons:** Produces many small catalogs that grow with each new peer dependency. Scatters the overall peer compatibility policy across separate workspace sections, making it harder to review the full compatibility surface at a glance.

### Option C: Use one peer compatibility catalog

- **Summary:** Define all centrally managed peer ranges under `catalogs.peer-compatibility` and reference them with `catalog:peer-compatibility`.
- **Pros:** Preserves published ranges, presents the supported peer dependency policy in one place, prevents drift, and requires no reporting exceptions.
- **Cons:** A single dependency can have only one range in this catalog; packages requiring a genuinely different compatibility profile need a separate named catalog.

## Decision Outcome

Option C — use the shared `peer-compatibility` catalog.

### Rationale

The catalog is organized by intent rather than by dependency. The default catalog remains the source of exact versions used internally, while `peer-compatibility` is the source of public compatibility ranges. Pnpm replaces `catalog:peer-compatibility` with the stored range when packing or publishing, so consumers receive the same contract as if the range were written directly in each package manifest.

TypeScript `>=5.0.0` and React `^18 || ^19` are the initial ranges managed by this catalog. Future common peer dependency ranges should be added to the same catalog so maintainers can review the repository's compatibility policy in one place.

## Consequences

- **Positive:** Shared peer ranges are centralized, visible together, and cannot drift between participating packages.
- **Negative:** Package manifests contain an indirection to `pnpm-workspace.yaml`.
- **Neutral:** Dependencies needing multiple legitimate compatibility ranges require explicitly named compatibility profiles rather than conflicting entries in `peer-compatibility`.

## Implementation and Follow-up

- Add `catalogs.peer-compatibility` to `pnpm-workspace.yaml`.
- Reference `catalog:peer-compatibility` from the optional TypeScript peers in Atomic and Headless.
- Reference `catalog:peer-compatibility` from the React peers in `atomic-react` and `headless-react`.
- Add future shared peer dependency ranges to this catalog when all participating packages use the same compatibility contract.
- Verify packed manifests publish the intended concrete ranges.
