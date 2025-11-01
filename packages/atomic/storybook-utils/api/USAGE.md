# Using API Mocks in Storybook Stories

This guide explains how to use the MSW API harness utilities in your Storybook stories.

## Quick Start

### 1. Import the Mock API

```typescript
import { MockSearchApi } from '@/storybook-utils/api/search/mock';
```

### 2. Create an Instance

```typescript
const searchApiHarness = new MockSearchApi();
```

### 3. Configure Storybook Parameters

```typescript
const meta: Meta = {
  // ... other config
  parameters: {
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
};
```

## Basic Usage

### Simple Story with Default Responses

```typescript
import type { Meta, StoryObj as Story } from '@storybook/web-components-vite';
import { MockSearchApi } from '@/storybook-utils/api/search/mock';
import { wrapInSearchInterface } from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const { decorator, play } = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-search-box',
  title: 'Search/SearchBox',
  decorators: [decorator],
  parameters: {
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'Default Search Box',
};
```

## EndpointHarness API

Each endpoint in a Mock API class is an `EndpointHarness` instance with the following methods:

### `mock(modifier)`

Permanently modifies the base response used for all subsequent requests.

**When to use:** Set up the default behavior for all stories in the meta.

```typescript
// Reduce total results to 30
searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 30),
  totalCount: 30,
  totalCountFiltered: 30,
}));
```

### `mockOnce(modifier, httpResponseInit?)`

Queues a modified response for the next API request. Responses are consumed in FIFO order.

**When to use:** Create specific response sequences for individual stories.

```typescript
// Queue specific responses for a story
searchApiHarness.searchEndpoint.mockOnce((response) => ({
  ...response,
  results: response.results.slice(0, 10),
}));
```

**Optional second parameter** for HTTP response options:

```typescript
searchApiHarness.searchEndpoint.mockOnce(
  (response) => response,
  { status: 201, headers: { 'X-Custom': 'value' } }
);
```

### `mockErrorOnce()`

Queues a network error for the next request.

```typescript
// Simulate network failure
searchApiHarness.searchEndpoint.mockErrorOnce();
```

### `clear()`

Clears all queued responses, returning to the base response behavior.

**When to use:** Reset state in `beforeEach` hooks.

```typescript
beforeEach: () => {
  searchApiHarness.searchEndpoint.clear();
}
```

### `reset()`

Resets the base response to the initial default.

```typescript
searchApiHarness.searchEndpoint.reset();
```

## Common Patterns

### Pattern 1: Pagination Testing

Test multi-page interactions by queuing responses for each page:

```typescript
const meta: Meta = {
  // ... config
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
    
    // First page: results 0-40
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(0, 40),
    }));
    
    // Second page: results 40-80
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(40, 80),
    }));
    
    // Third page: results 80-120
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(80),
    }));
  },
};
```

### Pattern 2: Empty State Testing

Test components with no results:

```typescript
export const NoResults: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
      totalCountFiltered: 0,
    }));
  },
  play,
};
```

### Pattern 3: Limited Results

Test components with fewer results than expected:

```typescript
export const FewResults: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(0, 3),
      totalCount: 3,
      totalCountFiltered: 3,
    }));
  },
  play,
};
```

### Pattern 4: Error Handling

Test error states and network failures:

```typescript
export const NetworkError: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockErrorOnce();
  },
  play,
};

export const ApiError: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce(() => ({
      ok: false,
      status: 500,
      statusCode: 500,
      message: 'Internal Server Error',
      type: 'error',
    }));
  },
  play,
};
```

### Pattern 5: Setting Base Response for All Stories

Modify the base response at the meta level to affect all stories:

```typescript
const searchApiHarness = new MockSearchApi();

// Apply to all stories
searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 50),
  totalCount: 50,
}));

const meta: Meta = {
  // ... config
};
```

## Using Multiple Mock APIs

Combine handlers from multiple APIs when your component uses different services:

```typescript
import { MockSearchApi } from '@/storybook-utils/api/search/mock';
import { MockAnswerApi } from '@/storybook-utils/api/answer/mock';

const searchApiHarness = new MockSearchApi();
const answerApiHarness = new MockAnswerApi();

const meta: Meta = {
  parameters: {
    msw: {
      handlers: [
        ...searchApiHarness.handlers,
        ...answerApiHarness.handlers,
      ],
    },
  },
};
```

## BeforeEach vs AfterEach

### Use `beforeEach` to Flush (Recommended)

Flush responses **before** each story to ensure a clean slate:

```typescript
const meta: Meta = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
    // Queue responses for this story
  },
};
```

**Why:** This pattern ensures queued responses are available throughout the story's play function.

### Don't Use `afterEach` to Flush

Avoid flushing in `afterEach` when testing multi-step interactions:

```typescript
// ❌ DON'T DO THIS
const meta: Meta = {
  afterEach: () => {
    searchApiHarness.searchEndpoint.clear();
  },
};
```

**Why:** Flushing after the play function completes would remove responses needed during the story.

## Streaming Responses (RGA Example)

For streaming endpoints like Retrieval Generated Answering (RGA):

```typescript
import { MockAnswerApi } from '@/storybook-utils/api/answer/mock';

const answerApiHarness = new MockAnswerApi();

// The streaming endpoint returns a function
// No special handling needed in stories - it works automatically!

const meta: Meta = {
  parameters: {
    msw: {
      handlers: [...answerApiHarness.handlers],
    },
  },
};
```

The streaming response is handled automatically by the harness. You can still enqueue custom streaming responses if needed:

```typescript
import { buildAnsweringStreamingResponse } from '@/storybook-utils/api/answer/generate-response';

answerApiHarness.generateEndpoint.mockOnce(
  () => buildAnsweringStreamingResponse({ delayBetweenMessages: 0 })
);
```

## Commerce API Example

```typescript
import { MockCommerceApi } from '@/storybook-utils/api/commerce/mock';
import { wrapInCommerceInterface } from '@/storybook-utils/commerce/commerce-interface-wrapper';

const commerceApiHarness = new MockCommerceApi();

// Modify base to show fewer products
commerceApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  products: response.products.slice(0, 12),
}));

const { decorator, play } = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-product-list',
  decorators: [decorator],
  parameters: {
    msw: {
      handlers: [...commerceApiHarness.handlers],
    },
  },
  play,
};

export default meta;

export const Default: Story = {};

export const NoProducts: Story = {
  beforeEach: () => {
    commerceApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      products: [],
      totalCount: 0,
    }));
  },
  play,
};
```

## Testing Tips

### 1. Keep Stories Focused

Each story should test one specific behavior or state:

```typescript
export const Loading: Story = { /* ... */ };
export const WithResults: Story = { /* ... */ };
export const NoResults: Story = { /* ... */ };
export const Error: Story = { /* ... */ };
```

### 2. Use Descriptive Names

Name your stories clearly to indicate what they're testing:

```typescript
export const NotEnoughRecsForCarousel: Story = {
  name: 'Not enough recommendations for carousel',
  // ...
};
```

### 3. Document Complex Setups

Add comments when using multiple queued responses:

```typescript
beforeEach: () => {
  // Queue 3 responses to demonstrate pagination behavior:
  // 1. First page shows results 0-40
  // 2. Second page shows results 40-80  
  // 3. Third page shows final results (80+)
  searchApiHarness.searchEndpoint.mockOnce(/* ... */);
  searchApiHarness.searchEndpoint.mockOnce(/* ... */);
  searchApiHarness.searchEndpoint.mockOnce(/* ... */);
}
```

### 4. Flush in beforeEach

Always flush queued responses in `beforeEach` to ensure each story starts clean:

```typescript
beforeEach: () => {
  searchApiHarness.searchEndpoint.clear();
  // Then queue responses specific to this story
}
```

### 5. Test User Journeys

Queue responses to simulate multi-step user interactions:

```typescript
beforeEach: () => {
  // User sees initial results
  searchApiHarness.searchEndpoint.mockOnce(/* initial */);
  // User clicks "load more"
  searchApiHarness.searchEndpoint.mockOnce(/* page 2 */);
  // User reaches end
  searchApiHarness.searchEndpoint.mockOnce(/* final page */);
}
```

## Troubleshooting

### Responses Not Being Used

**Problem:** Queued responses aren't being consumed.

**Solution:** Check that:
1. The endpoint path in the harness matches the actual API call
2. The HTTP method (GET/POST) is correct
3. The handlers are included in the MSW parameters

### Responses in Wrong Order

**Problem:** Wrong response is returned for a request.

**Solution:** Ensure you're flushing in `beforeEach`, not `afterEach`:

```typescript
beforeEach: () => {
  harness.searchEndpoint.clear();
  // Then enqueue in the correct order
}
```

### TypeScript Errors

**Problem:** Type errors when modifying responses.

**Solution:** Ensure you're spreading the base response and maintaining the same structure:

```typescript
// ✅ Good
mockOnce((response) => ({
  ...response,
  results: [],
}))

// ❌ Bad - missing fields
mockOnce(() => ({
  results: [],
}))
```

## Available Mock APIs

- **MockSearchApi** - Search API (v2)
  - `searchEndpoint`
  - `querySuggestEndpoint`

- **MockCommerceApi** - Commerce API (v2)
  - `searchEndpoint`
  - `recommendationEndpoint`
  - `querySuggestEndpoint`
  - `productSuggestEndpoint`

- **MockAnswerApi** - Answer API (RGA)
  - `generateEndpoint`

- **MockMachineLearningApi** - Machine Learning API
  - `userActionsEndpoint`

## See Also

- [Structure Guide](./README.md) - File structure and naming conventions
- [MSW Documentation](https://mswjs.io/) - Official MSW docs
- [Storybook Testing](https://storybook.js.org/docs/react/writing-tests/interaction-testing) - Interaction testing guide
