import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInCommerceInterface} from '../../../../../storybookUtils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '../../../../../storybookUtils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '../../../../../storybookUtils/commerce/commerce-product-template-wrapper';
import {parameters} from '../../../../../storybookUtils/common/common-meta-parameters';
import {renderComponent} from '../../../../../storybookUtils/common/render-component';

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
  component: 'atomic-product-rating',
  title: 'Atomic-Commerce/Product Template Components/ProductRating',
  id: 'atomic-product-rating',
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
  name: 'atomic-product-rating',
};

export const WithARatingDetailsField: Story = {
  args: {
    'attributes-rating-details-field': 'ec_rating',
  },
};

export const WithAMaxValueInIndex: Story = {
  args: {
    'attributes-max-value-in-index': 10,
  },
};

export const WithADifferentIcon: Story = {
  args: {
    'attributes-icon':
      'https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/circle.svg',
  },
};
