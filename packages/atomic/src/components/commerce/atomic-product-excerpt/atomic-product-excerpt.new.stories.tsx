import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {html} from 'lit';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
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
const {decorator: commerceProductListDecorator} = wrapInCommerceProductList();
const {decorator: productTemplateDecorator} = wrapInProductTemplate();
const wrapperDecorator: Decorator = (story) => {
  return html`
    <div style="width: 200px; height: 60px;">
      ${story()}
    </div>
  `;
};

const meta: Meta = {
  component: 'atomic-product-excerpt',
  title: 'Commerce/Product Excerpt',
  id: 'atomic-product-excerpt',
  render: renderComponent,
  parameters,
  decorators: [
    wrapperDecorator,
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play,
};

export default meta;

export const Default: Story = {};

export const Collapsible: Story = {
  name: 'Collapsible',
  args: {
    'attributes-is-collapsible': true,
  },
};
