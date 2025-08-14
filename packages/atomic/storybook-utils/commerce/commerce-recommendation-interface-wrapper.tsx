import {
  buildCommerceEngine,
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import { Decorator, StoryContext } from '@storybook/web-components-vite';
import { html } from 'lit';
import type * as _ from '../../src/components.js';

export const wrapInCommerceRecommendationInterface = (
  engineConfig?: Partial<CommerceEngineConfiguration>
): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-commerce-recommendation-interface id="code-root">
      ${story()}
    </atomic-commerce-recommendation-interface>
  `,
  play: async ({ canvasElement }) => {
    await customElements.whenDefined(
      'atomic-commerce-recommendation-interface'
    );
    const recommendationInterface = canvasElement.querySelector('atomic-commerce-recommendation-interface');
    const engine = buildCommerceEngine({
      configuration: {
        ...getSampleCommerceEngineConfiguration(),
        ...engineConfig,
      },
    });
    await recommendationInterface!.initializeWithEngine(engine);
  },
});
