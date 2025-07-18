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
  component: 'atomic-product-section-badges',
  title: 'Atomic-Commerce/Product Template Components/ProductSectionBadges',
  id: 'atomic-product-section-badges',
  render: renderComponent,
  parameters,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-badges',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `<span class="badge badge-primary">NEW</span>`,
  },
};

export const WithMultipleBadges: Story = {
  name: 'With Multiple Badges',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <span class="badge badge-primary">NEW</span>
      <span class="badge badge-warning">SALE</span>
      <span class="badge badge-success">BESTSELLER</span>
    `,
  },
};

export const WithCustomStyledBadges: Story = {
  name: 'With Custom Styled Badges',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
  args: {
    'slots-default': `
      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
        <span style="background-color: #dc2626; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px; font-weight: bold; height: var(--line-height); display: flex; align-items: center;">
          🔥 HOT
        </span>
        <span style="background-color: #16a34a; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px; font-weight: bold; height: var(--line-height); display: flex; align-items: center;">
          ✨ NEW
        </span>
        <span style="background-color: #ea580c; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px; font-weight: bold; height: var(--line-height); display: flex; align-items: center;">
          💸 50% OFF
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
