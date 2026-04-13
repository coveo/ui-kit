import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock.js';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/commerce/recommendation-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';
import '@/src/components/commerce/atomic-commerce-recommendation-interface/atomic-commerce-recommendation-interface.js';
import '@/src/components/commerce/atomic-commerce-recommendation-list/atomic-commerce-recommendation-list.js';
import '@/src/components/commerce/atomic-product-children/atomic-product-children.js';
import '@/src/components/commerce/atomic-product-field-condition/atomic-product-field-condition.js';
import '@/src/components/commerce/atomic-product-image/atomic-product-image.js';
import '@/src/components/commerce/atomic-product-link/atomic-product-link.js';
import '@/src/components/commerce/atomic-product-price/atomic-product-price.js';
import '@/src/components/commerce/atomic-product-rating/atomic-product-rating.js';
import '@/src/components/commerce/atomic-product-section-children/atomic-product-section-children.js';
import '@/src/components/commerce/atomic-product-section-emphasized/atomic-product-section-emphasized.js';
import '@/src/components/commerce/atomic-product-section-metadata/atomic-product-section-metadata.js';
import '@/src/components/commerce/atomic-product-section-name/atomic-product-section-name.js';
import '@/src/components/commerce/atomic-product-section-visual/atomic-product-section-visual.js';
import '@/src/components/commerce/atomic-product-template/atomic-product-template.js';
import '@/src/components/commerce/atomic-product-text/atomic-product-text.js';

const mockCommerceApi = new MockCommerceApi();

async function initializeCommerceRecommendationInterface(
  canvasElement: HTMLElement
) {
  await customElements.whenDefined('atomic-commerce-recommendation-interface');
  const commerceRecommendationInterface = canvasElement.querySelector(
    'atomic-commerce-recommendation-interface'
  );
  await commerceRecommendationInterface!.initializeWithEngine(
    buildCommerceEngine({
      configuration: getSampleCommerceEngineConfiguration(),
    })
  );
}

const meta: Meta = {
  component: 'recommendations',
  title: 'Reference/Commerce/Example Pages',
  id: 'recommendations',
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockCommerceApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mockCommerceApi.recommendationEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
  render: () => html`
    <atomic-commerce-recommendation-interface>
      <atomic-commerce-recommendation-list
        display="list"
        density="normal"
        image-size="small"
        products-per-page="3"
        slot-id="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
      >
        <atomic-product-template>
          <template>
            <atomic-product-section-name>
              <atomic-product-link class="font-bold"></atomic-product-link>
            </atomic-product-section-name>
            <atomic-product-section-visual>
              <atomic-product-image
                field="ec_thumbnails"
              ></atomic-product-image>
            </atomic-product-section-visual>
            <atomic-product-section-metadata>
              <atomic-product-field-condition if-defined="ec_brand">
                <atomic-product-text
                  field="ec_brand"
                  class="text-neutral-dark block"
                ></atomic-product-text>
              </atomic-product-field-condition>
              <atomic-product-field-condition if-defined="ec_rating">
                <atomic-product-rating
                  field="ec_rating"
                ></atomic-product-rating>
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
    </atomic-commerce-recommendation-interface>
  `,
  play: async (context) => {
    await initializeCommerceRecommendationInterface(context.canvasElement);
  },
};

export default meta;

export const Default: Story = {
  name: 'Recommendation Carousel',
};
