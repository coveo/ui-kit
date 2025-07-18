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
  component: 'atomic-product-section-emphasized',
  title: 'Atomic-Commerce/Product Template Components/ProductSectionEmphasized',
  id: 'atomic-product-section-emphasized',
  render: renderComponent,
  parameters,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-emphasized',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `<span class="text-2xl font-bold text-green-600">$299.99</span>`,
  },
};

export const WithOriginalPrice: Story = {
  name: 'With Original and Sale Price',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div class="flex items-center gap-2">
        <span class="text-2xl font-bold text-red-600">$199.99</span>
        <span class="text-lg text-gray-500 line-through">$299.99</span>
      </div>
    `,
  },
};

export const WithCurrency: Story = {
  name: 'With Different Currencies',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `<span class="text-2xl font-bold text-blue-600">€249.90</span>`,
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
      <div style="display: flex; align-items: baseline; gap: 8px;">
        <span style="font-size: 24px; font-weight: bold; color: #059669;">$149</span>
        <span style="font-size: 14px; color: #6b7280;">99</span>
        <span style="font-size: 12px; color: #9ca3af; text-decoration: line-through;">$249.99</span>
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
