# Internal Layer

All implementation details for the Thermidor package live here. The `public/` layer imports from `internal/` exclusively through barrel `index.ts` files — never via deep paths into sub-modules.

## Sub-Modules

| Directory   | Purpose                                                      |
| ----------- | ------------------------------------------------------------ |
| `features/` | Domain-specific state management (slice, actions, selectors) |
| `api/`      | HTTP clients, endpoint thunks, response handlers, facades    |
| `engine/`   | Engine class and core plumbing (store, dispatch, config)     |
| `utils/`    | Shared cross-cutting utilities used by all other modules     |

## Barrel Convention

Every sub-module exposes an `index.ts` barrel that re-exports the symbols consumers need. Files not exported from a barrel are considered private to that module.

```ts
// Correct — import from the barrel
import {getOrCreatePaginationActions} from '@/src/internal/features/pagination';

// Incorrect — deep path bypasses the barrel
import {getOrCreatePaginationActions} from '@/src/internal/features/pagination/pagination-actions';
```

## Relationship to `public/`

`public/` (controllers, actions, interfaces) defines the package's external contract. It depends on `internal/` but `internal/` never imports from `public/`. An ESLint `no-restricted-imports` rule enforces this boundary and prevents `public/` from importing Redux Toolkit or Immer directly.

## Adding Code

1. Determine which sub-module your code belongs to (see each module's README).
2. Create your file inside the appropriate directory.
3. Export any symbols consumers need from the module's barrel `index.ts`.
