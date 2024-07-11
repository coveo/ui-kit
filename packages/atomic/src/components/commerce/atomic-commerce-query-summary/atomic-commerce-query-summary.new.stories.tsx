import {wrapInCommerceInterface} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {CommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInCommerceInterface({
  skipFirstSearch: false,
});

const noProductsEngineConfig: Partial<CommerceEngineConfiguration> = {
  preprocessRequest: (r) => {
    const parsed = JSON.parse(r.body as string);
    // eslint-disable-next-line @cspell/spellchecker
    parsed.query = 'qnjssoptjhyalwnmrbgtyslsd';
    r.body = JSON.stringify(parsed);
    return r;
  },
};

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
  skipFirstSearch: true,
});

const {play: playNoProducts} = wrapInCommerceInterface({
  skipFirstSearch: false,
  engineConfig: noProductsEngineConfig,
});

const {play: playFixedNumberOfProducts} = wrapInCommerceInterface({
  skipFirstSearch: false,
  engineConfig: fixedNumberOfProducts(27),
});

const meta: Meta = {
  component: 'atomic-commerce-query-summary',
  title: 'Atomic-Commerce/QuerySummary',
  id: 'atomic-commerce-query-summary',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-query-summary',
};

export const NoInitialSearch: Story = {
  name: 'No Initial Search',
  tags: ['test'],
  decorators: [(story) => story()],
  play: async (context) => {
    await playNoInitialSearch(context);
  },
};

export const NoProducts: Story = {
  name: 'No Products',
  tags: ['test'],
  decorators: [(story) => story()],
  play: async (context) => {
    await playNoProducts(context);
  },
};

export const FixedNumberOfProducts: Story = {
  name: 'Fixed Number of Products',
  tags: ['test'],
  decorators: [(story) => story()],
  play: async (context) => {
    await playFixedNumberOfProducts(context);
  },
};

export const WithSearchBox: Story = {
  name: 'With a Search Box',
  tags: ['test'],
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
  play: async (context) => {
    await playNoInitialSearch(context);
  },
};
