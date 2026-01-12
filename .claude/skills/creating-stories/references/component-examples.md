# Component Story Examples

This document provides comprehensive examples for different types of component stories.

## Search Components

### Facet Components

```typescript
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

const baseFacetValues = [
  {value: 'Value1', state: 'idle', numberOfResults: 100},
  {value: 'Value2', state: 'idle', numberOfResults: 50},
  {value: 'Value3', state: 'idle', numberOfResults: 25},
];

const createFacetResponse = (values, options = {}) => ({
  facetId: 'myfield',
  field: 'myfield',
  moreValuesAvailable: options.moreValuesAvailable ?? true,
  values,
  label: 'My Field',
});

const {decorator, play} = wrapInSearchInterface();
const {events, argTypes, template} = getStorybookHelpers('atomic-facet', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-facet',
  title: 'Search/Facet',
  id: 'atomic-facet',
  render: (args) => template(args),
  decorators: [facetDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {handles: events},
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  argTypes,
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  args: {
    field: 'myfield',
    label: 'My Field',
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if ('facets' in response) {
        return {
          ...response,
          facets: [...(response.facets || []), createFacetResponse(baseFacetValues)],
        };
      }
      return response;
    });
  },
};

export const WithSelectedValue: Story = {
  name: 'With Selected Value',
  args: {
    field: 'myfield',
    label: 'My Field',
  },
  beforeEach: () => {
    const selectedValues = baseFacetValues.map((v, i) =>
      i === 0 ? {...v, state: 'selected'} : v
    );
    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if ('facets' in response) {
        return {
          ...response,
          facets: [...(response.facets || []), createFacetResponse(selectedValues)],
        };
      }
      return response;
    });
  },
};

export const WithSearch: Story = {
  name: 'With Search Enabled',
  args: {
    field: 'myfield',
    label: 'My Field',
    'with-search': true,
  },
  beforeEach: () => {
    searchApiHarness.facetSearchEndpoint.mock(() => ({
      values: [
        {displayValue: 'Searched1', rawValue: 'Searched1', count: 10},
        {displayValue: 'Searched2', rawValue: 'Searched2', count: 5},
      ],
      moreValuesAvailable: false,
    }));
    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if ('facets' in response) {
        return {
          ...response,
          facets: [...(response.facets || []), createFacetResponse(baseFacetValues)],
        };
      }
      return response;
    });
  },
};
```

### Search Box Components

```typescript
import type {Decorator, Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-box',
  {excludeCategories: ['methods']}
);
const {decorator, play} = wrapInSearchInterface({
  skipFirstSearch: true,
  includeCodeRoot: false,
});

const searchApiHarness = new MockSearchApi();

const normalWidthDecorator: Decorator = (story) =>
  html`<div style="min-width: 600px;" id="code-root">${story()}</div>`;

const meta: Meta = {
  component: 'atomic-search-box',
  title: 'Search/Search Box',
  id: 'atomic-search-box',
  render: (args) => template(args),
  decorators: [normalWidthDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {handles: events},
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  args: {
    ...args,
    'minimum-query-length': '0',
  },
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};

export const WithSuggestions: Story = {
  name: 'With Query Suggestions',
  args: {
    'default-slot': `<atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>`,
  },
};

export const WithRecentQueries: Story = {
  name: 'With Recent Queries',
  args: {
    'default-slot': `<atomic-search-box-recent-queries></atomic-search-box-recent-queries>`,
  },
};

export const RichSearchBox: Story = {
  name: 'With All Features',
  args: {
    'default-slot': `
      <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
      <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
      <atomic-search-box-instant-results image-size="small"></atomic-search-box-instant-results>
    `,
  },
};
```

### Pager Components

```typescript
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-pager', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-pager',
  title: 'Search/Pager',
  id: 'atomic-pager',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {handles: events},
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};

export const CustomNumberOfPages: Story = {
  name: 'With Custom Number of Pages',
  args: {
    'number-of-pages': '10',
  },
};

export const CustomIcons: Story = {
  name: 'With Custom Icons',
  args: {
    'previous-button-icon': 'https://example.com/prev.svg',
    'next-button-icon': 'https://example.com/next.svg',
  },
};
```

## Result Template Components

### Result Link

```typescript
import type {Decorator, Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

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
    actions: {handles: events},
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};

export const WithCustomAttributes: Story = {
  name: 'With Custom Link Attributes',
  decorators: [
    () => html`
      <atomic-result-link>
        <a slot="attributes" target="_blank" rel="noopener"></a>
      </atomic-result-link>
    `,
  ],
};

export const WithHrefTemplate: Story = {
  name: 'With Custom URL Template',
  decorators: [
    () => html`
      <atomic-result-link
        href-template="\${clickUri}?source=\${raw.source}"
      ></atomic-result-link>
    `,
  ],
};
```

## Commerce Components

### Product List

```typescript
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';

const commerceApiHarness = new MockCommerceApi();
const {decorator, play} = wrapInCommerceInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-product-list',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-product-list',
  title: 'Commerce/Product List',
  id: 'atomic-commerce-product-list',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {handles: events},
    msw: {handlers: [...commerceApiHarness.handlers]},
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};

export const GridDisplay: Story = {
  name: 'Grid Display',
  args: {
    display: 'grid',
  },
};

export const ListDisplay: Story = {
  name: 'List Display',
  args: {
    display: 'list',
  },
};
```

### Commerce Facet

```typescript
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';

const commerceApiHarness = new MockCommerceApi();
const {decorator, play} = wrapInCommerceInterface();
const {events, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-facet',
  title: 'Commerce/Facet',
  id: 'atomic-commerce-facet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {handles: events},
    msw: {handlers: [...commerceApiHarness.handlers]},
  },
  argTypes,
  beforeEach: () => {
    commerceApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  args: {
    field: 'ec_brand',
    label: 'Brand',
  },
};

export const WithSearch: Story = {
  name: 'With Search',
  args: {
    field: 'ec_brand',
    label: 'Brand',
    'with-search': true,
  },
};
```

## Insight Components

### Insight Interface Components

```typescript
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const insightApiHarness = new MockInsightApi();
const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-search-box',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-search-box',
  title: 'Insight/Search Box',
  id: 'atomic-insight-search-box',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {handles: events},
    msw: {handlers: [...insightApiHarness.handlers]},
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};
```

## Components with Custom Styling

### Color Facet with CSS Parts

```typescript
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, argTypes, template} = getStorybookHelpers('atomic-color-facet', {
  excludeCategories: ['methods'],
});

const facetValueToCss = {
  Red: {
    'background-color': 'rgb(255, 0, 0)',
  },
  Blue: {
    'background-color': 'rgb(0, 0, 255)',
  },
  Green: {
    'background-color': 'rgb(0, 255, 0)',
  },
};

const colorFacetStylesDecorator = (story: () => unknown) => {
  const cssRules = Object.entries(facetValueToCss)
    .map(([facetValue, css]) => {
      const partValueSanitized = facetValue.replace(/[^a-z0-9]/gi, '');
      const cssProperties = Object.entries(css)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join('\n');

      return `atomic-color-facet::part(value-${partValueSanitized}) {
        ${cssProperties}
      }`;
    })
    .join('\n');

  return html`
    <style>${cssRules}</style>
    ${story()}
  `;
};

const meta: Meta = {
  component: 'atomic-color-facet',
  title: 'Search/Color Facet',
  id: 'atomic-color-facet',
  render: (args) => template(args),
  decorators: [facetDecorator, colorFacetStylesDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {handles: events},
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  argTypes,
  play,
};

export default meta;

export const Default: Story = {
  args: {
    field: 'color',
    label: 'Color',
  },
};
```

## Testing Multiple States

```typescript
export const AllStates: Story = {
  name: 'All Component States',
  render: () => html`
    <div style="display: grid; gap: 20px;">
      <div>
        <h3>Default State</h3>
        <atomic-component></atomic-component>
      </div>
      <div>
        <h3>Loading State</h3>
        <atomic-component loading></atomic-component>
      </div>
      <div>
        <h3>Error State</h3>
        <atomic-component error="An error occurred"></atomic-component>
      </div>
      <div>
        <h3>Empty State</h3>
        <atomic-component empty></atomic-component>
      </div>
    </div>
  `,
};
```
