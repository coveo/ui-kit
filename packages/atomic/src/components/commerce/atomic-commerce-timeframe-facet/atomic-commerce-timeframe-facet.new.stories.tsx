import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {commerceFacetWidthDecorator} from '@/storybook-utils/commerce/commerce-facet-width-decorator';
import {
  hideFacetTypesHook,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-facets/atomic-commerce-facets.js';
import '@/src/components/commerce/atomic-commerce-timeframe-facet/atomic-commerce-timeframe-facet.js';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {
  commerceFacetTransformer,
  createFacetSearchTransformer,
} from '@/storybook-utils/api/commerce/facet-transformer';
import {commercePaginationTransformer} from '@/storybook-utils/api/commerce/pagination-transformer';
import {richResponse as baseSearchResponse} from '@/storybook-utils/api/commerce/search-response';

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
  engineConfig: {
    context: {
      country: 'US',
      currency: 'USD',
      language: 'en',
      view: {
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing',
      },
    },
  },
  type: 'product-listing',
  includeCodeRoot: false,
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-timeframe-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-timeframe-facet',
  title: 'Commerce/Facet (Timeframe)',
  id: 'atomic-commerce-timeframe-facet',
  render: (args) => template(args),
  decorators: [commerceFacetWidthDecorator, decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: commerceApiHarness.handlers,
    },
    chromatic: {disableSnapshot: true},
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
    await hideFacetTypesHook('atomic-commerce-timeframe-facet', context);
  },
};
