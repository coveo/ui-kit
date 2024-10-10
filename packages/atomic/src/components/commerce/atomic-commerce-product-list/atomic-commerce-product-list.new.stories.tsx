import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@coveo/atomic-storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit-html/static.js';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: false});

const {play: playNoProducts} = wrapInCommerceInterface({
  skipFirstSearch: false,
  engineConfig: {
    preprocessRequest: (r) => {
      const parsed = JSON.parse(r.body as string);
      parsed.query = 'show me no products';
      r.body = JSON.stringify(parsed);
      return r;
    },
  },
});

const meta: Meta = {
  argTypes: {
    'attributes-display': {
      options: ['grid', 'list', 'table'],
      control: {type: 'radio'},
    },
    'attributes-density': {
      options: ['compact', 'comfortable', 'normal'],
      control: {type: 'radio'},
    },
    'attributes-image-size': {
      options: ['small', 'large', 'icon', 'none'],
      control: {type: 'radio'},
    },
  },
  args: {
    'attributes-number-of-placeholders': 24,
    'attributes-display': 'grid',
    'attributes-density': 'normal',
    'attributes-image-size': 'small',
  },
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

const {play: playNoFirstQuery} = wrapInCommerceInterface({
  skipFirstSearch: true,
});

export const BeforeQuery: Story = {
  name: 'Before a query',
  play: async (context) => {
    await playNoFirstQuery(context);
  },
};

export const NoProducts: Story = {
  name: 'With no products',
  decorators: [(story) => story()],
  play: async (context) => {
    await playNoProducts(context);
    await playExecuteFirstSearch(context);
  },
};

export const WithProductTemplate: Story = {
  name: 'With a product template',
  args: {
    'slots-default': `<atomic-product-template>
  <template>
    <atomic-product-section-name>
      <atomic-product-link class="font-bold"></atomic-product-link>
    </atomic-product-section-name>
    <atomic-product-section-visual>
      <atomic-product-image></atomic-product-image>
    </atomic-product-section-visual>
    <atomic-product-section-metadata>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
      </atomic-product-field-condition>
      <atomic-product-rating></atomic-product-rating>
    </atomic-product-section-metadata>
    <atomic-product-section-emphasized>
      <atomic-product-price></atomic-product-price>
    </atomic-product-section-emphasized>
    <atomic-product-section-children>
      <atomic-product-children></atomic-product-children>
    </atomic-product-section-children>
  </template>
</atomic-product-template>`,
  },
};

export const InPage: Story = {
  name: 'In a page',
  decorators: [
    (story) =>
      html` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets"
          ><atomic-commerce-facets></atomic-commerce-facets
        ></atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-commerce-breadbox></atomic-commerce-breadbox>
            <atomic-commerce-query-summary></atomic-commerce-query-summary>
            <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
            <atomic-commerce-did-you-mean></atomic-commerce-did-you-mean>
            <atomic-commerce-refine-toggle></atomic-commerce-refine-toggle>
          </atomic-layout-section>
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
