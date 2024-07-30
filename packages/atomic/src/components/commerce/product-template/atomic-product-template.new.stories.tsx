import {wrapInCommerceInterface} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {wrapInCommerceRecommendationInterface} from '@coveo/atomic/storybookUtils/commerce-recommendation-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {userEvent, waitFor, expect} from '@storybook/test';
import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import {within} from 'shadow-dom-testing-library';
import {renderComponentWithoutCodeRoot} from '../../../../storybookUtils/render-component';

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

const meta: Meta = {
  component: 'atomic-product-template',
  title: 'Atomic-Commerce/Product Template Components/atomic-product-template',
  id: 'atomic-product-template',
  render: renderComponentWithoutCodeRoot,
  parameters,
  args: {
    'slots-default': TEMPLATE_EXAMPLE,
  },
};

export default meta;

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({skipFirstSearch: false});
const atomicCommerceResultListDecorator: Decorator = (story) => {
  return html`
    <atomic-commerce-product-list
      number-of-placeholders="24"
      display="grid"
      density="normal"
      image-size="small"
    >
      ${story()}
    </atomic-commerce-product-list>
  `;
};

export const InAProductList: Story = {
  name: 'In a product list',
  decorators: [atomicCommerceResultListDecorator, commerceInterfaceDecorator],
  play: initializeCommerceInterface,
};

const {
  decorator: commerceRecommendationInterfaceDecorator,
  play: initializeCommerceRecommendationInterface,
} = wrapInCommerceRecommendationInterface();
const atomicCommerceRecommendationDecorator: Decorator = (story) => {
  return html`
    <atomic-commerce-recommendation-list
      id="popular_bought"
      slot-id="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
      products-per-page="3"
    >
      ${story()}
    </atomic-commerce-recommendation-list>
  `;
};

export const InARecommendationList: Story = {
  name: 'In a recommendation list',
  decorators: [
    atomicCommerceRecommendationDecorator,
    commerceRecommendationInterfaceDecorator,
  ],

  play: initializeCommerceRecommendationInterface,
};

const atomicCommerceSearchBoxInstantProductsDecorator: Decorator = (story) => {
  return html`
    <atomic-commerce-search-box data-testid="search-box">
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      <atomic-commerce-search-box-instant-products image-size="small">
        ${story()}
      </atomic-commerce-search-box-instant-products>
    </atomic-commerce-search-box>
    <atomic-commerce-query-error></atomic-commerce-query-error>
  `;
};

export const InASearchBoxInstantProducts: Story = {
  name: 'In a search box instant products',
  decorators: [
    atomicCommerceSearchBoxInstantProductsDecorator,
    commerceInterfaceDecorator,
  ],
  play: async (context) => {
    initializeCommerceInterface(context);
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
};

export const WithoutValidParent: Story = {
  name: 'Without a valid parent',
  tags: ['test'],
  decorators: [commerceInterfaceDecorator],
  play: initializeCommerceInterface,
};
