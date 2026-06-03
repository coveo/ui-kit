import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {testDisclosureA11y} from '@/storybook-utils/a11y/disclosure.js';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-product-excerpt/atomic-product-excerpt.js';

const commerceApiHarness = new MockCommerceApi();

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
  'atomic-product-excerpt',
  {excludeCategories: ['methods']}
);
const wrapperDecorator: Decorator = (story) => {
  return html`
    <div style="width: 200px; height: 60px;" id="code-root">${story()}</div>
  `;
};

const meta: Meta = {
  component: 'atomic-product-excerpt',
  title: 'Commerce/Product Excerpt',
  id: 'atomic-product-excerpt',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    msw: {handlers: [...commerceApiHarness.handlers]},
    chromatic: {disableSnapshot: true},
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'truncate-after': '2',
  },
  argTypes,

  decorators: [
    wrapperDecorator,
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play,
  beforeEach: () => {
    commerceApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {};

export const Collapsible: Story = {
  name: 'Collapsible',
  args: {
    isCollapsible: true,
  },
};

export const A11yDisclosure: Story = {
  tags: ['a11y', 'test', '!dev'],
  args: {
    isCollapsible: true,
    'truncate-after': '1',
  },
  decorators: [
    (story) => html`<div style="max-width: 150px;">${story()}</div>`,
  ],
  beforeEach: () => {
    commerceApiHarness.searchEndpoint.mock((response) => {
      if ('products' in response) {
        return {
          ...response,
          products: response.products.map((p: Record<string, unknown>) => ({
            ...p,
            ec_shortdesc:
              'This is a very long product excerpt that is designed to force text truncation in any viewport width. It contains multiple sentences to ensure wrapping occurs reliably in headless browsers during automated testing.',
          })),
        };
      }
      return response;
    });
  },
  play: async (context) => {
    await play(context);
    await testDisclosureA11y(context, {
      trigger: {expanded: false},
      skipKeyboard: true,
    });
  },
};
