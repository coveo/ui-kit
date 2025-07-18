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
  component: 'atomic-product-section-name',
  title: 'Atomic-Commerce/Product Template Components/ProductSectionName',
  id: 'atomic-product-section-name',
  render: renderComponent,
  parameters,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-name',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `<h3 class="font-bold text-lg">Premium Wireless Headphones</h3>`,
  },
};

export const WithProductLink: Story = {
  name: 'With Product Link',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `<a href="#" class="font-bold text-lg text-blue-600 hover:text-blue-800 no-underline">Premium Wireless Headphones</a>`,
  },
};

export const WithLongTitle: Story = {
  name: 'With Long Title (Multi-line)',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `<h3 class="font-bold text-lg" style="height: calc(var(--line-height) * 2); line-height: var(--line-height); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Bluetooth Headphones with Microphone</h3>`,
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
      <div style="height: calc(var(--line-height) * 2);">
        <h3 style="margin: 0; font-weight: 600; font-size: 16px; line-height: var(--line-height); color: #1f2937; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
          Apple AirPods Pro (2nd Generation) with MagSafe Case
        </h3>
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
