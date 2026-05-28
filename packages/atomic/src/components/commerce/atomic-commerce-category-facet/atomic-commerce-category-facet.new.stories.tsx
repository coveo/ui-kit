import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {commerceFacetWidthDecorator} from '@/storybook-utils/commerce/commerce-facet-width-decorator';
import {
  hideFacetTypesHook,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-category-facet/atomic-commerce-category-facet.js';
import '@/src/components/commerce/atomic-commerce-facets/atomic-commerce-facets.js';
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
  includeCodeRoot: false,
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-category-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-category-facet',
  title: 'Commerce/Facet (Category)',
  id: 'atomic-commerce-category-facet',
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
  render: () => html`<div id="code-root">
    <atomic-commerce-facets></atomic-commerce-facets>
  </div>`,
  play: async (context) => {
    await play(context);
    await hideFacetTypesHook('atomic-commerce-category-facet', context);
  },
};
