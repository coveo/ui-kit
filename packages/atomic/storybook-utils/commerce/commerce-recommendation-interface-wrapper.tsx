import {
  buildCommerceEngine,
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {Decorator, StoryContext} from '@storybook/web-components-vite';
import {html} from 'lit';
import {spreadProps} from '@open-wc/lit-helpers';
import type {AtomicCommerceRecommendationInterface} from '@/src/components/commerce/atomic-commerce-recommendation-interface/atomic-commerce-recommendation-interface.js';
import '@/src/components/commerce/atomic-commerce-recommendation-interface/atomic-commerce-recommendation-interface.js';

export const wrapInCommerceRecommendationInterface = (
  engineConfig?: Partial<CommerceEngineConfiguration>,
  includeCodeRoot: boolean = true
): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-commerce-recommendation-interface
      ${spreadProps(includeCodeRoot ? {id: 'code-root'} : {})}
    >
      ${story()}
    </atomic-commerce-recommendation-interface>
  `,
  play: async ({canvasElement}) => {
    await customElements.whenDefined(
      'atomic-commerce-recommendation-interface'
    );
    const recommendationInterface =
      canvasElement.querySelector<AtomicCommerceRecommendationInterface>(
        'atomic-commerce-recommendation-interface'
      );
    const engine = buildCommerceEngine({
      configuration: {
        ...getSampleCommerceEngineConfiguration(),
        ...engineConfig,
      },
    });
    await recommendationInterface!.initializeWithEngine(engine);
  },
});
