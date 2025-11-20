---
applyTo: 'packages/atomic/**/*.stories.tsx'
---

# AI Instructions: MSW API Mocking in Atomic Storybook

## Overview

When working with Storybook stories in the Atomic package, you must use the MSW (Mock Service Worker) API harness utilities located in `packages/atomic/storybook-utils/api/`. These utilities provide a consistent, type-safe way to mock REST API responses.

## When to Use API Mocks

Use API mocking in Storybook stories when:
- The component interacts with Headless controllers that make API calls
- You need to test different API response scenarios (empty states, errors, pagination)
- You want to demonstrate component behavior with various data sets
- You're creating visual regression or interaction tests

## Required Reading

Before creating or modifying API mocks, read:
1. `/packages/atomic/storybook-utils/api/README.md` - Structure and naming conventions
2. `/packages/atomic/storybook-utils/api/USAGE.md` - How to use mocks in stories

## Core Principles

### 1. Use Existing Mocks When Possible

Before creating a new mock, check if one already exists:

```bash
ls packages/atomic/storybook-utils/api/
```

Available mocks:
- `MockSearchApi` - Search API v2
- `MockCommerceApi` - Commerce API v2  
- `MockAnswerApi` - Answer/RGA API
- `MockMachineLearningApi` - ML/User Actions API

### 2. Always Import from `@/storybook-utils/api/[domain]/mock`

```typescript
// ✅ Correct
import { MockSearchApi } from '@/storybook-utils/api/search/mock';

// ❌ Wrong - don't import from other paths
import { MockSearchApi } from '../../../storybook-utils/api/search/mock';
```

### 3. Create One Harness Instance Per Story File

```typescript
// At the top level of your story file
const searchApiHarness = new MockSearchApi();

const meta: Meta = {
  parameters: {
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
};
```

## Common Patterns for Stories

### Pattern: Basic Story with Default Response

```typescript
import type { Meta, StoryObj as Story } from '@storybook/web-components-vite';
import { MockSearchApi } from '@/storybook-utils/api/search/mock';
import { wrapInSearchInterface } from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const { decorator, play } = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-component-name',
  title: 'Search/ComponentName',
  decorators: [decorator],
  parameters: {
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  play,
};

export default meta;

export const Default: Story = {};
```

### Pattern: Modifying Base Response for All Stories

When all stories need the same modified response:

```typescript
const searchApiHarness = new MockSearchApi();

// Apply to ALL stories in this file
searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 30),
  totalCount: 30,
  totalCountFiltered: 30,
}));

const meta: Meta = {
  // ... rest of config
};
```

### Pattern: Story-Specific Responses

When individual stories need different responses:

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

### Pattern: Testing Pagination

For components that load more results:

```typescript
const meta: Meta = {
  // ... other config
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
    
    // First request - initial page
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(0, 40),
    }));
    
    // Second request - next page
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(40, 80),
    }));
    
    // Third request - final page
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(80),
    }));
  },
  play,
};
```

### Pattern: Testing Errors

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

### Pattern: Multiple APIs

When a component uses multiple APIs:

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

## Creating a New API Mock

Only create a new mock if the API domain doesn't exist yet.

### Step 1: Create Directory and Response File

```bash
mkdir packages/atomic/storybook-utils/api/[api-domain]
```

Create `[endpoint-name]-response.ts`:

```typescript
// packages/atomic/storybook-utils/api/[api-domain]/[endpoint]-response.ts

export const baseResponse = {
  // Your response structure matching the API
  results: [],
  totalCount: 0,
  // ... other fields
};
```

### Step 2: Create Mock Class

Create `mock.ts`:

```typescript
// packages/atomic/storybook-utils/api/[api-domain]/mock.ts

import type { HttpHandler } from 'msw';
import { EndpointHarness, type MockApi } from '../_base.js';
import type { APIErrorWithStatusCode } from '../_common/error.js';
import { baseResponse } from './[endpoint]-response.js';

export class Mock[Domain]Api implements MockApi {
  readonly [endpoint]Endpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.[endpoint]Endpoint = new EndpointHarness<
      typeof baseResponse | APIErrorWithStatusCode
    >(
      'POST',  // or 'GET'
      `${basePath}/rest/path/to/endpoint`,
      baseResponse
    );
  }

  get handlers(): HttpHandler[] {
    return [this.[endpoint]Endpoint.generateHandler()];
  }
}
```

### Step 3: Add Multiple Endpoints (if needed)

```typescript
export class Mock[Domain]Api implements MockApi {
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

## Important Rules

### DO:
- ✅ Always flush queued responses in `beforeEach` hooks
- ✅ Use `mock()` for changes affecting all stories
- ✅ Use `mockOnce()` for story-specific responses
- ✅ Spread the base response when modifying: `{...response, field: newValue}`
- ✅ Include all handlers in MSW parameters: `handlers: [...harness.handlers]`
- ✅ Use descriptive story names that indicate what's being tested


## Naming Conventions

When creating new mocks, follow these conventions:

### File Names
- Mock class file: `mock.ts`
- Response data files: `[endpoint-name]-response.ts`

### Class Names
- Mock class: `Mock[Domain]Api` (PascalCase)
- Endpoint properties: `[endpointName]Endpoint` (camelCase)

### Export Names
- Base response: `baseResponse`
- Variations: descriptive names (e.g., `baseFoldedResponse`, `immediateBaseResponse`)

## Special Cases

### Streaming Responses (like RGA)

For streaming endpoints, export a function that returns `HttpResponse`:

```typescript
// generate-response.ts
import { HttpResponse } from 'msw';

export const baseResponse = () => {
  const stream = new ReadableStream({
    // ... streaming logic
  });
  
  return new HttpResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
};

// mock.ts
export class MockAnswerApi implements MockApi {
  readonly generateEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.generateEndpoint = new EndpointHarness<
      () => HttpResponse<DefaultBodyType>
    >(
      'POST',
      `${basePath}/rest/answer/generate`,
      baseResponse,
      (response) => response()  // Custom factory for streaming
    );
  }

  get handlers(): HttpHandler[] {
    return [this.generateEndpoint.generateHandler()];
  }
}
```

### Insight Endpoints with Multiple Path Parameters

Use MSW path parameters for dynamic segments:

```typescript
const path = `${basePath}/rest/organizations/:orgId/insight/v1/configs/:insightId/answer/:configId/generate`;

this.generateInsightEndpoint = new EndpointHarness(
  'POST',
  path,
  baseResponse
);
```

## Troubleshooting

### "Handlers not defined" Error
**Cause:** Forgot to include handlers in MSW parameters
**Fix:** Add `msw: { handlers: [...harness.handlers] }` to parameters

### "Response not modified" Issue  
**Cause:** Not spreading the base response
**Fix:** Always use `{...response, field: value}` pattern

### "Wrong response returned" Issue
**Cause:** Queued responses from previous story
**Fix:** Add `beforeEach` hook with `clear()`

## Examples to Reference

Look at these files for complete examples:

### Pagination Example
`packages/atomic/src/components/search/atomic-load-more-results/atomic-load-more-results.new.stories.tsx`

### Empty States Example
`packages/atomic/src/components/recommendations/atomic-recs-list/atomic-recs-list.new.stories.tsx`

### Commerce API Example
`packages/atomic/src/components/commerce/atomic-commerce-no-products/atomic-commerce-no-products.new.stories.tsx`

### Multiple Endpoints Example
`packages/atomic/storybook-utils/api/commerce/mock.ts`

### Streaming Response Example
`packages/atomic/storybook-utils/api/answer/mock.ts`
`packages/atomic/storybook-utils/api/answer/generate-response.ts`

## Quick Reference

### EndpointHarness Methods

| Method | Purpose | When to Use |
|--------|---------|-------------|
| `mock(fn)` | Permanently modify base response | Setup for all stories |
| `mockOnce(fn)` | Queue one response for next request | Story-specific behavior |
| `mockErrorOnce()` | Queue network error | Testing error states |
| `clear()` | Clear queued responses | Reset in beforeEach |
| `reset()` | Reset to original base | Rarely needed |

### Response Modifier Pattern

```typescript
// ALWAYS spread the base response
(response) => ({
  ...response,
  field: newValue,
  nested: {
    ...response.nested,
    field: newValue,
  }
})
```

## Additional Resources

- MSW Documentation: https://mswjs.io/
- Storybook MSW Addon: https://storybook.js.org/addons/msw-storybook-addon
- Structure Guide: `/packages/atomic/storybook-utils/api/README.md`
- Usage Guide: `/packages/atomic/storybook-utils/api/USAGE.md`
