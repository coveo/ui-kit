import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

const {play} = wrapInCommerceInterface({skipFirstSearch: true});
const {decorator, play: preprocessedPlayed} = wrapInCommerceInterface({
  skipFirstSearch: true,
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
  title: 'Atomic-Commerce/NoProduct',
  id: 'atomic-commerce-no-products',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play: preprocessedPlayed,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-no-products',
  decorators: [
    (story) =>
      html` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box
            role="searchbox"
          ></atomic-commerce-search-box>
        </atomic-layout-section>

        <atomic-layout-section section="main">
          <atomic-layout-section section="products">
            ${story()}
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>`,
  ],
  play: async (context) => {
    await preprocessedPlayed(context);
    await playExecuteFirstSearch(context);
  },
};

export const WithResults: Story = {
  name: 'With Results',
  tags: ['test'],
  decorators: [
    (story) =>
      html` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box
            role="searchbox"
          ></atomic-commerce-search-box>
        </atomic-layout-section>

        <atomic-layout-section section="main">
          <atomic-layout-section section="products">
            ${story()}
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>`,
  ],
  play: async (context) => {
    await play(context);
  },
};
