import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

async function initializeCommerceRecommendationInterface(
  canvasElement: HTMLElement
) {
  await customElements.whenDefined('atomic-commerce-recommendation-interface');
  const commerceRecommendationInterface = canvasElement.querySelector(
    'atomic-commerce-recommendation-interface'
  );
  await commerceRecommendationInterface!.initializeWithEngine(
    buildCommerceEngine({configuration: getSampleCommerceEngineConfiguration()})
  );
}
const meta: Meta = {
  component: 'atomic-commerce-recommendation-interface',
  title: 'Commerce/atomic-commerce-recommendation-interface',
  id: 'atomic-commerce-recommendation-interface',
  render: renderComponent,
  parameters,
  play: async (context) => {
    await initializeCommerceRecommendationInterface(context.canvasElement);
  },
  argTypes: {
    'attributes-language': {
      name: 'language',
      type: 'string',
    },
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-recommendation-interface',
};

const recommendationList = `<style>
  atomic-commerce-recommendation-list {
    --atomic-recs-number-of-columns: 3;
  }
  @media only screen and (max-width: 1024px) {
    atomic-commerce-recommendation-list {
      --atomic-recs-number-of-columns: 1;
    }
  }
</style>

<atomic-commerce-layout>
  <atomic-layout-section section="main">
    <atomic-commerce-recommendation-list
      id="popular_bought"
      slot-id="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
      products-per-page="3"
    >
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
            <atomic-product-field-condition if-defined="ec_brand">
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
    </atomic-commerce-recommendation-list>
  </atomic-layout-section>
</atomic-commerce-layout>`;

export const WithRecommendationList: Story = {
  tags: ['commerce', 'test'],
  args: {
    'slots-default': recommendationList,
  },
  play: async ({canvasElement}) => {
    const recsInterface = canvasElement.querySelector(
      'atomic-commerce-recommendation-interface'
    );
    recsInterface!.innerHTML = recommendationList;
    await initializeCommerceRecommendationInterface(canvasElement);
  },
};
