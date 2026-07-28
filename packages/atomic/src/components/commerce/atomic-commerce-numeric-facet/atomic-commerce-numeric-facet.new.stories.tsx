import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {testCheckboxA11y} from '@/storybook-utils/a11y/checkbox.js';
import {commerceFacetWidthDecorator} from '@/storybook-utils/commerce/commerce-facet-width-decorator';
import {
  hideFacetTypesHook,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-facets/atomic-commerce-facets.js';
import '@/src/components/commerce/atomic-commerce-numeric-facet/atomic-commerce-numeric-facet.js';
import {MockCommerceApi} from '@coveo/platform-mock-api/commerce/mock';
import {
  commerceFacetTransformer,
  createFacetSearchTransformer,
} from '@coveo/platform-mock-api/commerce/facet-transformer';
import {commercePaginationTransformer} from '@coveo/platform-mock-api/commerce/pagination-transformer';
import {richResponse as baseSearchResponse} from '@coveo/platform-mock-api/commerce/search-response';

const commerceApiHarness = new MockCommerceApi();
commerceApiHarness.searchEndpoint.addRequestTransformer(
  commerceFacetTransformer,
  commercePaginationTransformer
);
commerceApiHarness.productListingEndpoint.addRequestTransformer(
  commerceFacetTransformer,
  commercePaginationTransformer
);
commerceApiHarness.facetSearchEndpoint.addRequestTransformer(
  createFacetSearchTransformer(baseSearchResponse)
);

const {play, decorator} = wrapInCommerceInterface({
  includeCodeRoot: false,
});
const {events, args, argTypes, template} = getStorybookHelpers('atomic-commerce-numeric-facet', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-commerce-numeric-facet',
  title: 'Commerce/Facet (Numeric)',
  id: 'atomic-commerce-numeric-facet',
  render: (args) => template(args),
  decorators: [commerceFacetWidthDecorator, decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...commerceApiHarness.handlers],
    },
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  beforeEach: () => {
    commerceApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {
  decorators: [
    (_) => {
      return html`<div id="code-root">
        <atomic-commerce-facets></atomic-commerce-facets>
      </div>`;
    },
  ],
  play: async (context) => {
    await play(context);
    await hideFacetTypesHook('atomic-commerce-numeric-facet', context);
  },
};

export const A11yCheckbox: Story = {
  tags: ['a11y', 'test', '!dev'],
  decorators: [
    (_) => {
      return html`<div id="code-root">
        <atomic-commerce-facets></atomic-commerce-facets>
      </div>`;
    },
  ],
  play: async (context) => {
    await play(context);
    await hideFacetTypesHook('atomic-commerce-numeric-facet', context);
    await testCheckboxA11y(context, {checkboxName: /\$\d/});
  },
};
