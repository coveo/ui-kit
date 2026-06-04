import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-product-price/atomic-product-price.js';

const commerceApiHarness = new MockCommerceApi();

// Limit to Blue Lagoon ($1000) + Locktron Padlock ($39/$36 promo) to avoid
// strict-mode violations in e2e tests (getByText('$39.00') must match once)
commerceApiHarness.productListingEndpoint.mock((response) => ({
  ...response,
  products: [response.products[0], response.products[8]],
  pagination: {
    ...response.pagination,
    totalCount: 2,
    perPage: 2,
    totalPages: 1,
  },
}));

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstRequest: false,
  type: 'product-listing',
  engineConfig: {
    context: {
      view: {
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing-product-price',
      },
      language: 'en',
      country: 'US',
      currency: 'USD',
    },
  },
  includeCodeRoot: false,
});

const {
  decorator: commerceInterfaceDecoratorEUR,
  play: initializeCommerceInterfaceEUR,
} = wrapInCommerceInterface({
  skipFirstRequest: false,
  type: 'product-listing',
  engineConfig: {
    context: {
      view: {
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing-product-price',
      },
      language: 'fr',
      country: 'FR',
      currency: 'EUR',
    },
  },
  includeCodeRoot: false,
});

const {decorator: commerceProductListDecorator} = wrapInCommerceProductList(
  'list',
  false
);
const {decorator: productTemplateDecorator} = wrapInProductTemplate();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-price',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-product-price',
  title: 'Commerce/Product Price',
  id: 'atomic-product-price',
  render: (args) => template(args),
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
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
};

export const WithEURCurrency: Story = {
  name: 'With a different currency',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecoratorEUR,
  ],
  play: initializeCommerceInterfaceEUR,
};
