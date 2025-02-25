import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstSearch: false,
  type: 'product-listing',
  engineConfig: {
    context: {
      view: {
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing',
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
  component: 'atomic-product-link',
  title: 'Atomic-Commerce/Product Template Components/ProductLink',
  id: 'atomic-product-link',
  render: renderComponent,
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters,
  play: initializeCommerceInterface,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-link',
};

export const WithSlotsAttributes: Story = {
  name: 'opens in a new browser tab',
  decorators: [
    () => {
      return html`
        <atomic-product-link>
          <a slot="attributes" target="_blank"></a>
        </atomic-product-link>
      `;
    },
  ],
};

export const WithAlternativeContent: Story = {
  name: 'with alternative content',
  decorators: [
    () => {
      return html`
        <atomic-product-link>
          <div>
            Alternative content
            <img src="https://picsum.photos/350" class="thumbnail" />
          </div>
        </atomic-product-link>
      `;
    },
  ],
};

export const WithHrefTemplate: Story = {
  name: 'with href template',
  decorators: [
    () => {
      return html`
        <atomic-product-link
          href-template="\${clickUri}?source=\${additionalFields.source}"
        ></atomic-product-link>
      `;
    },
  ],
};
