# Utils Module

Shared cross-cutting utilities consumed by `features/`, `api/`, and `engine/`. This is the home for helpers that are not tied to a single domain.

## When to Put Something Here vs. in a Feature

- **Here**: The utility is used (or likely to be used) by more than one module, or it provides infrastructure for the public layer (base classes, selector factories).
- **In a feature**: The logic is specific to one domain (e.g., pagination math, facet request building). Keep it co-located with the feature even if it feels "utility-like."

## Adding Code

1. Create your file in `internal/utils/`.
2. Export public symbols from `index.ts`.
3. Use the barrel path (`@/src/internal/utils`) when importing from other modules.
