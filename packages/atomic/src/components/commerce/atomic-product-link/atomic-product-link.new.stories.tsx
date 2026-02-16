import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

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
  includeCodeRoot: false,
});
const {decorator: commerceProductListDecorator} = wrapInCommerceProductList(
  'list',
  false
);
const {decorator: productTemplateDecorator} = wrapInProductTemplate();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-link',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-product-link',
  title: 'Commerce/Product Link',
  id: 'atomic-product-link',
  render: (args) => template(args),
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

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
            <img src="https://picsum.photos/seed/picsum/350" alt="Thumbnail" class="thumbnail" />
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
