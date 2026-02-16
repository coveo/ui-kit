# MSW API Mocking Utilities

This directory contains utilities for mocking REST API responses in Storybook stories using [Mock Service Worker (MSW)](https://mswjs.io/).

## Overview

The API harness system provides a wrapper around MSW that simplifies mocking REST APIs with features like:
- Response queuing for multi-step interactions
- Base response modification for test variations
- Network error simulation
- Streaming response support (e.g., for RGA)

## Directory Structure

```
storybook-utils/api/
├── _base.ts                    # Core EndpointHarness and MockApi classes
├── _common/                    # Shared types and utilities
│   └── error.ts               # Common error response types
├── search/                     # Search API mocking
│   ├── mock.ts                # MockSearchApi class
│   ├── search-response.ts     # Base search response data
│   └── querySuggest-response.ts
├── commerce/                   # Commerce API mocking
│   ├── mock.ts                # MockCommerceApi class
│   ├── search-response.ts
│   ├── recommendation-response.ts
│   ├── querySuggest-response.ts
│   └── productSuggest-response.ts
├── answer/                     # Answer API (RGA) mocking
│   ├── mock.ts                # MockAnswerApi class
│   └── generate-response.ts   # Streaming response builder
└── machinelearning/            # ML API mocking
    ├── mock.ts                # MockMachineLearningApi class
    └── user-actions-response.ts
```

## Naming Conventions

### Directory Names
- Use lowercase, single-word names matching the API domain (e.g., `search`, `commerce`, `answer`)
- For multi-word API domains, use camelCase (e.g., `machinelearning`)

### File Names

#### Mock Class Files
- **Pattern:** `mock.ts`
- **Purpose:** Contains the `Mock[Domain]Api` class
- **Example:** `search/mock.ts` exports `MockSearchApi`

#### Response Data Files
- **Pattern:** `[endpoint-name]-response.ts`
- **Purpose:** Contains base response data for a specific endpoint
- **Examples:**
  - `search-response.ts` - Main search endpoint responses
  - `querySuggest-response.ts` - Query suggestion responses
  - `user-actions-response.ts` - User actions endpoint responses

### Class Names

#### Mock API Classes
- **Pattern:** `Mock[Domain]Api`
- **Must implement:** `MockApi` interface
- **Examples:**
  - `MockSearchApi`
  - `MockCommerceApi`
  - `MockAnswerApi`
  - `MockMachineLearningApi`

#### Endpoint Property Names
- **Pattern:** `[endpointName]Endpoint`
- **Type:** `EndpointHarness<TResponse>`
- **Examples:**
  - `searchEndpoint`
  - `querySuggestEndpoint`
  - `recommendationEndpoint`
  - `userActionsEndpoint`

### Export Names

#### Response Data Exports
- **Pattern:** `baseResponse` or specific name for variations
- **Examples:**
  ```typescript
  export const baseResponse = { /* ... */ };
  export const baseFoldedResponse = { /* ... */ };
  export const immediateBaseResponse = () => /* ... */;
  ```

## Creating a New API Mock

### Step 1: Create the Directory

Create a new directory under `storybook-utils/api/` named after your API domain:

```bash
mkdir storybook-utils/api/[your-api-domain]
```

### Step 2: Create Response Data File(s)

Create `[endpoint-name]-response.ts` file(s) with your base response data:

```typescript
// example-response.ts
export const baseResponse = {
  // Your response structure
  results: [],
  totalCount: 0,
  // ... other fields
};
```

For streaming responses (like RGA), export a function that returns an `HttpResponse`:

```typescript
// streaming-response.ts
import { HttpResponse } from 'msw';

export const baseResponse = () => {
  const stream = new ReadableStream({
    // ... streaming logic
  });
  
  return new HttpResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
};
```

### Step 3: Create the Mock Class

Create `mock.ts` with your `Mock[Domain]Api` class:

```typescript
// mock.ts
import type { HttpHandler } from 'msw';
import { EndpointHarness, type MockApi } from '../_base.js';
import { baseResponse } from './example-response.js';

export class MockExampleApi implements MockApi {
  readonly exampleEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.exampleEndpoint = new EndpointHarness<typeof baseResponse>(
      'POST',  // or 'GET'
      `${basePath}/rest/path/to/endpoint`,
      baseResponse
    );
  }

  get handlers(): HttpHandler[] {
    return [this.exampleEndpoint.generateHandler()];
  }
}
```

For streaming responses, provide a custom response factory:

```typescript
export class MockStreamingApi implements MockApi {
  readonly generateEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.generateEndpoint = new EndpointHarness<
      () => HttpResponse<DefaultBodyType>
    >(
      'POST',
      `${basePath}/rest/path/to/generate`,
      baseResponse,
      (response) => response()  // Custom factory for streaming
    );
  }

  get handlers(): HttpHandler[] {
    return [this.generateEndpoint.generateHandler()];
  }
}
```

### Step 4: Multiple Endpoints

If your API has multiple endpoints, add them all to the mock class:

```typescript
export class MockMultiEndpointApi implements MockApi {
  readonly searchEndpoint;
  readonly suggestEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.searchEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/api/search`,
      baseSearchResponse
    );
    
    this.suggestEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/api/suggest`,
      baseSuggestResponse
    );
  }

  get handlers(): HttpHandler[] {
    return [
      this.searchEndpoint.generateHandler(),
      this.suggestEndpoint.generateHandler(),
    ];
  }
}
```

## URL Path Patterns

Use MSW path patterns with parameters for dynamic routes:

- `:orgId` - Organization ID placeholder
- `:configId` - Configuration ID placeholder
- `:insightId` - Insight ID placeholder

**Examples:**
```typescript
`${basePath}/rest/organizations/:orgId/commerce/v2/search`
`${basePath}/rest/organizations/:orgId/answer/v1/configs/:configId/generate`
`${basePath}/rest/organizations/:orgId/insight/v1/configs/:insightId/answer/:configId/generate`
```

## Type Safety

### Response Types

Define response types using `typeof` for type inference:

```typescript
this.searchEndpoint = new EndpointHarness<typeof baseSearchResponse>(
  'POST',
  path,
  baseSearchResponse
);
```

### Union Types for Errors

Include error types in the generic for endpoints that can return errors:

```typescript
import type { APIErrorWithStatusCode } from '../_common/error.js';

this.searchEndpoint = new EndpointHarness<
  typeof baseSearchResponse | APIErrorWithStatusCode
>(
  'POST',
  path,
  baseSearchResponse
);
```

## Best Practices

1. **Keep response data separate** - Store base responses in dedicated `-response.ts` files
2. **Use readonly properties** - Mark endpoint properties as `readonly`
3. **Provide sensible defaults** - Include reasonable default data in base responses
4. **Document complex responses** - Add JSDoc comments for non-obvious response structures
5. **Export base responses** - Temporarily export base responses during migration (TODO: remove once internalized)
6. **Match production URLs** - Use accurate path patterns matching production API routes
7. **Include all endpoints** - If an API has multiple endpoints, include them all in one Mock class

## Common Patterns

### Testing Pagination

```typescript
// In beforeEach
harness.searchEndpoint.mockOnce((response) => ({
  ...response,
  results: response.results.slice(0, 20),
}));
harness.searchEndpoint.mockOnce((response) => ({
  ...response,
  results: response.results.slice(20, 40),
}));
```

### Testing Error States

```typescript
// Enqueue a network error
harness.searchEndpoint.mockErrorOnce();

// Or enqueue an API error response
harness.searchEndpoint.mockOnce(() => ({
  ok: false,
  status: 404,
  statusCode: 404,
  message: 'Not Found',
  type: 'error',
}));
```

### Modifying Base Response

```typescript
// Permanently modify the base response for all stories
harness.searchEndpoint.mock((response) => ({
  ...response,
  totalCount: 100,
  results: response.results.slice(0, 100),
}));
```

## Migration Notes

This system replaces the previous OpenAPI-based mocking approach. During migration:

1. Base responses are temporarily exported from `mock.ts` files
2. These exports should be removed once all stories are migrated
3. Look for `TODO: Remove exports once the concept is fully internalized` comments

## See Also

- [Usage Guide](./USAGE.md) - How to use API mocks in Storybook stories
- [MSW Documentation](https://mswjs.io/) - Official MSW documentation
- [Storybook MSW Addon](https://storybook.js.org/addons/msw-storybook-addon) - MSW integration for Storybook
