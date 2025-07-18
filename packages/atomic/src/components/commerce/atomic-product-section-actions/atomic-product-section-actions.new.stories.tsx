import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstRequest: false,
  type: 'product-listing',
  engineConfig: {
    context: {
      view: {
        url: 'https://sports.barca.group/browse/promotions',
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
  component: 'atomic-product-section-actions',
  title: 'Atomic-Commerce/Product Template Components/ProductSectionActions',
  id: 'atomic-product-section-actions',
  render: renderComponent,
  parameters,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-actions',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `<button class="btn btn-primary">Add to Cart</button>`,
  },
};

export const WithMultipleActions: Story = {
  name: 'With Multiple Actions',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <button class="btn btn-primary mr-2">Add to Cart</button>
      <button class="btn btn-outline">Add to Wishlist</button>
    `,
  },
};

export const WithCustomButtons: Story = {
  name: 'With Custom Styled Actions',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div style="display: flex; gap: 8px; align-items: center;">
        <button style="background-color: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
          🛒 Add to Cart
        </button>
        <button style="background-color: transparent; color: #374151; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer;">
          ❤️ Wishlist
        </button>
        <button style="background-color: transparent; color: #6b7280; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer;">
          👁️ View
        </button>
      </div>
    `,
  },
};

export const EmptySection: Story = {
  name: 'Empty Section (Hidden)',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': ``,
  },
};
