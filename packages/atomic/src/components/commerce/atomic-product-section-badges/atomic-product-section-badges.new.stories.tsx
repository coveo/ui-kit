import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplateForSections} from '@/storybook-utils/commerce/product-template-section-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator: commerceInterfaceDecorator, play} = wrapInCommerceInterface({
  engineConfig: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.perPage = 1;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
});
const {decorator: commerceProductListDecorator} =
  wrapInCommerceProductList('grid');
const {decorator: productTemplateDecorator} =
  wrapInProductTemplateForSections();

const meta: Meta = {
  component: 'atomic-product-section-badges',
  title: 'Commerce/Product Sections',
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
  play,
  args: {
    'slots-default': `
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span class="badge badge-primary" style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">NEW</span>
        <span class="badge badge-secondary" style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">SALE</span>
        <span class="badge badge-success" style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">BESTSELLER</span>
      </div>
    `,
  },
};
