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
  component: 'atomic-product-numeric-field-value',
  title: 'Atomic-Commerce/Product Template Components/ProductNumericFieldValue',
  id: 'atomic-product-numeric-field-value',
  render: renderComponent,
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters,
  play: initializeCommerceInterface,
  args: {
    'attributes-field': 'ec_rating',
  },
  argTypes: {
    'attributes-field': {
      name: 'field',
      type: 'string',
    },
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-numeric-field-value',
};
