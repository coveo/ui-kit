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
  component: 'atomic-product-section-description',
  title:
    'Atomic-Commerce/Product Template Components/ProductSectionDescription',
  id: 'atomic-product-section-description',
  render: renderComponent,
  parameters,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-description',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `<p class="text-sm text-gray-600">Premium wireless headphones with industry-leading noise cancellation and superior sound quality.</p>`,
  },
};

export const WithLongDescription: Story = {
  name: 'With Long Description (Truncated)',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <p class="text-sm text-gray-600" style="height: calc(var(--line-height) * 3); line-height: var(--line-height); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
        Experience the ultimate in wireless audio with our premium headphones featuring industry-leading noise cancellation technology. These headphones deliver exceptional sound quality with deep bass, clear mids, and crisp highs. Perfect for travel, work, or relaxation, they offer up to 30 hours of battery life and quick charging capabilities.
      </p>
    `,
  },
};

export const WithKeyFeatures: Story = {
  name: 'With Key Features List',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div class="text-sm text-gray-600" style="height: calc(var(--line-height) * 3); line-height: var(--line-height); overflow: hidden;">
        <ul class="list-none m-0 p-0" style="line-height: var(--line-height);">
          <li>• Noise cancellation technology</li>
          <li>• 30-hour battery life</li>
          <li>• Quick charge: 3 mins = 3 hours playback</li>
        </ul>
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
      <div style="height: calc(var(--line-height) * 2); line-height: var(--line-height); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
        <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: var(--line-height);">
          Wireless freedom meets premium audio quality. Advanced drivers deliver rich, detailed sound while adaptive noise control keeps you focused on what matters most.
        </p>
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
