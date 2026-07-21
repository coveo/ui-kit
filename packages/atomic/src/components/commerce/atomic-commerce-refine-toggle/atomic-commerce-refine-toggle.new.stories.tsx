import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-refine-toggle/atomic-commerce-refine-toggle.js';
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

const {decorator, play} = wrapInCommerceInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-refine-toggle',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-refine-toggle',
  title: 'Commerce/Refine Toggle',
  id: 'atomic-commerce-refine-toggle',
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
