import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
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
  component: 'atomic-product-section-name',
  title: 'Commerce/Product Sections',
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
  play,
  args: {
    'slots-default': `<h3 class="text-lg font-semibold text-gray-900">Sony WH-1000XM4 Wireless Headphones</h3>`,
  },
};
