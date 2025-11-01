import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInCommerceRecommendationInterface} from '@/storybook-utils/commerce/commerce-recommendation-interface-wrapper';
import {wrapInCommerceRecommendationList} from '@/storybook-utils/commerce/commerce-recommendation-list-wrapper';
import {wrapInCommerceSearchBoxInstantProducts} from '@/storybook-utils/commerce/commerce-searchbox-instant-products-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {parameters as searchBoxParameters} from '@/storybook-utils/common/search-box-suggestions-parameters';

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

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-template',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-product-template',
  title: 'Commerce/Product Template',
  id: 'atomic-product-template',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'default-slot': TEMPLATE_EXAMPLE,
  },
  argTypes: {
    ...argTypes,
    'must-match': {
      ...argTypes['must-match'],
      control: false,
    },
    'must-not-match': {
      ...argTypes['must-not-match'],
      control: false,
    },
    conditions: {
      ...argTypes.conditions,
      control: false,
    },
  },
};

export default meta;

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstRequest: false,
  engineConfig: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.perPage = 4;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
  includeCodeRoot: false,
});
const {decorator: commerceProductListDecorator} =
  wrapInCommerceProductList('list');

export const InAProductList: Story = {
  name: 'In a product list',
  decorators: [commerceProductListDecorator, commerceInterfaceDecorator],
  play: initializeCommerceInterface,
};

const {
  decorator: commerceRecommendationInterfaceDecorator,
  play: initializeCommerceRecommendationInterface,
} = wrapInCommerceRecommendationInterface();
const {decorator: commerceRecommendationListDecorator} =
  wrapInCommerceRecommendationList();

export const InARecommendationList: Story = {
  name: 'In a recommendation list',
  decorators: [
    commerceRecommendationListDecorator,
    commerceRecommendationInterfaceDecorator,
  ],

  play: initializeCommerceRecommendationInterface,
};

const {decorator: commerceSearchBoxInstantsProductsDecorator} =
  wrapInCommerceSearchBoxInstantProducts();

export const InASearchBoxInstantProducts: Story = {
  name: 'In a search box instant products',
  decorators: [
    commerceSearchBoxInstantsProductsDecorator,
    commerceInterfaceDecorator,
  ],
  parameters: searchBoxParameters,
  play: async (context) => {
    await initializeCommerceInterface(context);
    const {canvas, step} = context;
    await step('Click Searchbox', async () => {
      (
        await canvas.findAllByShadowTitle('Search field with suggestions.', {
          exact: false,
        })
      )
        ?.find((el) => el.getAttribute('part') === 'textarea')
        ?.focus();
    });
  },
};
