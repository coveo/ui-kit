# Features Module

Each sub-directory here represents a single domain feature — the canonical location for its slice definition, action creators, selectors, and types.

## Naming Conventions

- Directory: kebab-case matching the domain name (e.g., `search-box/`)
- Files: `<feature>-slice.ts`, `<feature>-actions.ts`, `<feature>-selectors.ts`, `<feature>-types.ts`
- Barrel: `index.ts` at the feature directory root
- Tests: co-located as `<feature>-<unit>.test.ts`

## Barrel Pattern

Each feature barrel exports the public surface of the module:

```ts
// internal/features/pagination/index.ts
export {getOrCreatePaginationSlice} from './pagination-slice.js';
export {getOrCreatePaginationActions} from './pagination-actions.js';
export {getOrCreatePaginationSelectors} from './pagination-selectors.js';
export type {PaginationState} from './pagination-types.js';
```

## How to Add a New Feature

1. Create a directory under `internal/features/` with the feature's kebab-case name.
2. Add the implementation files following the naming conventions above.
3. Create an `index.ts` barrel that exports factory functions and types.
4. Import from the barrel in consuming modules (e.g., `public/controllers/`).

## What Belongs Here vs. Elsewhere

- **Here**: State slices, domain-specific actions, selectors, and types.
- **`utils/`**: Cross-cutting helpers shared across multiple features.
- **`api/`**: HTTP transport, endpoint clients, and API-specific logic.
