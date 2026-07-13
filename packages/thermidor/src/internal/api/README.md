# API Module

All HTTP client logic, endpoint thunks, response handlers, and facades live here, organized by domain.

## Structure

Each domain sub-module has its own barrel `index.ts` that exports client factories, types, thunks, and facades. The top-level `api/index.ts` re-exports from all domain barrels.

`protocol/` is an exception — it has no barrel because it is imported directly by sibling API modules, not by code outside `api/`.

## How to Add a New Endpoint

1. Determine the domain (e.g., `search`, `conversation`). Create a new sub-directory if no existing domain fits.
2. Add the endpoint client, types, thunk, and facade files following existing conventions.
3. Export public symbols from the domain's barrel `index.ts`.
4. Re-export from `api/index.ts` if the symbol is needed outside the API module.

## What Belongs Here vs. Elsewhere

- **Here**: HTTP clients, request/response types, thunks that call endpoints, facade resolvers.
- **`features/`**: State slices and selectors derived from API responses.
- **`utils/`**: Generic helpers not specific to HTTP transport.
