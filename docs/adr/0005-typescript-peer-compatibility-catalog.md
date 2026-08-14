---
status: Proposed
date: 2026-08-14
related:
  - https://coveord.atlassian.net/browse/KIT-5996
  - packages/atomic/package.json
  - packages/headless/package.json
  - pnpm-workspace.yaml
  - docs/adr/0003-catalog-first-dependency-management-with-automated-reporting.md
---

# Use a named catalog for TypeScript peer compatibility

## Context and Problem Statement

The default pnpm catalog pins TypeScript to the exact version used to build and test the monorepo. The published `@coveo/atomic` and `@coveo/headless` packages instead declare TypeScript `>=5.0.0` as an optional peer dependency, expressing the minimum compiler version supported by their type declarations.

Hardcoding that range in both manifests duplicates a shared compatibility contract and is reported as bypassing the default catalog. Reusing the default catalog would publish its exact toolchain version and unnecessarily constrain consumers.

## Decision Drivers

- Preserve the published `>=5.0.0` compatibility contract.
- Keep the exact internal toolchain version independent from the consumer compatibility range.
- Prevent Atomic and Headless peer ranges from drifting.
- Follow the catalog-first policy without adding reporting exceptions.

## Considered Options

### Option A: Use the default catalog

- **Summary:** Reference `catalog:` from both peer dependencies.
- **Pros:** Uses the existing catalog entry.
- **Cons:** Publishes the default catalog's exact TypeScript version, forcing consumers to match the monorepo toolchain instead of the supported compatibility range.

### Option B: Keep hardcoded peer ranges

- **Summary:** Keep `>=5.0.0` duplicated in both package manifests.
- **Pros:** Preserves current published behavior.
- **Cons:** Allows the ranges to drift, bypasses the catalog-first policy, and creates catalog-candidate report noise.

### Option C: Use a named compatibility catalog

- **Summary:** Define `catalogs.typescript-compatibility` with `typescript: '>=5.0.0'` and reference it from both peer dependencies.
- **Pros:** Preserves the published range, centralizes the compatibility contract, and requires no reporting exception.
- **Cons:** Readers must look in `pnpm-workspace.yaml` to see the concrete range.

## Decision Outcome

Option C — use the named `typescript-compatibility` catalog.

### Rationale

Pnpm replaces `catalog:typescript-compatibility` with its stored `>=5.0.0` specifier when packing or publishing. Consumers therefore receive the same compatibility contract as before, while Atomic and Headless share one source of truth. The exact TypeScript version in the default catalog remains dedicated to internal development and testing.

## Consequences

- **Positive:** The published peer range remains unchanged and cannot drift between Atomic and Headless.
- **Negative:** The range is one level of indirection away from each package manifest.
- **Neutral:** Future compatibility changes are made once in `pnpm-workspace.yaml` and affect both packages together.

## Implementation and Follow-up

- Add `catalogs.typescript-compatibility` to `pnpm-workspace.yaml`.
- Reference `catalog:typescript-compatibility` from the optional TypeScript peers in Atomic and Headless.
- Verify both packed manifests publish `typescript: ">=5.0.0"`.
