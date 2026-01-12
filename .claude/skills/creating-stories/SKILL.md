---
name: creating-stories
description: Creates and modifies Storybook stories for Atomic components and sample pages. Uses MSW for API mocking, follows ui-kit conventions. Use when creating stories, adding component examples, building sample pages, or when user mentions Storybook, stories, or visual testing.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
  package: atomic
---

# Creating Stories

This skill helps create and modify Storybook stories for Atomic components and sample pages with proper MSW API mocking.

## Story Types

### Component Stories
Stories for individual Atomic components that demonstrate features, variants, and states.

**Location:** `packages/atomic/src/components/<category>/<component-name>/<component-name>.new.stories.tsx`

**Categories:** `search`, `commerce`, `common`, `insight`, `ipx`, `recommendations`

### Sample Page Stories
Full-page examples combining multiple components to showcase complete use cases.

**Location:** `packages/atomic/storybook-pages/<use-case>/<page-name>.new.stories.tsx`

**Use cases:** `search`, `commerce`, `insight`, `ipx`, `recommendations`

## Component Story Structure

### Basic Component Story Template

```typescript
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

// Create API harness at top level
const searchApiHarness = new MockSearchApi();

// Get interface wrapper
const {decorator, play} = wrapInSearchInterface();

// Get storybook helpers for the component
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-component-name',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-component-name',
  title: 'Search/Component Name',
  id: 'atomic-component-name',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  args,
  argTypes,
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {};
```

### Result Template Component Story

For components rendered inside result templates:

```typescript
import type {Decorator, Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

// Limit to one result for result component stories
searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 1),
  totalCount: 1,
  totalCountFiltered: 1,
}));

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  skipFirstSearch: false,
  includeCodeRoot: false,
});

// Custom result list wrapper
const customResultListDecorator: Decorator = (story) => html`
  <atomic-result-list
    display="list"
    number-of-placeholders="1"
    density="compact"
    image-size="small"
  >
    ${story()}
  </atomic-result-list>
`;

const {decorator: resultTemplateDecorator} = wrapInResultTemplate(false);
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-link',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-link',
  title: 'Search/Result Link',
  id: 'atomic-result-link',
  render: (args) => template(args),
  decorators: [
    resultTemplateDecorator,
    customResultListDecorator,
    searchInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};
```

## Sample Page Story Structure

### Search Page Example

```typescript
import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/search/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

async function initializeSearchInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = canvasElement.querySelector(
    'atomic-search-interface'
  );
  await searchInterface!.initialize(getSampleSearchEngineConfiguration());
}

const mockSearchApi = new MockSearchApi();

const meta: Meta = {
  component: 'search-page',
  title: 'Search/Example Pages',
  id: 'search-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mockSearchApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
  render: () => html`
    <atomic-search-interface language-assets-path="./lang" icon-assets-path="./assets">
      <!-- Component markup here -->
    </atomic-search-interface>
  `,
  play: async (context) => {
    await initializeSearchInterface(context.canvasElement);
    const searchInterface = context.canvasElement.querySelector(
      'atomic-search-interface'
    );
    await searchInterface!.executeFirstSearch();
  },
};

export default meta;

export const Default: Story = {
  name: 'Search Page',
};
```

### Commerce Page Example

```typescript
import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock.js';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/commerce/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

const mockCommerceApi = new MockCommerceApi();

async function initializeCommerceInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-commerce-interface');
  const commerceInterface = canvasElement.querySelector(
    'atomic-commerce-interface'
  );
  await commerceInterface!.initialize(getSampleCommerceEngineConfiguration());
}

const meta: Meta = {
  component: 'commerce-page',
  title: 'Commerce/Example Pages',
  id: 'commerce-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mockCommerceApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mockCommerceApi.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
  render: () => html`
    <atomic-commerce-interface type="search" language-assets-path="./lang" icon-assets-path="./assets">
      <!-- Component markup here -->
    </atomic-commerce-interface>
  `,
  play: async (context) => {
    await initializeCommerceInterface(context.canvasElement);
    const commerceInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    await commerceInterface!.executeFirstRequest();
  },
};

export default meta;

export const Default: Story = {
  name: 'Commerce Page',
};
```

## API Mocking with MSW

### Available API Mocks

| Mock Class | Import Path | Use Case |
|------------|-------------|----------|
| `MockSearchApi` | `@/storybook-utils/api/search/mock` | Search interface components |
| `MockCommerceApi` | `@/storybook-utils/api/commerce/mock` | Commerce interface components |
| `MockAnswerApi` | `@/storybook-utils/api/answer/mock` | Answer/RGA components |
| `MockInsightApi` | `@/storybook-utils/api/insight/mock` | Insight interface components |
| `MockRecommendationApi` | `@/storybook-utils/api/recommendation/mock` | Recommendation components |
| `MockMachineLearningApi` | `@/storybook-utils/api/machinelearning/mock` | ML/User Actions API |

### Core Mocking Patterns

#### Pattern 1: Default Response

```typescript
const searchApiHarness = new MockSearchApi();

const meta: Meta = {
  parameters: {
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
};
```

#### Pattern 2: Modify Base Response for All Stories

```typescript
const searchApiHarness = new MockSearchApi();

// Apply to ALL stories in this file
searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 30),
  totalCount: 30,
  totalCountFiltered: 30,
}));
```

#### Pattern 3: Story-Specific Response

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

#### Pattern 4: Testing Pagination

```typescript
const meta: Meta = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
    
    // First page
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(0, 40),
    }));
    
    // Second page
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(40, 80),
    }));
  },
};
```

#### Pattern 5: Facet Response Mocking

```typescript
const baseFacetValues = [
  {value: 'Email', state: 'idle', numberOfResults: 87},
  {value: 'HTML', state: 'idle', numberOfResults: 245},
];

const createFacetResponse = (values, {moreValuesAvailable = true} = {}) => ({
  facetId: 'filetype',
  field: 'filetype',
  moreValuesAvailable,
  values,
  label: 'File Type',
});

export const Default: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if ('facets' in response) {
        return {
          ...response,
          facets: [
            ...(response.facets || []),
            createFacetResponse(baseFacetValues),
          ],
        };
      }
      return response;
    });
  },
};
```

#### Pattern 6: Error States

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

### EndpointHarness Methods

| Method | Purpose | Usage |
|--------|---------|-------|
| `mock(fn)` | Permanently modify base response | Apply to all stories in file |
| `mockOnce(fn)` | Queue one response for next request | Story-specific behavior |
| `mockErrorOnce()` | Queue network error | Testing error states |
| `clear()` | Clear queued responses | Reset in `beforeEach` |
| `reset()` | Reset to original base response | Rarely needed |

## Interface Wrappers

### Search Interface

```typescript
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface({
  skipFirstSearch: false,  // Default: true
  includeCodeRoot: true,   // Default: true
});
```

### Commerce Interface

```typescript
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';

const {decorator, play} = wrapInCommerceInterface({
  skipFirstSearch: false,
  includeCodeRoot: true,
});
```

### Result Template

```typescript
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';

const {decorator} = wrapInResultTemplate(false);  // false = don't auto-load template
```

## Common Decorators

### Custom Layout Decorator

```typescript
import type {Decorator} from '@storybook/web-components-vite';
import {html} from 'lit';

const normalWidthDecorator: Decorator = (story) =>
  html`<div style="min-width: 600px;" id="code-root">${story()}</div>`;
```

### Facet Decorator

```typescript
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';

const meta: Meta = {
  decorators: [facetDecorator, decorator],
};
```

### Custom Styling Decorator

```typescript
const colorFacetStylesDecorator = (story: () => unknown) => {
  const cssRules = `
    atomic-color-facet::part(value-checkbox) {
      width: 1.5rem;
      height: 1.5rem;
    }
  `;
  
  return html`
    <style>${cssRules}</style>
    ${story()}
  `;
};
```

## Story Naming Conventions

### Story Titles

- **Component:** `Search/Component Name`, `Commerce/Component Name`
- **Sample Pages:** `Search/Example Pages`, `Commerce/Example Pages`

### Story IDs

Use kebab-case matching component name: `atomic-component-name`

### Story Names (Exported Stories)

```typescript
export const Default: Story = {};  // Default behavior

export const CustomIcon: Story = {
  name: 'With custom icons',  // Descriptive name
  args: { /* ... */ },
};

export const NoResults: Story = {
  name: 'Empty State',
};
```

## Creating Multiple Story Variants

```typescript
export const Default: Story = {};

export const WithSelectedValue: Story = {
  name: 'With Selected Value',
  beforeEach: () => {
    // Mock specific response
  },
};

export const NoResults: Story = {
  name: 'Empty State',
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
    }));
  },
};

export const LoadingState: Story = {
  name: 'Loading',
  args: {
    // Component-specific loading state
  },
};
```

## Reference Files

- [MSW API Mocking Patterns](references/msw-patterns.md) - Advanced MSW techniques
- [Component Story Examples](references/component-examples.md) - More component story patterns
- [Sample Page Examples](references/sample-page-examples.md) - Full page story patterns

## Validation Checklist

Before completing a story, verify:
- [ ] Story file named `<component-name>.new.stories.tsx`
- [ ] MSW API harness created at top level
- [ ] All handlers included in `msw.handlers` parameter
- [ ] `beforeEach` used to clear/setup mocked responses
- [ ] Component imports use path aliases (`@/storybook-utils/...`)
- [ ] Meta object includes `component`, `title`, `id`, `parameters`
- [ ] At least one exported story (`Default`)
- [ ] For sample pages: initialization function and `play` handler
- [ ] For component stories: proper decorator usage
- [ ] Story follows existing patterns from similar components

## Common Pitfalls

1. **Forgetting to clear mocked responses** - Always use `beforeEach` with `.clear()`
2. **Not spreading base response** - Always use `{...response, field: value}`
3. **Wrong import paths** - Always use `@/storybook-utils/...` not relative paths
4. **Missing handlers** - Include all harness handlers in `msw.handlers`
5. **Wrong interface type** - Match interface type to component use case (search vs commerce)
6. **Incorrect decorator order** - Result template components need specific order
7. **Missing play function** - Sample pages require `play` for initialization

## ui-kit Specific Notes

- Package: `packages/atomic`
- Component conventions: `.github/instructions/atomic.instructions.md`
- MSW instructions: `.github/instructions/msw-api-mocking.instructions.md`
- Storybook helpers from: `@wc-toolkit/storybook-helpers`
- All new stories must use `.new.stories.tsx` extension
- Stories participate in Chromatic visual regression testing
