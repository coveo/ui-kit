import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-load-more-products/atomic-commerce-load-more-products.js';
import {MockCommerceApi} from '@coveo/platform-mock-api/commerce/mock';
import {commerceFacetTransformer} from '@coveo/platform-mock-api/commerce/facet-transformer';
import {commercePaginationTransformer} from '@coveo/platform-mock-api/commerce/pagination-transformer';

const commerceApiHarness = new MockCommerceApi();
commerceApiHarness.searchEndpoint.addRequestTransformer(
  commerceFacetTransformer,
  commercePaginationTransformer
);
commerceApiHarness.productListingEndpoint.addRequestTransformer(
  commerceFacetTransformer,
  commercePaginationTransformer
);

const {decorator, play} = wrapInCommerceInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-load-more-products',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-load-more-products',
  title: 'Commerce/Load More Products',
  id: 'atomic-commerce-load-more-products',
  render: (args) => template(args),
  decorators: [decorator],
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

  play,
  beforeEach: () => {
    commerceApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {};
