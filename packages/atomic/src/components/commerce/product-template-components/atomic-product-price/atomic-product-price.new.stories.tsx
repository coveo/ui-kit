import {wrapInCommerceInterface} from '@coveo/atomic-storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@coveo/atomic-storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@coveo/atomic-storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstSearch: false,
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
});

const {
  decorator: commerceInterfaceDecoratorEUR,
  play: initializeCommerceInterfaceEUR,
} = wrapInCommerceInterface({
  skipFirstSearch: false,
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
});

const {decorator: commerceProductListDecorator} = wrapInCommerceProductList();
const {decorator: productTemplateDecorator} = wrapInProductTemplate();

const meta: Meta = {
  component: 'atomic-product-price',
  title: 'Atomic-Commerce/Product Template Components/ProductPrice',
  id: 'atomic-product-price',
  render: renderComponent,
  parameters,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-price',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
};

export const WithEURCurrency: Story = {
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecoratorEUR,
  ],
  play: initializeCommerceInterfaceEUR,
};
