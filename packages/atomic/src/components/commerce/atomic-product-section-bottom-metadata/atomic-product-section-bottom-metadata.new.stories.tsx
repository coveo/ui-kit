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
  component: 'atomic-product-section-bottom-metadata',
  title:
    'Atomic-Commerce/Product Template Components/ProductSectionBottomMetadata',
  id: 'atomic-product-section-bottom-metadata',
  render: renderComponent,
  parameters,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-bottom-metadata',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div class="text-xs text-gray-500">
        <span>Free shipping • 2-day delivery</span>
      </div>
    `,
  },
};

export const WithAvailability: Story = {
  name: 'With Availability Information',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div class="flex items-center gap-2 text-xs">
        <span class="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
        <span class="text-green-600 font-medium">In Stock</span>
        <span class="text-gray-500">• Ships in 1-2 days</span>
      </div>
    `,
  },
};

export const WithMultipleInfo: Story = {
  name: 'With Multiple Information Lines',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div class="text-xs text-gray-500" style="max-height: calc(var(--line-height) * 2); line-height: var(--line-height); overflow: hidden;">
        <div style="line-height: var(--line-height);">Free returns within 30 days</div>
        <div style="line-height: var(--line-height);">1-year manufacturer warranty</div>
      </div>
    `,
  },
};

export const WithCustomStyling: Story = {
  name: 'With Custom Styling',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; line-height: var(--line-height); max-height: calc(var(--line-height) * 2); overflow: hidden;">
        <span style="background-color: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px; font-weight: 500;">
          🚚 Free Ship
        </span>
        <span style="background-color: #ecfdf5; color: #059669; padding: 2px 6px; border-radius: 4px; font-weight: 500;">
          ✓ In Stock
        </span>
        <span style="color: #6b7280;">
          30-day returns
        </span>
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
