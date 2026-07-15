# Requirements Document

## Introduction

This document specifies the requirements for implementing ADR-006 — a purely structural refactoring of the Thermidor package's internal directory layout. The refactor collapses the current multi-layer internal structure (`api/interface/` + `api/internal/` + `core/interface/` + `core/internal/`) into a single `internal/` directory with four sub-modules (`features/`, `api/`, `engine/`, `utils/`). The `public/` layer remains unchanged. The anti-corruption boundary between `public/` and implementation details is enforced by barrel `index.ts` files and ESLint rules rather than directory nesting.

## Glossary

- **Thermidor**: The internal package at `packages/thermidor/` within the ui-kit monorepo
- **Barrel**: An `index.ts` file that re-exports symbols from sibling files, serving as the single import entry point for a sub-module
- **Feature_Module**: A domain-specific directory under `internal/features/` containing slice, actions, selectors, and types for one domain (e.g., pagination, facets, cart)
- **Indirection_File**: A file whose sole purpose is to re-export or trivially wrap symbols from another location (mutators, re-exported selectors)
- **Anti_Corruption_Boundary**: The architectural boundary preventing `public/` from depending on implementation details (Redux Toolkit, Immer, deep internal paths)
- **Deep_Path**: An import path that reaches into a sub-module beyond its barrel (e.g., `@/src/internal/features/pagination/pagination-actions`)
- **Public_Layer**: The `src/public/` directory containing controllers, actions, and interfaces that form the package's external contract
- **Internal_Layer**: The `src/internal/` directory containing all implementation details
- **API_Snapshot_Gate**: A CI check that captures the set of exported symbols and flags leaked implementation types
- **DTS_Validation_Gate**: A CI check that inspects generated `.d.ts` declaration files for leaked implementation types

## Requirements

### Requirement 1: Directory Structure Creation

**User Story:** As a contributor, I want a single `internal/` directory with clearly named sub-modules, so that I always know where implementation code belongs.

#### Acceptance Criteria

1. THE Refactor SHALL create the directory `src/internal/` with sub-directories `features/`, `api/`, `engine/`, and `utils/`
2. WHEN the refactor is complete, THE Internal_Layer SHALL contain exactly four top-level sub-modules: `features`, `api`, `engine`, and `utils`
3. THE Refactor SHALL create a barrel `index.ts` file in each of `internal/features/<name>/`, `internal/api/`, `internal/api/<domain>/`, `internal/engine/`, and `internal/utils/`

### Requirement 2: Feature Module Migration

**User Story:** As a contributor, I want all domain feature code in one canonical location per feature, so that I do not have to look across multiple directories to understand a domain.

#### Acceptance Criteria

1. WHEN the refactor is complete, THE Internal_Layer SHALL contain Feature_Modules for: pagination, facets, result-list, product-list, search-box, cart, configuration, generative, sort, search-parameters, query-correction, and triggers
2. THE Refactor SHALL move all files from `core/internal/<feature>/` to `internal/features/<feature>/` preserving file names and content
3. WHEN a Feature_Module barrel is created, THE Barrel SHALL export the `getOrCreate*` factory functions for slice, actions, and selectors, plus any public type definitions
4. THE Refactor SHALL preserve co-located test files alongside their source files during the move

### Requirement 3: Logic Preservation and Type Consolidation

**User Story:** As a contributor, I want interface files with real logic merged into their feature modules, so that derived selectors and transformations live alongside the state they operate on.

#### Acceptance Criteria

1. THE Refactor SHALL move `core/interface/facets/facets-selectors.ts` (containing `buildFacetsRequest`) to `internal/features/facets/facets-selectors.ts`
2. THE Refactor SHALL move `core/interface/configuration/configuration-selectors.ts` to `internal/features/configuration/configuration-selectors.ts`
3. THE Refactor SHALL move `core/interface/generative/generative-hydration.ts` and its test to `internal/features/generative/`
4. THE Refactor SHALL move or merge type files from `core/interface/<feature>/` into `internal/features/<feature>/` for: pagination, facets, cart, result-list, and generative
5. WHEN a type file exists in both `core/interface/` and `core/internal/` for the same feature, THE Refactor SHALL merge them into a single file in `internal/features/<feature>/`

### Requirement 4: Utils Module Consolidation

**User Story:** As a contributor, I want shared cross-cutting utilities in a single `utils/` module, so that utility code is easy to discover and reuse.

#### Acceptance Criteria

1. THE Refactor SHALL move all files from `core/interface/utils/` to `internal/utils/`
2. THE Refactor SHALL move `core/interface/base-controller.ts` to `internal/utils/`
3. THE Refactor SHALL move `core/interface/base-interface.ts` to `internal/utils/`
4. THE Refactor SHALL move `core/interface/cache/interface-cache-registry.ts` to `internal/utils/`
5. THE Refactor SHALL move `core/interface/navigator-context/navigator-context-types.ts` to `internal/utils/`
6. WHEN the utils barrel is created, THE Barrel SHALL export all utilities needed by features, api, and engine modules

### Requirement 5: Engine Module Migration

**User Story:** As a contributor, I want engine code isolated in its own module, so that engine plumbing is clearly separated from domain features.

#### Acceptance Criteria

1. THE Refactor SHALL move all files from `core/interface/engine/` to `internal/engine/`
2. WHEN the engine barrel is created, THE Barrel SHALL export the Engine class, engine types, and engine configuration factory
3. THE Refactor SHALL preserve co-located engine test files during the move

### Requirement 6: API Module Consolidation

**User Story:** As a contributor, I want all HTTP client logic in one place organized by domain, so that I can find any endpoint implementation in `internal/api/<domain>/`.

#### Acceptance Criteria

1. THE Refactor SHALL merge files from `api/interface/`, `api/internal/`, `core/internal/api/`, and `core/interface/api/` into `internal/api/` organized by domain
2. WHEN the API module is structured, THE Internal_Layer SHALL contain these domain sub-modules under `api/`: `protocol`, `search`, `commerce-search`, `conversation`, `query-suggest`, `commerce-query-suggest`, and `generative`
3. WHEN an API domain barrel is created, THE Barrel SHALL export client factories, type definitions, facade resolvers, and thunk factories needed by consumers
4. THE Refactor SHALL place transport-layer files (http, stream, sse-parser, buffer, error-handling) in `internal/api/protocol/`

### Requirement 7: Indirection Removal

**User Story:** As a contributor, I want mechanical wrapper files removed, so that there is no dead-weight code obscuring the real implementation.

#### Acceptance Criteria

1. THE Refactor SHALL delete the 6 mutator files: `core/interface/pagination/pagination-mutators.ts`, `core/interface/facets/facets-mutators.ts`, `core/interface/result-list/result-list-mutators.ts`, `core/interface/cart/cart-mutators.ts`, `core/interface/search-box/search-box-mutators.ts`, `core/interface/configuration/configuration-mutators.ts`
2. THE Refactor SHALL delete the 4 re-exported selector files: `core/interface/cart/cart-selectors.ts`, `core/interface/result-list/result-list-selectors.ts`, `core/interface/search-box/search-box-selectors.ts`, `core/interface/pagination/pagination-selectors.ts`
3. THE Refactor SHALL delete test files associated with removed indirection files (approximately 12 files)
4. WHEN a test file for a removed indirection contains assertions about real behavior, THE Refactor SHALL migrate those assertions to the corresponding `internal/features/` test file

### Requirement 8: Import Rewriting

**User Story:** As a contributor, I want all imports to use barrel paths, so that import statements are short, consistent, and protected against internal file reorganization.

#### Acceptance Criteria

1. WHEN all file moves are complete, THE Refactor SHALL update all import statements in `public/` to reference barrel paths (e.g., `@/src/internal/features/pagination` instead of deep file paths)
2. WHEN all file moves are complete, THE Refactor SHALL update all cross-module import statements within `internal/` to reference barrel paths where applicable
3. WHEN TypeScript compilation is run after import rewriting, THE Compiler SHALL produce zero errors (`tsc --noEmit` passes)

### Requirement 9: ESLint Boundary Enforcement

**User Story:** As a contributor, I want a lint rule that prevents accidental boundary violations, so that the anti-corruption layer is enforced mechanically in CI.

#### Acceptance Criteria

1. THE Refactor SHALL add a `no-restricted-imports` ESLint rule scoped to files in `src/public/`
2. WHEN a file in `public/` imports from `@reduxjs/toolkit`, `@reduxjs/toolkit/*`, or `immer`, THE ESLint_Rule SHALL report an error with message: "Public layer must not depend on Redux or Immer directly."
3. WHEN a file in `public/` imports a Deep_Path into internal sub-modules, THE ESLint_Rule SHALL report an error with message: "Import from the barrel (index.ts), not deep paths."
4. WHEN `pnpm run lint:check` is executed after the refactor, THE Linter SHALL produce zero errors in the Thermidor package

### Requirement 10: API Snapshot Gate

**User Story:** As a maintainer, I want a CI check that flags leaked implementation types in the public API, so that internal symbols never accidentally become part of the package contract.

#### Acceptance Criteria

1. THE Refactor SHALL create a snapshot of all symbols exported from `src/index.ts`
2. WHEN the API snapshot is compared before and after the refactor, THE Snapshot SHALL show zero differences in exported symbol names and type signatures
3. IF the snapshot detects any symbol whose type references `@reduxjs/toolkit` or `immer` internals, THEN THE Gate SHALL fail with a descriptive error

### Requirement 11: Declaration File Validation Gate

**User Story:** As a maintainer, I want a CI check that scans `.d.ts` output for leaked types, so that consumers never see Redux or Immer types in the package's type declarations.

#### Acceptance Criteria

1. THE Refactor SHALL create a validation step that inspects generated `.d.ts` files after build
2. IF any `.d.ts` file contains import statements or type references to `@reduxjs/toolkit` or `immer`, THEN THE DTS_Validation_Gate SHALL fail with an error identifying the offending file
3. WHEN the validation gate passes, THE Build_Output SHALL contain zero references to implementation-layer dependencies in declaration files

### Requirement 12: README Documentation

**User Story:** As a contributor, I want lightweight README files in each internal sub-module, so that I can quickly understand the architecture and conventions without reading source code.

#### Acceptance Criteria

1. THE Refactor SHALL create README.md files in: `internal/`, `internal/features/`, `internal/api/`, `internal/engine/`, and `internal/utils/`
2. WHEN a README is created, THE README SHALL describe the module's purpose, conventions, and how to add new code
3. THE READMEs SHALL remain lightweight and not duplicate information available in barrel files or the ADR

### Requirement 13: Old Directory Cleanup

**User Story:** As a contributor, I want empty legacy directories removed, so that the codebase does not contain dead structure.

#### Acceptance Criteria

1. WHEN all files have been moved out of `core/`, THE Refactor SHALL delete the `core/` directory and all its empty sub-directories
2. WHEN all files have been moved out of the top-level `api/` directory, THE Refactor SHALL delete the `api/` directory and all its empty sub-directories
3. WHEN cleanup is complete, THE Source_Tree SHALL not contain any empty directories previously used by the old structure

### Requirement 14: Public API Preservation

**User Story:** As a package consumer, I want the refactor to produce zero breaking changes, so that my code continues to work without modification.

#### Acceptance Criteria

1. THE Refactor SHALL not add, remove, or modify any symbol exported from `src/index.ts`
2. THE Refactor SHALL not change any runtime behavior of the package
3. WHEN the full test suite is executed after the refactor, THE Test_Suite SHALL pass with zero failures (excluding tests for deleted indirection files)

### Requirement 15: Compilation and Lint Verification

**User Story:** As a maintainer, I want the refactor verified by the standard CI checks, so that I am confident the codebase is in a clean state.

#### Acceptance Criteria

1. WHEN `tsc --noEmit` is executed against the Thermidor package after the refactor, THE Compiler SHALL report zero errors
2. WHEN `pnpm run lint:check` is executed after the refactor, THE Linter SHALL report zero errors in the Thermidor package
3. WHEN `pnpm run test` is executed in the Thermidor package after the refactor, THE Test_Runner SHALL report zero failures
4. WHEN circular dependency analysis is run on `internal/`, THE Analyzer SHALL report zero circular dependencies

### Requirement 16: Single Canonical Location

**User Story:** As a contributor, I want each implementation concept to exist in exactly one file, so that there is no ambiguity about which version is authoritative.

#### Acceptance Criteria

1. WHEN the refactor is complete, FOR ALL implementation concepts (slice, action factory, selector factory, endpoint client), THE Internal_Layer SHALL contain exactly one file defining that concept
2. THE Refactor SHALL not create duplicate definitions of any symbol across `internal/` sub-modules
