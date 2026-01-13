# EndpointHarness Quick Reference

Most MSW mocking in Atomic Storybook is done through `EndpointHarness` instances exposed by the `Mock*Api` harness classes.

Source of truth: `packages/atomic/storybook-utils/api/USAGE.md`.

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
