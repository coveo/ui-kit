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

export const WithRecommendationList: Story = {
  tags: ['commerce', 'test'],
  args: {
    'slots-default': `
      <atomic-commerce-layout>
        <atomic-layout-section section="main">
          <atomic-commerce-recommendation-list
            id="popular_bought"
            slot-id="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
            products-per-page="3"
          ></atomic-commerce-recommendation-list>
        </atomic-layout-section>
      </atomic-commerce-layout>
    `,
  },
};
