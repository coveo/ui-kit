import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@coveo/atomic-storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {CommerceEngineConfiguration} from '@coveo/headless/dist/definitions/commerce.index';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit-html/static.js';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: false});

const noResultsEngineConfig: Partial<CommerceEngineConfiguration> = {
  preprocessRequest: (r) => {
    const parsed = JSON.parse(r.body as string);
    // eslint-disable-next-line @cspell/spellchecker
    parsed.query = 'xqyzpqwlnftguscaqmzpbyuagloxhf';
    r.body = JSON.stringify(parsed);
    return r;
  },
};

const {play: playNoresults} = wrapInCommerceInterface({
  skipFirstSearch: false,
  engineConfig: noResultsEngineConfig,
});

const meta: Meta = {
  component: 'atomic-commerce-product-list',
  title: 'Atomic-Commerce/ProductList',
  id: 'atomic-commerce-product-list',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-product-list',
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};

const {play: playNoFirstSearch} = wrapInCommerceInterface({
  skipFirstSearch: true,
  engineConfig: noResultsEngineConfig,
});

export const NoFirstSearch: Story = {
  name: 'atomic-commerce-product-list',
  play: async (context) => {
    await playNoFirstSearch(context);
  },
};

export const OpenInNewTab: Story = {
  name: 'Open Product in New Tab',
  tags: ['test'],
  args: {'attributes-grid-cell-link-target': '_blank'},
  play: async (context) => {
    await wrapInCommerceInterface({skipFirstSearch: true}).play(context);
    await playExecuteFirstSearch(context);
  },
};

export const NoResults: Story = {
  name: 'No Results',
  tags: ['test'],
  decorators: [(story) => story()],
  play: async (context) => {
    await playNoresults(context);
    await playExecuteFirstSearch(context);
  },
};

export const InPage: Story = {
  name: 'In a page',
  tags: ['test'],
  decorators: [
    (story) =>
      html` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="products">
            ${story()}
            <atomic-commerce-query-error></atomic-commerce-query-error>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-commerce-load-more-products></atomic-commerce-load-more-products>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>`,
  ],
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};
