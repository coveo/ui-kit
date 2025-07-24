import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface();

const {decorator: commerceProductListDecorator} = wrapInCommerceProductList();
const {decorator: productTemplateDecorator} = wrapInProductTemplate();

const meta: Meta = {
  component: 'atomic-product-section-children',
  title: 'Atomic-Commerce/Product Template Components/ProductSectionChildren',
  id: 'atomic-product-section-children',
  render: renderComponent,
  parameters,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-children',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div class="border border-gray-200 rounded-lg p-3 bg-gray-50 mt-2 ml-4">
        <div class="text-sm font-medium text-gray-700 mb-2">Related Products:</div>
        <div class="space-y-1">
          <div class="text-sm text-gray-600">• Wireless Charging Case - $79.99</div>
          <div class="text-sm text-gray-600">• Premium Foam Tips - $29.99</div>
        </div>
      </div>
    `,
  },
};
