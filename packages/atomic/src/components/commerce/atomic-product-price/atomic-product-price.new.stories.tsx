import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

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
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
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
