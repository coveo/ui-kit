import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

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
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-description',
  {excludeCategories: ['methods']}
);
const wrapperDecorator: Decorator = (story) => {
  return html`
    <div style="width: 200px; height: 60px;">
      ${story()}
    </div>
  `;
};

const meta: Meta = {
  component: 'atomic-product-description',
  title: 'Commerce/Product Description',
  id: 'atomic-product-description',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  decorators: [
    wrapperDecorator,
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  afterEach: play,
};

export default meta;

export const Default: Story = {};

export const Collapsible: Story = {
  name: 'Collapsible',
  args: {
    isCollapsible: true,
  },
};

export const UsingECDescription: Story = {
  name: 'Using ec_description',
  args: {
    field: 'ec_description',
  },
};
