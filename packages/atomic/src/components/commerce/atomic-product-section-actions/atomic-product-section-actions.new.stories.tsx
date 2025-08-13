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
  component: 'atomic-product-section-actions',
  title: 'Commerce/Product Sections',
  id: 'atomic-product-section-actions',
  render: renderComponent,
  parameters,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-actions',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play,
  args: {
    'slots-default': `<button class="btn btn-primary">Add to Cart</button>`,
  },
};
