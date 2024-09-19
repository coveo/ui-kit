import {wrapInCommerceInterface} from '@coveo/atomic/storybookUtils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@coveo/atomic/storybookUtils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@coveo/atomic/storybookUtils/commerce/commerce-product-template-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
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
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing',
      },
      language: 'en',
      country: 'US',
      currency: 'USD',
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
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters,
  play: initializeCommerceInterface,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-price',
};
