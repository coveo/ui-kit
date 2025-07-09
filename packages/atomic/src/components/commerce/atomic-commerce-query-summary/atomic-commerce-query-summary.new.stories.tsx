import {CommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator, play} = wrapInCommerceInterface({
  skipFirstRequest: false,
});

const fixedNumberOfProducts = (
  perPage: number
): Partial<CommerceEngineConfiguration> => ({
  preprocessRequest: (r) => {
    const parsed = JSON.parse(r.body as string);
    parsed.perPage = perPage;
    r.body = JSON.stringify(parsed);
    return r;
  },
});

const {play: playNoInitialSearch} = wrapInCommerceInterface({
  skipFirstRequest: true,
});

const {play: playFixedNumberOfProducts} = wrapInCommerceInterface({
  skipFirstRequest: false,
  engineConfig: fixedNumberOfProducts(27),
});

const meta: Meta = {
  component: 'atomic-commerce-query-summary',
  title: 'Commerce/atomic-commerce-query-summary',
  id: 'atomic-commerce-query-summary',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {};

export const WithoutFirstRequestExecuted: Story = {
  name: 'Without first request executed',
  decorators: [(story) => story()],
  play: async (context) => {
    await playNoInitialSearch(context);
  },
};

export const WithAFixedNumberOfProducts: Story = {
  name: 'With a fixed number of products',
  decorators: [(story) => story()],
  play: async (context) => {
    await playFixedNumberOfProducts(context);
  },
};

export const WithSearchBox: Story = {
  name: 'With a search box',
  decorators: [
    (story) =>
      html` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>

        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            ${story()}
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>`,
  ],
};
