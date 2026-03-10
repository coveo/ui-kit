# Advanced MSW API Mocking Patterns

This document covers advanced patterns for MSW API mocking in Storybook stories.

## Multiple API Harnesses

When a component uses multiple APIs, create harnesses for each:

```typescript
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {MockAnswerApi} from '@/storybook-utils/api/answer/mock';

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

## Conditional Response Modification

Modify responses based on conditions:

```typescript
searchApiHarness.searchEndpoint.mock((response) => {
  if ('facets' in response) {
    return {
      ...response,
      facets: [
        ...(response.facets || []),
        customFacetResponse,
      ],
    };
  }
  return response;
});
```

## Facet Search Mocking

For components with facet search functionality:

```typescript
const meta: Meta = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
    searchApiHarness.facetSearchEndpoint.clear();
    
    // Mock facet search results
    searchApiHarness.facetSearchEndpoint.mock(() => ({
      values: [
        {displayValue: 'Powerpoint', rawValue: 'Powerpoint', count: 76},
        {displayValue: 'PDF', rawValue: 'PDF', count: 43},
      ],
      moreValuesAvailable: false,
    }));
  },
};
```

## Query Suggest Mocking

For search box components with suggestions:

```typescript
const searchApiHarness = new MockSearchApi();

const meta: Meta = {
  beforeEach: () => {
    searchApiHarness.querySuggestEndpoint.clear();
    
    searchApiHarness.querySuggestEndpoint.mock(() => ({
      completions: [
        {expression: 'laptop', score: 100, highlighted: '[laptop]'},
        {expression: 'laptop bag', score: 95, highlighted: '[laptop] bag'},
        {expression: 'laptop stand', score: 90, highlighted: '[laptop] stand'},
      ],
    }));
  },
};
```

## Commerce-Specific Mocking

### Product Recommendations

```typescript
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';

const commerceApiHarness = new MockCommerceApi();

const meta: Meta = {
  beforeEach: () => {
    commerceApiHarness.recommendationEndpoint.mock((response) => ({
      ...response,
      products: response.products.slice(0, 8),
    }));
  },
};
```

### Product Listings

```typescript
commerceApiHarness.productListingEndpoint.mock((response) => ({
  ...response,
  products: response.products.filter(p => p.ec_price < 100),
  totalCount: response.products.filter(p => p.ec_price < 100).length,
}));
```

## Insight API Mocking

```typescript
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';

const insightApiHarness = new MockInsightApi();

const meta: Meta = {
  parameters: {
    msw: {
      handlers: [...insightApiHarness.handlers],
    },
  },
  beforeEach: () => {
    insightApiHarness.searchEndpoint.mock((response) => ({
      ...response,
      results: response.results.slice(0, 10),
    }));
  },
};
```

## Answer/RGA API Mocking

For streaming answer components:

```typescript
import {MockAnswerApi} from '@/storybook-utils/api/answer/mock';

const answerApiHarness = new MockAnswerApi();

const meta: Meta = {
  parameters: {
    msw: {
      handlers: [...answerApiHarness.handlers],
    },
  },
};
```

Note: Answer API uses streaming responses. The mock handles SSE (Server-Sent Events) automatically.

## Machine Learning API Mocking

For components that track user actions:

```typescript
import {MockMachineLearningApi} from '@/storybook-utils/api/machinelearning/mock';

const mlApiHarness = new MockMachineLearningApi();

const meta: Meta = {
  parameters: {
    msw: {
      handlers: [...mlApiHarness.handlers],
    },
  },
};
```

## Sequential Response Testing

Test multi-step interactions:

```typescript
const meta: Meta = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
    
    // First search
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(0, 10),
      totalCount: 100,
    }));
    
    // After refinement
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(0, 5),
      totalCount: 5,
    }));
  },
};
```

## Rich Response Data

Use rich response data for more realistic testing:

```typescript
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/search/search-response';

const meta: Meta = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
};
```

Available rich responses:
- `search/search-response.ts` - `richResponse`
- `commerce/search-response.ts` - `richResponse`
- `insight/search-response.ts` - `richResponse`

## Testing Empty States

### No Results

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
};
```

### No Facets

```typescript
export const NoFacets: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      facets: [],
    }));
  },
};
```

### No Suggestions

```typescript
export const NoSuggestions: Story = {
  beforeEach: () => {
    searchApiHarness.querySuggestEndpoint.mockOnce(() => ({
      completions: [],
    }));
  },
};
```

## Testing Loading States

Use delays or pending promises for loading states:

```typescript
export const Loading: Story = {
  beforeEach: () => {
    // Note: MSW doesn't directly support delays, but you can use
    // component-level loading props or test during initialization
  },
  play: async (context) => {
    // Test during loading phase
    await context.step('Check loading state', async () => {
      const component = context.canvasElement.querySelector('atomic-component');
      // Assertions for loading state
    });
  },
};
```

## Complex Facet Mocking

### Category Facet

```typescript
const categoryFacetResponse = {
  facetId: 'category',
  field: 'category',
  moreValuesAvailable: false,
  values: [
    {
      value: 'Electronics',
      state: 'idle',
      numberOfResults: 150,
      children: [
        {value: 'Laptops', state: 'idle', numberOfResults: 50},
        {value: 'Phones', state: 'idle', numberOfResults: 100},
      ],
    },
  ],
};
```

### Numeric Facet

```typescript
const numericFacetResponse = {
  facetId: 'price',
  field: 'price',
  values: [
    {start: 0, end: 50, state: 'idle', numberOfResults: 25},
    {start: 50, end: 100, state: 'idle', numberOfResults: 40},
    {start: 100, end: 500, state: 'idle', numberOfResults: 15},
  ],
};
```

### Timeframe Facet

```typescript
const timeframeFacetResponse = {
  facetId: 'date',
  field: 'date',
  values: [
    {start: '2024-01-01', end: '2024-12-31', state: 'idle', numberOfResults: 80},
    {start: '2023-01-01', end: '2023-12-31', state: 'idle', numberOfResults: 120},
  ],
};
```

## Testing Edge Cases

### Very Long Content

```typescript
export const LongContent: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.map(result => ({
        ...result,
        title: 'A'.repeat(200),
        excerpt: 'B'.repeat(1000),
      })),
    }));
  },
};
```

### Special Characters

```typescript
export const SpecialCharacters: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.map(result => ({
        ...result,
        title: 'Test <script>alert("xss")</script>',
        raw: {
          ...result.raw,
          custom_field: 'Value & "quotes" <tags>',
        },
      })),
    }));
  },
};
```

### Large Result Sets

```typescript
export const ManyResults: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      totalCount: 10000,
      totalCountFiltered: 10000,
    }));
  },
};
```

## Debugging Tips

### Log Response Modifications

```typescript
searchApiHarness.searchEndpoint.mock((response) => {
  console.log('Original response:', response);
  const modified = {...response, results: response.results.slice(0, 10)};
  console.log('Modified response:', modified);
  return modified;
});
```

### Check Handler Registration

```typescript
console.log('Registered handlers:', mockSearchApi.handlers);
```

### Verify Endpoint Calls

Use MSW's logging or browser DevTools to verify API calls are being intercepted.
