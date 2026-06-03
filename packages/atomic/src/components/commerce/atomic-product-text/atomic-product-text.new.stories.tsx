import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {updateQuery} from '../../../../../headless/src/features/commerce/query/query-actions';
import '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface.js';
import '@/src/components/commerce/atomic-product-text/atomic-product-text.js';

const commerceApiHarness = new MockCommerceApi();

// Mock search response with a product containing "kayak" in excerpt/name for highlight tests
commerceApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  products: [
    {
      ...response.products[0],
      ec_name: 'Kayak Explorer 3000',
      ec_description:
        'A durable kayak for ocean and river adventures. This kayak features a comfortable seat and lightweight frame.',
      ec_shortdesc:
        'A durable kayak for ocean and river adventures. This kayak features a comfortable seat and lightweight frame.',
      excerpt:
        'A durable kayak for ocean and river adventures. This kayak features a comfortable seat and lightweight frame.',
      nameHighlights: [{offset: 0, length: 5}],
      excerptHighlights: [
        {offset: 10, length: 5},
        {offset: 53, length: 5},
      ],
    },
  ],
  pagination: {
    ...response.pagination,
    totalCount: 1,
    perPage: 1,
    totalPages: 1,
  },
}));

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstRequest: true,
  engineConfig: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.perPage = 1;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
  includeCodeRoot: false,
});

const {decorator: commerceProductListDecorator} = wrapInCommerceProductList(
  undefined,
  false
);
const {decorator: productTemplateDecorator} = wrapInProductTemplate();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-text',
  {
    excludeCategories: ['methods'],
    containerSelector: 'atomic-product-template template',
  }
);

const meta: Meta = {
  component: 'atomic-product-text',
  title: 'Commerce/Product Text',
  id: 'atomic-product-text',
  render: (args) => template(args),
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    msw: {handlers: [...commerceApiHarness.handlers]},
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
  name: 'atomic-product-text',
  play: async (context) => {
    await initializeCommerceInterface(context);

    const searchInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    searchInterface?.engine?.dispatch(updateQuery({query: 'kayak'}));

    await searchInterface!.executeFirstRequest();
  },
  args: {
    field: 'excerpt',
  },
};
