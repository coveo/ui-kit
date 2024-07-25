import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {wrapInCommerceRecommendationInterface} from '@coveo/atomic/storybookUtils/commerce-recommendation-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderTemplate} from '@coveo/atomic/storybookUtils/render-template';
import {userEvent, waitFor, expect} from '@storybook/test';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import {within} from 'shadow-dom-testing-library';

const TEMPLATE_EXAMPLE = `<template>
  <atomic-product-section-name>
    <atomic-product-link class="font-bold"></atomic-product-link>
  </atomic-product-section-name>
  <atomic-product-section-visual>
    <atomic-product-field-condition if-defined="ec_thumbnails">
      <atomic-product-image field="ec_thumbnails"></atomic-product-image>
    </atomic-product-field-condition>
  </atomic-product-section-visual>
  <atomic-product-section-metadata>
    <atomic-product-field-condition if-defined="ec_brand">
      <atomic-product-text
        field="ec_brand"
        class="block text-neutral-dark"
      ></atomic-product-text>
    </atomic-product-field-condition>
    <atomic-product-field-condition if-defined="ec_rating">
      <atomic-product-rating field="ec_rating"></atomic-product-rating>
    </atomic-product-field-condition>
  </atomic-product-section-metadata>
  <atomic-product-section-description>
    <atomic-product-text
      field="excerpt"
      class="block text-neutral-dark"
    ></atomic-product-text>
  </atomic-product-section-description>
  <atomic-product-section-emphasized>
    <atomic-product-price currency="USD"></atomic-product-price>
  </atomic-product-section-emphasized>
  <atomic-product-section-children>
    <atomic-product-children></atomic-product-children>
  </atomic-product-section-children>
</template>`;

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-product-template',
  title: 'Atomic-Commerce/Product Template Components/atomic-product-template',
  id: 'atomic-product-template',
  render: renderTemplate,
  decorators: [decorator],
  parameters,
  play,
  argTypes: {
    template: {table: {disable: true}},
    parent: {table: {disable: true}},
    parentArgs: {table: {disable: true}},
  },
  args: {
    template: TEMPLATE_EXAMPLE,
  },
};

export default meta;

export const InAProductList: Story = {
  name: 'In a product list',
  args: {
    parent: 'atomic-commerce-product-list',
  },
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};

const {decorator: recommendationDecorator, play: recommendationPlay} =
  wrapInCommerceRecommendationInterface();

export const InARecommendationList: Story = {
  name: 'In a recommendation list',
  decorators: [recommendationDecorator],
  args: {
    parent: 'atomic-commerce-recommendation-list',
    parentArgs: [
      'id="popular_bought"',
      'slot-id="af4fb7ba-6641-4b67-9cf9-be67e9f30174"',
      'products-per-page="3"',
    ],
  },
  play: async (context) => {
    await recommendationPlay(context);
  },
};

export const InASearchBoxInstantProducts: Story = {
  name: 'In a search box instant products',
  args: {
    parent: 'atomic-commerce-search-box-instant-products',
    parentArgs: ['image-size="small"'],
  },
  play: async (context) => {
    await play(context);
    const {canvasElement, step} = context;
    const canvas = within(canvasElement);

    await step('Wait for the search box to render', async () => {
      await waitFor(
        () =>
          expect(
            canvas.getByShadowPlaceholderText('Search')
          ).toBeInTheDocument(),
        {
          timeout: 30e3,
        }
      );
      await userEvent.type(
        canvas.getByShadowPlaceholderText('Search'),
        'shirt'
      );
    });
  },
  decorators: [
    (story) => html`
      <atomic-commerce-search-box data-testid="search-box">
        <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
        ${story()}
      </atomic-commerce-search-box>
      <atomic-commerce-query-error></atomic-commerce-query-error>
    `,
  ],
};

export const WithoutValidParent: Story = {
  name: 'Without a valid parent',
  tags: ['test'],
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};
