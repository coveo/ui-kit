# ADR-006 — Annex A: Proposed Directory Structure

This annex provides the full proposed directory tree after the restructuring.

## Complete tree

```
src/
├── index.ts                                         ← Package entry. Re-exports from public/ only.
│
├── public/                                          ← THE CONTRACT
│   │                                                   Lint: no @reduxjs/toolkit, no immer,
│   │                                                   no deep internal/ imports.
│   ├── controllers/
│   │   ├── index.ts
│   │   ├── controller-types.ts
│   │   ├── cart/
│   │   │   └── cart-controller.ts
│   │   ├── converse/
│   │   │   └── converse-controller.ts
│   │   ├── pagination/
│   │   │   └── pagination-controller.ts
│   │   ├── product-list/
│   │   │   └── product-list-controller.ts
│   │   ├── result-list/
│   │   │   └── result-list-controller.ts
│   │   └── search-box/
│   │       └── search-box-controller.ts
│   ├── actions/
│   │   ├── index.ts
│   │   ├── cart/
│   │   │   └── cart-actions.ts
│   │   ├── configuration/
│   │   │   └── configuration-actions.ts
│   │   ├── search-box/
│   │   │   ├── search-box-actions.ts
│   │   │   └── search-box-state-getter.ts
│   │   └── search-parameters/
│   │       └── search-parameters-actions.ts
│   └── interfaces/
│       ├── commerce.ts
│       ├── compose.ts
│       ├── generative.ts
│       └── search.ts
│
├── internal/                                        ← EVERYTHING ELSE
│   │
│   ├── features/                                    ← Domain features (state)
│   │   ├── pagination/
│   │   │   ├── index.ts                             ← Barrel
│   │   │   ├── pagination-types.ts
│   │   │   ├── pagination-slice.ts
│   │   │   ├── pagination-slice.test.ts
│   │   │   ├── pagination-actions.ts
│   │   │   └── pagination-selectors.ts
│   │   ├── facets/
│   │   │   ├── index.ts
│   │   │   ├── facets-types.ts
│   │   │   ├── facets-slice.ts
│   │   │   ├── facets-slice.test.ts
│   │   │   ├── facets-actions.ts
│   │   │   └── facets-selectors.ts
│   │   ├── result-list/
│   │   │   ├── index.ts
│   │   │   ├── result-list-types.ts
│   │   │   ├── result-list-slice.ts
│   │   │   ├── result-list-slice.test.ts
│   │   │   ├── result-list-actions.ts
│   │   │   └── result-list-selectors.ts
│   │   ├── product-list/
│   │   │   ├── index.ts
│   │   │   ├── product-list-types.ts
│   │   │   ├── product-list-slice.ts
│   │   │   ├── product-list-actions.ts
│   │   │   └── product-list-selectors.ts
│   │   ├── search-box/
│   │   │   ├── index.ts
│   │   │   ├── search-box-slice.ts
│   │   │   ├── search-box-slice.test.ts
│   │   │   ├── search-box-actions.ts
│   │   │   └── search-box-selectors.ts
│   │   ├── cart/
│   │   │   ├── index.ts
│   │   │   ├── cart-types.ts
│   │   │   ├── cart-slice.ts
│   │   │   ├── cart-slice.test.ts
│   │   │   ├── cart-actions.ts
│   │   │   └── cart-selectors.ts
│   │   ├── configuration/
│   │   │   ├── index.ts
│   │   │   ├── configuration-types.ts
│   │   │   ├── configuration-slice.ts
│   │   │   ├── configuration-slice.test.ts
│   │   │   ├── configuration-actions.ts
│   │   │   ├── configuration-selectors.ts
│   │   │   └── configuration-reader.ts
│   │   ├── generative/
│   │   │   ├── index.ts
│   │   │   ├── generative-types.ts
│   │   │   ├── generative-slice.ts
│   │   │   ├── generative-actions.ts
│   │   │   ├── generative-selectors.ts
│   │   │   ├── generative-hydration.ts
│   │   │   ├── generative-hydration.test.ts
│   │   │   └── generative-loader.ts
│   │   ├── sort/
│   │   │   ├── index.ts
│   │   │   ├── sort-slice.ts
│   │   │   ├── sort-actions.ts
│   │   │   └── sort-selectors.ts
│   │   ├── search-parameters/
│   │   │   ├── index.ts
│   │   │   ├── search-parameters-slice.ts
│   │   │   ├── search-parameters-actions.ts
│   │   │   └── search-parameters-selectors.ts
│   │   ├── query-correction/
│   │   │   ├── index.ts
│   │   │   ├── query-correction-slice.ts
│   │   │   └── query-correction-actions.ts
│   │   └── triggers/
│   │       ├── index.ts
│   │       ├── triggers-slice.ts
│   │       └── triggers-actions.ts
│   │
│   ├── api/                                         ← HTTP clients + endpoint thunks + facades
│   │   ├── index.ts                                 ← Barrel
│   │   ├── protocol/
│   │   │   ├── http.ts
│   │   │   ├── http.test.ts
│   │   │   ├── error-handling.ts
│   │   │   ├── error-handling.test.ts
│   │   │   ├── stream.ts
│   │   │   ├── stream.test.ts
│   │   │   ├── stream-types.ts
│   │   │   ├── sse-parser.ts
│   │   │   ├── sse-parser.test.ts
│   │   │   ├── buffer.ts
│   │   │   └── buffer.test.ts
│   │   ├── search/
│   │   │   ├── index.ts                             ← Barrel
│   │   │   ├── search-endpoint-client.ts
│   │   │   ├── search-endpoint-client.test.ts
│   │   │   ├── search-endpoint-types.ts
│   │   │   ├── search-thunk.ts
│   │   │   ├── search-thunk-slice.ts
│   │   │   ├── search-request-selector.ts
│   │   │   ├── search-response-handler.ts
│   │   │   └── search-facade.ts
│   │   ├── commerce-search/
│   │   │   ├── index.ts
│   │   │   ├── commerce-search-endpoint-client.ts
│   │   │   ├── commerce-search-endpoint-types.ts
│   │   │   ├── commerce-search-thunk.ts
│   │   │   ├── commerce-search-thunk-slice.ts
│   │   │   ├── commerce-search-request-selector.ts
│   │   │   ├── commerce-search-response-handler.ts
│   │   │   └── commerce-search-facade.ts
│   │   ├── conversation/
│   │   │   ├── index.ts
│   │   │   ├── conversation-endpoint-client.ts
│   │   │   ├── conversation-endpoint-client.test.ts
│   │   │   ├── conversation-endpoint-types.ts
│   │   │   ├── conversation-event-stream.ts
│   │   │   ├── conversation-event-stream.test.ts
│   │   │   └── conversation-endpoint-request-selector.ts
│   │   ├── query-suggest/
│   │   │   ├── index.ts
│   │   │   ├── query-suggest-thunk.ts
│   │   │   └── query-suggest-facade.ts
│   │   ├── commerce-query-suggest/
│   │   │   ├── index.ts
│   │   │   ├── commerce-query-suggest-thunk.ts
│   │   │   └── commerce-query-suggest-facade.ts
│   │   ├── generative/
│   │   │   ├── index.ts
│   │   │   └── generative-runtime.ts
│   │   ├── organization-endpoint.ts
│   │   └── organization-endpoint.test.ts
│   │
│   ├── engine/                                      ← Engine class & core plumbing
│   │   ├── index.ts                                 ← Barrel
│   │   ├── engine.ts
│   │   ├── engine.test.ts
│   │   ├── engine-types.ts
│   │   └── engine-configuration.ts
│   │
│   └── utils/                                       ← Shared utilities
│       ├── index.ts                                 ← Barrel
│       ├── symbols.ts
│       ├── interface-types.ts
│       ├── memoized-state-selector.ts
│       ├── memoized-state-selector.test.ts
│       ├── facade-cache.ts
│       ├── resolve-facades.ts
│       ├── select-slice.ts
│       ├── select-slice.test.ts
│       ├── id-generator.ts
│       ├── id-generator.test.ts
│       ├── get-handle-internals.ts
│       └── navigator-context-types.ts
│
└── test/
    ├── test-utils.ts
    └── integration/
        └── search-endpoint-real-network.test.ts
```

## Barrel example: `internal/features/pagination/index.ts`

```ts
// What public/ is allowed to import
export { getOrCreatePaginationSlice } from './pagination-slice.js';
export { getOrCreatePaginationActions } from './pagination-actions.js';
export { getOrCreatePaginationSelectors } from './pagination-selectors.js';
export type { PaginationState } from './pagination-types.js';
```

## Barrel example: `internal/api/search/index.ts`

```ts
// Client factory + types (needed by configuration-actions and potentially external consumers)
export { createSearchEndpointClient } from './search-endpoint-client.js';
export type {
  SearchEndpointClient,
  SearchEndpointClientConfiguration,
  SearchEndpointClientResult,
  SearchEndpointCallOptions,
} from './search-endpoint-client.js';
export type {
  CoveoSearchEndpointRequest,
  CoveoSearchEndpointResponse,
  CoveoFacetRequest,
  CoveoFacetResponse,
  CoveoFacetValue,
  CoveoSearchResult,
} from './search-endpoint-types.js';

// Facade resolver (needed by interface builders)
export { createSearchFacadeResolver } from './search-facade.js';

// Thunk factory (needed by facade resolver, not typically by public/)
export { createSearchEndpointThunk } from './search-thunk.js';
```

## ESLint rule

```js
// Applied to files matching src/public/**
"no-restricted-imports": ["error", {
  patterns: [
    {
      group: ["@reduxjs/toolkit", "@reduxjs/toolkit/*", "immer"],
      message: "Public layer must not depend on Redux or Immer directly."
    },
    {
      group: [
        "@/src/internal/features/*/*",
        "@/src/internal/api/*/*",
        "@/src/internal/engine/*",
        "@/src/internal/utils/*"
      ],
      message: "Import from the barrel (index.ts), not deep paths. Use @/src/internal/features/<name> or @/src/internal/api/<name>."
    }
  ]
}]
```

## Import path mapping (before → after)

| Before | After |
|--------|-------|
| `@/src/core/internal/pagination/pagination-actions.js` | `@/src/internal/features/pagination` |
| `@/src/core/internal/pagination/pagination-selectors.js` | `@/src/internal/features/pagination` |
| `@/src/core/internal/pagination/pagination-slice.js` | `@/src/internal/features/pagination` |
| `@/src/core/interface/utils/memoized-state-selector.js` | `@/src/internal/utils` |
| `@/src/core/interface/utils/interface-types.js` | `@/src/internal/utils` |
| `@/src/core/interface/utils/symbols.js` | `@/src/internal/utils` |
| `@/src/core/interface/utils/resolve-facades.js` | `@/src/internal/utils` |
| `@/src/core/interface/engine/engine.js` | `@/src/internal/engine` |
| `@/src/core/interface/engine/engine-types.js` | `@/src/internal/engine` |
| `@/src/api/interface/search-endpoint/search-endpoint-client.js` | `@/src/internal/api/search` |
| `@/src/core/internal/api/search/search-thunk.js` | `@/src/internal/api/search` |
| `@/src/core/interface/api/commerce-search/commerce-search-facade.js` | `@/src/internal/api/commerce-search` |
