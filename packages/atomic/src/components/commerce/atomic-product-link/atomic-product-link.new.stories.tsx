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
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing',
      },
      language: 'en',
      country: 'US',
      currency: 'USD',
    },
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

const meta: Meta = {
  component: 'atomic-product-link',
  title: 'Commerce/Product Link',
  id: 'atomic-product-link',
  render: renderComponent,
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters,
  play,
};

export default meta;

export const Default: Story = {};

export const WithSlotsAttributes: Story = {
  name: 'With a slot for attributes',
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
  name: 'With alternative content',
  decorators: [
    () => {
      return html`
        <atomic-product-link>
          <div>
            <img src="https://picsum.photos/350" class="thumbnail" />
          </div>
        </atomic-product-link>
      `;
    },
  ],
};

export const WithHrefTemplate: Story = {
  name: 'With an href template',
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
