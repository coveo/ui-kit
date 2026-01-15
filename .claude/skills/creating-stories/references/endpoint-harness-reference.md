# EndpointHarness Reference

Most MSW mocking in Atomic Storybook is done through `EndpointHarness` instances exposed by the `Mock*Api` harness classes.

## Overview

Atomic uses **MSW (Mock Service Worker)** to mock API responses in Storybook stories. Each API endpoint is an `EndpointHarness<TResponse>` instance that provides:

- **Response queuing** - Queue multiple responses for multi-step interactions (pagination, search refinement)
- **Base response modification** - Set default behavior for all stories
- **Network error simulation** - Test error states
- **Type safety** - TypeScript ensures response modifications match the expected structure

### Mock API Naming Conventions

Each domain has a Mock API class following the naming convention `Mock[Domain]Api`:

```typescript
import { MockSearchApi } from '@/storybook-utils/api/search/mock';
import { MockCommerceApi } from '@/storybook-utils/api/commerce/mock';
```

Each mock class exposes endpoint properties following the pattern `[endpoint]Endpoint`:

```typescript
const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint        // EndpointHarness<SearchResponse>
searchApiHarness.querySuggestEndpoint  // EndpointHarness<QuerySuggestResponse>
```

## Methods

- `mock((baseResponse) => nextResponse)`
  - Permanently changes the base response factory for the entire story file.
  - Use when all stories share the same modified dataset.

- `mockOnce((baseResponse) => nextResponse)`
  - Queues a single response for the next matching request.
  - Use for story-specific states or sequential flows (pagination, refinements).

- `mockErrorOnce()`
  - Queues a network error.
  - Use for error-state UI, retry flows, and query error containers.

- `clear()`
  - Clears queued `mockOnce` / `mockErrorOnce` responses.
  - Use in `beforeEach` so stories don’t leak state.

- `reset()`
  - Restores the original base response factory.
  - Rarely needed; prefer `clear()` for story isolation.

## Examples

### Shared modification for a file

```ts
const searchApiHarness = new MockSearchApi();

searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 10),
  totalCount: 10,
  totalCountFiltered: 10,
}));
```

### Story-specific variation

```ts
export const NoResults: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
      totalCountFiltered: 0,
    }));
  },
};
```

### Network error

```ts
export const NetworkError: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockErrorOnce();
  },
};
```

## Usage Notes

### Response Modifier Pattern

All methods that modify responses use a **modifier function** pattern:

```typescript
(baseResponse: TResponse) => TResponse
```

The modifier receives the typed base response and must return the same type. **Always spread the base response** to maintain required fields:

```typescript
// ✅ Good - preserves all fields
searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 10),
  totalCount: 10,
}));

// ❌ Bad - missing required fields
searchApiHarness.searchEndpoint.mock((response) => ({
  results: response.results.slice(0, 10),
  totalCount: 10,
}));
```

### Type Safety

EndpointHarness uses TypeScript generics for response typing:

```typescript
class EndpointHarness<TResponse> {
  mock(modifier: (response: TResponse) => TResponse): void;
  mockOnce(modifier: (response: TResponse) => TResponse): void;
  // ...
}
```

TypeScript will catch structure mismatches at compile time, ensuring your modified responses match the API contract.
