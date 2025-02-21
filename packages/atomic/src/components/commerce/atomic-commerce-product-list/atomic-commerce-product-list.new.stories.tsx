import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

// TODO KIT-3640 - Add stories for table display

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: false});

const {play: playNoFirstQuery} = wrapInCommerceInterface({
  skipFirstSearch: true,
});

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
  name: 'Grid display',
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};

export const GridDisplayWithTemplate: Story = {
  name: 'Grid display with template',
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

export const GridDisplayBeforeQuery: Story = {
  name: 'Grid display before query',
  play: async (context) => {
    await playNoFirstQuery(context);
  },
};

export const ListDisplay: Story = {
  name: 'List display',
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
  args: {
    'attributes-display': 'list',
  },
};

export const ListDisplayWithTemplate: Story = {
  name: 'List display with template',
  args: {
    'attributes-display': 'list',
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

export const ListDisplayBeforeQuery: Story = {
  name: 'List display before query',
  args: {
    'attributes-display': 'list',
  },
  play: async (context) => {
    await playNoFirstQuery(context);
  },
};

export const NoProducts: Story = {
  name: 'No products',
  decorators: [(story) => story()],
  play: async (context) => {
    await playNoProducts(context);
    await playExecuteFirstSearch(context);
  },
};

export const InPage: Story = {
  name: 'In page',
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
