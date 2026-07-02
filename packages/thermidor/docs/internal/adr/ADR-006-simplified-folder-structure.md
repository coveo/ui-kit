# ADR-006: Simplified Internal Folder Structure

**Status**: `🟡 Proposed`  
**Related docs**: [ADR-000 Architecture Decision Charter](./ADR-000-architecture-decision-charter.md), [ADR-001 Anti-Corruption Layer](./ADR-001-anti-corruption-layer.md), [ADR-005 Public-Facing Abstractions](./ADR-005-public-facing-abstractions.md)

## 1. Context

The current `src/` directory uses a three-layer structure (`api/`, `core/`, `public/`), each subdivided into `interface/` and `internal/`. This creates up to six locations per domain feature and introduces indirection layers (mutators, loaders, re-exported selectors) whose sole purpose is to bridge `interface/` and `internal/` within the same layer.

- **Business/context drivers**: Thermidor is still early-stage. The internal structure must be easy to navigate for contributors, both core and external. The current layout creates confusion about where new code belongs and duplicates concepts across boundaries.
- **Technical constraints**: The anti-corruption boundary between `public/` and implementation details (Redux, Coveo API types) must be preserved (ADR-001). The simplification must not alter the public API surface.
- **Known assumptions**: The `core/interface/` mutators, loaders, and re-exported selectors are largely mechanical indirection. Controllers already import directly from `core/internal/` in most cases, bypassing the `core/interface/` layer.

## 2. Decision Statement

Collapse the internal directory structure from three layers with `interface/`+`internal/` splits into a single `internal/` directory. Enforce the anti-corruption boundary through a lint rule restricting import depth rather than through directory nesting.

The new layout:

```
src/
├── public/          ← The contract (unchanged role)
├── internal/        ← All implementation (features, api, engine, utils)
├── test/
└── index.ts
```

Each subdirectory within `internal/` exposes a barrel `index.ts` that declares what is importable by `public/`. A lint rule prevents `public/` from importing anything other than these barrels.

See [Annex A](./ADR-006-annex-a-proposed-structure.md) for the full directory tree.  
See [Annex B](./ADR-006-annex-b-removed-indirection.md) for the list of concepts removed.

## 3. Requirements & Considerations Mapping

### MUST

1. **Requirement**: Full use-case support
   - **Impact**: None
   - **How satisfied**: Pure structural refactor. No behavioral change.

2. **Requirement**: Public API independence
   - **Impact**: Positive
   - **How satisfied**: The anti-corruption boundary is now enforced by a lint rule that prevents `public/` from importing `@reduxjs/toolkit`, `immer`, or deep paths within `internal/`. This is stricter than the current structure (where controllers already import directly from `core/internal/`).

3. **Requirement**: First-class SSR
   - **Impact**: None
   - **How satisfied**: No runtime change.

### SHOULD

1. **Consideration**: Tree-shaking efficiency
   - **Impact**: None
   - **How addressed**: Barrel exports do not affect tree-shaking when using named exports (no `export *` from implementation files).

2. **Consideration**: Migration simplicity
   - **Impact**: None
   - **How addressed**: Internal refactor only. No public API changes.

3. **Consideration**: External contribution readiness
   - **Impact**: Positive
   - **How addressed**: Contributors face a single question: "Is this public-facing or implementation?" If implementation, it goes in `internal/features/<name>/`. No more deciding between `core/interface/` vs `core/internal/` vs `api/interface/` vs `api/internal/`.

## 4. Options Considered

### Option A (Selected): Two-level split (`public/` + `internal/`) with barrel-enforced boundaries

- **Summary**: One `internal/` directory containing `features/`, `api/`, `engine/`, and `utils/`. Each sub-module has a barrel `index.ts`. A lint rule restricts `public/` to importing from barrels only.
- **Pros**:
  - Minimal cognitive overhead: two directories, one rule
  - Eliminates ~30 indirection files (mutators, loaders, re-exported selectors)
  - Single canonical location per concept
  - The lint rule is enforceable in CI and produces clear error messages
  - Scales well as features are added
- **Cons**:
  - Barrel discipline required (reviewers must verify barrels don't over-export)
  - Slightly less self-documenting than directory names (requires reading the lint rule or barrel)
- **Risks**:
  - Barrel pollution (mitigated by PR review and small barrel size)

### Option B: Three-level split (`public/` + `internal/` + `implementation/`)

- **Summary**: Like Option A but adds a third directory for "deep internals" (slices, thunks, HTTP layer) that even `internal/` barrels cannot depend on directly.
- **Pros**:
  - Provides a stronger signal for "never expose this"
- **Cons**:
  - Three layers — the original complaint was "three layers is too many"
  - Forces decisions about which of two internal directories a file belongs in
  - Barrel + lint already solves the same problem with less structure
- **Risks**:
  - Contributor confusion about `internal/` vs `implementation/`

### Option C: Keep current structure, add lint rules only

- **Summary**: Keep `core/interface/`, `core/internal/`, `api/interface/`, `api/internal/` as-is but add lint rules to enforce boundaries.
- **Pros**:
  - No file moves required
- **Cons**:
  - Does not address the navigation complexity or concept duplication
  - Mutators and loaders remain as dead-weight indirection
  - Still six locations per feature
- **Risks**:
  - Contributor confusion persists

## 5. Decision Rationale

Option A provides the simplest mental model: one directory for what consumers see (`public/`), one for everything else (`internal/`). The anti-corruption boundary from ADR-001 is preserved and strengthened through tooling rather than directory nesting.

The current structure's `core/interface/` layer was designed as a boundary between "what the rest of the package can use" and "raw implementation." In practice, this layer has become mechanical indirection: mutators that wrap actions, selectors that re-export from `internal/`, loaders that just call `adoptSlice`. Controllers already reach past it. Option A acknowledges this reality and replaces the structural boundary with a tooling boundary (barrel + lint), which is both more enforceable and less costly.

Option B was rejected because it reintroduces the three-layer problem. Option C was rejected because it preserves the structural overhead without solving the contributor experience problem.

## 6. Public API and Contract Impact

- **Public API changes**: None
- **Backward compatibility impact**: None
- **Deprecations required**: None
- **Type/contract stability notes**: No type changes
- **Non-leakage check (implementation details not exposed)**: Pass — the lint rule now enforces this mechanically

## 7. Operational and Runtime Impact

- **Performance impact**: None (structural refactor)
- **Reliability impact**: None
- **Security/privacy impact**: None
- **SSR impact (if applicable)**: None
- **Observability impact (logs/metrics/traces)**: None

## 8. Migration and Rollout Plan

- **Consumer migration impact**: None — internal refactor only
- **Rollout strategy**: Single PR, all file moves + import rewrites + lint rule addition
- **Rollback strategy**: Revert the PR
- **Communication plan**: None required (internal decision)

### Execution steps

1. Create `src/internal/` with subdirectories (`features/`, `api/`, `engine/`, `utils/`)
2. Move `core/internal/*` feature folders → `internal/features/`
3. Move `core/interface/utils/` → `internal/utils/`
4. Merge `core/interface/<feature>/` files into `internal/features/<feature>/` (remove pure indirection, keep files with actual logic like `facets-selectors.ts`)
5. Merge `api/interface/` + `api/internal/` + `core/internal/api/` + `core/interface/api/` → `internal/api/`
6. Move `core/interface/engine/` → `internal/engine/`
7. Write barrel `index.ts` for each sub-module
8. Update all imports in `public/` to use barrel paths
9. Add ESLint `no-restricted-imports` rule
10. Delete empty `core/` and top-level `api/` directories
11. Verify all tests pass
