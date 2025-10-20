import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {
  executeFirstRequestHook,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

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
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play: preprocessedPlayed,
};

export default meta;

export const Default: Story = {
  decorators: [
    (story) =>
      html` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box
          ></atomic-commerce-search-box>
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
