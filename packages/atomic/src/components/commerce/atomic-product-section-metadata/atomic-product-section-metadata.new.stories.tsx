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
  component: 'atomic-product-section-metadata',
  title: 'Atomic-Commerce/Product Template Components/ProductSectionMetadata',
  id: 'atomic-product-section-metadata',
  render: renderComponent,
  parameters,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-metadata',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div class="flex items-center gap-1 text-sm text-gray-600">
        <span>★★★★☆</span>
        <span>(124 reviews)</span>
      </div>
    `,
  },
};

export const WithBrand: Story = {
  name: 'With Brand Information',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span class="font-medium">Sony</span>
        <span>•</span>
        <span>★★★★☆ 4.2</span>
      </div>
    `,
  },
};

export const WithMultipleMetadata: Story = {
  name: 'With Multiple Metadata Fields',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div class="flex flex-col gap-1 text-sm text-gray-600">
        <div class="flex items-center gap-1">
          <span>★★★★★</span>
          <span>4.8 (89)</span>
        </div>
        <div class="text-xs text-gray-500">
          SKU: WH1000XM5
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
      <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6b7280;">
        <div style="display: flex; align-items: center; gap: 2px;">
          <span style="color: #fbbf24;">★★★★☆</span>
          <span style="font-weight: 500;">4.3</span>
        </div>
        <span style="color: #d1d5db;">|</span>
        <span style="color: #9ca3af;">156 sold</span>
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
