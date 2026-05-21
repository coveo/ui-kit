import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {
  executeFirstRequestHook,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-layout/atomic-commerce-layout.js';
import '@/src/components/commerce/atomic-commerce-no-products/atomic-commerce-no-products.js';
import '@/src/components/commerce/atomic-commerce-search-box/atomic-commerce-search-box.js';
import '@/src/components/common/atomic-layout-section/atomic-layout-section.js';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';

const commerceApiHarness = new MockCommerceApi();

commerceApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  products: [],
  pagination: {...response.pagination, totalEntries: 0, totalPages: 0},
}));

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-no-products',
  {excludeCategories: ['methods']}
);

const {decorator, play: preprocessedPlayed} = wrapInCommerceInterface({
  skipFirstRequest: true,
  engineConfig: {
    preprocessRequest: (r) => {
      const parsed = JSON.parse(r.body as string);
      parsed.query = 'NOT @URI';
      r.body = JSON.stringify(parsed);
      return r;
    },
  },
});

const meta: Meta = {
  component: 'atomic-commerce-no-products',
  title: 'Commerce/No Products',
  id: 'atomic-commerce-no-products',
  render: (args) => template(args),
  decorators: [decorator],
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

  play: preprocessedPlayed,
  beforeEach: () => {
    commerceApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {
  decorators: [
    (story) =>
      html` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>

        <atomic-layout-section section="main">
          <atomic-layout-section section="products" id="code-root">
            ${story()}
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>`,
  ],
  play: async (context) => {
    await preprocessedPlayed(context);
    await executeFirstRequestHook(context);
  },
};
