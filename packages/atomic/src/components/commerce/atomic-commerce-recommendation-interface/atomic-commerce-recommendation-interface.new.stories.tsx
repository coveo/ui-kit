import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

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
  title: 'Atomic-Commerce/Interfaces/atomic-commerce-recommendation-interface',
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

export const WithProductList: Story = {
  tags: ['commerce', 'test'],
  args: {
    'slots-default': `
      <atomic-commerce-layout>
        <atomic-layout-section section="main">
          <atomic-layout-section section="products">
            <atomic-commerce-product-list
              display="grid"
              density="compact"
              image-size="small"
            ></atomic-commerce-product-list>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    `,
  },
};
