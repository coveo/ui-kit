import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator: commerceInterfaceDecorator, play} = wrapInCommerceInterface({
  type: 'product-listing',
  engineConfig: {
    context: {
      view: {
        url: 'https://ui-kit.coveo/atomic/storybook/atomic-product-image',
      },
      language: 'en',
      country: 'US',
      currency: 'USD',
    },
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.perPage = 2;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
});
const {decorator: commerceProductListDecorator} = wrapInCommerceProductList();
const {decorator: productTemplateDecorator} = wrapInProductTemplate();

const meta: Meta = {
  component: 'atomic-product-image',
  title: 'Commerce/Product Image',
  id: 'atomic-product-image',
  render: renderComponent,
  decorators: [
    (story) => html`
    <atomic-product-section-visual>
      ${story()}
    </atomic-product-section-visual>    
  `,
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters,
  play,
};

export default meta;

export const Default: Story = {};

export const withAFallbackImage: Story = {
  name: 'With a fallback image',
  args: {
    'attributes-field': 'invalid',
    'attributes-fallback': 'https://sports.barca.group/logos/barca.svg',
  },
};
