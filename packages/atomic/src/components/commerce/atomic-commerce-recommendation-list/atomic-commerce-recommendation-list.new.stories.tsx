import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceRecommendationInterface} from '@/storybook-utils/commerce/commerce-recommendation-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-recommendation-list/atomic-commerce-recommendation-list.js';
import '@/src/components/commerce/atomic-product-children/atomic-product-children.js';
import '@/src/components/commerce/atomic-product-field-condition/atomic-product-field-condition.js';
import '@/src/components/commerce/atomic-product-image/atomic-product-image.js';
import '@/src/components/commerce/atomic-product-link/atomic-product-link.js';
import '@/src/components/commerce/atomic-product-multi-value-text/atomic-product-multi-value-text.js';
import '@/src/components/commerce/atomic-product-price/atomic-product-price.js';
import '@/src/components/commerce/atomic-product-rating/atomic-product-rating.js';
import '@/src/components/commerce/atomic-product-section-actions/atomic-product-section-actions.js';
import '@/src/components/commerce/atomic-product-section-bottom-metadata/atomic-product-section-bottom-metadata.js';
import '@/src/components/commerce/atomic-product-section-children/atomic-product-section-children.js';
import '@/src/components/commerce/atomic-product-section-emphasized/atomic-product-section-emphasized.js';
import '@/src/components/commerce/atomic-product-section-metadata/atomic-product-section-metadata.js';
import '@/src/components/commerce/atomic-product-section-name/atomic-product-section-name.js';
import '@/src/components/commerce/atomic-product-section-visual/atomic-product-section-visual.js';
import '@/src/components/commerce/atomic-product-template/atomic-product-template.js';
import '@/src/components/commerce/atomic-product-text/atomic-product-text.js';

const mockCommerceApi = new MockCommerceApi();

const {decorator, play} = wrapInCommerceRecommendationInterface({});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-recommendation-list',
  {excludeCategories: ['methods']}
);

const defaultSlotContent = `
  <atomic-product-template>
    <template>
    <atomic-product-section-name>
      <atomic-product-link class="font-bold"></atomic-product-link>
    </atomic-product-section-name>
    <atomic-product-section-visual>
      <atomic-product-image field="ec_thumbnails"></atomic-product-image>
    </atomic-product-section-visual>
    <atomic-product-section-metadata>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="ec_rating">
        <atomic-product-rating field="ec_rating"></atomic-product-rating>
        <atomic-product-multi-value-text field="cat_available_sizes"></atomic-product-multi-value-text>
      </atomic-product-field-condition>
    </atomic-product-section-metadata>
    <atomic-product-section-emphasized>
      <atomic-product-price currency="USD"></atomic-product-price>
    </atomic-product-section-emphasized>
    <atomic-product-section-children>
      <atomic-product-children></atomic-product-children>
    </atomic-product-section-children>
  </template>
</atomic-product-template>
`.trim();

const meta: Meta = {
  component: 'atomic-commerce-recommendation-list',
  title: 'Commerce/Recommendation List',
  id: 'atomic-commerce-recommendation-list',
  render: (args) => template(args),
  play,
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    handlers: [...mockCommerceApi.handlers],
  },
  beforeEach: async () => {
    mockCommerceApi.recommendationEndpoint.clear();
  },
  argTypes,

  args: {
    ...args,
    'heading-level': '0',
    headingLevel: '0',
    slotId: 'af4fb7ba-6641-4b67-9cf9-be67e9f30174',
    'slot-id': 'af4fb7ba-6641-4b67-9cf9-be67e9f30174',
    'default-slot': defaultSlotContent,
  },
};
export default meta;

export const Default: Story = {};

const withFullTemplateSlotContent = `
<atomic-product-template>
  <template>
    <atomic-product-section-visual>
      <span>Visual Section</span>
    </atomic-product-section-visual>
    <atomic-product-section-badge>
      <span>Badge Section</span>
    </atomic-product-section-badge>
    <atomic-product-section-actions>
      <span>Actions Section</span>
    </atomic-product-section-actions>
    <atomic-product-section-title>
      <span>Title Section</span>
    </atomic-product-section-title>
    <atomic-product-section-title-metadata>
      <span>Title Metadata Section</span>
    </atomic-product-section-title-metadata>
    <atomic-product-section-emphasized>
      <span>Emphasized Section</span>
    </atomic-product-section-emphasized>
    <atomic-product-section-excerpt>
      <span>Excerpt Section</span>
    </atomic-product-section-excerpt>
    <atomic-product-section-bottom-metadata>
      <span>Bottom Metadata Section</span>
    </atomic-product-section-bottom-metadata>
  </template>
</atomic-product-template>
`.trim();

export const WithFullTemplate: Story = {
  name: 'With a full template',
  args: {
    'default-slot': withFullTemplateSlotContent,
  },
};

export const AsCarousel: Story = {
  name: 'As a carousel',
  args: {
    'products-per-page': 3,
  },
};

export const NoRecommendations: Story = {
  name: 'No recommendations',
  beforeEach: async () => {
    mockCommerceApi.recommendationEndpoint.mockOnce((response) => ({
      ...response,
      products: [],
      pagination: {
        page: 0,
        perPage: 10,
        totalEntries: 0,
        totalPages: 0,
      },
      triggers: [],
    }));
  },
};
