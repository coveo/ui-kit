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

export const WithMultipleChildren: Story = {
  name: 'With Multiple Child Products',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div class="border-l-2 border-blue-200 bg-blue-50 p-3 ml-4 mt-2 rounded-r-lg">
        <div class="text-sm font-semibold text-blue-800 mb-2">Bundle Options:</div>
        <div class="grid gap-2">
          <div class="flex justify-between items-center text-sm">
            <span class="text-blue-700">Protective Case</span>
            <span class="text-blue-600 font-medium">+$19.99</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-blue-700">Screen Protector</span>
            <span class="text-blue-600 font-medium">+$9.99</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-blue-700">Car Charger</span>
            <span class="text-blue-600 font-medium">+$14.99</span>
          </div>
        </div>
      </div>
    `,
  },
};

export const WithVariants: Story = {
  name: 'With Product Variants',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div class="border border-gray-300 rounded-md p-3 ml-6 mt-3 bg-white shadow-sm">
        <div class="text-sm font-medium text-gray-800 mb-2">Available in:</div>
        <div class="flex flex-wrap gap-2">
          <span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border">
            Black - $299.99
          </span>
          <span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border">
            White - $299.99
          </span>
          <span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border">
            Silver - $319.99
          </span>
        </div>
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
      <div style="margin-left: 20px; margin-top: 12px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fafafa; position: relative;">
        <div style="position: absolute; left: -10px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 8px solid #e5e7eb;"></div>
        <div style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 8px;">
          Recommended Add-ons:
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-between; align-items: center; font-size: 11px; color: #6b7280;">
            <span>🔋 Extended Battery Pack</span>
            <span style="font-weight: 500; color: #059669;">$39.99</span>
          </div>
          <div style="display: flex; justify-between; align-items: center; font-size: 11px; color: #6b7280;">
            <span>🎧 Premium Audio Cable</span>
            <span style="font-weight: 500; color: #059669;">$24.99</span>
          </div>
        </div>
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
