import {
  buildCommerceEngine,
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {within} from '@storybook/test';
import {Decorator, StoryContext} from '@storybook/web-components';
import {html} from 'lit';
import type * as _ from '../../src/components.js';
// TODO: Remove this import once atomic-commerce-recommendation-list is merged;
import '../../src/components/commerce/atomic-product/atomic-product';

export const wrapInCommerceRecommendationInterface = (
  engineConfig?: Partial<CommerceEngineConfiguration>
): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-commerce-recommendation-interface data-testid="root-recs-interface">
      ${story()}
    </atomic-commerce-recommendation-interface>
  `,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined(
      'atomic-commerce-recommendation-interface'
    );
    const canvas = within(canvasElement);
    const recommendationInterface =
      await canvas.findByTestId<HTMLAtomicCommerceRecommendationInterfaceElement>(
        'root-recs-interface'
      );
    await step('Render the Recommendation Interface', async () => {
      const engine = buildCommerceEngine({
        configuration: {
          ...getSampleCommerceEngineConfiguration(),
          ...engineConfig,
        },
      });
      await recommendationInterface!.initializeWithEngine(engine);
    });
  },
});
