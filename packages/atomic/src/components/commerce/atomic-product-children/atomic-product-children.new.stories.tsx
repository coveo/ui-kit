import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-product-children/atomic-product-children.js';
import '@/src/components/commerce/atomic-product-section-children/atomic-product-section-children.js';

const commerceApiHarness = new MockCommerceApi();

// Limit to 1 product so e2e selectors don't hit strict mode violations
commerceApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  products: response.products.slice(0, 1),
  pagination: {
    ...response.pagination,
    totalCount: 1,
    perPage: 1,
    totalPages: 1,
  },
}));

const {decorator: commerceInterfaceDecorator, play} = wrapInCommerceInterface({
  engineConfig: {
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
const {decorator: productTemplateDecorator} = wrapInProductTemplate(false);
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-children',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-product-children',
  title: 'Commerce/Product Children',
  id: 'atomic-product-children',
  render: (args) => template(args),
  decorators: [
    (story) => html`
      <atomic-product-section-children id="code-root">
        ${story()}
      </atomic-product-section-children>
    `,
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    msw: {handlers: [...commerceApiHarness.handlers]},
    chromatic: {disableSnapshot: true},
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
  beforeEach: () => {
    commerceApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {};
