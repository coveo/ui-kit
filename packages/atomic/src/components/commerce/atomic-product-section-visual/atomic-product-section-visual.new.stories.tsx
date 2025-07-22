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
  component: 'atomic-product-section-visual',
  title: 'Atomic-Commerce/Product Template Components/ProductSectionVisual',
  id: 'atomic-product-section-visual',
  render: renderComponent,
  parameters,
  argTypes: {
    'attributes-image-size': {
      name: 'image-size',
      control: 'select',
      options: ['small', 'large'],
      type: 'string',
    },
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-visual',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <img src="https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Product+Image" 
           alt="Product Image" 
           style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
    `,
  },
};

export const WithSmallSize: Story = {
  name: 'With Small Image Size',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'attributes-image-size': 'small',
    'slots-default': `
      <img src="https://via.placeholder.com/150x150/10B981/FFFFFF?text=Small" 
           alt="Small Product Image" 
           style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
    `,
  },
};

export const WithLargeSize: Story = {
  name: 'With Large Image Size',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'attributes-image-size': 'large',
    'slots-default': `
      <img src="https://via.placeholder.com/400x400/DC2626/FFFFFF?text=Large" 
           alt="Large Product Image" 
           style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
    `,
  },
};

export const WithMultipleImages: Story = {
  name: 'With Multiple Images',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div style="position: relative; width: 100%; height: 100%;">
        <img src="https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Main+Image" 
             alt="Main Product Image" 
             style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
        <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
          +3 more
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
      <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; text-align: center; padding: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div>
          <div style="font-size: 24px; margin-bottom: 8px;">📱</div>
          <div style="font-size: 14px;">Premium Device</div>
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
