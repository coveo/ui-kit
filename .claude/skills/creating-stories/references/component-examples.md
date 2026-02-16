# Component Story Examples

Essential patterns for different component types. All examples follow the standard structure from SKILL.md.

## Standard Component Pattern

Full example showing all required parts:

```typescript
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-search-box');

const meta: Meta = {
  component: 'atomic-search-box',
  title: 'Search/Search Box',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {handles: events},
    msw: {handlers: [...searchApiHarness.handlers]},
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

export const WithCustomProps: Story = {
  args: {
    'minimum-query-length': '0',
  },
};
```

## Facet Components

**Key difference:** Use `facetDecorator` and conditionally add facet to response.

```typescript
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';

const createFacetResponse = (values) => ({
  facetId: 'myfield',
  field: 'myfield',
  moreValuesAvailable: true,
  values,
});

const meta: Meta = {
  // ... standard config
  decorators: [facetDecorator, decorator],
};

export const Default: Story = {
  args: {field: 'myfield'},
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if ('facets' in response) {
        return {
          ...response,
          facets: [...(response.facets || []), createFacetResponse([
            {value: 'Value1', state: 'idle', numberOfResults: 100},
            {value: 'Value2', state: 'idle', numberOfResults: 50},
          ])],
        };
      }
      return response;
    });
  },
};
```

**For facet search:** Mock `facetSearchEndpoint` and add `'with-search': true` to args.

## Result Template Components

**Key difference:** Custom decorator order and single result.

```typescript
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {html} from 'lit';

searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 1),
  totalCount: 1,
}));

const customResultListDecorator = (story) => html`
  <atomic-result-list display="list">
    ${story()}
  </atomic-result-list>
`;

const {decorator: resultTemplateDecorator} = wrapInResultTemplate(false);

const meta: Meta = {
  // ... standard config
  decorators: [
    resultTemplateDecorator,
    customResultListDecorator,
    searchInterfaceDecorator,
  ],
};
```

## Commerce Components

**Key difference:** Use `MockCommerceApi` and `wrapInCommerceInterface`.

```typescript
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';

const commerceApiHarness = new MockCommerceApi();
const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  // ... standard config with commerceApiHarness.handlers
};
```

## Insight Components

**Key difference:** Use `MockInsightApi` and `wrapInInsightInterface`.

```typescript
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const insightApiHarness = new MockInsightApi();
const {decorator, play} = wrapInInsightInterface();
```

## Components with Custom Styling

**Pattern:** Use decorator to inject `<style>` with CSS parts.

```typescript
const stylesDecorator = (story) => html`
  <style>
    atomic-component::part(value-item) {
      background-color: blue;
    }
  </style>
  ${story()}
`;

const meta: Meta = {
  decorators: [stylesDecorator, /* ...other decorators */],
};
```

## Query Suggestions

**Pattern:** Mock `querySuggestEndpoint` for search box completions.

```typescript
searchApiHarness.querySuggestEndpoint.mock(() => ({
  completions: [
    {expression: 'laptop', score: 100, highlighted: '[laptop]'},
    {expression: 'laptop bag', score: 95, highlighted: '[laptop] bag'},
  ],
}));
```

## Custom Width/Layout

**Pattern:** Wrap in decorator with inline styles.

```typescript
import {html} from 'lit';

const widthDecorator = (story) =>
  html`<div style="min-width: 600px;">${story()}</div>`;

const meta: Meta = {
  decorators: [widthDecorator, decorator],
};
```

};

export default meta;

export const Default: Story = {
  args: {
    field: 'color',
    label: 'Color',
  },
};
```
